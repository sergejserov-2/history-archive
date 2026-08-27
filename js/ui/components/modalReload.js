import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

function getRegistration(type){
    return modalRegistry.find(modal=>modal.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

export function setModalUrl(type,params={}){
    const url=new URL(window.location.href);
    url.searchParams.set("modal",type);
    for(const key of Object.keys(params)){
        const value=params[key];
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }
    window.history.pushState({modal:true},"",url);
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);
    for(const[key,value]of Object.entries(params)){
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }
    window.history.replaceState({modal:true},"",url);
}

export function clearModalUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    if(!type)return;
    const registration=getRegistration(type);
    url.searchParams.delete("modal");
    for(const key of registration?.params??[]){
        if(key!=="id")url.searchParams.delete(key);
    }
    window.history.replaceState({},"",url);
}

async function closeFromUrl(){
    const state=window.history.state;
    if(state?.modal){
        window.history.back();
        return;
    }
    clearModalUrl();
}

async function reload(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    const current=getCurrentModal();

    if(!type){
        if(current)await current.close();
        return;
    }

    const registration=getRegistration(type);

    if(!registration){
        console.error("Unknown modal:",type);
        clearModalUrl();
        return;
    }

    if(registration.admin&&!isAdmin()){
        clearModalUrl();
        return;
    }

    const params=getUrlParams(registration,url);
    const data=registration.load?await registration.load(params):null;

    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);
        clearModalUrl();
        return;
    }

    if(current)await current.close();

    await registration.open?.(data);

    const modal=getCurrentModal();
    if(modal)modal.setCloseHandler(closeFromUrl);
}

export async function restoreModalFromUrl(){
    await reload();
}

window.addEventListener("popstate",async()=>{
    await reload();
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
    await reload();
});
