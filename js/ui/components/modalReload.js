import{modalRegistry}from"./modalRegistry.js";
import{isAdmin}from"../../admin/adminMode.js";
import{getCurrentModal}from"./modal.js";

let restoring=false;
let modalContext=null;
let reloadAgain=false;

function getRegistration(type){
    return modalRegistry.find(modal=>modal.type===type)??null;
}

function getUrlParams(registration,url){
    const params={};
    for(const key of registration.params??[])params[key]=url.searchParams.get(key);
    return params;
}

function cleanModalParams(url,registration){
    for(const key of registration?.params??[]){
        if(key!=="id")url.searchParams.delete(key);
    }
}

function isSameModal(type,params={}){
    const url=new URL(window.location.href);
    if(url.searchParams.get("modal")!==type)return false;

    const registration=getRegistration(type);
    if(!registration)return false;

    for(const key of registration.params??[]){
        if(key==="id")continue;
        const current=url.searchParams.get(key)??"";
        const next=params[key]===null||params[key]===undefined?"":String(params[key]);
        if(current!==next)return false;
    }

    return true;
}

export function setModalUrl(type,params={}){
    const url=new URL(window.location.href);
    const oldType=url.searchParams.get("modal");
    const oldRegistration=getRegistration(oldType);
    const registration=getRegistration(type);

    if(oldType&&oldType!==type)cleanModalParams(url,oldRegistration);
    cleanModalParams(url,registration);

    url.searchParams.set("modal",type);

    for(const[key,value]of Object.entries(params)){
        if(key==="id")continue;
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }

    window.history.pushState({},"",url);
}

export function replaceModalUrl(params={}){
    const url=new URL(window.location.href);

    for(const[key,value]of Object.entries(params)){
        if(key==="id")continue;
        if(value===null||value===undefined||value==="")url.searchParams.delete(key);
        else url.searchParams.set(key,String(value));
    }

    window.history.replaceState({},"",url);
}

export function clearModalUrl(){
    const url=new URL(window.location.href);
    const type=url.searchParams.get("modal");
    if(!type)return;

    const registration=getRegistration(type);

    url.searchParams.delete("modal");
    cleanModalParams(url,registration);

    window.history.pushState({},"",url);
}

async function closeCurrentWithoutHistory(){
    const modal=getCurrentModal();
    if(!modal)return;

    modal.setBeforeCloseHandler?.(null);
    modal.setCloseHandler(null);

    await modal.close({runHandler:false});
}

async function reload(){
    if(restoring){
        reloadAgain=true;
        return;
    }

    restoring=true;

    try{
        do{
            reloadAgain=false;

            const url=new URL(window.location.href);
            const type=url.searchParams.get("modal");

            if(!type){
                modalContext=null;
                await closeCurrentWithoutHistory();
                continue;
            }

            const registration=getRegistration(type);

            if(!registration){
                modalContext=null;
                await closeCurrentWithoutHistory();
                continue;
            }

            if(registration.admin&&!isAdmin()){
                modalContext=null;
                await closeCurrentWithoutHistory();

                const cleanUrl=new URL(window.location.href);
                cleanUrl.searchParams.delete("modal");
                cleanModalParams(cleanUrl,registration);

                window.history.replaceState({},"",cleanUrl);
                continue;
            }

            const params=getUrlParams(registration,url);
            const data=registration.load
                ?await registration.load(params,modalContext)
                :null;

            if(registration.load&&!data){
                modalContext=null;
                await closeCurrentWithoutHistory();

                const cleanUrl=new URL(window.location.href);
                cleanUrl.searchParams.delete("modal");
                cleanModalParams(cleanUrl,registration);

                window.history.replaceState({},"",cleanUrl);
                continue;
            }

            await registration.open?.(data);

            const modal=getCurrentModal();

            if(modal){
                modal.setCloseHandler(()=>{
                    if(restoring)return;
                    window.history.back();
                });
            }
        }while(reloadAgain);
    }finally{
        restoring=false;
    }
}

export async function openModal(type,params={},context=null){
    if(isSameModal(type,params))return;

    modalContext=context;
    setModalUrl(type,params);
    await reload();
}

export async function restoreModalFromUrl(){
    modalContext=null;
    await reload();
}

export async function openPhotoModal(photo,{id=null}={}) {
    if(!photo?.id)return;

    const objectId=
        id||
        new URL(window.location.href).searchParams.get("id")||
        null;

    await openModal("photo-preview",{
        id:objectId,
        entityId:photo.id
    });
}

window.addEventListener("popstate",()=>void reload());

document.addEventListener("click",event=>{
    const link=event.target.closest(".subject-mention");
    if(!link)return;

    const href=link.getAttribute("href");
    if(!href)return;

    const url=new URL(href,window.location.href);

    if(url.searchParams.get("modal")!=="subject")return;

    event.preventDefault();

    const entityId=url.searchParams.get("entityId");
    if(!entityId)return;

    void openModal("subject",{entityId});
});
