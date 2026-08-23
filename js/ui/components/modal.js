import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";

let currentModal=null;
let modalHistory=[];

function getCurrentModalRegistration(){
    const type=new URL(window.location.href).searchParams.get("modal");
    if(!type)return null;
    return modalRegistry.find(modal=>modal.type===type)??null;
}

export function createModal({title="",content="",width=null}){
    const oldModal=currentModal;
    const overlay=document.createElement("div");
    overlay.className="modal-overlay";
    const registration=getCurrentModalRegistration();
    const modal=document.createElement("div");
    modal.className=registration?.admin
        ?"modal modal--admin"
        :"modal";
    if(width)modal.style.setProperty("--modal-width",`${width}px`);
    modal.innerHTML=`
        <div class="modal__header">
            <h2>${title}</h2>
            <span class="modal__close">×</span>
        </div>
        <div class="modal__content">
            ${content}
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>{
        overlay.classList.add("modal-overlay--visible");
        modal.classList.add("modal--visible");
    });
    let closing=false;
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
                if(event.target!==element)return;
                finish();
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
    async function animateClose(){
        await waitForTransition(
            modal,
            ()=>{
                modal.classList.remove(
                    "modal--visible"
                );
            }
        );
        await waitForTransition(
            overlay,
            ()=>{
                overlay.classList.remove(
                    "modal-overlay--visible"
                );
            }
        );
        overlay.remove();
    }
    async function close(){
        if(currentModal?.overlay!==overlay)return;
        if(closing)return;
        closing=true;
        if(modalHistory.length){
            const url=modalHistory.pop();
            window.history.pushState(
                {},
                "",
                url
            );
            await animateClose();
            currentModal=null;
            await restoreModalFromUrl();
            return;
        }
        currentModal=null;
        await animateClose();
        clearModalUrl();
    }
    const closeButton=modal.querySelector(".modal__close");
    closeButton.onclick=close;
    currentModal={
        overlay,
        close
    };
    if(oldModal){
        oldModal.overlay.remove();
    }
    return{
        root:overlay,
        content:modal.querySelector(".modal__content"),
        setContent(html){
            const contentElement=modal.querySelector(".modal__content");
            if(contentElement){
                contentElement.innerHTML=html;
            }
        },
        close
    };
}

export function setModalUrl(type,params={}){
    const currentUrl=new URL(window.location.href);
    if(currentUrl.searchParams.get("modal")){
        modalHistory.push(
            currentUrl.toString()
        );
    }
    const url=new URL(window.location.href);
    url.searchParams.set("modal",type);
    Object.entries(params).forEach(([key,value])=>{
        if(
            value===null||
            value===undefined||
            value===""
        ){
            url.searchParams.delete(key);
            return;
        }
        url.searchParams.set(
            key,
            String(value)
        );
    });
    window.history.pushState(
        {},
        "",
        url
    );
}

export function clearModalUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    if(!type)return;
    const registration=modalRegistry.find(
        modal=>modal.type===type
    );
    url.searchParams.delete("modal");
    for(
        const key of registration?.params??[]
    ){
        if(key==="id")continue;
        url.searchParams.delete(key);
    }
    window.history.pushState(
        {},
        "",
        url
    );
}

export async function restoreModalFromUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    if(!type){
        closeCurrentModal();
        modalHistory=[];
        return;
    }
    const registration=modalRegistry.find(
        modal=>modal.type===type
    );
    if(!registration){
        console.error(
            "Unknown modal:",
            type
        );
        closeCurrentModal();
        return;
    }
    if(
        registration.admin&&
        !isAdmin()
    ){
        clearModalUrl();
        closeCurrentModal();
        modalHistory=[];
        return;
    }
    const params={};
    for(
        const key of registration.params??[]
    ){
        params[key]=
            url.searchParams.get(key);
    }
    let data=null;
    if(registration.load){
        data=await registration.load(params);
    }
    if(
        registration.load&&
        !data
    ){
        console.error(
            "Modal data not found:",
            type,
            params
        );
        clearModalUrl();
        closeCurrentModal();
        modalHistory=[];
        return;
    }
    if(registration.open){
        await registration.open(data);
    }
}

export function closeCurrentModal(){
    if(!currentModal)return;
    const modal=currentModal;
    currentModal=null;
    modal.overlay.remove();
}

window.addEventListener(
    "popstate",
    async()=>{
        const url=new URL(window.location.href);
        if(!url.searchParams.get("modal")){
            modalHistory=[];
            closeCurrentModal();
            return;
        }
        await restoreModalFromUrl();
    }
);

document.addEventListener(
    "click",
    async event=>{
        const link=event.target.closest(
            ".subject-mention"
        );
        if(!link)return;
        event.preventDefault();
        const href=link.getAttribute("href");
        if(!href)return;
        const url=new URL(
            href,
            window.location.href
        );
        if(
            url.searchParams.get("modal")!=="subject"
        ){
            return;
        }
        const entityId=url.searchParams.get("entityId");
        if(!entityId)return;
        const currentUrl=new URL(window.location.href);
        if(
            currentUrl.searchParams.get("modal")
        ){
            modalHistory.push(
                currentUrl.toString()
            );
        }
        currentUrl.searchParams.set(
            "modal",
            "subject"
        );
        currentUrl.searchParams.set(
            "entityId",
            entityId
        );
        window.history.pushState(
            {},
            "",
            currentUrl
        );
        await restoreModalFromUrl();
    }
);
