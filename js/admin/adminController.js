import{onAdminStateChanged}from"./adminMode.js";
import{updateAdminButton}from"../ui/components/adminButtons.js";
import{show,hide}from"../ui/animations/controller.js";

let currentAdminState=false;
let initialized=false;
let uiInitialized=false;
let observer=null;

export function isAdminUIEnabled(){
    return currentAdminState;
}

function getAdminButtons(){
    return document.querySelectorAll(".admin-button");
}

function getEmptySections(){
    return document.querySelectorAll(".section--admin-empty");
}

function showEmptySectionButtons(section){
    section.querySelectorAll(".admin-button").forEach(button=>{
        button.hidden=false;
        button.classList.remove("animation--hidden");
    });
}

function hideEmptySectionButtons(section){
    section.querySelectorAll(".admin-button").forEach(button=>{
        button.hidden=true;
        button.classList.add("animation--hidden");
    });
}

function updateEmptySection(section,animate){
    if(!section)return;
    if(!animate){
        if(currentAdminState){
            section.hidden=false;
            section.classList.remove("animation--hidden");
            showEmptySectionButtons(section);
        }else{
            section.hidden=true;
            section.classList.add("animation--hidden");
            hideEmptySectionButtons(section);
        }
        return;
    }
    const state=section._animationState;
    if(currentAdminState&&!section.hidden&&state!=="exit"&&!section.classList.contains("animation--hidden"))return;
    if(!currentAdminState&&section.hidden&&state!=="enter")return;
    if(currentAdminState){
        showEmptySectionButtons(section);
        show(section);
        return;
    }
    hide(section).then(()=>{
        if(currentAdminState)return;
        hideEmptySectionButtons(section);
    });
}

function syncEmptySections(animate){
    getEmptySections().forEach(section=>updateEmptySection(section,animate));
}

export function syncAdminButtons(animate=uiInitialized){
    syncEmptySections(animate);
    getAdminButtons().forEach(button=>{
        if(button.closest(".section--admin-empty"))return;
        if(!animate){
            button.hidden=!currentAdminState;
            button.classList.toggle("animation--hidden",!currentAdminState);
            return;
        }
        updateAdminButton(button,currentAdminState);
    });
}

export function initializeAdminUI(){
    if(uiInitialized)return;
    syncAdminButtons(false);
    uiInitialized=true;
}

function handleAdminStateChanged(admin){
    const nextState=!!admin;
    if(nextState===currentAdminState)return;
    currentAdminState=nextState;
    syncAdminButtons(uiInitialized);
}

function observeAdminButtons(){
    if(observer||!document.body)return;
    observer=new MutationObserver(mutations=>{
        let hasNewElements=false;
        mutations.forEach(mutation=>{
            mutation.addedNodes.forEach(node=>{
                if(node.nodeType!==Node.ELEMENT_NODE)return;
                if(node.matches?.(".admin-button,.section--admin-empty")){
                    hasNewElements=true;
                    return;
                }
                if(node.querySelector?.(".admin-button,.section--admin-empty"))
                    hasNewElements=true;
            });
        });
        if(hasNewElements)syncAdminButtons(uiInitialized);
    });
    observer.observe(document.body,{childList:true,subtree:true});
}

export function initAdminController(){
    if(initialized)return;
    initialized=true;
    onAdminStateChanged(handleAdminStateChanged);
    observeAdminButtons();
}

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initAdminController,{once:true});
}else{
    initAdminController();
}
