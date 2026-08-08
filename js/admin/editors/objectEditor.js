// ======================================
// Object editor
// ======================================

import {
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    db
}
from "../../firebase.js";

import {
    createObject
}
from "../../api/objects.js";

import {
    createModal
}
from "../../ui/components/modal.js";


import {

    renderEntityEditor,
    setupEntityFieldsEditor,
    setupEditorButtons,
    setupParentsEditor,
    setupCoverEditor

}
from "../../ui/components/editor.js";

// ======================================
// Render
// ======================================

export function renderObjectEditor(

    object,

    types,

    objects,

    photos,

    children,

    context

){

    const objectPhotos =

        object

        ?

        photos.filter(

            photo =>

                photo.parents?.includes(
                    object.id
                )

        )

        :

        [];

    const parent =

        !object && context?.parentId

        ?

        objects.find(

            o =>
            o.id === context.parentId

        )

        :

        null;

    const parentType =

        parent

        ?

        types.find(

            t =>
            t.id === parent.typeId

        )

        :

        null;

    const defaultTypeId =

        object?.typeId

        ??

        types.find(

            t =>

            parentType &&

            t.level === parentType.level - 1

        )?.id

        ??

        "";

    const cfg = {

        title:"Объект",

        fields:[],

        cover:{

            photos:objectPhotos

        },

        options:{

            typeSelector:true,

            types,

            defaultTypeId

        }

    };

    return renderEntityEditor(

        cfg,

        object

    );

}

export function openObjectEditor(
    
    object,

    types,

    objects,

    photos,

    children,

    context,
    
    onSave

){

    const form =
        renderObjectEditor(
            object,
            types,
            objects,
            photos,
            children,
            context
        );

    const modal =
        createModal({

            title:"Объект",

            content:form

        });

    const root =
        modal.root;

   initObjectEditor(
    root,

    object,

    types,

    objects,

    photos,

    children,

    context,

    ()=>{

            modal.close();

            onSave?.();

        }

    );

}





// ======================================
// Init
// ======================================

export function initObjectEditor(

    root,

    object,

    types,

    objects,

    photos,

    children,

    context,

    onSave

){

let parents =

    object

    ?

    JSON.parse(

        JSON.stringify(

            object.parents ?? []

        )

    )

    :

    context?.parentId

    ?

    [

        {

            objectId:
                context.parentId,

            address:""

        }

    ]

    :

    [];

// ======================================
// Parents
// ======================================

const parentsEditor =

setupParentsEditor(

    root,

    objects,

    object,

    parents,

    {

        address:true,

filter(parent){

    if(
        parent.id === object?.id
    ){

        return false;

    }

    const selectedTypeId =

        root.querySelector(
            "#entityType"
        )?.value;

    const objectType =

        types.find(

            t =>
            t.id === selectedTypeId

        );

    const parentType =

        types.find(

            t =>
            t.id === parent.typeId

        );

    if(!parentType){

        return false;

    }

    // ======================================
    // Второй и последующие родители
    // ======================================

    if(
        parents.length > 0
    ){

        const firstParent =

            objects.find(

                o =>
                o.id ===
                parents[0].objectId

            );

        const firstParentType =

            types.find(

                t =>
                t.id === firstParent?.typeId

            );

        if(!firstParentType){

            return false;

        }

        return (

            parentType.level ===
            firstParentType.level

        );

    }

    // ======================================
    // Первый родитель
    // ======================================

    if(!objectType){

        return false;

    }

    return (

        parentType.level >
        objectType.level

    );

}

    }

);

// ======================================
// Fields
// ======================================

const fieldsEditor =

setupEntityFieldsEditor(

    root,

    {

        fields:[]

    },

    {

        typeId:"#entityType"

    }

);

// ======================================
// Cover
// ======================================

const coverEditor =

setupCoverEditor(

    root,

    photos,

    object

);

// ======================================
// Buttons
// ======================================

setupEditorButtons(

    root,

    async()=>{try{

            if(

                parentsEditor
                .getParents()
                .length === 0

            ){

                alert(

                    "Нужен хотя бы один родитель"

                );

                return;

            }

            const fieldsData =

                fieldsEditor.getData();

            const newTypeId =

                fieldsData.typeId;

            const newType =

                types.find(

                    t =>

                    t.id === newTypeId

                );

            if(!newType){

                alert(

                    "Не выбран тип"

                );

                return;

            }

            if(object){

                const oldType =

                    types.find(

                        t =>

                        t.id === object.typeId

                    );

                if(

                    children.length > 0 &&

                    newType.level < oldType.level

                ){

                    alert(

                        "Нельзя выбрать тип ниже текущего"

                    );

                    return;

                }

                const firstParent =

                    objects.find(

                        o =>

                        o.id ===

                        parentsEditor
                        .getParents()[0]

                    );

                const parentType =

                    types.find(

                        t =>

                        t.id === firstParent?.typeId

                    );

                if(

                    parentType &&

                    newType.level >= parentType.level

                ){

                    alert(

                        "Новый тип конфликтует с уровнем родителей."

                    );

                    return;

                }

            }

            const data = {

                ...fieldsData,

                ...coverEditor.getData(),

                parents:

                    parentsEditor.getParents()

            };

            if(object){

                await updateDoc(

                    doc(

                        db,

                        "objects",

                        object.id

                    ),

                    data

                );

            }

            else{

                await createObject(

                    data

                );

            }

            onSave();

        }

        catch(error){

            console.error(error);

            alert(

                "Ошибка сохранения"

            );

        }

    },

    ()=>{

        onSave();

    }

);

}
