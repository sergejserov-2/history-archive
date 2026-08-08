// ======================================
// MODAL REGISTRY
// ======================================
//
// Здесь описываются все модалки,
// которые можно открыть по ссылке.
//
// Registry отвечает только за:
//
// 1. тип модалки;
// 2. параметры, которые нужно прочитать;
// 3. загрузку данных;
// 4. открытие модалки.
//
// URL здесь НЕ формируется.
//
// Ссылку формирует интерфейс.
//
// ======================================

// ======================================
// Imports
// ======================================

import {
    getPhotos
}
from "../../api/photos.js";

import {
    openPhotoViewer
}
from "./photoViewer.js";

// ======================================
// PHOTO PREVIEW
// ======================================
//
// URL:
//
// ?modal=photo-preview
// &photoId=PHOTO_ID
//
// ======================================

export const photoPreviewModal = {

type: "photo-preview",

params: [

    "objectId",

    "photoId"

],

load: async params => {

    if(
        !params.objectId ||
        !params.photoId
    ){

        return null;

    }

    const photos =
        await getPhotos(
            params.objectId
        );

    return photos.find(

        photo =>
            photo.id ===
            params.photoId

    ) ?? null;

},

open: async photo => {

    if(!photo){

        return;

    }

    openPhotoViewer(

        photo,

        {
            fromUrl: true
        }

    );

}

};

// ======================================
// ENTITY EDITOR
// ======================================

export const entityEditorModal = {

    type: "entity-editor",

    params: [

        "entityId",

        "entityType"

    ],

    load: null,

    open: null

};

// ======================================
// OBJECT EDITOR
// ======================================

export const objectEditorModal = {

    type: "object-editor",

    params: [

        "objectId"

    ],

    load: null,

    open: null

};

// ======================================
// LOGIN
// ======================================

export const loginModal = {

    type: "login",

    params: [],

    load: null,

    open: null

};

// ======================================
// ALL MODALS
// ======================================

export const modalRegistry = [

    photoPreviewModal,

    entityEditorModal,

    objectEditorModal,

    loginModal

];
