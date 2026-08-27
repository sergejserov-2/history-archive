let currentModal=null;
let modalHistory=[];

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
    let overlay=oldModal?.overlay??null;
    const isReplacement=Boolean(oldModal);

    if(!overlay){
        overlay=document.createElement("div");
        overlay.className="modal-overlay";
        document.body.appendChild(overlay);
    }

    if(oldModal){
        modalHistory.push({
            overlay:oldModal.overlay,
            element:oldModal.element,
            close:oldModal.close,
            closeHandler:oldModal.closeHandler,
            setCloseHandler:oldModal.setCloseHandler
        });
    }

    const modal=createModalElement({title,content,width,admin});

    if(isReplacement)modal.classList.add("modal--replacement");
    overlay.appendChild(modal);

    let closing=false;
    let closeHandler=null;

    function setCloseHandler(handler){
        closeHandler=handler;
        if(currentModal?.element===modal)currentModal.closeHandler=handler;
    }

    async function close(){
        if(currentModal?.element!==modal||closing)return;
        closing=true;
        const handler=closeHandler;
        modal.classList.remove("modal--visible");
        modal.classList.add("modal--closing");
        await waitForTransition(modal,()=>{});
        modal.remove();

        if(modalHistory.length){
            const previous=modalHistory.pop();
            if(previous.element&&previous.element.parentNode){
                previous.element.classList.remove("modal--replaced");
                previous.element.classList.add("modal--visible");
                currentModal={
                    overlay:previous.overlay,
                    element:previous.element,
                    close:previous.close,
                    closeHandler:previous.closeHandler,
                    setCloseHandler:previous.setCloseHandler
                };
                if(typeof handler==="function")await handler();
                return;
            }
        }

        currentModal=null;
        modalHistory=[];
        overlay.classList.remove("modal-overlay--visible");
        await waitForTransition(overlay,()=>{});
        overlay.remove();
        if(typeof handler==="function")await handler();
    }

    const closeButton=modal.querySelector(".modal__close");
    if(closeButton)closeButton.onclick=close;

    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            if(!isReplacement)overlay.classList.add("modal-overlay--visible");
            if(oldModal)oldModal.element.classList.add("modal--replaced");
            requestAnimationFrame(()=>{
                modal.classList.remove("modal--replacement");
                modal.classList.add("modal--visible");
            });
        });
    });

    currentModal={overlay,element:modal,close,closeHandler:null,setCloseHandler};

    return{
        root:overlay,
        content:modal.querySelector(".modal__content"),
        setContent(html){
            const contentElement=modal.querySelector(".modal__content");
            if(contentElement)contentElement.innerHTML=html;
        },
        setCloseHandler,
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
