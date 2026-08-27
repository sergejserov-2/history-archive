import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

let restoring=false;
let closingFromHistory=false;

function getRegistration(type){
    return modalRegistry.find(modal=>modal.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

function getModalState(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    return{
        url,
        type,
        registration:type?getRegistration(type):null
    };
}

export function setModalUrl(type,params={}){
    const url=new URL(window.location.href);
    url.searchParams.set("modal",type);

    const registration=getRegistration(type);
    const allowed=new Set(registration?.params??[]);

    for(const key of [...url.searchParams.keys()]){
        if(key==="modal")continue;
        if(!allowed.has(key)&&key!=="id")url.searchParams.delete(key);
    }

    Object.entries(params).forEach(([key,value])=>{
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    });

    window.history.pushState({modal:type},"",url);
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);

    Object.entries(params).forEach(([key,value])=>{
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    });

    window.history.replaceState(
        {
            ...window.history.state,
            modal:url.searchParams.get("modal")
        },
        "",
        url
    );
}

function removeModalParams(url,registration){
    url.searchParams.delete("modal");
    for(const key of registration?.params??[]){
        if(key!=="id")url.searchParams.delete(key);
    }
    return url;
}

async function closeCurrentModalFromHistory(){
    const modal=getCurrentModal();
    if(!modal)return;
    closingFromHistory=true;
    try{
        await modal.close();
    }finally{
        closingFromHistory=false;
    }
}

async function openFromUrl(){
    const{url,type,registration}=getModalState();

    if(!type){
        await closeCurrentModalFromHistory();
        return;
    }

    if(!registration){
        console.error("Unknown modal:",type);
        const cleanUrl=removeModalParams(url,null);
        window.history.replaceState({}, "", cleanUrl);
        await closeCurrentModalFromHistory();
        return;
    }

    if(registration.admin&&!isAdmin()){
        const cleanUrl=removeModalParams(url,registration);
        window.history.replaceState({}, "", cleanUrl);
        await closeCurrentModalFromHistory();
        return;
    }

    const params=getUrlParams(registration,url);
    const data=registration.load?await registration.load(params):null;

    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);
        const cleanUrl=removeModalParams(url,registration);
        window.history.replaceState({}, "", cleanUrl);
        await closeCurrentModalFromHistory();
        return;
    }

    const current=getCurrentModal();

    if(current){
        const currentType=current.element?.dataset?.modalType;
        if(currentType===type)return;
        await closeCurrentModalFromHistory();
    }

    restoring=true;
    try{
        await registration.open?.(data);
    }finally{
        restoring=false;
    }

    const modal=getCurrentModal();
    if(!modal)return;

    modal.element.dataset.modalType=type;

    modal.setCloseHandler(async()=>{
        if(closingFromHistory||restoring)return;
        if(window.location.search.includes("modal=")){
            window.history.back();
        }
    });
}

export async function restoreModalFromUrl(){
    await openFromUrl();
}

window.addEventListener("popstate",async()=>{
    await openFromUrl();
});

document.addEventListener("click",async event=>{
    const link=event.target.closest(".subject-mention");
    if(!link)return;

    const href=link.getAttribute("href");
    if(!href)return;

    const url=new URL(href,window.location.href);
    if(url.searchParams.get("modal")!=="subject")return;

    event.preventDefault();

    const entityId=url.searchParams.get("entityId");
    if(!entityId)return;

    setModalUrl("subject",{entityId});
    await openFromUrl();
});
