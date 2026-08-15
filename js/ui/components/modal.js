// ======================================
// Modal component
// ======================================

import {
    modalRegistry
}
from "./modalRegistry.js";

// ======================================
// Current modal
// ======================================

let currentModal = null;

// ======================================
// Create modal
// ======================================

export function createModal({

    title = "",

    content = ""

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
        "modal";

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

    if(
        currentModal?.overlay !== overlay
    ){

        return;

    }

    currentModal = null;

    overlay.remove();

    clearModalUrl();

}

    closeButton.onclick =
        close;

    currentModal = {

        overlay,

        close

    };

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
// Пример:
//
// setModalUrl(
//     "photo-preview",
//     {
//         photoId: "PHOTO_ID"
//     }
// );
//
// URL:
//
// object.html
// ?id=OBJECT_ID
// &modal=photo-preview
// &photoId=PHOTO_ID
//
// ВАЖНО:
//
// objectId здесь НЕ передаётся.
// Он уже находится в ?id=OBJECT_ID.
//
// ======================================

export function setModalUrl(

    type,

    params = {}

){

    const url =
        new URL(
            window.location.href
        );

    // ==================================
    // Modal type
    // ==================================

    url.searchParams.set(
        "modal",
        type
    );

    // ==================================
    // Modal parameters
    // ==================================

    Object.entries(
        params
    ).forEach(

        ([key, value]) => {

            if(
                value === null ||
                value === undefined ||
                value === ""
            ){

                url.searchParams.delete(
                    key
                );

                return;

            }

            url.searchParams.set(
                key,
                String(value)
            );

        }

    );

    // ==================================
    // Update browser URL
    // ==================================

    window.history.pushState(

        {},

        "",

        url

    );

}

// ======================================
// Clear modal URL
// ======================================
//
// Было:
//
// object.html
// ?id=OBJECT_ID
// &modal=photo-preview
// &photoId=PHOTO_ID
//
// Станет:
//
// object.html
// ?id=OBJECT_ID
//
// ВАЖНО:
//
// id страницы никогда не удаляется.
//
// ======================================

export function clearModalUrl(){

    const url =
        new URL(
            window.location.href
        );

    // ==================================
    // Получаем текущую модалку
    // ==================================

    const type =
        url.searchParams.get(
            "modal"
        );

    if(!type){

        return;
    }

    // ==================================
    // Находим регистрацию
    // ==================================

    const registration =
        modalRegistry.find(

            modal =>
                modal.type === type

        );

    // ==================================
    // Удаляем ТОЛЬКО modal
    // ==================================

    url.searchParams.delete(
        "modal"
    );

    // ==================================
    // Удаляем ТОЛЬКО параметры модалки
    // ==================================

    for(
        const key of
        registration?.params ?? []
    ){

        // id — параметр страницы,
        // а не параметр модалки.

        if(
            key === "id"
        ){

            continue;

        }

        url.searchParams.delete(
            key
        );

    }

    // ==================================
    // Сохраняем URL страницы
    // ==================================

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
// URL:
//
// ?id=OBJECT_ID
// &modal=photo-preview
// &photoId=PHOTO_ID
//
// Алгоритм:
//
// 1. читаем modal;
// 2. находим регистрацию;
// 3. читаем параметры модалки;
// 4. загружаем данные;
// 5. открываем модалку.
//
// ======================================

// ======================================
// Restore modal from URL
// ======================================

export async function restoreModalFromUrl(){

    const url =
        new URL(
            window.location.href
        );

    const type =
        url.searchParams.get(
            "modal"
        );

    // ==================================
    // Модалки в URL нет
    // ==================================

    if(!type){

        // Если модалка была открыта —
        // закрываем её.

        closeCurrentModal();

        return;

    }

    // ==================================
    // Найти регистрацию
    // ==================================

    const registration =
        modalRegistry.find(

            modal =>
                modal.type === type

        );

    // ==================================
    // Неизвестная модалка
    // ==================================

    if(!registration){

        console.error(

            "Unknown modal:",

            type

        );

        closeCurrentModal();

        return;

    }

    // ==================================
    // Получить параметры
    // ==================================

    const params = {};

    for(
        const key of
        registration.params ?? []
    ){

        params[key] =
            url.searchParams.get(
                key
            );

    }

    // ==================================
    // Загрузить данные
    // ==================================

    let data = null;

    if(
        registration.load
    ){

        data =
            await registration.load(
                params
            );

    }

    // ==================================
    // Данные не найдены
    // ==================================

    if(

        registration.load &&
        !data

    ){

        console.error(

            "Modal data not found:",

            type,

            params

        );

        // ==================================
        // Устаревшая ссылка
        //
        // Удаляем только modal-состояние.
        // id страницы НЕ трогаем.
        // ==================================

        clearModalUrl();

        closeCurrentModal();

        return;

    }

    // ==================================
    // Закрываем предыдущий экземпляр
    // ==================================

    closeCurrentModal();

    // ==================================
    // Открыть модалку
    // ==================================

    if(
        registration.open
    ){

        await registration.open(
            data
        );

    }

}

// ======================================
// Close current modal
// ======================================

function closeCurrentModal(){

    if(!currentModal){

        return;

    }

    const modal =
        currentModal;

    currentModal = null;

    modal.overlay.remove();

}

// ======================================
// Browser Back / Forward
// ======================================

window.addEventListener(

    "popstate",

    ()=>{

        const url =
            new URL(
                window.location.href
            );

        // ==================================
        // Modal закрыта через Back
        // ==================================

        if(
            !url.searchParams.get(
                "modal"
            )
        ){

            closeCurrentModal();

            return;

        }

        // ==================================
        // Modal открыта через Forward
        // ==================================

        restoreModalFromUrl();

    }

);

// ======================================
// Subject mention links
// ======================================
document.addEventListener(
    "click",
    async event=>{
        const link=
            event.target.closest(
                ".subject-mention"
            );
        if(!link)return;
        event.preventDefault();
        const href=
            link.getAttribute("href");
        if(!href)return;
        const url=
            new URL(
                href,
                window.location.href
            );
        const type=
            url.searchParams.get(
                "modal"
            );
        if(type!=="subject")return;
        const entityId=
            url.searchParams.get(
                "entityId"
            );
        if(!entityId)return;
        const currentUrl=
            new URL(
                window.location.href
            );
        currentUrl.searchParams.set(
            "modal",
            "subject"
        );
        currentUrl.searchParams.set(
            "entityId",
            entityId
        );
        window.history.pushState(
            {},
            "",
            currentUrl
        );
        await restoreModalFromUrl();
    }
);
