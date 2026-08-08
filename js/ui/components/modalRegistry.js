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

// ======================================
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

// ======================================
// PHOTO EDITOR
// ======================================

export const photoEditorModal = {

    type: "photo-editor",

    params: [

        "modalId"

    ],

    load: null,

    open: null

};

// ======================================
// SOURCE EDITOR
// ======================================

export const sourceEditorModal = {

    type: "source-editor",

    params: [

        "modalId"

    ],

    load: null,

    open: null

};

// ======================================
// RECORD EDITOR
// ======================================

export const recordEditorModal = {

    type: "record-editor",

    params: [

        "modalId"

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

    photoEditorModal,

    sourceEditorModal,

    recordEditorModal,

    objectEditorModal

];
