import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

const modalHistory=[];

function getRegistration(type){
    return modalRegistry.find(item=>item.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

function getModalUrl(){
    return new URL(window.location.href);
}

function getBaseUrl(url){
    const base=new URL(url.href);
    const type=base.searchParams.get("modal");
    const registration=type?getRegistration(type):null;
    base.searchParams.delete("modal");
    for(const key of registration?.params??[])base.searchParams.delete(key);
    return base;
}

function pushUrl(url){
    window.history.pushState({},"",url);
}

export function setModalUrl(type,params={}){
    const currentUrl=getModalUrl();
    if(currentUrl.searchParams.get("modal"))modalHistory.push(currentUrl.toString());

    const url=getModalUrl();
    url.searchParams.set("modal",type);

    const registration=getRegistration(type);
    const allowed=new Set(registration?.params??[]);

    for(const key of [...url.searchParams.keys()]){
        if(key!=="modal"&&!allowed.has(key)&&key!=="id"){
            continue;
        }
    }

    for(const[key,value]of Object.entries(params)){
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }

    pushUrl(url);
}

export function replaceModalUrl(params={}){
    const url=getModalUrl();
    for(const[key,value]of Object.entries(params)){
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }
    window.history.replaceState({},"",url);
}

export function clearModalUrl(){
    const url=getModalUrl();
    const type=url.searchParams.get("modal");
    if(!type)return;

    const registration=getRegistration(type);
    url.searchParams.delete("modal");

    for(const key of registration?.params??[]){
        url.searchParams.delete(key);
    }

    window.history.pushState({},"",url);
}

async function openFromUrl(){
    const url=getModalUrl();
    const type=url.searchParams.get("modal");

    if(!type)return false;

    const registration=getRegistration(type);

    if(!registration){
        console.error("Unknown modal:",type);
        clearModalUrl();
        return false;
    }

    if(registration.admin&&!isAdmin()){
        clearModalUrl();
        modalHistory.length=0;
        return false;
    }

    const params=getUrlParams(registration,url);
    const data=registration.load?await registration.load(params):null;

    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);
        clearModalUrl();
        modalHistory.length=0;
        return false;
    }

    await registration.open?.(data);

    const modal=getCurrentModal();

    if(modal){
        modal.setCloseHandler(async()=>{
            await handleModalClose();
        });
    }

    return true;
}

async function handleModalClose(){
    if(modalHistory.length){
        const previousUrl=modalHistory.pop();
        window.history.pushState({},"",previousUrl);
        await openFromUrl();
        return;
    }

    const url=getModalUrl();
    const type=url.searchParams.get("modal");

    if(type){
        const registration=getRegistration(type);
        url.searchParams.delete("modal");
        for(const key of registration?.params??[])url.searchParams.delete(key);
        window.history.pushState({},"",url);
    }

    modalHistory.length=0;
}

export async function restoreModalFromUrl(){
    if(!getModalUrl().searchParams.get("modal")){
        modalHistory.length=0;
        return;
    }
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
