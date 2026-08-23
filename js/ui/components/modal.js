let currentModal = null;
let modalHistory = [];


/* ==========================================
   WAIT FOR TRANSITION
========================================== */

function waitForTransition(element, callback){

    return new Promise(resolve => {

        let finished = false;

        const finish = () => {

            if(finished) return;

            finished = true;

            element.removeEventListener(
                "transitionend",
                onTransitionEnd
            );

            clearTimeout(timeout);

            resolve();

        };

        const onTransitionEnd = event => {

            if(
                event.target === element &&
                (
                    event.propertyName === "transform" ||
                    event.propertyName === "opacity"
                )
            ){

                finish();

            }

        };

        const timeout = setTimeout(
            finish,
            500
        );

        element.addEventListener(
            "transitionend",
            onTransitionEnd
        );

        callback();

    });

}


/* ==========================================
   CREATE MODAL ELEMENT
========================================== */

function createModalElement({

    title = "",
    content = "",
    width = null,
    admin = false

} = {}){

    const modal = document.createElement(
        "div"
    );

    modal.className =
        admin
            ? "modal modal--admin"
            : "modal";

    if(width){

        modal.style.setProperty(
            "--modal-width",
            `${width}px`
        );

    }

    modal.innerHTML = `

        <div class="modal__header">

            <h2>${title}</h2>

            <span class="modal__close">
                ×
            </span>

        </div>

        <div class="modal__content">

            ${content}

        </div>

    `;

    return modal;

}


/* ==========================================
   CREATE MODAL
========================================== */

export function createModal({

    title = "",
    content = "",
    width = null,
    admin = false

} = {}){

    const oldModal = currentModal;

    let overlay =
        oldModal?.overlay ??
        null;

    const isReplacement =
        Boolean(oldModal);


    /* ======================================
       OVERLAY
    ====================================== */

    if(!overlay){

        overlay = document.createElement(
            "div"
        );

        overlay.className =
            "modal-overlay";

        document.body.appendChild(
            overlay
        );

    }


    /* ======================================
       SAVE CURRENT MODAL IN HISTORY
    ====================================== */

    if(oldModal){

        modalHistory.push({

            overlay:
                oldModal.overlay,

            element:
                oldModal.element,

            close:
                oldModal.close,

            closeHandler:
                oldModal.closeHandler,

            setCloseHandler:
                oldModal.setCloseHandler

        });

    }


    /* ======================================
       CREATE NEW MODAL
    ====================================== */

    const modal = createModalElement({

        title,
        content,
        width,
        admin

    });


    /* ======================================
       INITIAL REPLACEMENT STATE
    ====================================== */

    if(isReplacement){

        modal.classList.add(
            "modal--replacement"
        );

    }


    overlay.appendChild(
        modal
    );


    /* ======================================
       CLOSE HANDLER
    ====================================== */

    let closing = false;

    let closeHandler = null;


    /* ======================================
       SET CLOSE HANDLER
    ====================================== */

    function setCloseHandler(handler){

        closeHandler = handler;

        if(
            currentModal?.element === modal
        ){

            currentModal.closeHandler =
                handler;

        }

    }


    /* ======================================
       CLOSE
    ====================================== */

    async function close(){

        if(
            currentModal?.element !== modal ||
            closing
        ){

            return;

        }

        closing = true;


        /* ==================================
           CLOSE CURRENT MODAL
        ================================== */

        modal.classList.remove(
            "modal--visible"
        );

        modal.classList.add(
            "modal--closing"
        );


        await waitForTransition(
            modal,
            () => {}
        );


        modal.remove();


        /* ==================================
           RESTORE PREVIOUS MODAL
        ================================== */

        if(modalHistory.length){

            const previous =
                modalHistory.pop();

            if(
                previous.element &&
                previous.element.parentNode
            ){

                previous.element.classList.remove(
                    "modal--replaced"
                );

                previous.element.classList.add(
                    "modal--visible"
                );

                currentModal = {

                    overlay:
                        previous.overlay,

                    element:
                        previous.element,

                    close:
                        previous.close,

                    closeHandler:
                        previous.closeHandler,

                    setCloseHandler:
                        previous.setCloseHandler

                };

                return;

            }

        }


        /* ==================================
           NO HISTORY — CLOSE OVERLAY
        ================================== */

        currentModal = null;

        modalHistory = [];

        overlay.classList.remove(
            "modal-overlay--visible"
        );


        await waitForTransition(
            overlay,
            () => {}
        );


        overlay.remove();

    }


    /* ======================================
       CLOSE BUTTON
    ====================================== */

    const closeButton =
        modal.querySelector(
            ".modal__close"
        );

    if(closeButton){

        closeButton.onclick =
            close;

    }


    /* ======================================
       ANIMATION
    ====================================== */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            /* ------------------------------
               Overlay
            ------------------------------ */

            if(!isReplacement){

                overlay.classList.add(
                    "modal-overlay--visible"
                );

            }


            /* ------------------------------
               Old modal
            ------------------------------ */

            if(oldModal){

                oldModal.element.classList.add(
                    "modal--replaced"
                );

            }


            /* ------------------------------
               New modal
            ------------------------------ */

            requestAnimationFrame(() => {

                modal.classList.remove(
                    "modal--replacement"
                );

                modal.classList.add(
                    "modal--visible"
                );

            });

        });

    });


    /* ======================================
       CURRENT MODAL
    ====================================== */

    currentModal = {

        overlay,

        element:
            modal,

        close,

        closeHandler:

            null,

        setCloseHandler

    };


    /* ======================================
       PUBLIC API
    ====================================== */

    return {

        root:
            overlay,

        content:
            modal.querySelector(
                ".modal__content"
            ),

        setContent(html){

            const contentElement =
                modal.querySelector(
                    ".modal__content"
                );

            if(contentElement){

                contentElement.innerHTML =
                    html;

            }

        },

        setCloseHandler,

        close

    };

}


/* ==========================================
   GET CURRENT MODAL
========================================== */

export function getCurrentModal(){

    return currentModal;

}


/* ==========================================
   CLOSE CURRENT MODAL
========================================== */

export function closeCurrentModal(){

    if(!currentModal) return;

    void currentModal.close();

}
