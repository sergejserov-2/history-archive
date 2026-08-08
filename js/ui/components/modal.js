// ======================================
// Modal component
// ======================================

const modalRoutes = new Map();

// ======================================
// Register modal
// ======================================
//
// name  — имя модалки
// type  — "public" или "admin"
// open  — функция открытия
//
// URL:
//
// ?modal=photo
// ?modal=photo&modalId=123
//
// ======================================

export function registerModal(

    name,

    type,

    open

){

    if(
        !name ||
        typeof open !== "function"
    ){

        return;

    }

    modalRoutes.set(

        name,

        {

            type:
                type === "admin"
                ?
                "admin"
                :
                "public",

            open

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

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "modal-overlay";

    const modal =
        document.createElement(
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

    function close(){

        overlay.remove();

        if(route){

            clearModalUrl();

        }

    }

    closeButton.onclick =
        close;

    // ==================================
    // Add modal to URL
    // ==================================

    if(route){

        setModalUrl(

            route.name,

            route.id

        );

    }

    return {

        root:
            overlay,

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

function setModalUrl(

    name,

    id = null

){

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(

        "modal",

        name

    );

    if(id){

        url.searchParams.set(

            "modalId",

            id

        );

    }
    else{

        url.searchParams.delete(

            "modalId"

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
// isAdmin передаётся снаружи.
//
// Например:
//
// restoreModalFromUrl(
//     isAdmin
// );
//
// ======================================

export async function restoreModalFromUrl(

    isAdmin = false

){

    const url =
        new URL(
            window.location.href
        );

    const name =
        url.searchParams.get(
            "modal"
        );

    const id =
        url.searchParams.get(
            "modalId"
        );

    if(!name){

        return;

    }

    const route =
        modalRoutes.get(
            name
        );

    // ==================================
    // Unknown modal
    // ==================================

    if(!route){

        clearModalUrl();

        return;

    }

    // ==================================
    // Admin modal
    // ==================================

    if(

        route.type === "admin" &&
        !isAdmin

    ){

        clearModalUrl();

        return;

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
//
// Здесь пока только меняем URL.
//
// Реальное восстановление вызывается
// страницей, когда она готова.
//

window.addEventListener(

    "popstate",

    ()=>{

        // Ничего не делаем автоматически.

    }

);
