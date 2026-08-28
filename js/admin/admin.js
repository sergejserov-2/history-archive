import{deleteEntity}from"./update.js";
import{openModal}from"../ui/components/modalReload.js";
import{refreshSubjectsModal}from"../ui/components/subjects.js";

let initialized=false;

export function initAdmin(page,updates={}){
    if(initialized)return;
    initialized=true;

    document.addEventListener("click",async event=>{
        const button=event.target.closest(".admin-button");
        if(!button||button.classList.contains("admin-button--disabled"))return;

        const action=button.dataset.action;
        const id=button.dataset.id;
        const object=page.object;
        const types=page.types;
        const objects=page.objects;
        const photos=page.photos;
        const sources=page.sources;
        const records=page.records;
        const children=page.children;
        const subjects=page.subjects??[];
        const recordTypes=page.recordTypes??[];
        const subjectTypes=page.subjectTypes??[];

        const objectType=types.find(type=>type.id===object?.typeId);
        const objectLevel=Number(objectType?.level);
        const availableRecordTypes=recordTypes.filter(recordType=>recordType.levels?.map(Number).includes(objectLevel));

        const context={
            objects,
            parentId:object?.id,
            recordTypes:availableRecordTypes,
            subjectTypes,
            types,
            photos,
            sources,
            records,
            children,
            subjects,
            updates
        };

        if(action==="edit-object"){
            await openModal("editor",{entityId:object.id,entityType:"object"},context);
            return;
        }

        if(action==="delete-object"){
            if(!confirm("Удалить объект и все дочерние сущности?"))return;
            try{
                const result=await deleteEntity("object",id,context);
                if(result?.parentId)window.location.href=`object.html?id=${result.parentId}`;
            }catch(error){
                console.error("Ошибка удаления объекта:",error);
                alert("Не удалось удалить объект");
            }
            return;
        }

        if(action==="add-object"){
            await openModal("editor",{entityType:"object"},context);
            return;
        }

        if(action==="add-photo"){
            await openModal("editor",{entityType:"photo"},context);
            return;
        }

        if(action==="edit-photo"){
            if(!photos.find(photo=>photo.id===id))return;
            await openModal("editor",{entityId:id,entityType:"photo"},context);
            return;
        }

        if(action==="delete-photo"){
            if(!confirm("Удалить фотографию?"))return;
            try{
                await deleteEntity("photo",id,{...context,photos});
            }catch(error){
                console.error("Ошибка удаления фотографии:",error);
                alert("Не удалось удалить фотографию");
            }
            return;
        }

        if(action==="add-source"){
            await openModal("editor",{entityType:"source"},context);
            return;
        }

        if(action==="edit-source"){
            if(!sources.find(source=>source.id===id))return;
            await openModal("editor",{entityId:id,entityType:"source"},context);
            return;
        }

        if(action==="delete-source"){
            if(!confirm("Удалить источник?"))return;
            try{
                await deleteEntity("source",id,{...context,sources});
            }catch(error){
                console.error("Ошибка удаления источника:",error);
                alert("Не удалось удалить источник");
            }
            return;
        }

        if(action==="add-record"){
            await openModal("editor",{entityType:"record"},context);
            return;
        }

        if(action==="edit-record"){
            if(!records.find(record=>record.id===id))return;
            await openModal("editor",{entityId:id,entityType:"record"},context);
            return;
        }

        if(action==="delete-record"){
            if(!confirm("Удалить запись?"))return;
            try{
                await deleteEntity("record",id,{...context,records:page.records});
            }catch(error){
                console.error("Ошибка удаления записи:",error);
                alert("Не удалось удалить запись");
            }
            return;
        }

        if(action==="add-subject"){
            await openModal("editor",{entityType:"subject"},context);
            return;
        }

        if(action==="edit-subject"){
            if(!subjects.find(subject=>subject.id===id))return;
            await openModal("editor",{entityId:id,entityType:"subject"},context);
            return;
        }

        if(action==="delete-subject"){
            if(!confirm("Удалить субъект?"))return;
            try{
                await deleteEntity("subject",id,{
                    ...context,
                    subjects,
                    updates:{
                        ...updates,
                        onSubjectDeleted:refreshSubjectsModal
                    }
                });
            }catch(error){
                console.error("Ошибка удаления субъекта:",error);
                alert("Не удалось удалить субъект");
            }
        }
    });
}
