// ======================================
// Modal component
// ======================================

const modalRoutes = new Map();

let currentModal = null;

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

        // ------------------------------
        // Remove modal from URL
        // ------------------------------

        if(
            route
        ){

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

    // ------------------------------
    // Route can be:
    //
    // {
    //     type: "photo",
    //     id: "123"
    // }
    //
    // ------------------------------

    let params = null;

    if(
        typeof route === "string"
    ){

        params = {

            modal: route

        };

    }
    else{

        params = {

            ...route

        };

    }

    // ------------------------------
    // Remove old modal parameters
    // ------------------------------

    url.searchParams.delete(
        "modal"
    );

    url.searchParams.delete(
        "modalId"
    );

    // ------------------------------
    // Set new parameters
    // ------------------------------

    if(params.modal){

        url.searchParams.set(

            "modal",

            params.modal

        );

    }

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
// isAdmin передаётся страницей.
//
// Если админская модалка открыта
// без прав администратора:
//
//     -> URL очищается
//     -> возвращаемся на основную страницу
//
// ======================================

export async function restoreModalFromUrl({

    isAdmin = false

} = {}){

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

    // Нет модалки
    if(!type){

        return;

    }

    // ==================================
    // Find route
    // ==================================

    const route =
        modalRoutes.get(
            type
        );

    // Неизвестная модалка
    if(!route){

        clearModalUrl();

        return;

    }

    // ==================================
    // Admin protection
    // ==================================

    if(

        route.admin &&
        !isAdmin

    ){

        clearModalUrl();

        // Возвращаемся на страницу
        // без модалки.

        return;

    }

    // ==================================
    // Close previous modal
    // ==================================

    if(currentModal){

        currentModal.overlay.remove();

        currentModal = null;

    }

    // ==================================
    // Open modal
    // ==================================

    await route.open(
        id
    );

}

// ======================================
// Browser Back / Forward
// ======================================

window.addEventListener(

    "popstate",

    async()=>{

        // Если URL больше не содержит
        // modal — закрываем текущую.

        const url =
            new URL(
                window.location.href
            );

        const type =
            url.searchParams.get(
                "modal"
            );

        if(!type){

            if(currentModal){

                currentModal.overlay.remove();

                currentModal = null;

            }

            return;

        }

        // Есть modal —
        // восстанавливаем его.

        await restoreModalFromUrl();

    }

);
