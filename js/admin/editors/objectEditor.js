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
    setupCoverEditor,
    setupFieldCounters

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

// ======================================
// Default type
// ======================================

let defaultTypeId = "";

// ======================================
// Редактирование существующего объекта
// ======================================

if(object){

    defaultTypeId =
        object.typeId ?? "";

}

// ======================================
// Создание нового объекта
// ======================================

else if(parentType){

    // ==================================
    // Ребёнок должен быть ровно
    // на один уровень ниже родителя
    // ==================================

    const targetLevel =

        Number(parentType.level) - 1;

    // ==================================
    // Берём только типы нужного уровня
    // ==================================

    const availableTypes =

        types.filter(

            type =>

                Number(type.level) ===
                targetLevel

        );

    if(
        availableTypes.length > 0
    ){

        // ==================================
        // Считаем количество объектов
        // каждого типа
        // ==================================

        const typeCounts = {};

        objects.forEach(

            existingObject => {

                if(
                    !existingObject.typeId
                ){

                    return;

                }

                typeCounts[
                    existingObject.typeId
                ] =

                    (
                        typeCounts[
                            existingObject.typeId
                        ]
                        ??
                        0
                    ) + 1;

            }

        );

        // ==================================
        // Сортировка:
        //
        // 1. Популярность — от большей
        //    к меньшей
        //
        // 2. При одинаковой популярности —
        //    название А → Я
        // ==================================

        const sortedTypes =

            [...availableTypes].sort(

                (a, b) => {

                    const countA =
                        typeCounts[a.id] ?? 0;

                    const countB =
                        typeCounts[b.id] ?? 0;

                    if(
                        countA !== countB
                    ){

                        return countB - countA;

                    }

                    return (

                        a.title ?? ""

                    ).localeCompare(

                        b.title ?? "",

                        "ru"

                    );

                }

            );

        defaultTypeId =
            sortedTypes[0].id;

    }

}

// ======================================
// Disabled types
// ======================================

const maxChildLevel =

    children.length > 0

    ?

    Math.max(

        ...children.map(

            child => {

                const childType =

                    types.find(

                        type =>
                        type.id === child.typeId

                    );

                return (

                    childType?.level
                    ??
                    -Infinity

                );

            }

        )

    )

    :

    -Infinity;

const disabledTypeIds =

    object && children.length > 0

    ?

    types

        .filter(

            type =>

                Number(type.level) <=
                Number(maxChildLevel)

        )

        .map(

            type => type.id

        )

    :

    [];

const cfg = {

    title: "Объект",

    fields: [],
    
    lost: true,

    limits: {

        title: 45,

        description: 350

    },

    cover: {

        photos: objectPhotos

    },

    options: {

        typeSelector: true,

        types,

        defaultTypeId,

        disabledTypeIds

    }

};
    return renderEntityEditor(

        cfg,

        object

    );

}

// ======================================
// Open editor
// ======================================

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

        title:
            object
            ? "Изменить объект"
            : "Добавить объект",

        content:form

    });

    const root =
        modal.root;
    setupFieldCounters(root);

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

        filter(

            parent,
            currentParents

        ){

            // ======================================
            // Нельзя выбрать самого себя
            // ======================================

            if(
                parent.id === object?.id
            ){

                return false;

            }

            const parentType =

                types.find(

                    t =>
                    t.id === parent.typeId

                );

            if(!parentType){

                return false;

            }

            // ======================================
            // Если родитель уже выбран
            // ======================================

            if(
                currentParents.length > 0
            ){

                const firstParentId =

                    currentParents[0].objectId;

                const firstParent =

                    objects.find(

                        o =>
                        o.id === firstParentId

                    );

                const firstParentType =

                    types.find(

                        t =>
                        t.id === firstParent?.typeId
                    );

                if(!firstParentType){

                    return false;

                }

                // ==================================
                // Второй родитель должен быть
                // строго того же уровня
                // ==================================

                return (

                    Number(parentType.level) ===
                    Number(firstParentType.level)

                );

            }

            // ======================================
            // Родителей пока нет
            // ======================================

            const selectedTypeId =

                root.querySelector(
                    "#entityType"
                )?.value;

            const objectType =

                types.find(

                    t =>
                    t.id === selectedTypeId

                );

            if(!objectType){

                return false;

            }

            // ======================================
            // Первый родитель должен быть
            // выше объекта
            // ======================================

            return (

                Number(parentType.level) >
                Number(objectType.level)

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
            fields:[],
            lost:true
        },
        {
            typeId:"#entityType"
        },
        object
    );

