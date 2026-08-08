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
//
//     admin
//         требуется ли администратор
//
//     getUrl
//         получает данные модалки
//         и возвращает параметры URL
//
//     load
//         получает параметры URL
//         и загружает данные модалки
//
// --------------------------------------
//
// Пример:
//
// registerModal(
//     "photo",
//     openPhotoViewer,
//     {
//         admin: false,
//
//         getUrl: photo => ({
//
//             modal: "photo",
//
//             modalId: photo.id
//
//         }),
//
//         load: async params => {
//
//             return await getPhoto(
//                 params.modalId
//             );
//
//         }
//
//     }
// );
//
// ======================================

export function registerModal(

    type,

    open,

    {

        admin = false,

        getUrl = null,

        load = null

    } = {}

){

    modalRoutes.set(

        type,

        {

            open,

            admin,

            getUrl,

            load

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
//
// route:
//
// {
//     type: "photo",
//
//     data: photo
// }
//
// modal.js сам находит регистрацию
// и вызывает её getUrl(data).
//
// ======================================

function setModalUrl(route){

    const type =
        typeof route === "string"
        ? route
        : route?.type;

    if(!type){

        return;

    }

    const modalRoute =
        modalRoutes.get(
            type
        );

    if(!modalRoute){

        console.error(

            "Unknown modal route:",

            type

        );

        return;

    }

    // ----------------------------------
    // Получить параметры URL
    // ----------------------------------

    let params = null;

    if(modalRoute.getUrl){

        const data =
            typeof route === "string"
            ? null
            : route.data;

        params =
            modalRoute.getUrl(
                data
            );

    }

    // Если getUrl ничего не вернул
    if(!params){

        params = {

            modal: type

        };

    }

    const url =
        new URL(
            window.location.href
        );

    // ----------------------------------
    // Удалить старые параметры модалки
    // ----------------------------------

    clearModalParams(
        url
    );

    // ----------------------------------
    // Установить новые параметры
    // ----------------------------------

    Object.entries(
        params
    ).forEach(

        ([key, value]) => {

            if(
                value === null ||
                value === undefined
            ){

                return;

            }

            url.searchParams.set(

                key,

                String(value)

            );

        }

    );

    // ----------------------------------
    // Если getUrl не указал modal
    // ----------------------------------

    if(
        !url.searchParams.get(
            "modal"
        )
    ){

        url.searchParams.set(

            "modal",

            type

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

    clearModalParams(
        url
    );

    window.history.pushState(

        {},

        "",

        url

    );

}

// ======================================
// Clear modal parameters
// ======================================
//
// Удаляем только параметры,
// относящиеся к модалке.
//
// Остальная ссылка страницы
// полностью сохраняется.
//
// ======================================

function clearModalParams(
    url
){

    url.searchParams.delete(
        "modal"
    );

    url.searchParams.delete(
        "modalId"
    );

    url.searchParams.delete(
        "modalType"
    );

}

// ======================================
// Restore modal from URL
// ======================================
//
// modal.js:
//
// 1. читает modal
// 2. находит регистрацию
// 3. проверяет admin
// 4. передаёт параметры URL в load
// 5. получает данные
// 6. передаёт данные в open
//
// ======================================

export async function restoreModalFromUrl({

    isAdmin = currentAdminState

} = {}){

    currentAdminState =
        !!isAdmin;

    const url =
        new URL(
            window.location.href
        );

    const type =
        url.searchParams.get(
            "modal"
        );

    // ==================================
    // Нет модалки
    // ==================================

    if(!type){

        closeCurrentModal();

        return;

    }

    // ==================================
    // Найти регистрацию
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
    // Получить параметры модалки
    // ==================================

    const params = {};

    url.searchParams.forEach(

        (value, key) => {

            if(
                key === "modal"
            ){

                return;

            }

            params[key] = value;

        }

    );

    // ==================================
    // Загрузить данные
    // ==================================

    let data = null;

    if(route.load){

        data =
            await route.load(
                params
            );

    }

    // ==================================
    // Данные не найдены
    // ==================================

    if(
        route.load &&
        !data
    ){

        clearModalUrl();

        return;

    }

    // ==================================
    // Открыть модалку
    // ==================================

    await route.open(
        data
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
// Вызывается при изменении
// состояния администратора.
//
// ======================================

export function setModalAdminState(

    isAdmin

){

    currentAdminState =
        !!isAdmin;

    // ----------------------------------
    // Если админ вышел,
    // а открыта админская модалка
    // ----------------------------------

    if(!currentAdminState){

        const url =
            new URL(
                window.location.href
            );

        const type =
            url.searchParams.get(
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
