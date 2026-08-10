// ======================================
// Entity editor
// ======================================

import {
    createModal
}
from "../../ui/components/modal.js";

import {

    renderEntityEditor,
    setupFileEditor,
    setupParentsEditor,
    setupEntityFieldsEditor,
    setupEditorButtons,
    setupFieldCounters

}
from "../../ui/components/editor.js";

import {
    uploadPhoto,
    uploadSourceDocument,
    moveFileToDeleted
}
from "../../api/storage.js";

import {
    updatePhoto,
    createPhoto
}
from "../../api/photos.js";

import {
    updateSource,
    createSource
}
from "../../api/sources.js";

import {
    updateRecord,
    createRecord
}
from "../../api/records.js";

// ======================================
// Config
// ======================================

const CONFIG = {

photo: {

    title: "Фото",

    update: updatePhoto,
    create: createPhoto,

    upload: uploadPhoto,

    file: true,

    limits: {

        title: 45,

        description: 350,

        author: 45

    },

    fields: [

        "author",

        "date"

    ]

},

source: {

    title: "Источник",

    update: updateSource,
    create: createSource,

    upload: uploadSourceDocument,

    file: true,

    limits: {

        title: 45,

        description: 2000,

        author: 45

    },

    fields: [

        "author",

        "date"

    ]

},

record: {

    title: "Запись",

    update: updateRecord,
    create: createRecord,

    file: false,

    limits: {

        title: 45,

        description: 75

    },

    fields: [

        "dateStart",
        "dateEnd"

    ],

    options: {

        typeSelector: true

    }

}

};

// ======================================
// Open
// ======================================

export function openEntityEditor(

    type,

    entity,

    context,

    onSave

){

const cfg = CONFIG[type];

    if(!cfg){

        console.error(
            "Unknown entity type",
            type
        );

        return;

    }

    const isNew = !entity;

    if(isNew){

        entity = {

            title:

                type === "photo"
                ? "Новая фотография"

                :

                type === "source"
                ? "Новый источник"

                :

                "Новая запись"

        };

    }

    let parents =

        entity.parents

        ?

        [...entity.parents]

        :

        context.parentId
        ? [context.parentId]
        : [];


const form = renderEntityEditor(

    {

        ...cfg,

        options: {

            ...(cfg.options ?? {}),

            types:
                type === "record"
                ?
                (
                    context.recordTypes ?? []
                )
                :
                []

        }

    },

    entity

);

const modal = createModal({

    title:
        entity?.id
        ?
        `Изменить ${cfg.title.toLowerCase()}`
        :
        `Добавить ${cfg.title.toLowerCase()}`,

    content: form

});

const root = modal.root;
setupFieldCounters(root);

const fileEditor = setupFileEditor(
    root,
    entity,
    cfg.upload
);

const parentsEditor = setupParentsEditor(
    root,
    context.objects,
    entity,
    parents
);

const fieldsEditor = setupEntityFieldsEditor(

    root,

    cfg,

    type === "record"
        ?
        {
            typeId:
                "#entityType"
        }
        :
        {}

);


setupEditorButtons(

    root,

    async()=>{

        try{

            if(
                type === "photo" &&
                !fileEditor?.hasFile()
            ){

                alert(
                    "Для фотографии необходимо выбрать файл"
                );

                return;

            }

            const data = {

                ...fieldsEditor.getData(),

                parents:
                    parentsEditor.getParents()

            };

const fileData =
    await fileEditor?.getData();

if(fileData){

    // ======================================
    // Старый файл был откреплён
    // ======================================

    if(
        fileData.removedStoragePath
    ){

        await moveFileToDeleted(

            fileData.removedStoragePath

        );

        data.storagePath = null;

    }

    if(
    fileData.removedPreviewPath
){

    await moveFileToDeleted(
        fileData.removedPreviewPath
    );

    data.previewPath = null;

}

    // ======================================
    // Выбран новый файл
    // ======================================

        if(
            fileData.storagePath
        ){
        
            data.storagePath =
                fileData.storagePath;
        
        }
        
        if(
            fileData.previewPath
        ){
        
            data.previewPath =
                fileData.previewPath;
        
        }

}

            if(!isNew){

                await cfg.update(
                    entity.id,
                    data
                );

            }
            else{

                if(
                    parentsEditor.getParents().length === 0
                ){

                    alert(
                        "Нужен хотя бы один родитель"
                    );

                    return;

                }

                await cfg.create(
                    data
                );

            }

            modal.close();

            onSave?.();

        }
        catch(error){

            console.error(error);

            alert(
                "Ошибка сохранения"
            );

        }

    },

    ()=>{

        modal.close();

    }

);
}