// ======================================
// Type change
// ======================================

const typeSelect =

    root.querySelector(
        "#entityType"
    );

if(typeSelect){

    typeSelect.onchange = ()=>{

        const newType =

            types.find(

                type =>
                type.id === typeSelect.value

            );

        if(!newType){

            return;

        }

        // ======================================
        // Проверяем первого родителя
        // ======================================

        const currentParents =

            parentsEditor.getParents();

        if(
            currentParents.length > 0
        ){

            const firstParent =

                objects.find(

                    o =>
                    o.id ===
                    currentParents[0].objectId

                );

            const firstParentType =

                types.find(

                    type =>
                    type.id ===
                    firstParent?.typeId

                );

            if(

                firstParentType &&

                Number(newType.level) >=
                Number(firstParentType.level)

            ){

                alert(

                    "Выбранный тип выше или равен уровню родителя. Родители будут сброшены."

                );

                parentsEditor.clearParents();

            }

        }

    };

}

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

    async()=>{

        try{

            // ==================================
            // Проверяем родителей
            // ==================================

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

            // ==================================
            // Получаем данные полей
            // ==================================

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

            // ======================================
            // Проверка уровня первого родителя
            // ======================================

            const currentParents =

                parentsEditor.getParents();

            if(
                currentParents.length === 0
            ){

                alert(

                    "Нужен хотя бы один родитель"

                );

                return;

            }

            const firstParentId =

                currentParents[0].objectId;

            const firstParent =

                objects.find(

                    o =>
                    o.id === firstParentId

                );

            const parentType =

                types.find(

                    t =>
                    t.id === firstParent?.typeId

                );

            if(

                parentType &&

                Number(newType.level) >=
                Number(parentType.level)

            ){

                alert(

                    "Тип объекта должен быть ниже уровня родителя."

                );

                return;

            }

            // ======================================
            // Проверки существующего объекта
            // ======================================

            if(object){

                // ==================================
                // Проверка уровня детей
                // ==================================

                if(
                    children.length > 0
                ){

                    const maxChildLevel =

                        Math.max(

                            ...children.map(

                                child => {

                                    const childType =

                                        types.find(

                                            t =>
                                            t.id === child.typeId

                                        );

                                    return (

                                        childType?.level
                                        ??
                                        -Infinity

                                    );

                                }

                            )

                        );

                    if(

                        Number(newType.level) <=
                        Number(maxChildLevel)

                    ){

                        alert(

                            "Тип объекта должен быть выше уровня всех его детей."

                        );

                        return;

                    }

                }

            }

            // ======================================
            // Parents + auto address
            // ======================================

            const parentsWithAddress =

                parentsEditor
                    .getParents()
                    .map(

                        parent => ({

                            ...parent,

                            // Если адрес пустой —
                            // используем название объекта.
                            //
                            // Если адрес уже указан —
                            // оставляем его.

                            address:

                                parent.address?.trim()
                                ||
                                (fieldsData.title ?? "")

                        })

                    );

            // ======================================
            // Data
            // ======================================

            const data = {

                ...fieldsData,...coverEditor.getData(),

                parents:
                    parentsWithAddress

            };

            // ======================================
            // Save
            // ======================================

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
