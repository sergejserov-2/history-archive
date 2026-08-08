// ======================================
// Modal registry
// ======================================
//
// Здесь описываются ВСЕ модалки приложения.
//
// Registry отвечает только за:
//
// 1. имя модалки;
// 2. параметры, которые нужно прочитать из URL;
// 3. получение данных по этим параметрам;
// 4. функцию открытия модалки.
//
// Modal.js:
//
// - читает ?modal=...
// - находит нужную регистрацию здесь;
// - читает указанные параметры URL;
// - при необходимости загружает данные;
// - передаёт данные в open.
//
// URL НЕ формируется здесь.
//
// Ссылку с параметрами формирует интерфейс.
// Например:
//
// ?modal=photo&modalId=123
//
// ======================================

// ==========================================
// MODAL REGISTRY
// ==========================================

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
    openEntityEditor
}
from "../../admin/editors/entityEditor.js";

// PHOTO VIEWER
// ======================================

export const photoViewerModal = {

    type: "photo",

    params: [

        "modalId"

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

// ==========================================
// Entity Editor
// ==========================================

export const entityEditorModal = {

    type: "entity-editor",

    params: [

        "modalId",

        "modalType"

    ],

    load: async params => {

        const type =
            params.modalType;

        const id =
            params.modalId;

        if(
            !type ||
            !id
        ){

            return null;

        }

        let entity = null;

        // ----------------------------------
        // Load entity
        // ----------------------------------

        if(type === "photo"){

            entity =
                await getPhoto(id);

        }

        else if(type === "source"){

            entity =
                await getSource(id);

        }

        else if(type === "record"){

            entity =
                await getRecord(id);

        }

        else{

            console.error(
                "Unknown entity editor type:",
                type
            );

            return null;

        }

        if(!entity){

            return null;

        }

        // ----------------------------------
        // Context required by editor
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

export const objectEditorModal = {

    type: "object-editor",

    params: [

        "modalId"

    ],

    load: null,

    open: null

};

// ======================================
// ALL MODALS
// ======================================
//
// Modal.js будет работать только
// с этим массивом.
//
// ======================================

export const modalRegistry = [

    photoViewerModal,

    loginModal,

    entityEditorModal,

    objectEditorModal

];
