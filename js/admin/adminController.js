// ======================================
// Admin UI controller
// ======================================

import {
    onAdminStateChanged
}
from "./adminMode.js";

import {
    updateAdminButton
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
// Synchronize all buttons
// ======================================

export function syncAdminButtons(){
    console.log(
    "[ADMIN SYNC]"
);

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
// Auth state changed
// ======================================

function handleAdminStateChanged(
    admin
){

    const nextState =
        !!admin;


    // ==================================
    // Ничего не изменилось
    // ==================================

    if(
        nextState ===
        currentAdminState
    ){

        return;

    }


    currentAdminState =
        nextState;


    syncAdminButtons();

}


// ======================================
// Observe dynamically inserted HTML
// ======================================

function observeAdminButtons(){

    if(observer)
        return;


    if(!document.body)
        return;


    observer =
        new MutationObserver(
            mutations => {

                let hasNewButtons =
                    false;


                mutations.forEach(
                    mutation => {

                        mutation.addedNodes
                            .forEach(
                                node => {

                                    if(
                                        node.nodeType !==
                                        Node.ELEMENT_NODE
                                    ){

                                        return;

                                    }


                                    if(
                                        node.matches?.(
                                            ".admin-button"
                                        )
                                    ){

                                        hasNewButtons =
                                            true;

                                        return;

                                    }


                                    if(
                                        node.querySelector?.(
                                            ".admin-button"
                                        )
                                    ){

                                        hasNewButtons =
                                            true;

                                    }

                                }
                            );

                    }
                );


                if(
                    hasNewButtons
                ){

                    syncAdminButtons();

                }

            }
        );


    observer.observe(

        document.body,

        {
            childList:true,
            subtree:true
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


    onAdminStateChanged(
        handleAdminStateChanged
    );


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
            once:true
        }
    );

}else{

    initAdminController();

}
