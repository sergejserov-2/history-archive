// ======================================
// Admin UI controller
// ======================================

import {
    onAdminStateChanged
}
from "./adminMode.js";

import {
    updateAdminButton,
    setAdminButtonState
}
from "../ui/components/adminButtons.js";


// ======================================
// State
// ======================================

let currentAdminState = false;

let initialized = false;

let observer = null;


// ======================================
// Get current UI state
// ======================================

export function isAdminUIEnabled(){

    return currentAdminState;

}


// ======================================
// Find all admin buttons
// ======================================

function getAdminButtons(){

    return document.querySelectorAll(
        ".admin-button"
    );

}


// ======================================
// Synchronize all existing buttons
// ======================================
//
// Используется ТОЛЬКО при реальном
// изменении admin-состояния.
//
// Здесь анимация разрешена.
//

export function syncAdminButtons(){

    getAdminButtons().forEach(
        button => {

            updateAdminButton(
                button,
                currentAdminState
            );

        }
    );

}


// ======================================
// Synchronize newly inserted buttons
// ======================================
//
// Важно:
//
// новые кнопки появляются после
// innerHTML / outerHTML.
//
// Они НЕ должны проигрывать
// entrance-анимацию заново.
//
// Просто сразу получают текущее
// состояние admin UI.
//

function syncNewAdminButtons(
    root
){

    if(!root)
        return;


    const buttons = [];


    // Сам добавленный элемент.

    if(
        root.nodeType ===
        Node.ELEMENT_NODE
    ){

        if(
            root.matches?.(
                ".admin-button"
            )
        ){

            buttons.push(
                root
            );

        }


        // Кнопки внутри добавленного
        // элемента.

        root
            .querySelectorAll?.(
                ".admin-button"
            )
            .forEach(
                button => {

                    buttons.push(
                        button
                    );

                }
            );

    }


    // Устанавливаем состояние
    // без анимации.

    buttons.forEach(
        button => {

            setAdminButtonState(
                button,
                currentAdminState
            );

        }
    );

}


// ======================================
// Auth state changed
// ======================================

function handleAdminStateChanged(
    admin
){

    admin = !!admin;


    // ==================================
    // Ничего не изменилось
    // ==================================
    //
    // Firebase / другие подписчики могут
    // повторно сообщить то же состояние.
    //
    // В этом случае вообще ничего
    // не трогаем.

    if(
        admin === currentAdminState
    ){

        return;

    }


    // ==================================
    // Реальное изменение состояния
    // ==================================

    currentAdminState =
        admin;


    // Только здесь запускается
    // анимация существующих кнопок.

    syncAdminButtons();

}


// ======================================
// Observe dynamically inserted HTML
// ======================================
//
// Observer НЕ вызывает syncAdminButtons().
//
// Иначе любой innerHTML / outerHTML
// повторно запускал бы анимацию всех
// кнопок на странице.
//
// Observer только мгновенно выставляет
// состояние новым кнопкам.
//

function observeAdminButtons(){

    if(observer)
        return;


    if(!document.body)
        return;


    observer =
        new MutationObserver(
            mutations => {

                mutations.forEach(
                    mutation => {

                        mutation.addedNodes
                            .forEach(
                                node => {

                                    syncNewAdminButtons(
                                        node
                                    );

                                }
                            );

                    }
                );

            }
        );


    observer.observe(

        document.body,

        {
            childList: true,
            subtree: true
        }

    );

}


// ======================================
// Initialize
// ======================================

export function initAdminController(){

    if(initialized)
        return;


    initialized = true;


    // ==================================
    // Firebase auth state
    // ==================================

    onAdminStateChanged(
        handleAdminStateChanged
    );


    // ==================================
    // Dynamic buttons
    // ==================================

    observeAdminButtons();

}


// ======================================
// Automatic initialization
// ======================================

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initAdminController,
        {
            once: true
        }
    );

}else{

    initAdminController();

}
