// ======================================
// MODAL REGISTRY
// ======================================
//
// Здесь описываются все модалки,
// которые могут быть восстановлены
// по полной ссылке.
//
// Registry отвечает только за:
//
// 1. тип модалки;
// 2. параметры, которые читаются из URL;
// 3. загрузку данных;
// 4. открытие модалки.
//
// URL здесь НЕ формируется.
//
// Ссылку с параметрами формирует интерфейс.
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
    getSources
}
from "../../api/sources.js";

import {
    getRecords
}
from "../../api/records.js";

import {
    getAllObjects
}
from "../../api/objects.js";

import {
    openPhotoViewer
}
from "../../ui/components/photoViewer.js";

import {
    openEntityEditor
}
from "../../admin/editors/entityEditor.js";

// ======================================
// PHOTO PREVIEW
// ======================================
//
// URL:
//
// ?modal=photo
// &modalId=PHOTO_ID
//
// ======================================

export const photoPreviewModal = {

    type: "photo",

    params: [

        "modalId"

    ],

    load: async params => {

        if(!params.modalId){

            return null;

        }

        const photos =
            await getPhotos();

        return photos.find(

            photo =>
                photo.id ===
                params.modalId

        ) ?? null;

    },

    open: async photo => {

        if(!photo){

            return;

        }

        openPhotoViewer(
            photo
        );

    }

};

// ======================================
// ENTITY EDITOR
// ======================================
//
// URL:
//
// ?modal=entity-editor
// &modalId=ENTITY_ID
// &modalType=photo
//
// modalType:
//
// photo
// source
// record
//
// ======================================

export const entityEditorModal = {

    type: "entity-editor",

    params: [

        "modalId",

        "modalType"

    ],

    load: async params => {

        const id =
            params.modalId;

        const type =
            params.modalType;

        if(
            !id ||
            !type
        ){

            return null;

        }

        let entity = null;

        // ----------------------------------
        // Photo
        // ----------------------------------

        if(type === "photo"){

            const photos =
                await getPhotos();

            entity =
                photos.find(

                    photo =>
                        photo.id === id

                ) ?? null;

        }

        // ----------------------------------
        // Source
        // ----------------------------------

        else if(type === "source"){

            const sources =
                await getSources();

            entity =
                sources.find(

                    source =>
                        source.id === id

                ) ?? null;

        }

        // ----------------------------------
        // Record
        // ----------------------------------

        else if(type === "record"){

            const records =
                await getRecords();

            entity =
                records.find(

                    record =>
                        record.id === id

                ) ?? null;

        }

        // ----------------------------------
        // Unknown type
        // ----------------------------------

        else{

            console.error(

                "Unknown entity editor type:",

                type

            );

            return null;

        }

        // ----------------------------------
        // Entity not found
        // ----------------------------------

        if(!entity){

            return null;

        }

        // ----------------------------------
        // Editor context
    // ----------------------------------

        const objects =
            await getAllObjects();

        return {

            type,

            entity,

            context: {

                objects

            }

        };

    },

    open: async data => {

        if(!data){

            return;

        }

        openEntityEditor(

            data.type,

            data.entity,

            data.context

        );

    }

};

// ======================================
// OBJECT EDITOR
// ======================================
//
// URL:
//
// ?modal=object-editor
// &modalId=OBJECT_ID
//
// ======================================

export const objectEditorModal = {

    type: "object-editor",

    params: [

        "modalId"

    ],

    load: null,

    open: null

};

// ======================================
// LOGIN
// ======================================
//
// URL:
//
// ?modal=login
//
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
//
// modal.js работает только
// с этим массивом.
//
// ======================================

export const modalRegistry = [

    photoPreviewModal,

    entityEditorModal,

    objectEditorModal,

    loginModal

];
