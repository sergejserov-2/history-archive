import{getRecentFeedbacks}from"../../api/feedback.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList}from"./entityList.js";
import{renderDateTime}from"./date.js";

let currentFeedbacksModal=null;

export async function openFeedbacksModal(){
    const feedbacks=await getRecentFeedbacks(100);

    const modal=createModal({
        title:"Обращения",
        content:renderFeedbackList(feedbacks),
        width:630,
        admin:true
    });

    currentFeedbacksModal=modal;
    modal.feedbacks=feedbacks;

    modal.root.onclick=event=>{
        const row=event.target.closest(".entity-list-row");
        if(!row)return;

        const feedback=modal.feedbacks.find(
            item=>item.id===row.dataset.id
        );

        if(!feedback)return;

        void openModal("feedback-view",{
            entityId:feedback.id
        });
    };

    return modal;
}

export async function refreshFeedbacksModal(){
    if(!currentFeedbacksModal?.root?.isConnected){
        currentFeedbacksModal=null;
        return;
    }

    const feedbacks=await getRecentFeedbacks(100);

    currentFeedbacksModal.feedbacks=feedbacks;

    currentFeedbacksModal.setContent(
        renderFeedbackList(feedbacks)
    );
}

function renderFeedbackList(feedbacks=[]){
    const groups=new Map();

    [...feedbacks]
        .sort((a,b)=>Number(b.createdAt??0)-Number(a.createdAt??0))
        .forEach(feedback=>{
            const date=new Date(Number(feedback.createdAt??0));
            const key=`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

            if(!groups.has(key)){
                groups.set(key,{date,items:[]});
            }

            groups.get(key).items.push({
                id:feedback.id,
                clickable:true,
                sortValue:Number(feedback.createdAt??0),
                title:escapeHTML(feedback.name||"Без имени"),
                description:escapeHTML(feedback.title||"Без заголовка"),
                meta:renderDateTime(feedback.createdAt)
            });
        });

    return renderEntityList({
        groups:[
            ...groups.values().map(group=>({
                title:formatFeedbackGroupDate(group.date),
                items:group.items,
                sortDirection:"desc"
            }))
        ]
    });
}

function formatFeedbackGroupDate(date){
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const target=new Date(date.getFullYear(),date.getMonth(),date.getDate());
    const diff=Math.round((today-target)/86400000);

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
