// ======================================
// Admin UI controller
// ======================================

import{
    onAdminStateChanged
}from"./adminMode.js";

import{
    updateAdminButton
}from"../ui/components/adminButtons.js";

import{
    show,
    hide
}from"../ui/animations/controller.js";

// ======================================
// State
// ======================================

let currentAdminState=false;
let initialized=false;
let observer=null;

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
// Find empty sections
// ======================================

function getEmptySections(){
    return document.querySelectorAll(
        ".section--admin-empty"
    );
}

// ======================================
// Empty section button
// ======================================

function syncEmptySectionButtons(section){
    section.querySelectorAll(
        ".admin-button"
    ).forEach(button=>{
        button.hidden=!currentAdminState;
        button.classList.remove(
            "animation--hidden"
        );
    });
}

// ======================================
// Synchronize empty sections
// ======================================

function syncEmptySections(){
    getEmptySections().forEach(section=>{
        syncEmptySectionButtons(section);

        if(currentAdminState){
            show(section);
        }else{
            hide(section);
        }
    });
}

// ======================================
// Synchronize all buttons
// ======================================

export function syncAdminButtons(){
    syncEmptySections();

    getAdminButtons().forEach(button=>{
        if(
            button.closest(
                ".section--admin-empty"
            )
        )
            return;

        updateAdminButton(
            button,
            currentAdminState
        );
    });
}

// ======================================
// Auth state changed
// ======================================

function handleAdminStateChanged(admin){
    const nextState=!!admin;

    if(
        nextState===
        currentAdminState
    )
        return;

    currentAdminState=nextState;

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

    observer=new MutationObserver(
        mutations=>{
            let hasNewElements=false;

            mutations.forEach(
                mutation=>{
                    mutation.addedNodes.forEach(
                        node=>{
                            if(
                                node.nodeType!==
                                Node.ELEMENT_NODE
                            )
                                return;

                            if(
                                node.matches?.(
                                    ".admin-button,.section--admin-empty"
                                )
                            ){
                                hasNewElements=true;
                                return;
                            }

                            if(
                                node.querySelector?.(
                                    ".admin-button,.section--admin-empty"
                                )
                            ){
                                hasNewElements=true;
                            }
                        }
                    );
                }
            );

            if(hasNewElements)
                syncAdminButtons();
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

    initialized=true;

    onAdminStateChanged(
        handleAdminStateChanged
    );

    observeAdminButtons();
}

// ======================================
// Automatic initialization
// ======================================

if(
    document.readyState===
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
