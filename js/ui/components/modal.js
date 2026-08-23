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
            if(event.target===element)finish();
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

    const modal=document.createElement("div");

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
            <span class="modal__close">×</span>
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

    const modal=createModalElement({
        title,
        content,
        width,
        admin
    });

    /*
        Новая модалка добавляется поверх старой.
        Старая пока остаётся полностью живой.
    */

    if(oldModal){

        modal.classList.add(
            "modal--replacement"
        );

        overlay.appendChild(
            modal
        );

        requestAnimationFrame(()=>{

            requestAnimationFrame(()=>{

                modal.classList.add(
                    "modal--visible"
                );

                oldModal.element.classList.add(
                    "modal--replaced"
                );

            });

        });

    }else{

        overlay.appendChild(
            modal
        );

        requestAnimationFrame(()=>{

            overlay.classList.add(
                "modal-overlay--visible"
            );

            modal.classList.add(
                "modal--visible"
            );

        });

    }

    let closing=false;
    let closeHandler=null;

    async function close(){

        if(
            currentModal?.element!==modal ||
            closing
        ){
            return;
        }

        closing=true;

        /*
            Обычное закрытие последней модалки.
        */

        modal.classList.remove(
            "modal--visible"
        );

        await waitForTransition(
            modal,
            ()=>{}
        );

        modal.remove();

        if(closeHandler){
            await closeHandler();
        }

        /*
            Если closeHandler восстановил
            предыдущую модалку, overlay оставляем.
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

    const closeButton=
        modal.querySelector(
            ".modal__close"
        );

    if(closeButton){
        closeButton.onclick=close;
    }

    /*
        Старую модалку удаляем только после
        завершения её transition.

        ВАЖНО:
        она не исчезает раньше появления новой.
    */

    if(oldModal){

        void waitForTransition(
            oldModal.element,
            ()=>{
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

    currentModal={
        overlay,
        element:modal,
        close,

        setCloseHandler(handler){
            closeHandler=handler;
        }
    };

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
