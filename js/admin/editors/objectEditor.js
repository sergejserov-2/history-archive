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
    renderEntityEditor,
    setupEntityFieldsEditor,
    setupEditorButtons,
    setupParentsEditor
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

    children

){

const objectPhotos =
    object
    ?
    photos.filter(
        photo =>
            photo.parents?.includes(object.id)
    )
    :
    [];

const cfg = {

    fields:[],

    options:{

        typeSelector:true,

        types

    }

};

return `

<div class="object-editor">

${

renderEntityEditor(
    cfg,
    object
)

}

<label>

Обложка

<select id="objectCoverInput">

<option value="">

Без фотографии

</option>

${
objectPhotos.map(photo=>`

<option

value="${photo.id}"

${
photo.id === object?.coverPhotoId
?
"selected"
:
""
}

>

${photo.title ?? photo.id}

</option>

`).join("")
}

</select>

</label>

</div>

`;

}

// ======================================
// Init
// ======================================

export function initObjectEditor(

    object,

    types,

    objects,

    photos,

    children,

    onSave

){

let parents =

JSON.parse(

JSON.stringify(

object.parents ?? []

)

);

let coverPhotoId =

object?.coverPhotoId ?? null;

const parentsEditor = setupParentsEditor(

    document,

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
document.getElementById(
    "entityType"
).value;

            const objectType =
                types.find(
                    t=>t.id===selectedTypeId
                );

            const parentType =
                types.find(
                    t=>t.id===parent.typeId
                );

            if(
                !objectType ||
                !parentType
            ){

                return false;

            }

            // Если родители уже есть —
            // только тот же уровень

            if(parents.length){

                const firstParent =
                    objects.find(
                        o=>
                        o.id === parents[0]
                    );

                const firstParentType =
                    types.find(
                        t=>
                        t.id === firstParent.typeId
                    );

                return (
                    parentType.level ===
                    firstParentType.level
                );

            }

            // Новый родитель должен быть выше

            return (
                parentType.level >
                objectType.level
            );

        }

    }

);
    
const fieldsEditor =
    setupEntityFieldsEditor(

        document,

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

document.getElementById(

"objectCoverInput"

).onchange=e=>{

coverPhotoId =

e.target.value || null;

};

// ======================================
// Save
// ======================================

document.getElementById(
    "saveObjectButton"
).onclick = async ()=>{

    if(
        parentsEditor.getParents().length===0
    ){
    
        alert(
            "Нужен хотя бы один родитель"
        );
    
        return;
    
    }

const data =
    fieldsEditor.getData();

const newTypeId =
    data.typeId;
    
    const newType =
        types.find(
            t=>t.id===newTypeId
        );

    if(object){

        const oldType =
            types.find(
                t=>t.id===object.typeId
            );

        if(
            children.length>0 &&
            newType.level < oldType.level
        ){

            alert(
                "Нельзя выбрать тип ниже текущего"
            );

            return;

        }

        let resetParents = false;

        if(parents.length){

            const firstParent =
                objects.find(
                    o=>o.id===parents[0].objectId
                );

            const parentType =
                types.find(
                    t=>t.id===firstParent.typeId
                );

            if(
                parentType &&
                newType.level >= parentType.level
            ){
                resetParents = true;
            }

        }

        if(resetParents){

            parents.length = 0;

            alert(
                "Новый тип конфликтует с уровнем родителей."
            );

            return;

        }

    }

const data = {

    ...fieldsEditor.getData(),

    coverPhotoId,

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

    }else{

        await createObject(
            data
        );

    }

    onSave();

};

document.getElementById(

"cancelObjectButton"

).onclick=

onSave;

}
