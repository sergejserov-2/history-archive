// ======================================
// Modal component
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
