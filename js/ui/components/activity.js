import{getRecentActivities}from"../../api/activity.js";
import{createModal,setModalUrl}from"./modal.js";
import{renderEntityList}from"./entityList.js";
import{openSubjectModal}from"./subject.js";
import{openSubjectsModal}from"./subjects.js";
import{openTypesModal}from"./types.js";
import{getSubject}from"../../api/subjects.js";

let currentActivityModal=null;

export async function openActivityModal(){
    const activities=await getRecentActivities(100);
    const modal=createModal({
        title:"История изменений",
        content:renderActivityList(activities),
        width:630
    });
    currentActivityModal=modal;
    modal.activities=activities;
    modal.root.addEventListener("click",async event=>{
        const row=event.target.closest(".entity-list-row");
        if(!row)return;
        const id=row.dataset.id;
        if(!id)return;
        const activity=activities.find(item=>item.id===id);
        if(!activity)return;
        event.preventDefault();
        await openActivityTarget(activity);
    });
    return modal;
}

export async function refreshActivityModal(){
    if(!currentActivityModal?.root?.isConnected){
        currentActivityModal=null;
        return;
    }
    const activities=await getRecentActivities(100);
    currentActivityModal.activities=activities;
    currentActivityModal.setContent(
        renderActivityList(activities)
    );
}

async function openActivityTarget(activity){
    const{action,entityType,entityId,parentId}=activity;

    if(entityType==="object"){
        if(action==="delete"){
            window.location.href=parentId
                ?`object.html?id=${parentId}`
                :"index.html";
            return;
        }
        if(entityId){
            window.location.href=`object.html?id=${entityId}`;
        }
        return;
    }

    if(
        entityType==="photo"||
        entityType==="source"||
        entityType==="record"
    ){
        if(parentId){
            window.location.href=`object.html?id=${parentId}`;
        }
        return;
    }

    if(entityType==="subject"){
        if(action==="delete"){
            setModalUrl("subjects",{});
            await openSubjectsModal();
            return;
        }
        const subject=await getSubject(entityId);
        if(!subject)return;
        setModalUrl("subject",{entityId});
        openSubjectModal(subject,{fromUrl:true});
        return;
    }

    if(
        entityType==="objectType"||
        entityType==="recordType"||
        entityType==="subjectType"
    ){
        setModalUrl("types",{});
        await openTypesModal();
    }
}

function renderActivityList(activities=[]){
    const items=[...activities]
        .sort(
            (a,b)=>
                Number(a.createdAt??0)-
                Number(b.createdAt??0)
        )
        .map(activity=>({
            id:activity.id,
            clickable:true,
            title:escapeHTML(
                activity.adminName||
                activity.adminEmail||
                "Неизвестный администратор"
            ),
            description:escapeHTML(
                formatActivityDescription(activity)
            ),
            meta:formatActivityDate(activity.createdAt)
        }));

    return renderEntityList({
        groups:[
            {
                title:"",
                items
            }
        ]
    });
}

function formatActivityDescription(activity){
    const title=activity.title||"Без названия";
    const name=escapeHTML(title);

    if(activity.action==="create")
        return`Создание ${formatEntityName(activity.entityType)} "${name}"`;
    if(activity.action==="update")
        return`Изменение ${formatEntityName(activity.entityType)} "${name}"`;
    if(activity.action==="delete")
        return`Удаление ${formatEntityName(activity.entityType)} "${name}"`;

    return`${formatEntityName(activity.entityType)} "${name}"`;
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

function formatActivityDate(timestamp){
    const date=new Date(timestamp);
    const months=[
        "I","II","III","IV","V","VI",
        "VII","VIII","IX","X","XI","XII"
    ];
    const day=String(date.getDate()).padStart(2,"0");
    const month=months[date.getMonth()];
    const year=String(date.getFullYear()).slice(-2);
    const time=date.toLocaleTimeString("ru-RU",{
        hour:"2-digit",
        minute:"2-digit"
    });
    return`${day}/${month}-${year}, ${time}`;
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
