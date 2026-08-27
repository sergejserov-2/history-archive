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
            if(event.target===element)finish();
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
    const replacing=Boolean(previous);

    if(!overlay){
        overlay=document.createElement("div");
        overlay.className="modal-overlay";
        document.body.appendChild(overlay);
    }

    const element=createModalElement({title,content,width,admin});
    overlay.appendChild(element);

    let closing=false;
    let closeHandler=null;

    async function close({silent=false}={}){
        if(currentModal?.element!==element||closing)return;
        closing=true;

        element.classList.remove("modal--visible");
        element.classList.add("modal--closing");

        await waitForTransition(element,()=>{});

        element.remove();

        if(currentModal?.element!==element)return;

        currentModal=null;

        if(!overlay.querySelector(".modal")){
            overlay.classList.remove("modal-overlay--visible");
            await waitForTransition(overlay,()=>{});
            if(overlay.parentNode)overlay.remove();
        }

        if(!silent&&closeHandler)await closeHandler();
    }

    const closeButton=element.querySelector(".modal__close");
    if(closeButton)closeButton.onclick=()=>void close();

    requestAnimationFrame(()=>{
        if(!replacing)overlay.classList.add("modal-overlay--visible");
        if(previous?.element)previous.element.classList.remove("modal--visible");
        requestAnimationFrame(()=>{
            element.classList.remove("modal--closing");
            element.classList.add("modal--visible");
        });
    });

    if(previous?.element){
        void waitForTransition(previous.element,()=>{}).then(()=>{
            if(previous.element.parentNode)previous.element.remove();
        });
    }

    currentModal={
        overlay,
        element,
        close,
        setCloseHandler(handler){
            closeHandler=typeof handler==="function"?handler:null;
        }
    };

    return{
        root:overlay,
        content:element.querySelector(".modal__content"),
        setContent(html){
            const contentElement=element.querySelector(".modal__content");
            if(contentElement)contentElement.innerHTML=html;
        },
        setCloseHandler(handler){
            closeHandler=typeof handler==="function"?handler:null;
        },
        close,
        element
    };
}

export function getCurrentModal(){
    return currentModal;
}

export function closeCurrentModal(options={}){
    if(!currentModal)return;
    return currentModal.close(options);
}
