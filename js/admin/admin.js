// ======================================
// Admin
// ======================================

import {
    renderObjectEditor,
    initObjectEditor
}
from "./editors/objectEditor.js";

// ======================================
// Init
// ======================================

export function initAdmin(

    object,

    types,

    objects,

    photos,

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

            if(

                action !== "edit-object"

            ){

                return;

            }

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

                () => {

                    location.reload();

                }

            );

        }

    );

}
