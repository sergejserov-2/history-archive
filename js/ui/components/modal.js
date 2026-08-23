let currentModal=null;

function waitForTransition(element,callback){

    return new Promise(resolve=>{

        let finished=false;

        const finish=()=>{

            if(finished)return;

            finished=true;

            element.removeEventListener(
                "transitionend",
                onTransitionEnd
            );

            clearTimeout(timeout);

            resolve();

        };

        const onTransitionEnd=event=>{

            if(
                event.target===element &&
                event.propertyName==="transform"
            ){

                finish();

            }

        };

        const timeout=setTimeout(
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


function createModalElement({

    title="",
    content="",
    width=null,
    admin=false

}={}){

    const modal=document.createElement(
        "div"
    );

    modal.className=
        admin
            ? "modal modal--admin"
            : "modal";

    if(width){

        modal.style.setProperty(
            "--modal-width",
            `${width}px`
        );

    }

    modal.innerHTML=`

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


export function createModal({

    title="",
    content="",
    width=null,
    admin=false

}={}){

    const oldModal=currentModal;

    let overlay=
        oldModal?.overlay ??
        null;

    const isReplacement=
        Boolean(oldModal);


    /* ======================================
       OVERLAY
    ====================================== */

    if(!overlay){

        overlay=document.createElement(
            "div"
        );

        overlay.className=
            "modal-overlay";

        document.body.appendChild(
            overlay
        );

    }


    /* ======================================
       NEW MODAL
    ====================================== */

    const modal=createModalElement({

        title,
        content,
        width,
        admin

    });


    /*
        При замене новая модалка добавляется
        поверх старой.

        В этот момент старая ещё полностью
        видима.
    */

    if(isReplacement){

        modal.classList.add(
            "modal--replacement"
        );

    }

    overlay.appendChild(
        modal
    );


    /* ======================================
       START ANIMATION
    ====================================== */

    requestAnimationFrame(()=>{

        requestAnimationFrame(()=>{

            /*
                При первом открытии показываем
                overlay.
            */

            if(!isReplacement){

                overlay.classList.add(
                    "modal-overlay--visible"
                );

            }


            /*
                При замене сначала оставляем
                новую модалку в состоянии .94.
            */

            if(oldModal){

                oldModal.element.classList.add(
                    "modal--replaced"
                );

            }


            /*
                Следующий кадр запускает
                появление новой модалки.

                Сначала удаляем replacement,
                затем добавляем visible.
            */

            requestAnimationFrame(()=>{

                modal.classList.remove(
                    "modal--replacement"
                );

                modal.classList.add(
                    "modal--visible"
                );

            });

        });

    });


    let closing=false;

    let closeHandler=null;


    /* ======================================
       CLOSE
    ====================================== */

    async function close(){

        if(
            currentModal?.element!==modal ||
            closing
        ){

            return;

        }

        closing=true;


        /*
            Обычное закрытие.
        */

        modal.classList.remove(
            "modal--visible"
        );

        modal.classList.add(
            "modal--closing"
        );


        await waitForTransition(
            modal,
            ()=>{}
        );


        modal.remove();


        /*
            Важный момент:

            closeHandler может восстановить
            предыдущую модалку через modalReload.
        */

        if(closeHandler){

            await closeHandler();

        }


        /*
            Если предыдущая модалка не была
            восстановлена — закрываем overlay.
        */

        if(
            currentModal?.element===modal
        ){

            currentModal=null;


            overlay.classList.remove(
                "modal-overlay--visible"
            );


            await waitForTransition(
                overlay,
                ()=>{}
            );


            overlay.remove();

        }

    }


    /* ======================================
       CLOSE BUTTON
    ====================================== */

    const closeButton=
        modal.querySelector(
            ".modal__close"
        );

    if(closeButton){

        closeButton.onclick=
            close;

    }


    /* ======================================
       REMOVE OLD MODAL
    ====================================== */

    if(oldModal){

        /*
            Старая модалка уже получила
            .modal--replaced.

            Ждём окончания её схлопывания
            и только потом удаляем DOM.
        */

        void waitForTransition(

            oldModal.element,

            ()=>{

                /*
                    На случай, если класс ещё
                    не успел быть установлен.
                */

                oldModal.element.classList.remove(
                    "modal--visible"
                );

                oldModal.element.classList.add(
                    "modal--replaced"
                );

            }

        ).then(()=>{

            if(
                oldModal.element.parentNode
            ){

                oldModal.element.remove();

            }

        });

    }


    /* ======================================
       CURRENT MODAL
    ====================================== */

    currentModal={

        overlay,

        element:modal,

        close,

        setCloseHandler(handler){

            closeHandler=handler;

        }

    };


    /* ======================================
       PUBLIC API
    ====================================== */

    return{

        root:overlay,

        content:
            modal.querySelector(
                ".modal__content"
            ),

        setContent(html){

            const contentElement=
                modal.querySelector(
                    ".modal__content"
                );

            if(contentElement){

                contentElement.innerHTML=
                    html;

            }

        },

        setCloseHandler(handler){

            closeHandler=handler;

        },

        close

    };

}


export function getCurrentModal(){

    return currentModal;

}


export function closeCurrentModal(){

    if(!currentModal)return;

    void currentModal.close();

}
