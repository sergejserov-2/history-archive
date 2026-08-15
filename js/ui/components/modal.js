// ======================================
// Modal component
// ======================================

import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";

// ======================================
// Open modals
// ======================================

const openModals=new Map();

// ======================================
// Create modal
// ======================================

export function createModal({
    type="",
    title="",
    content=""
}){
    // ==================================
    // Same modal type already opened
    // ==================================

    if(type&&openModals.has(type)){
        return openModals.get(type);
    }

    const overlay=document.createElement("div");

    overlay.className="modal-overlay";

    const modal=document.createElement("div");

    modal.className="modal";

    modal.innerHTML=`
        <div class="modal__header">
            <h2>${title}</h2>
            <span class="modal__close">×</span>
        </div>

        <div class="modal__content">
            ${content}
        </div>
    `;

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    const closeButton=
        modal.querySelector(".modal__close");

    function close(){
        const current=
            openModals.get(type);

        if(current?.overlay!==overlay)return;

        openModals.delete(type);

        overlay.remove();

        // ==================================
        // Clear URL only if this modal
        // is the modal currently stored there
        // ==================================

        const url=
            new URL(window.location.href);

        if(
            url.searchParams.get("modal")===type
        ){
            clearModalUrl();
        }
    }

    closeButton.onclick=close;

    const instance={
        type,
        overlay,
        content:modal.querySelector(
            ".modal__content"
        ),
        close
    };

    if(type){
        openModals.set(
            type,
            instance
        );
    }

    return instance;
}

// ======================================
// Get opened modal
// ======================================

export function getOpenModal(type){
    return openModals.get(type)??null;
}

// ======================================
// Set modal URL
// ======================================

export function setModalUrl(
    type,
    params={}
){
    const url=
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "modal",
        type
    );

    Object.entries(params).forEach(
        ([key,value])=>{
            if(
                value===null||
                value===undefined||
                value===""
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
    const url=
        new URL(
            window.location.href
        );

    const type=
        url.searchParams.get(
            "modal"
        );

    if(!type)return;

    const registration=
        modalRegistry.find(
            modal=>modal.type===type
        );

    url.searchParams.delete(
        "modal"
    );

    for(
        const key of
        registration?.params??[]
    ){
        if(key==="id")continue;

        url.searchParams.delete(
            key
        );
    }

    window.history.pushState(
        {},
        "",
        url
    );
}

// ======================================
// Restore modal from URL
// ======================================

export async function restoreModalFromUrl(){
    const url=
        new URL(
            window.location.href
        );

    const type=
        url.searchParams.get(
            "modal"
        );

    if(!type)return;

    const registration=
        modalRegistry.find(
            modal=>modal.type===type
        );

    if(!registration){
        console.error(
            "Unknown modal:",
            type
        );

        return;
    }

    // ==================================
    // Admin-only modal
    // ==================================

    if(
        registration.admin&&
        !isAdmin()
    ){
        clearModalUrl();

        return;
    }

    // ==================================
    // Same modal type already opened
    // ==================================

    if(openModals.has(type)){
        return;
    }

    // ==================================
    // Parameters
    // ==================================

    const params={};

    for(
        const key of
        registration.params??[]
    ){
        params[key]=
            url.searchParams.get(
                key
            );
    }

    // ==================================
    // Load data
    // ==================================

    let data=null;

    if(registration.load){
        data=
            await registration.load(
                params
            );
    }

    // ==================================
    // Data not found
    // ==================================

    if(
        registration.load&&
        !data
    ){
        console.error(
            "Modal data not found:",
            type,
            params
        );

        clearModalUrl();

        return;
    }

    // ==================================
    // Open
    // ==================================

    if(registration.open){
        await registration.open(
            data
        );
    }
}

// ======================================
// Close modal by type
// ======================================

export function closeModal(type){
    const modal=
        openModals.get(type);

    if(!modal)return;

    modal.close();
}

// ======================================
// Close all modals
// ======================================

export function closeAllModals(){
    for(
        const modal of
        openModals.values()
    ){
        modal.overlay.remove();
    }

    openModals.clear();
}

// ======================================
// Browser Back / Forward
// ======================================

window.addEventListener(
    "popstate",
    ()=>{
        const url=
            new URL(
                window.location.href
            );

        const type=
            url.searchParams.get(
                "modal"
            );

        if(!type){
            return;
        }

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
            link.getAttribute(
                "href"
            );

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
