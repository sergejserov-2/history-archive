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
//
// createModal:
//
// Только создаёт визуальное окно.
//
// URL здесь НЕ изменяется.
//
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
// Open modal
// ======================================
//
// type:
//     тип зарегистрированной модалки
//
// params:
//     параметры модалки,
//     которые будут записаны в URL
//
// Например:
//
// openModal(
//     "photo",
//     {
//         modalId: photo.id
//     }
// );
//
// ======================================

export async function openModal(

    type,

    params = {}

){

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
    // Закрыть текущую модалку
    // ==================================

    closeCurrentModal();

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

        return;

    }

    // ==================================
    // Записать состояние в URL
    // ==================================

    setModalUrl(

        type,

        params

    );

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

    // ==================================
    // Пометить модалку как связанную
    // с URL
    // ==================================

    if(currentModal){

        currentModal.urlManaged = true;

    }

}

// ======================================
// Set modal URL
// ================
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

    // ==================================
    // Пометить как URL-модалку
    // ==================================

    if(currentModal){

        currentModal.urlManaged = true;

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

    // ==================================
    // Если модалка была открыта
    // через URL — очищаем его
    // ==================================

    if(
        modal.urlManaged
    ){

        clearModalUrl();

    }

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
