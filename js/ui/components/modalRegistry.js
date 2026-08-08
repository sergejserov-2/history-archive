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
// API imports
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
    getObject,
    getType,
    getParents,
    getChildren,
    getAllObjects
}
from "../../api/objects.js";

import {
    getTypes
}
from "../../api/types.js";

// ======================================
// UI imports
// ======================================

import {
    openPhotoViewer
}
from "./photoViewer.js";

import {
    openObjectEditor
}
from "./objectEditor.js";

import {
    openEntityEditor
}
from "./entityEditor.js";

// ======================================
// PHOTO PREVIEW
// ======================================
//
// URL:
//
// object.html
// ?id=OBJECT_ID
// &modal=photo-preview
// &entityId=PHOTO_ID
//
// id — родительский объект.
// entityId — фотография.
//
// ======================================

export const photoPreviewModal = {

    type: "photo-preview",

    params: [

        "id",

        "entityId"

    ],

    load: async params => {

        // ==================================
        // Родительский объект
        // ==================================

        if(
            !params.id
        ){

            return null;

        }

        // ==================================
        // ID фотографии
        // ==================================

        if(
            !params.entityId
        ){

            return null;

        }

        // ==================================
        // Получаем фотографии
        // именно этого объекта
        // ==================================

        const photos =
            await getPhotos(
                params.id
            );

        // ==================================
        // Ищем нужную фотографию
        // ==================================

        const photo =
            photos.find(

                item =>
                    item.id ===
                    params.entityId

            );

        if(!photo){

            return null;

        }

        return photo;

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
//
// Поддерживает:
//
// photo
// source
// record
//
// URL:
//
// object.html
// ?id=OBJECT_ID
// &modal=entity-editor
// &entityId=ENTITY_ID
// &entityType=photo
//
// id — родительский объект.
// entityId — сущность.
// entityType — photo / source / record.
//
// ======================================

export const entityEditorModal = {

    type: "entity-editor",

    params: [

        "id",

        "entityId",

        "entityType"

    ],

    load: async params => {

        // ==================================
        // Проверяем параметры
        // ==================================

        if(
            !params.id ||
            !params.entityId ||
            !params.entityType
        ){

            return null;

        }

        // ==================================
        // Подгружаем все объекты.
//
// Entity Editor использует их
// для выбора родителей.
// ==================================

        const objects =
            await getAllObjects();

        // ==================================
        // Получаем сущности,
// принадлежащие текущему объекту
        // ==================================

        let entities = [];

        if(
            params.entityType === "photo"
        ){

            entities =
                await getPhotos(
                    params.id
                );

        }

        else if(
            params.entityType === "source"
        ){

            entities =
                await getSources(
                    params.id
                );

        }

        else if(
            params.entityType === "record"
        ){

            entities =
                await getRecords(
                    params.id
                );

        }

        else{

            console.error(

                "Unknown entity type:",

                params.entityType

            );

            return null;

        }

        // ==================================
        // Ищем сущность
        // ==================================

        const entity =
            entities.find(

                item =>
                    item.id ===
                    params.entityId

            );

        // ==================================
        // Сущность не существует
        // или не принадлежит текущему объекту
        // ==================================

        if(!entity){

            return null;

        }

        // ==================================
        // Возвращаем всё,
        // что понадобится open()
        // ==================================

        return {

            entity,

            objects,

            parentId:
                params.id,

            type:
                params.entityType

        };

    },

    open: async data => {

        if(!data){

            return;

        }

        openEntityEditor(

            data.type,

            data.entity,

            {

                parentId:
                    data.parentId,

                objects:
                    data.objects

            },

            ()=>{

                // После сохранения
                // страницу обновит существующий
                // механизм admin/page.

            }

        );

    }

};

// ======================================
// OBJECT EDITOR
// ======================================
//
// URL:
//
// object.html
// ?id=PARENT_ID
// &modal=object-editor
// &entityId=OBJECT_ID
//
// id — родитель текущей страницы.
// entityId — редактируемый объект.
//
// Важно:
//
// Объект должен существовать
// и быть связан с id как с родителем.
//
// ======================================

export const objectEditorModal = {

    type: "object-editor",

    params: [

        "id",

        "entityId"

    ],

    load: async params => {

        // ==================================
        // Проверяем параметры
        // ==================================

        if(
            !params.id ||
            !params.entityId
        ){

            return null;

        }

        // ==================================
        // Получаем редактируемый объект
        // ==================================

        const object =
            await getObject(
                params.entityId
            );

        // ==================================
        // Объект не существует
        // ==================================

        if(!object){

            return null;

        }

        // ==================================
        // Проверяем связь с родителем
        // ==================================

        const hasParent =
            (object.parents ?? [])
                .some(

                    parent => {

                        if(
                            typeof parent ===
                            "string"
                        ){

                            return (
                                parent ===
                                params.id
                            );

                        }return (
                            parent?.objectId ===
                            params.id
                        );

                    }

                );

        // ==================================
        // Объект существует,
        // но ссылка устарела:
        // он не принадлежит этому родителю.
        // ==================================

        if(!hasParent){

            return null;

        }

        // ==================================
        // Загружаем данные редактора
        // ==================================

        const [

            type,

            types,

            objects,

            children,

            photos

        ] = await Promise.all([

            getType(
                object.typeId
            ),

            getTypes(),

            getAllObjects(),

            getChildren(
                object.id
            ),

            getPhotos(
                object.id
            )

        ]);

        // ==================================
        // Данные для редактора
        // ==================================

        return {

            object,

            type,

            types,

            objects,

            children,

            photos,

            context: {

                parentId:
                    params.id,

                objects

            }

        };

    },

    open: async data => {

        if(!data){

            return;

        }

        openObjectEditor(

            data.object,

            data.types,

            data.objects,

            data.photos,

            data.children,

            data.context,

            ()=>{

                // После сохранения
                // страница сама обновится
                // существующим механизмом.

            }

        );

    }

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
