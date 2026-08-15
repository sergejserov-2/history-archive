import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";

let currentModal=null;
let previousModalUrl=null;

export function createModal({title="",content="", width=null}){
    const oldModal=currentModal;

    const overlay=document.createElement("div");
    overlay.className="modal-overlay";

    const modal=document.createElement("div");
    modal.className="modal";
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

    const closeButton=modal.querySelector(".modal__close");

    async function close(){
        if(currentModal?.overlay!==overlay)return;

        if(previousModalUrl){
            const url=previousModalUrl;
            previousModalUrl=null;

            window.history.pushState({}, "", url);
            await restoreModalFromUrl();
            return;
        }

        currentModal=null;
        overlay.remove();
        clearModalUrl();
    }

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
        close
    };
}

export function setModalUrl(type,params={}){
    const currentUrl=new URL(window.location.href);

    if(currentUrl.searchParams.get("modal")){
        previousModalUrl=currentUrl.toString();
    }

    const url=new URL(window.location.href);

    url.searchParams.set("modal",type);

    Object.entries(params).forEach(([key,value])=>{
        if(value===null||value===undefined||value===""){
            url.searchParams.delete(key);
            return;
        }

        url.searchParams.set(key,String(value));
    });

    window.history.pushState({}, "", url);
}

export function clearModalUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");

    if(!type)return;

    const registration=
        modalRegistry.find(
            modal=>modal.type===type
        );

    url.searchParams.delete("modal");

    for(const key of registration?.params??[]){
        if(key==="id")continue;
        url.searchParams.delete(key);
    }

    window.history.pushState({}, "", url);
}

export async function restoreModalFromUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");

    if(!type){
        closeCurrentModal();
        previousModalUrl=null;
        return;
    }

    const registration=
        modalRegistry.find(
            modal=>modal.type===type
        );

    if(!registration){
        console.error("Unknown modal:",type);
        closeCurrentModal();
        return;
    }

    if(registration.admin&&!isAdmin()){
        clearModalUrl();
        closeCurrentModal();
        return;
    }

    const params={};

    for(const key of registration.params??[]){
        params[key]=url.searchParams.get(key);
    }

    let data=null;

    if(registration.load){
        data=await registration.load(params);
    }

    if(registration.load&&!data){
        console.error(
            "Modal data not found:",
            type,
            params
        );

        clearModalUrl();
        closeCurrentModal();
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
    async ()=>{
        const url=new URL(window.location.href);

        previousModalUrl=null;

        if(!url.searchParams.get("modal")){
            closeCurrentModal();
            return;
        }

        await restoreModalFromUrl();
    }
);

document.addEventListener(
    "click",
    async event=>{
        const link=
            event.target.closest(".subject-mention");

        if(!link)return;

        event.preventDefault();

        const href=link.getAttribute("href");

        if(!href)return;

        const url=
            new URL(
                href,
                window.location.href
            );

        if(url.searchParams.get("modal")!=="subject"){
            return;
        }

        const entityId=
            url.searchParams.get("entityId");

        if(!entityId)return;

        const currentUrl=
            new URL(window.location.href);

        if(currentUrl.searchParams.get("modal")){
            previousModalUrl=currentUrl.toString();
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
