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
    createObject,
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

    children

){

document.addEventListener(

"click",

async event=>{

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

const context = {

    objects,

    parentId: object.id

};

// ======================================
// Object edit
// ======================================

if(

action==="edit-object"

){

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

action==="delete-object"

){

const ok = confirm(

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

action==="add-object"

){

const data = {

    title:"Новый объект",

    description:"",

    typeId:"",

    parents:[

        {

            objectId: object.id,

            address:""

        }

    ]

};

const newObjectId =

await createObject(

    data

);

location.href =

`object.html?id=${newObjectId}`;

return;

}

// ======================================
// Add photo
// ======================================

if(

action==="add-photo"

){

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

action==="edit-photo"

){

const photo =

photos.find(

p=>p.id===id

);

if(!photo){

    return;

}

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

action==="delete-photo"

){

if(

!confirm(

"Удалить фотографию?"

)

){

    return;

}

await deletePhoto(id);

location.reload();

return;

}

// ======================================
// Add source
// ======================================

if(

action==="add-source"

){

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

action==="edit-source"

){

const source =

sources.find(

s=>s.id===id

);

if(!source){

    return;

}

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

action==="delete-source"

){

if(

!confirm(

"Удалить источник?"

)

){

    return;

}

await deleteSource(id);

location.reload();

return;

}

// ======================================
// Add record
// ======================================

if(

action==="add-record"

){

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

action==="edit-record"

){

const record =

records.find(

r=>r.id===id

);

if(!record){

    return;

}

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

action==="delete-record"

){

if(

!confirm(

"Удалить запись?"

)

){

    return;

}

await deleteRecord(id);

location.reload();

return;

}

}

);

}
