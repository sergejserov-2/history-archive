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
    const oldModal=currentModal;
    const overlay=oldModal?.overlay??document.createElement("div");
    const modal=createModalElement({title,content,width,admin});
    let closing=false;
    let closeHandler=null;

    if(!oldModal){
        overlay.className="modal-overlay";
        document.body.appendChild(overlay);
    }

    overlay.appendChild(modal);

    async function close({runHandler=true}={}){
        if(currentModal?.element!==modal||closing)return;

        if(runHandler&&typeof closeHandler==="function"){
            await closeHandler();
            return;
        }

        closing=true;
        modal.classList.remove("modal--visible");
        modal.classList.add("modal--closing");
        await waitForTransition(modal,()=>{});
        modal.remove();

        if(currentModal?.element!==modal)return;

        currentModal=null;

        if(currentModal)return;

        overlay.classList.remove("modal-overlay--visible");
        await waitForTransition(overlay,()=>{});
        if(overlay.parentNode)overlay.remove();
    }

    const closeButton=modal.querySelector(".modal__close");
    if(closeButton)closeButton.onclick=()=>void close();

    if(oldModal){
        oldModal.element.classList.remove("modal--visible");
        oldModal.element.classList.add("modal--closing");
        void waitForTransition(oldModal.element,()=>{}).then(()=>oldModal.element.remove());
    }

    currentModal={
        overlay,
        element:modal,
        close,
        setCloseHandler:handler=>{closeHandler=handler;}
    };

    requestAnimationFrame(()=>{
        if(!oldModal)overlay.classList.add("modal-overlay--visible");
        requestAnimationFrame(()=>modal.classList.add("modal--visible"));
    });

    return{
        root:overlay,
        content:modal.querySelector(".modal__content"),
        setContent(html){
            const contentElement=modal.querySelector(".modal__content");
            if(contentElement)contentElement.innerHTML=html;
        },
        setCloseHandler(handler){
            closeHandler=handler;
        },
        close:()=>close()
    };
}

export function getCurrentModal(){
    return currentModal;
}

export function closeCurrentModal(options={}){
    if(!currentModal)return;
    void currentModal.close(options);
}
