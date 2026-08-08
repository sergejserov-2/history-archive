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
//     функция открытия
//
// options:
//     admin — требуется ли админ
//
//     getUrl — функция формирования URL
//
// --------------------------------------
//
// Для обычной модалки:
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
// Для редактора:
//
// registerModal(
//     "entity-editor",
//     openEntityEditor,
//     {
//         admin: true,
//         getUrl: data => ({
//             modal: "entity-editor",
//             modalId: data.id,
//             modalType: data.type
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
    )
