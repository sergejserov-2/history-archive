let currentModal=null;

function waitForTransition(element,callback){
    return new Promise(resolve=>{
        let finished=false;
        const finish=()=>{
            if(finished)return;
            finished=true;
            element.removeEventListener("transitionend",onTransitionEnd);
            clearTimeout(timeout);
            resolve();
        };
        const onTransitionEnd=event=>{
            if(event.target===element&&(event.propertyName==="transform"||event.propertyName==="opacity"))finish();
        };
        const timeout=setTimeout(finish,500);
        element.addEventListener("transitionend",onTransitionEnd);
        callback();
    });
}

function createModalElement({title="",content="",width=null,admin=false}={}){
    const modal=document.createElement("div");
    modal.className=admin?"modal modal--admin":"modal";
    if(width)modal.style.setProperty("--modal-width",`${width}px`);
    modal.innerHTML=`<div class="modal__header"><h2>${title}</h2><span class="modal__close">×</span></div><div class="modal__content">${content}</div>`;
    return modal;
}

export function createModal({title="",content="",width=null,admin=false}={}){
    const previous=currentModal;
    let overlay=previous?.overlay??null;

    if(!overlay){
        overlay=document.createElement("div");
        overlay.className="modal-overlay";
        document.body.appendChild(overlay);
    }

    if(previous?.element?.isConnected){
        previous.element.classList.add("modal--replaced");
    }

    const modal=createModalElement({title,content,width,admin});
    if(previous)modal.classList.add("modal--replacement");
    overlay.appendChild(modal);

    let closing=false;
    let closeHandler=null;
    let cleanup=null;

    function setCloseHandler(handler){
        closeHandler=typeof handler==="function"?handler:null;
        if(currentModal?.element===modal)currentModal.closeHandler=closeHandler;
    }

    function setCleanup(handler){
        cleanup=typeof handler==="function"?handler:null;
        if(currentModal?.element===modal)currentModal.cleanup=cleanup;
    }

    async function close(){
        if(currentModal?.element!==modal||closing)return;
        closing=true;

        if(typeof cleanup==="function"){
            try{
                await cleanup();
            }catch(error){
                console.error("Ошибка очистки модалки:",error);
            }
        }

        modal.classList.remove("modal--visible");
        modal.classList.add("modal--closing");
        await waitForTransition(modal,()=>{});
        modal.remove();

        if(previous?.element?.isConnected){
            previous.element.classList.remove("modal--replaced");
            previous.element.classList.add("modal--visible");
            currentModal=previous;
        }else{
            currentModal=null;
            overlay.classList.remove("modal-overlay--visible");
            await waitForTransition(overlay,()=>{});
            if(!currentModal)overlay.remove();
        }

        if(typeof closeHandler==="function"){
            try{
                await closeHandler();
            }catch(error){
                console.error("Ошибка обработчика закрытия модалки:",error);
            }
        }
    }

    const closeButton=modal.querySelector(".modal__close");
    if(closeButton)closeButton.onclick=close;

    currentModal={
        overlay,
        element:modal,
        close,
        closeHandler:null,
        cleanup:null,
        setCloseHandler,
        setCleanup
    };

    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            overlay.classList.add("modal-overlay--visible");
            requestAnimationFrame(()=>{
                modal.classList.remove("modal--replacement");
                modal.classList.add("modal--visible");
            });
        });
    });

    return{
        root:overlay,
        content:modal.querySelector(".modal__content"),
        setContent(html){
            const contentElement=modal.querySelector(".modal__content");
            if(contentElement)contentElement.innerHTML=html;
        },
        setCloseHandler,
        setCleanup,
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
