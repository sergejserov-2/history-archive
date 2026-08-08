// ======================================
// Modal component
// ======================================

import {
    modalRegistry
}
from "../../modalRegistry.js";

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
// Restore modal from URL
// ======================================
//
// URL:
//
// ?modal=entity-editor
// &modalId=123
// &modalType=photo
//
// Алгоритм:
//
// 1. читаем modal
// 2. находим регистрацию
// 3. читаем параметры,
//    указанные в registration.params
// 4. вызываем registration.load()
// 5. передаём результат в registration.open()
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
