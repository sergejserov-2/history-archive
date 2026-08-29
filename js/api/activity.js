import{getActivityPage}from"../../api/activity.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList,insertEntityListItem}from"./entityList.js";
import{renderDateTime}from"./date.js";
import{getSubject}from"../../api/subjects.js";
import{compareEntities}from"./sort.js";

const PAGE_SIZE=500;

let currentActivityModal=null;

export async function openActivityModal(){
    const page=await getActivityPage(null,PAGE_SIZE);

    const modal=createModal({
        title:"История изменений",
        content:renderActivityList(page.activities),
        width:630,
        admin:true
    });

    currentActivityModal={
        ...modal,
        activities:page.activities,
        lastDoc:page.lastDoc,
        hasMore:page.hasMore,
        loading:false
    };

    setupActivityClick(modal.root);
    setupActivityInfiniteScroll(modal);

    return modal;
}

function setupActivityClick(root){
    root.addEventListener("click",async event=>{
        const row=event.target.closest(".entity-list-row");
        if(!row)return;

        const id=row.dataset.id;
        if(!id)return;

        const activity=
            currentActivityModal?.activities.find(
                item=>item.id===id
            );

        if(!activity)return;

        event.preventDefault();

        await openActivityTarget(activity);
    });
}

function setupActivityInfiniteScroll(modal){
    const scrollRoot=
        modal.root.querySelector(".modal__content")??
        modal.root;

    const check=async()=>{
        const state=currentActivityModal;

        if(!state?.hasMore||state.loading)return;

        const remaining=
            scrollRoot.scrollHeight-
            scrollRoot.scrollTop-
            scrollRoot.clientHeight;

        if(remaining>300)return;

        state.loading=true;

        try{
            const page=await getActivityPage(
                state.lastDoc,
                PAGE_SIZE
            );

            if(!page.activities.length){
                state.hasMore=false;
                return;
            }

            appendActivities(
                modal.root,
                page.activities
            );

            state.activities.push(
                ...page.activities
            );

            state.lastDoc=page.lastDoc;
            state.hasMore=page.hasMore;
        }finally{
            state.loading=false;
        }
    };

    scrollRoot.addEventListener(
        "scroll",
        ()=>void check()
    );
}

function appendActivities(root,activities=[]){
    activities.forEach(activity=>{
        const item=getActivityItem(activity);
        const element=createEntityElement(item);

        if(!element)return;

        const date=new Date(
            Number(activity.createdAt??0)
        );

        const result=insertEntityListItem({
            groupId:getActivityGroupId(date),
            groupTitle:formatActivityGroupDate(date),
            element,
            compare:(newElement,row)=>{
                const current=getEntityData(row);

                return compareEntities(
                    current,
                    item
                );
            }
        });

        if(result?.group){
            result.group.dataset.sortDirection="desc";
        }
    });
}

function createEntityElement(item){
    const template=document.createElement("template");

    template.innerHTML=`
        <div
            class="entity-list-row entity-list-row--clickable entity-list-row--description entity-list-row--meta"
            data-id="${item.id}"
            data-sort-value="${item.sortValue}"
        >
            <div class="entity-list-row__title">
                <span class="entity-list-row__title-text">
                    ${item.title}
                </span>
            </div>

            <div class="entity-list-row__description">
                ${item.description}
            </div>

            <div class="entity-list-row__meta">
                ${item.meta}
            </div>
        </div>
    `.trim();

    return template.content.firstElementChild;
}

function getEntityData(row){
    return{
        sortValue:Number(
            row.dataset.sortValue??0
        ),
        title:
            row.querySelector(
                ".entity-list-row__title-text"
            )?.textContent.trim()??"",
        meta:
            row.querySelector(
                ".entity-list-row__meta"
            )?.textContent.trim()??""
    };
}

export async function refreshActivityModal(){
    if(!currentActivityModal?.root?.isConnected){
        currentActivityModal=null;
        return;
    }

    const page=await getActivityPage(
        null,
        PAGE_SIZE
    );

    currentActivityModal.activities=page.activities;
    currentActivityModal.lastDoc=page.lastDoc;
    currentActivityModal.hasMore=page.hasMore;

    currentActivityModal.setContent(
        renderActivityList(page.activities)
    );
}

async function openActivityTarget(activity){
    const{
        action,
        entityType,
        entityId,
        parentId
    }=activity;

    if(entityType==="object"){
        if(action==="delete"){
            window.location.href=
                parentId
                    ?`object.html?id=${parentId}`
                    :"index.html";
            return;
        }

        if(entityId){
            window.location.href=
                `object.html?id=${entityId}`;
        }

        return;
    }

    if(
        entityType==="photo"||
        entityType==="source"||
        entityType==="record"
    ){
        if(parentId){
            window.location.href=
                `object.html?id=${parentId}`;
        }

        return;
    }

    if(entityType==="subject"){
        if(action==="delete"){
            await openModal("subjects");
            return;
        }

        const subject=
            await getSubject(entityId);

        if(!subject)return;

        await openModal(
            "subject",
            {entityId}
        );

        return;
    }

    if(
        entityType==="objectType"||
        entityType==="recordType"||
        entityType==="subjectType"
    ){
        await openModal("types");
    }
}

function getActivityGroupId(date){
    return[
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ].join("-");
}

function getActivityItem(activity){
    return{
        id:activity.id,
        clickable:true,
        sortValue:Number(activity.createdAt??0),
        title:escapeHTML(
            activity.adminName||
            activity.adminEmail||
            "Неизвестный администратор"
        ),
        description:
            formatActivityDescription(activity),
        meta:
            renderDateTime(
                activity.createdAt
            )
    };
}

function renderActivityList(activities=[]){
    const groups=new Map();

    activities.forEach(activity=>{
        const date=new Date(
            Number(activity.createdAt??0)
        );

        const key=getActivityGroupId(date);

        if(!groups.has(key)){
            groups.set(
                key,
                {
                    id:key,
                    date,
                    items:[]
                }
            );
        }

        groups.get(key).items.push(
            getActivityItem(activity)
        );
    });

    return renderEntityList({
        groups:[
            ...groups.values()
        ].map(group=>({
            id:group.id,
            title:
                formatActivityGroupDate(
                    group.date
                ),
            items:group.items,
            sortDirection:"desc"
        }))
    });
}

function formatActivityGroupDate(date){
    const now=new Date();

    const today=new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const target=new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diff=
        Math.round(
            (today-target)/86400000
        );

    if(diff===0)return"Сегодня";
    if(diff===1)return"Вчера";

    return date.toLocaleDateString(
        "ru-RU",
        {
            day:"numeric",
            month:"long",
            year:"numeric"
        }
    );
}

function formatActivityDescription(activity){
    const title=
        activity.title||
        "Без названия";

    const name=
        escapeHTML(title);

    if(activity.action==="create"){
        return`
            Создание ${formatEntityName(activity.entityType)} "${name}"
        `;
    }

    if(activity.action==="update"){
        return`
            Изменение ${formatEntityName(activity.entityType)} "${name}"
        `;
    }

    if(activity.action==="delete"){
        return`
            Удаление ${formatEntityName(activity.entityType)} "${name}"
        `;
    }

    return`
        ${formatEntityName(activity.entityType)} "${name}"
    `;
}

function formatEntityName(type){
    const names={
        object:"объекта",
        photo:"фотографии",
        source:"источника",
        record:"записи",
        subject:"субъекта",
        objectType:"типа объектов",
        recordType:"типа записей",
        subjectType:"типа субъектов"
    };

    return names[type]??"сущности";
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
