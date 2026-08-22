import{getRecentActivities}from"../../api/activity.js";
import{createModal,setModalUrl}from"./modal.js";
import{renderEntityList}from"./entityList.js";
import{openSubjectModal}from"./subject.js";
import{openSubjectsModal}from"./subjects.js";
import{openTypesModal}from"./types.js";
import{getSubject}from"../../api/subjects.js";
import{getType}from"../../api/types.js";
import{getRecordType}from"../../api/recordTypes.js";
import{getSubjectType}from"../../api/subjectTypes.js";

let currentActivityModal=null;

export async function openActivityModal(){

    const activities=await getRecentActivities(100);

    const modal=createModal({
        title:"Активность",
        content:renderActivityList(activities),
        width:525
    });

    currentActivityModal=modal;
    modal.activities=activities;

    modal.root.addEventListener("click",async event=>{

        const row=event.target.closest(".entity-list-row");

        if(!row)return;

        const id=row.dataset.id;

        if(!id)return;

        const activity=activities.find(
            item=>item.id===id
        );

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

    const{
        action,
        entityType,
        entityId,
        parentId
    }=activity;

    // ======================================
    // Object
    // ======================================

    if(entityType==="object"){

        if(action==="delete"){

            if(parentId){

                window.location.href=
                    `object.html?id=${parentId}`;

            }else{

                window.location.href="index.html";

            }

            return;
        }

        if(entityId){

            window.location.href=
                `object.html?id=${entityId}`;

        }

        return;
    }

    // ======================================
    // Photo / Source / Record
    // ======================================

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

    // ======================================
    // Subject
    // ======================================

if(entityType==="subject"){

    if(action==="delete"){

        setModalUrl("subjects",{});

        await openSubjectsModal();

        return;
    }

    const subject=await getSubject(entityId);

    if(!subject)return;

    setModalUrl("subject",{
        entityId
    });

    openSubjectModal(
        subject,
        {
            fromUrl:true
        }
    );

    return;
}

    // ======================================
    // Types
    // ======================================

if(
    entityType==="objectType"||
    entityType==="recordType"||
    entityType==="subjectType"
){

    setModalUrl("types",{});

    await openTypesModal();

    return;
}
}

function renderActivityList(activities=[]){

    const items=
        [...activities]
            .sort(
                (a,b)=>
                    Number(b.createdAt??0)-
                    Number(a.createdAt??0)
            )
            .map(activity=>({

                id:activity.id,

                clickable:true,

                title:
                    escapeHTML(
                        activity.adminEmail||
                        "Неизвестный администратор"
                    ),
                    description:
                    escapeHTML(
                        formatActivityDescription(activity)
                    ),

                meta:
                    formatActivityDate(
                        activity.createdAt
                    )

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

    const title=
        activity.title||
        "Без названия";

    const name=
        escapeHTML(title);

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

    if(!timestamp)return"";

    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day:"numeric",
            month:"long",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"
        }
    ).format(
        new Date(timestamp)
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
