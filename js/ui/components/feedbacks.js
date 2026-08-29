import{getFeedbackPage}from"../../api/feedback.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList}from"./entityList.js";
import{renderDateTime}from"./date.js";

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

function appendFeedbacks(root,feedbacks){
    const list=
        root.querySelector(".entity-list");

    if(!list)return;

    const html=
        renderFeedbackList(feedbacks);

    const temp=
        document.createElement("div");

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

function renderFeedbackList(feedbacks=[]){
    const groups=new Map();

    [...feedbacks]
        .sort(
            (a,b)=>
                Number(b.createdAt??0)-
                Number(a.createdAt??0)
        )
        .forEach(feedback=>{
            const date=
                new Date(
                    Number(feedback.createdAt??0)
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
                id:feedback.id,
                clickable:true,
                sortValue:
                    Number(
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
            });
        });

    return renderEntityList({
        groups:[
            ...groups.values().map(
                group=>({
                    title:
                        formatFeedbackGroupDate(
                            group.date
                        ),
                    items:group.items,
                    sortDirection:"desc"
                })
            )
        ]
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
