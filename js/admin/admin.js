import {
    renderObjectEditor,
    initObjectEditor
}
from "./editors/objectEditor.js";

export function initAdmin(
    object
) {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".admin-button"
                );

            if (!button) {

                return;

            }

            const action =
                button.dataset.action;

            if (
                action === "edit-object"
            ) {

                const block =
                    document.querySelector(
                        ".object__info"
                    );

                block.innerHTML =
                    renderObjectEditor(
                        object
                    );

                initObjectEditor(

                    object,

                    () => {

                        location.reload();

                    }

                );

            }

        }

    );

}
