import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

let restoring=false;
let closingFromHistory=false;

function getRegistration(type){
    return modalRegistry.find(item=>item.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

function getBaseUrl(url){
    const base=new URL(url.href);
    const registration=getRegistration(base.searchParams.get("modal"));
    base.searchParams.delete("modal");
    for(const key of registration?.params??[])base.searchParams.delete(key);
    return base;
}

function buildModalUrl(type,params={}){
    const url=new URL(window.location.href);
    const registration=getRegistration(type);

    url.searchParams.set("modal",type);

    for(const key of registration?.params??[]){
        if(key==="id")continue;
        const value=params[key];
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }

    return url;
}

export function setModalUrl(type,params={}){
    const url=buildModalUrl(type,params);
    window.history.pushState({modal:true},"",url);
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);
    const registration=getRegistration(url.searchParams.get("modal"));

    for(const key of registration?.params??[]){
        if(key==="id")continue;
        if(Object.prototype.hasOwnProperty.call(params,key)){
            const value=params[key];
            if(value===null||value===undefined||value==="")url.searchParams.delete(key);
            else url.searchParams.set(key,String(value));
        }
    }

    window.history.replaceState({modal:true},"",url);
}

export function clearModalUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");

    if(!type)return;

    const base=getBaseUrl(url);
    window.history.replaceState({},"",base);
}

async function closeCurrentModalSilently(){
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
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");

    if(!type){
        await closeCurrentModalSilently();
        return;
    }

    const registration=getRegistration(type);

    if(!registration){
        console.error("Unknown modal:",type);
        clearModalUrl();
        await closeCurrentModalSilently();
        return;
    }

    if(registration.admin&&!isAdmin()){
        clearModalUrl();
        await closeCurrentModalSilently();
        return;
    }

    const params=getUrlParams(registration,url);
    const data=registration.load?await registration.load(params):null;

    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);
        clearModalUrl();
        await closeCurrentModalSilently();
        return;
    }

    await closeCurrentModalSilently();

    await registration.open?.(data);

    const modal=getCurrentModal();

    if(!modal)return;

    modal.setCloseHandler(()=>{
        if(closingFromHistory)return;
        window.history.back();
    });
}

export async function restoreModalFromUrl(){
    if(restoring)return;

    restoring=true;

    try{
        await openFromUrl();
    }finally{
        restoring=false;
    }
}

export function updateModalParams(params={}){
    replaceModalUrl(params);
}

window.addEventListener("popstate",()=>{
    void restoreModalFromUrl();
});

document.addEventListener("click",event=>{
    const link=event.target.closest(".subject-mention");

    if(!link)return;

    const href=link.getAttribute("href");

    if(!href)return;

    const url=new URL(href,window.location.href);

    if(url.searchParams.get("modal")!=="subject")return;

    event.preventDefault();

    const type=url.searchParams.get("modal");
    const registration=getRegistration(type);

    if(!registration)return;

    const params=getUrlParams(registration,url);

    setModalUrl(type,params);
    void restoreModalFromUrl();
});
