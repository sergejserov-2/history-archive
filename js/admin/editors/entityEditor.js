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
    setupEditorButtons
}
from "../../ui/components/editor.js";

import {
    uploadPhotoOriginal,
    uploadSourceDocument
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

        upload: uploadPhotoOriginal,

        file: true,

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

        fields: [

            "dateStart",

            "dateEnd"

        ]

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

    let parents =
    
        entity
    
        ?
    
        [...(entity.parents ?? [])]
    
        :
    
        [context.parentId];



const form = renderEntityEditor(

    cfg,

    entity

);

    const modal = createModal({

        title: cfg.title,

        content: form

    });

    const root = modal.root;

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
    cfg
);

setupEditorButtons(

    root,

    async()=>{

        try{

            const data = {

                ...fieldsEditor.getData(),

                parents:
                    parentsEditor.getParents()

            };

            const fileData =
                await fileEditor?.getData();

            if(fileData){

                Object.assign(
                    data,
                    fileData
                );

            }

            if(entity){

                await cfg.update(
                    entity.id,
                    data
                );

            }
            else{

                if(
                    parentsEditor.getParents().length===0
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
