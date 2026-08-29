import{getActivityPage}from"../../api/activity.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList}from"./entityList.js";
import{getSubject}from"../../api/subjects.js";
import{renderDateTime}from"./date.js";

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

function appendActivities(root,activities){
    const list=
        root.querySelector(".entity-list");

    if(!list)return;

    const html=renderActivityList(activities);

    const temp=document.createElement("div");

    temp.innerHTML=html;

    const groups=[
        ...temp.querySelectorAll(
            ".entity-list__group"
        )
    ];

    groups.forEach(group=>{
        list.appendChild(group);
    });
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

function renderActivityList(activities=[]){
    const groups=new Map();

    [...activities]
        .sort(
            (a,b)=>
                Number(b.createdAt??0)-
                Number(a.createdAt??0)
        )
        .forEach(activity=>{
            const date=
                new Date(
                    Number(activity.createdAt??0)
                );

            const key=
                `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

            if(!groups.has(key)){
                groups.set(
                    key,
                    {
                        date,
                        items:[]
                    }
                );
            }

            groups.get(key).items.push({
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
            });
        });

    return renderEntityList({
        groups:[
            ...groups.values().map(
                group=>({
                    title:
                        formatActivityGroupDate(
                            group.date
                        ),
                    items:group.items,
                    sortDirection:"desc"
                })
            )
        ]
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
