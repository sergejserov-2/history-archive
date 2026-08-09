// ======================================
// Admin
// ======================================

import {
    openObjectEditor
}
from "./editors/objectEditor.js";

import {
    openEntityEditor
}
from "./editors/entityEditor.js";

import {
    deleteObject
}
from "../api/objects.js";

import {
    deletePhoto
}
from "../api/photos.js";

import {
    deleteSource
}
from "../api/sources.js";

import {
    deleteRecord
}
from "../api/records.js";

import {
    moveFileToDeleted
}
from "../api/storage.js";

import {
    setModalUrl
}
from "../ui/components/modal.js";

// ======================================
// Init
// ======================================

export function initAdmin(

    object,

    types,

    objects,

    photos,

    sources,

    records,

    children,

    recordTypes

){

    document.addEventListener(

        "click",

        async event => {

            const button =

                event.target.closest(

                    ".admin-button"

                );

            if(!button){

                return;

            }

            const action =

                button.dataset.action;

            const id =

                button.dataset.id;

            // ======================================
            // Object type / level
            //
            // Тип объекта НЕ меняем.
            // Уровень определяется через types.
            // ======================================

            const objectType =

                types.find(

                    type =>
                        type.id ===
                        object?.typeId

                );

            const objectLevel =

                Number(

                    objectType?.level

                );

            // ======================================
            // Record types available for this object
            // ======================================

            const availableRecordTypes =

                (recordTypes ?? [])

                .filter(

                    recordType =>

                        recordType.levels
                        ?.map(Number)
                        .includes(
                            objectLevel
                        )

                );

            // ======================================
            // Context
            // ======================================

            const context = {

                objects,

                parentId:
                    object.id,

                recordTypes:
                    availableRecordTypes

            };

            // ======================================
            // Object edit
            // ======================================

            if(

                action ===
                "edit-object"

            ){

                setModalUrl(

                    "object-editor",

                    {

                        entityId:
                            object.id

                    }

                );

                openObjectEditor(

                    object,

                    types,

                    objects,

                    photos,

                    children,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Object delete
            // ======================================

            if(

                action ===
                "delete-object"

            ){

                const ok =
                    confirm(

                        "Удалить объект и все дочерние сущности?"

                    );

                if(!ok){

                    return;

                }

                await deleteObject(

                    id

                );

                location.reload();

                return;

            }
            
            // ======================================
            // Add object
            // ======================================

            if(

                action ===
                "add-object"

            ){

                setModalUrl(

                    "object-editor",

                    {

                        entityId:
                            null

                    }

                );

                openObjectEditor(

                    null,

                    types,

                    objects,

                    photos,

                    [],

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Add photo
            // ======================================

            if(

                action ===
                "add-photo"

            ){

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            null,

                        entityType:
                            "photo"

                    }

                );

                openEntityEditor(

                    "photo",

                    null,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Edit photo
            // ======================================

            if(

                action ===
                "edit-photo"

            ){

                const photo =

                    photos.find(

                        p =>
                            p.id === id

                    );

                if(!photo){

                    return;

                }

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            photo.id,

                        entityType:
                            "photo"

                    }

                );

                openEntityEditor(

                    "photo",

                    photo,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Delete photo
            // ======================================

            if(

                action ===
                "delete-photo"

            ){

                if(

                    !confirm(

                        "Удалить фотографию?"

                    )

                ){

                    return;

                }

                const photo =

                    photos.find(

                        p =>
                            p.id === id

                    );

                try{

                    // ======================================
                    // Перемещаем файл в deleted
                    // ======================================

                    if(
                        photo?.storagePath
                    ){

                        await moveFileToDeleted(

                            photo.storagePath

                        );

                    }

                    // ======================================
                    // Удаляем сущность из Firestore
                    // ======================================

                    await deletePhoto(

                        id

                    );

                    location.reload();

                }

                catch(error){

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

            // ======================================
            // Add source
            // ======================================

            if(

                action ===
                "add-source"

            ){

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            null,

                        entityType:
                            "source"

                    }

                );

                openEntityEditor(

                    "source",

                    null,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Edit source
            // ======================================

            if(

                action ===
                "edit-source"

            ){

                const source =

                    sources.find(

                        s =>
                            s.id === id

                    );

                if(!source){

                    return;

                }

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            source.id,

                        entityType:
                            "source"

                    }

                );

                openEntityEditor(

                    "source",

                    source,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Delete source
            // ======================================

            if(

                action ===
                "delete-source"

            ){

                if(

                    !confirm(

                        "Удалить источник?"

                    )

                ){

                    return;

                }

                const source =

                    sources.find(

                        s =>
                            s.id === id

                    );

                try{

                    // ======================================
                    // Перемещаем файл в deleted
                    // ======================================

                    if(
                        source?.storagePath
                    ){

                        await moveFileToDeleted(

                            source.storagePath

                        );

                    }

                    // ======================================
                    // Удаляем сущность из Firestore
                    // ======================================

                    await deleteSource(

                        id

                    );

                    location.reload();

                }

                catch(error){

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

            // ======================================
            // Add record
            // ======================================

            if(

                action ===
                "add-record"

            ){

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            null,

                        entityType:
                            "record"

                    }

                );

                openEntityEditor(

                    "record",

                    null,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Edit record
            // ======================================

            if(

                action ===
                "edit-record"

            ){

                const record =

                    records.find(

                        r =>
                            r.id === id

                    );

                if(!record){

                    return;

                }

                setModalUrl(

                    "entity-editor",

                    {

                        entityId:
                            record.id,

                        entityType:
                            "record"

                    }

                );

                openEntityEditor(

                    "record",

                    record,

                    context,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Delete record
            // ======================================

            if(

                action ===
                "delete-record"

            ){

                if(

                    !confirm(

                        "Удалить запись?"

                    )

                ){

                    return;

                }

                await deleteRecord(

                    id

                );

                location.reload();

                return;

            }

        }

    );

}
