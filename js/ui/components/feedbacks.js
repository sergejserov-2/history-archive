import{getFeedbackPage}from"../../api/feedback.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList,insertEntityListItem}from"./entityList.js";
import{renderDateTime}from"./date.js";
import{compareEntities}from"./sort.js";

const PAGE_SIZE=500;

let currentFeedbacksModal=null;

export async function openFeedbacksModal(){
    const page=await getFeedbackPage(null,PAGE_SIZE);

    const modal=createModal({
        title:"Обращения",
        content:renderFeedbackList(page.feedbacks),
        width:630,
        admin:true
    });

    currentFeedbacksModal=modal;
    modal.feedbacks=page.feedbacks;
    modal.lastDoc=page.lastDoc;
    modal.hasMore=page.hasMore;
    modal.loading=false;

    modal.root.onclick=event=>{
        const row=event.target.closest(".entity-list-row");

        if(!row)return;

        const feedback=modal.feedbacks.find(
            item=>item.id===row.dataset.id
        );

        if(!feedback)return;

        void openModal(
            "feedback-view",
            {
                entityId:feedback.id
            }
        );
    };

    setupFeedbacksInfiniteScroll(modal);

    return modal;
}

function setupFeedbacksInfiniteScroll(modal){
    const scrollRoot=
        modal.root.querySelector(".modal__content")??
        modal.root;

    async function loadMore(){
        if(
            !modal.hasMore||
            modal.loading
        ){
            return;
        }

        const remaining=
            scrollRoot.scrollHeight-
            scrollRoot.scrollTop-
            scrollRoot.clientHeight;

        if(remaining>300)return;

        modal.loading=true;

        try{
            const page=await getFeedbackPage(
                modal.lastDoc,
                PAGE_SIZE
            );

            if(!page.feedbacks.length){
                modal.hasMore=false;
                return;
            }

            appendFeedbacks(
                modal.root,
                page.feedbacks
            );

            modal.feedbacks.push(
                ...page.feedbacks
            );

            modal.lastDoc=page.lastDoc;
            modal.hasMore=page.hasMore;
        }finally{
            modal.loading=false;
        }
    }

    scrollRoot.addEventListener(
        "scroll",
        ()=>void loadMore()
    );
}

function appendFeedbacks(root,feedbacks=[]){
    feedbacks.forEach(feedback=>{
        const item=getFeedbackItem(feedback);
        const element=createEntityElement(item);

        if(!element)return;

        const date=new Date(
            Number(feedback.createdAt??0)
        );

        insertEntityListItem({
            groupId:getFeedbackGroupId(date),
            groupTitle:formatFeedbackGroupDate(date),
            element,
            compare:(newElement,row)=>{
                const current=getEntityData(row);

                return compareEntities(
                    current,
                    item
                );
            }
        });
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

export async function refreshFeedbacksModal(){
    if(!currentFeedbacksModal?.root?.isConnected){
        currentFeedbacksModal=null;
        return;
    }

    const page=await getFeedbackPage(
        null,
        PAGE_SIZE
    );

    currentFeedbacksModal.feedbacks=
        page.feedbacks;

    currentFeedbacksModal.lastDoc=
        page.lastDoc;

    currentFeedbacksModal.hasMore=
        page.hasMore;

    currentFeedbacksModal.loading=false;

    currentFeedbacksModal.setContent(
        renderFeedbackList(page.feedbacks)
    );
}

function getFeedbackGroupId(date){
    return[
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ].join("-");
}

function getFeedbackItem(feedback){
    return{
        id:feedback.id,
        clickable:true,
        sortValue:Number(
            feedback.createdAt??0
        ),
        title:
            escapeHTML(
                feedback.name||
                "Без имени"
            ),
        description:
            escapeHTML(
                feedback.title||
                "Без заголовка"
            ),
        meta:
            renderDateTime(
                feedback.createdAt
            )
    };
}

function renderFeedbackList(feedbacks=[]){
    const groups=new Map();

    feedbacks.forEach(feedback=>{
        const date=new Date(
            Number(feedback.createdAt??0)
        );

        const key=getFeedbackGroupId(date);

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
            getFeedbackItem(feedback)
        );
    });

    return renderEntityList({
        groups:[
            ...groups.values()
        ].map(group=>({
            id:group.id,
            title:
                formatFeedbackGroupDate(
                    group.date
                ),
            items:group.items,
            sortDirection:"desc"
        }))
    });
}

function formatFeedbackGroupDate(date){
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

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
