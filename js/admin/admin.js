import{openEditor}from"./editorConfig.js";
import{deleteEntity}from"./update.js";
import{setModalUrl}from"../ui/components/modal.js";

export function initAdmin(page,updates={}){
    document.addEventListener("click",async event=>{
        const button=event.target.closest(".admin-button");
        if(!button)return;

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
        const recordTypes=page.recordTypes;

        const objectType=types.find(
            type=>type.id===object?.typeId
        );

        const objectLevel=
            Number(objectType?.level);

        const availableRecordTypes=
            (recordTypes??[]).filter(
                recordType=>
                    recordType.levels
                        ?.map(Number)
                        .includes(objectLevel)
            );

        const context={
            objects,
            parentId:object.id,
            recordTypes:availableRecordTypes,
            types,
            photos,
            sources,
            records,
            children,
            subjects,
            updates
        };

        if(action==="edit-object"){
            setModalUrl(
                "object-editor",
                {entityId:object.id}
            );

            await openEditor(
                "object",
                object,
                context
            );

            return;
        }

        if(action==="delete-object"){
            if(!confirm("Удалить объект и все дочерние сущности?"))return;

            try{
                const result=
                    await deleteEntity(
                        "object",
                        id,
                        context
                    );

                if(result?.parentId){
                    window.location.href=
                        `object.html?id=${result.parentId}`;
                }
            }catch(error){
                console.error(
                    "Ошибка удаления объекта:",
                    error
                );

                alert(
                    "Не удалось удалить объект"
                );
            }

            return;
        }

        if(action==="add-object"){
            setModalUrl(
                "object-editor",
                {entityId:null}
            );

            await openEditor(
                "object",
                null,
                {
                    ...context,
                    children:[]
                }
            );

            return;
        }

        if(action==="add-photo"){
            setModalUrl(
                "entity-editor",
                {
                    entityId:null,
                    entityType:"photo"
                }
            );

            await openEditor(
                "photo",
                null,
                context
            );

            return;
        }

        if(action==="edit-photo"){
            const photo=
                page.photos.find(
                    photo=>photo.id===id
                );

            if(!photo)return;

            setModalUrl(
                "entity-editor",
                {
                    entityId:photo.id,
                    entityType:"photo"
                }
            );

            await openEditor(
                "photo",
                photo,
                {
                    ...context,
                    photos:page.photos
                }
            );

            return;
        }

        if(action==="delete-photo"){
            if(!confirm("Удалить фотографию?"))return;

            try{
                await deleteEntity(
                    id,
                    {
                        ...context,
                        photos:page.photos
                    }
                );
            }catch(error){
                console.error(
                    "Ошибка удаления фотографии:",
                    error
                );

                alert(
                    "Не удалось удалить фотографию"
                );
            }

            return;
        }

        if(action==="add-source"){
            setModalUrl(
                "entity-editor",
                {
                    entityId:null,
                    entityType:"source"
                }
            );

            await openEditor(
                "source",
                null,
                context
            );

            return;
        }

        if(action==="edit-source"){
            const source=
                page.sources.find(
                    source=>source.id===id
                );

            if(!source)return;

            setModalUrl(
                "entity-editor",
                {
                    entityId:source.id,
                    entityType:"source"
                }
            );

            await openEditor(
                "source",
                source,
                {
                    ...context,
                    sources:page.sources
                }
            );

            return;
        }

        if(action==="delete-source"){
            if(!confirm("Удалить источник?"))return;

            try{
                await deleteEntity(
                    "source",
                    id,
                    {
                        ...context,
                        sources:page.sources
                    }
                );
            }catch(error){
                console.error(
                    "Ошибка удаления источника:",
                    error
                );

                alert(
                    "Не удалось удалить источник"
                );
            }

            return;
        }

        if(action==="add-record"){
            setModalUrl(
                "entity-editor",
                {
                    entityId:null,
                    entityType:"record"
                }
            );

            await openEditor(
                "record",
                null,
                context
            );

            return;
        }

        if(action==="edit-record"){
            const record=
                page.records.find(
                    record=>record.id===id
                );

            if(!record)return;

            setModalUrl(
                "entity-editor",
                {
                    entityId:record.id,
                    entityType:"record"
                }
            );

            await openEditor(
                "record",
                record,
                {
                    ...context,
                    records:page.records
                }
            );

            return;
        }

        if(action==="delete-record"){
            if(!confirm("Удалить запись?"))return;

            try{
                await deleteEntity(
                    "record",
                    id,
                    {
                        ...context,
                        records:page.records
                    }
                );
            }catch(error){
                console.error(
                    "Ошибка удаления записи:",
                    error
                );

                alert(
                    "Не удалось удалить запись"
                );
            }

            return;
        }

        if(action==="edit-subject"){
            const subject=
                subjects.find(
                    subject=>subject.id===id
                );

            if(!subject)return;

            setModalUrl(
                "subject",
                {
                    entityId:subject.id}
            );

            await openEditor(
                "subject",
                subject,
                {
                    ...context,
                    subjects
                }
            );

            return;
        }

        if(action==="delete-subject"){
            if(!confirm("Удалить субъект?"))return;

            try{
                await deleteEntity(
                    "subject",
                    id,
                    {
                        ...context,
                        subjects
                    }
                );
            }catch(error){
                console.error(
                    "Ошибка удаления субъекта:",
                    error
                );

                alert(
                    "Не удалось удалить субъект"
                );
            }

            return;
        }
    });
}
                    "photo",
