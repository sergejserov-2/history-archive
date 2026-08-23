import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

let modalHistory=[];

function getRegistration(type){
    return modalRegistry.find(modal=>modal.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

export function setModalUrl(type,params={}){
    const currentUrl=new URL(window.location.href);
    if(currentUrl.searchParams.get("modal"))modalHistory.push(currentUrl.toString());
    const url=new URL(window.location.href);
    url.searchParams.set("modal",type);
    Object.entries(params).forEach(([key,value])=>{
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    });
    window.history.pushState({},"",url);
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);
    Object.entries(params).forEach(([key,value])=>{
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    });
    window.history.replaceState({},"",url);
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
    window.history.pushState({},"",url);
}

async function reload(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    if(!type){
        modalHistory=[];
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
        modalHistory=[];
        return;
    }
    const params=getUrlParams(registration,url);
    const data=registration.load?await registration.load(params):null;
    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);
        clearModalUrl();
        modalHistory=[];
        return;
    }
    await registration.open?.(data);
    const modal=getCurrentModal();
    modal?.setCloseHandler(async()=>{
        if(modalHistory.length){
            const previousUrl=modalHistory.pop();
            window.history.pushState({},"",previousUrl);
            await reload();
            return;
        }
        clearModalUrl();
        modalHistory=[];
    });
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
