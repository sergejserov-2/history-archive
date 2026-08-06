// ======================================
// Object editor
// ======================================

import {
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    createObject
}
from "../../api/objects.js";

import {
    db
}
from "../../firebase.js";

// ======================================
// Render
// ======================================

export function renderObjectEditor(

    object,

    types,

    objects,

    photos,

    children

) {

const currentType =
    object
        ? types.find(
            t => t.id === object?.typeId
        )
        : null;

const objectPhotos =
    object
        ? photos.filter(
            photo =>
                photo.parents?.includes(object.id)
        )
        : [];

    return `

<div class="object-editor">

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

<label>

Название

<input

id="objectTitleInput"

value="${object?.title ?? "" ?? ""}"

>

</label>

<label>

Описание

<textarea

id="objectDescriptionInput"

>${object?.description ?? "" ?? ""}</textarea>

</label>

<label>

Тип

<select id="objectTypeInput">

${
types.map(type=>`

<option

value="${type.id}"

${
type.id === object?.typeId
?
"selected"
:
""
}

${
children.length > 0 &&
type.level < currentType.level
?
"disabled"
:
""
}

>

${type.title}

</option>

`).join("")
}

</select>

</label>

<label>

Родители

<div id="parentsContainer">

${renderParents(object,objects)}

</div>

</label>

<input

id="parentSearchInput"

placeholder="Добавить родителя"

>

<div id="parentSearchResults">

</div>

<button id="saveObjectButton">

Сохранить

</button>

<button id="cancelObjectButton">

Отмена

</button>

</div>

`;

}

// ======================================
// Render parents
// ======================================

function renderParents(

    object,

    objects

){

return (object.parents ?? [])

.map(parent=>{

const obj =

objects.find(

o=>o.id === parent.objectId

);

return `

<div class="parent-item">

<div>

${obj?.title ?? parent.objectId}

</div>

<input

class="parent-address"

data-id="${parent.objectId}"

value="${parent.address ?? ""}"

>

<button

data-remove="${parent.objectId}"

>

×

</button>

</div>

`;

})

.join("");

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

const parentsBox =

document.getElementById(

"parentsContainer"

);

const search =

document.getElementById(

"parentSearchInput"

);

const results =

document.getElementById(

"parentSearchResults"

);

// ======================================
// Update parents UI
// ======================================

function updateParents(){

parentsBox.innerHTML =

parents.map(parent=>{

const obj =

objects.find(

o=>o.id===parent.objectId

);

return `

<div class="parent-item">

<div>

${obj?.title ?? parent.objectId}

</div>

<input

class="parent-address"

data-id="${parent.objectId}"

value="${parent.address ?? ""}"

>

<button

data-remove="${parent.objectId}"

>

×

</button>

</div>

`;

})

.join("");

}

// ======================================
// Remove parent
// ======================================

parentsBox.onclick = e=>{

const id =

e.target.dataset.remove;

if(!id)

return;

parents =

parents.filter(

p=>p.objectId !== id

);

updateParents();

};

// ======================================
// Address change
// ======================================

parentsBox.oninput = e=>{

if(

!e.target.classList.contains(

"parent-address"

)

)

return;

const parent =

parents.find(

p=>

p.objectId ===

e.target.dataset.id

);

if(parent)

parent.address =

e.target.value;

};

// ======================================
// Parent search
// ======================================

search.oninput = ()=>{

const text =

search.value

.toLowerCase()

.trim();

if(!text){

results.innerHTML="";

return;

}

const selectedTypeId =

document.getElementById(
"objectTypeInput"
).value;
    
const objectType =

types.find(

t=>t.id===selectedTypeId

);

let level = null;

if(parents.length){

const first =

objects.find(

o=>

o.id===parents[0].objectId

);

level =

types.find(

t=>

t.id===first.typeId

)?.level;

}

const list =

objects.filter(o=>{

if(o.id===object.id)

return false;

if(

parents.some(

p=>

p.objectId===o.id

)

)

return false;

const type =

types.find(

t=>t.id===o.typeId

);

if(!type)

return false;

if(level !== null)

return type.level === level;

return type.level >

objectType.level;

});

results.innerHTML =

list

.filter(

o=>

o.title

.toLowerCase()

.includes(text)

)

.map(o=>`

<div

class="parent-result"

data-id="${o.id}"

>

${o.title}

</div>

`)

.join("");

};

// ======================================
// Select parent
// ======================================

results.onclick=e=>{

const item =

e.target.closest(

".parent-result"

);

if(!item)

return;

parents.push({

objectId:item.dataset.id,

address:""

});

updateParents();

search.value="";

results.innerHTML="";

};

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

    if(parents.length===0){

        alert("Нужен хотя бы один родитель");

        return;

    }

    const newTypeId =
        document.getElementById(
            "objectTypeInput"
        ).value;

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

            parents = [];

            updateParents();

            alert(
                "Новый тип конфликтует с уровнем родителей."
            );

            return;

        }

    }

    const data = {

        title:
            document.getElementById(
                "objectTitleInput"
            ).value,

        description:
            document.getElementById(
                "objectDescriptionInput"
            ).value,

        typeId:newTypeId,

        coverPhotoId,

        parents

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
