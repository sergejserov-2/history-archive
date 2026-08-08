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

        overlay.remove();

        if(
            currentModal?.overlay === overlay
        ){

            currentModal = null;

        }

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
// Страница НЕ перезагружается.
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

export function clearModalUrl(){

    const url =
        new URL(
            window.location.href
        );

    // ==================================
    // Получаем текущую регистрацию
    // ==================================

    const type =
        url.searchParams.get(
            "modal"
        );

    if(!type){

        return;

    }

    const registration =
        modalRegistry.find(

            modal =>
                modal.type === type

        );

    // ==================================
    // Удаляем modal
    // ==================================

    url.searchParams.delete(
        "modal"
    );

    // ==================================
    // Удаляем параметры модалки
    // ==================================

    for(
        const key of
        registration?.params ?? []
    ){

        url.searchParams.delete(
            key
        );

    }

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
// Restore modal from URL
// ======================================
//
// URL:
//
// ?modal=photo-preview
// &photoId=123
//
// Алгоритм:
//
// 1. читаем modal;
// 2. находим регистрацию;
// 3. читаем её параметры;
// 4. загружаем данные;
// 5. открываем модалку.
//
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
    // Модалки нет
    // ==================================

    if(!type){

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

        return;

    }

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

    currentModal.overlay.remove();

    currentModal = null;

}

// ======================================
// Browser Back / Forward
// ======================================

window.addEventListener(

    "popstate",

    ()=>{

        restoreModalFromUrl();

    }

);

// ======================================
// Initial URL
// ======================================
//
// Если страница открыта сразу
// с ?modal=...
// модалка восстанавливается.
//
// ======================================

restoreModalFromUrl();
