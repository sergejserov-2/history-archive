// ======================================
// Modal component
// ======================================

const modalRoutes = new Map();

let currentModal = null;

let currentAdminState = false;

// ======================================
// Register modal
// ======================================
//
// type:
//     имя модалки
//
// open:
//     функция открытия модалки
//
// options:
//     admin — требуется ли админ
//
//     getUrl — функция формирования URL
//
// Пример:
//
// registerModal(
//     "photo",
//     openPhotoViewer,
//     {
//         admin: false,
//         getUrl: id => ({
//             modal: "photo",
//             modalId: id
//         })
//     }
// );
//
// ======================================

export function registerModal(

    type,

    open,

    {

        admin = false,

        getUrl = null

    } = {}

){

    modalRoutes.set(

        type,

        {

            open,

            admin,

            getUrl

        }

    );

}

// ======================================
// Create modal
// ======================================

export function createModal({

    title = "",

    content = "",

    className = "",

    route = null

}) {

    const overlay = document.createElement(
        "div"
    );

    overlay.className =
        "modal-overlay";

    const modal = document.createElement(
        "div"
    );

    modal.className =
        `modal ${className}`;

    modal.innerHTML = `

        <div class="modal__header">

            <h2>

                ${title}

            </h2>

            <span
                class="modal__close"
            >

                ×

            </span>

        </div>

        <div class="modal__content">

            ${content}

        </div>

    `;

    overlay.appendChild(
        modal
    );

    document.body.appendChild(
        overlay
    );

    const closeButton =
        modal.querySelector(
            ".modal__close"
        );

    // ==================================
    // Close
    // ==================================

    function close(){

        overlay.remove();

        if(
            currentModal?.overlay === overlay
        ){

            currentModal = null;

        }

        // --------------------------------
        // Remove modal from URL
        // --------------------------------

        if(route){

            clearModalUrl();

        }

    }

    closeButton.onclick = close;

    // ==================================
    // Put modal into URL
    // ==================================

    if(route){

        setModalUrl(route);

        currentModal = {

            overlay,

            route

        };

    }

    return {

        root: overlay,

        content:
            modal.querySelector(
                ".modal__content"
            ),

        close

    };

}

// ======================================
// Set modal URL
// ======================================

function setModalUrl(route){

    const url =
        new URL(
            window.location.href
        );

    let params;

    // ----------------------------------
    // String
    // ----------------------------------

    if(
        typeof route === "string"
    ){

        params = {

            modal: route

        };

    }

    // ----------------------------------
    // Object
    // ----------------------------------

    else{

        params = {

            ...route

        };

    }

    // ----------------------------------
    // Remove old modal parameters
    // ----------------------------------

    url.searchParams.delete(
        "modal"
    );

    url.searchParams.delete(
        "modalId"
    );

    // ----------------------------------
    // Set modal
    // ----------------------------------

    if(params.modal){

        url.searchParams.set(

            "modal",

            params.modal

        );

    }

    // ----------------------------------
    // Set modal ID
    // ----------------------------------

    if(params.modalId){

        url.searchParams.set(

            "modalId",

            params.modalId

        );

    }

    window.history.pushState(

        {},

        "",

        url

    );

}

// ======================================
// Clear modal URL
// ======================================

function clearModalUrl(){

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.delete(
        "modal"
    );

    url.searchParams.delete(
        "modalId"
    );

    window.history.pushState(

        {},

        "",

        url

    );

}

// ======================================
// Restore modal from URL
// ======================================
//
// isAdmin:
//     текущее состояние администратора.
//
// Если в URL находится админская модалка,
// а пользователь не админ:
//
//     1. модалка не открывается
//     2. параметры modal/modalId удаляются
//     3. пользователь остаётся на основной
//        странице.
//
// ======================================

export async function restoreModalFromUrl({

    isAdmin = currentAdminState

} = {}){

    currentAdminState =
        isAdmin;

    const url =
        new URL(
            window.location.href
        );

    const type =
        url.searchParams.get(
            "modal"
        );

    const id =
        url.searchParams.get(
            "modalId"
        );

    // ==================================
    // Нет модалки
    // ==================================

    if(!type){

        closeCurrentModal();

        return;

    }

    // ==================================
    // Найти маршрут
    // ==================================

    const route =
        modalRoutes.get(
            type
        );

    // ==================================
    // Неизвестная модалка
    // ==================================

    if(!route){

        clearModalUrl();

        closeCurrentModal();

        return;

    }

    // ==================================
    // Защита админской модалки
    // ==================================

    if(

        route.admin &&
        !currentAdminState

    ){

        clearModalUrl();

        closeCurrentModal();

        return;

    }

    // ==================================
    // Закрыть предыдущую модалку
    // ==================================

    closeCurrentModal();

    // ==================================
    // Открыть модалку
    // ==================================

    await route.open(
        id
    );

}

// ======================================
// Close current modal
// ======================================

function closeCurrentModal(){

    if(!currentModal){

        return;

    }

    currentModal.overlay.remove();

    currentModal = null;

}

// ======================================
// Update admin state
// ======================================
//
// Это нужно, чтобы modal.js знал,
// может ли пользователь открыть
// админскую модалку.
//
// Можно вызывать при изменении
// ADMIN_MODE.
//
// ======================================

export function setModalAdminState(

    isAdmin

){

    currentAdminState =
        !!isAdmin;

    // ----------------------------------
    // Если админ вышел,
//    а открыта админская модалка
// ----------------------------------

    if(!currentAdminState){

        const type =
            new URL(
                window.location.href
            ).searchParams.get(
                "modal"
            );

        const route =
            modalRoutes.get(
                type
            );

        if(route?.admin){

            clearModalUrl();

            closeCurrentModal();

        }

    }

}

// ======================================
// Browser Back / Forward
// ======================================

window.addEventListener(

    "popstate",

    async()=>{

        await restoreModalFromUrl();

    }

);
