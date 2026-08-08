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
// object.html
// ?id=OBJECT_ID
// &modal=photo-preview
// &photoId=PHOTO_ID
//
// objectId отдельно в URL модалки не нужен.
// Он уже находится в стандартном параметре
// страницы: ?id=OBJECT_ID.
//
// ======================================

export const photoPreviewModal = {

    type: "photo-preview",

    params: [

        "id",

        "photoId"

    ],

    load: async params => {

        // ==================================
        // Получаем родительский Object ID
        // из обычного ?id=...
        // ==================================

        if(
            !params.id
        ){

            console.error(
                "Photo preview: object id is missing"
            );

            return null;

        }

        // ==================================
        // Получаем Photo ID
        // ==================================

        if(
            !params.photoId
        ){

            console.error(
                "Photo preview: photo id is missing"
            );

            return null;

        }

        // ==================================
        // Используем существующий механизм:
        //
        // getPhotos(objectId)
        //
        // Он возвращает фотографии,
        // принадлежащие этому Object.
        // ==================================

        const photos =
            await getPhotos(
                params.id
            );

        // ==================================
        // Находим конкретную фотографию
        // ==================================

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
