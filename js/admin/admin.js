// ======================================
// Admin
// ======================================

import {
    renderObjectEditor,
    initObjectEditor
}
from "./editors/objectEditor.js";

import {
    openEntityEditor
}
from "./editors/entityEditor.js";

// ======================================
// Init
// ======================================

export function initAdmin(

    object,

    types,

    objects,

    photos,

    sources,

    records,

    children

) {

    document.addEventListener(

        "click",

        event => {

            const button =

                event.target.closest(

                    ".admin-button"

                );

            if(!button){

                return;

            }

            const action =

                button.dataset.action;

            const id =

                button.dataset.id;

            // ======================================
            // Object
            // ======================================

            if(

                action === "edit-object"

            ){

                const block =

                    document.querySelector(

                        ".object__info"

                    );

                block.innerHTML =

                    renderObjectEditor(

                        object,

                        types,

                        objects,

                        photos,

                        children

                    );

                initObjectEditor(

                    object,

                    types,

                    objects,

                    photos,

                    children,

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Photo
            // ======================================

            if(

                action === "edit-photo"

            ){

                const photo =

                    photos.find(

                        p =>

                        p.id === id

                    );

                if(!photo){

                    return;

                }

                openEntityEditor(

                    "photo",

                    photo,

                    {

                        objects

                    },

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Source
            // ======================================

            if(

                action === "edit-source"

            ){

                const source =

                    sources.find(

                        s =>

                        s.id === id

                    );

                if(!source){

                    return;

                }

                openEntityEditor(

                    "source",

                    source,

                    {

                        objects

                    },

                    ()=>{

                        location.reload();

                    }

                );

                return;

            }

            // ======================================
            // Record
            // ======================================

            if(

                action === "edit-record"

            ){

                const record =

                    records.find(

                        r =>

                        r.id === id

                    );

                if(!record){

                    return;

                }

                openEntityEditor(

                    "record",

                    record,

                    {

                        objects

                    },()=>{

                        location.reload();

                    }

                );

                return;

            }

        }

    );

}
