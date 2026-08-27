import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

let reconciling=false;
let suppressCloseNavigation=false;

function getRegistration(type){
    return modalRegistry.find(item=>item.type===type)??null;
}

function getModalParams(registration,url){
    const params={};
    for(const key of registration?.params??[]){
        params[key]=url.searchParams.get(key);
    }
    return params;
}

function getState(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    return{
        url,
        type,
        registration:getRegistration(type)
    };
}

function getAllModalParameterNames(){
    const names=new Set();

    for(const registration of modalRegistry){
        for(const key of registration.params??[]){
            if(key!=="id")names.add(key);
        }
    }

    return names;
}

function cleanModalParams(url){
    const names=getAllModalParameterNames();

    for(const key of names){
        if(key!=="id")url.searchParams.delete(key);
    }

    return url;
}

function applyModalUrl(url,type,params={}){
    cleanModalParams(url);
    url.searchParams.set("modal",type);

    const registration=getRegistration(type);

    for(const key of registration?.params??[]){
        if(key==="id")continue;

        const value=params[key];

        if(value===null||value===undefined||value===""){
            url.searchParams.delete(key);
        }else{
            url.searchParams.set(key,String(value));
        }
    }

    return url;
}

async function closeCurrentModalSilently(){
    const modal=getCurrentModal();

    if(!modal)return;

    suppressCloseNavigation=true;

    try{
        await modal.close({silent:true});
    }finally{
        suppressCloseNavigation=false;
    }
}

async function openState(){
    const{url,type,registration}=getState();

    if(!type){
        await closeCurrentModalSilently();
        return;
    }

    if(!registration){
        console.error("Unknown modal:",type);

        const cleanUrl=cleanModalParams(url);
        cleanUrl.searchParams.delete("modal");

        window.history.replaceState(
            window.history.state,
            "",
            cleanUrl
        );

        await closeCurrentModalSilently();
        return;
    }

    if(registration.admin&&!isAdmin()){
        const cleanUrl=cleanModalParams(url);
        cleanUrl.searchParams.delete("modal");

        window.history.replaceState(
            window.history.state,
            "",
            cleanUrl
        );

        await closeCurrentModalSilently();
        return;
    }

    const params=getModalParams(registration,url);

    const data=registration.load
        ?await registration.load(params)
        :null;

    if(registration.load&&!data){
        console.error("Modal data not found:",type,params);

        const cleanUrl=cleanModalParams(url);
        cleanUrl.searchParams.delete("modal");

        window.history.replaceState(
            window.history.state,
            "",
            cleanUrl
        );

        await closeCurrentModalSilently();
        return;
    }

    if(reconciling)return;

    reconciling=true;

    try{
        await closeCurrentModalSilently();
        await registration.open?.(data);
    }finally{
        reconciling=false;
    }

    const modal=getCurrentModal();

    if(!modal)return;

    modal.element.dataset.modalType=type;

    modal.setCloseHandler(()=>{
        if(suppressCloseNavigation)return;
        if(reconciling)return;

        const current=new URL(window.location.href);

        if(!current.searchParams.has("modal"))return;

        window.history.back();
    });
}

export function setModalUrl(type,params={}){
    const url=new URL(window.location.href);
    applyModalUrl(url,type,params);

    window.history.pushState(
        {
            ...(window.history.state??{}),
            modal:type
        },
        "",
        url
    );
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");

    if(!type)return;

    const registration=getRegistration(type);

    for(const[key,value]of Object.entries(params)){
        if(key==="id")continue;

        if(value===null||value===undefined||value===""){
            url.searchParams.delete(key);
        }else{
            url.searchParams.set(key,String(value));
        }
    }

    const allowed=new Set(registration?.params??[]);

    for(const key of [...url.searchParams.keys()]){
        if(key==="modal"||key==="id")continue;
        if(!allowed.has(key))url.searchParams.delete(key);
    }

    window.history.replaceState(
        {
            ...(window.history.state??{}),
            modal:type
        },
        "",
        url
    );
}

export function clearModalUrl(){
    const url=new URL(window.location.href);

    if(!url.searchParams.has("modal"))return;

    cleanModalParams(url);
    url.searchParams.delete("modal");

    window.history.replaceState(
        window.history.state,
        "",
        url
    );
}

export async function restoreModalFromUrl(){
    await openState();
}

window.addEventListener("popstate",()=>{
    void openState();
});

document.addEventListener("click",event=>{
    const link=event.target.closest(".subject-mention");

    if(!link)return;

    const href=link.getAttribute("href");

    if(!href)return;

    const url=new URL(href,window.location.href);

    if(url.searchParams.get("modal")!=="subject")return;

    const entityId=url.searchParams.get("entityId");

    if(!entityId)return;

    event.preventDefault();

    setModalUrl("subject",{entityId});

    void openState();
});
