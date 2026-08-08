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
// PHOTO PREVIEW
// ======================================

export const photoPreviewModal = {

    type: "photo-preview",

    params: [
        "photoId"
    ],

    load: null,

    open: null

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
//
// modal.js будет работать только
// с этим массивом.
//
// ======================================

export const modalRegistry = [

    photoPreviewModal,

    entityEditorModal,

    objectEditorModal,

    loginModal

];
