import{
    animateExpand,
    animateCollapse
}from"./resize.js";

import{
    showVisibility,
    hideVisibility
}from"./visibility.js";

const ENTER_DELAY=10;
const EXIT_DELAY=10;
const SMALL_BUTTON_WIDTH="22px";
const SMALL_BUTTON_HEIGHT="22px";

function isExpandableAdminBlock(element){
    if(!element)return false;
    return element.classList.contains("entity-list__add")||element.classList.contains("photo-card--add")||element.classList.contains("source--add")||element.classList.contains("child-card--add");
}

function isSmallAdminButton(element){
    if(!element)return false;
    return element.matches("button.admin-button")||element.classList.contains("header__button--admin");
}

function prepareSmallButtonForExpand(button){
    const computed=window.getComputedStyle(button);
    const targetWidth=computed.width||SMALL_BUTTON_WIDTH;
    const targetHeight=computed.height||SMALL_BUTTON_HEIGHT;
    button.style.overflow="hidden";
    button.style.width="0px";
    button.style.height="0px";
    button.style.padding="0px";
    button.offsetHeight;
    return{targetWidth,targetHeight};
}

function animateSmallExpand(button){
    const{targetWidth,targetHeight}=prepareSmallButtonForExpand(button);
    button.style.transition="width 320ms ease,height 320ms ease,padding 320ms ease";
    requestAnimationFrame(()=>{
        button.style.width=targetWidth;
        button.style.height=targetHeight;
        button.style.padding="2px";
    });
    return new Promise(resolve=>{
        button._adminSizeTimer=setTimeout(()=>{
            button.style.width="";
            button.style.height="";
            button.style.padding="";
            button.style.transition="";
            button.style.overflow="";
            button._adminSizeTimer=null;
            resolve();
        },340);
    });
}

function animateSmallCollapse(button){
    const computed=window.getComputedStyle(button);
    const currentWidth=computed.width;
    const currentHeight=computed.height;
    const currentPadding=computed.padding;
    button.style.overflow="hidden";
    button.style.width=currentWidth;
    button.style.height=currentHeight;
    button.style.padding=currentPadding;
    button.offsetHeight;
    button.style.transition="width 300ms ease,height 300ms ease,padding 300ms ease";
    requestAnimationFrame(()=>{
        button.style.width="0px";
        button.style.height="0px";
        button.style.padding="0px";
    });
    return new Promise(resolve=>{
        button._adminSizeTimer=setTimeout(()=>{
            button.style.width="";
            button.style.height="";
            button.style.padding="";
            button.style.transition="";
            button.style.overflow="";
            button._adminSizeTimer=null;
            resolve();
        },320);
    });
}

function animateExpandElement(element){
    if(isExpandableAdminBlock(element))
        return animateExpand(element);

    if(isSmallAdminButton(element))
        return animateSmallExpand(element);

    return Promise.resolve();
}

function animateCollapseElement(element){
    if(isExpandableAdminBlock(element))
        return animateCollapse(element);

    if(isSmallAdminButton(element))
        return animateSmallCollapse(element);

    return Promise.resolve();
}

// ======================================
// Cancel
// ======================================

export function cancelAnimation(element){

    if(!element)
        return;

    if(element._adminAnimationTimer){
        clearTimeout(element._adminAnimationTimer);
        element._adminAnimationTimer=null;
    }

    if(element._adminSizeTimer){
        clearTimeout(element._adminSizeTimer);
        element._adminSizeTimer=null;
    }

    element.classList.remove(
        "admin-button--entering"
    );

    element.classList.remove(
        "admin-button--exiting"
    );

    element._adminAnimationState=null;

}

// ======================================
// Show
// ======================================

export function show(element){

    if(!element)
        return;

    cancelAnimation(element);

    element._adminAnimationState="enter";

    element.hidden=false;

    element.classList.add(
        "admin-button--hidden"
    );

    animateExpandElement(element).then(()=>{

        if(element._adminAnimationState!=="enter")
            return;

        element._adminAnimationTimer=setTimeout(()=>{

            if(element._adminAnimationState!=="enter")
                return;

            showVisibility(element).then(()=>{

                if(element._adminAnimationState!=="enter")
                    return;

                element._adminAnimationState=null;
                element._adminAnimationTimer=null;

            });

        },ENTER_DELAY);

    });

}

// ======================================
// Hide
// ======================================

export function hide(element){

    if(!element)
        return;

    cancelAnimation(element);

    if(element.hidden)
        return;

    element._adminAnimationState="exit";

    hideVisibility(element).then(()=>{

        if(element._adminAnimationState!=="exit")
            return;

        element._adminAnimationTimer=setTimeout(()=>{

            if(element._adminAnimationState!=="exit")
                return;

            animateCollapseElement(element).then(()=>{

                if(element._adminAnimationState!=="exit")
                    return;

                element.hidden=true;

                element._adminAnimationState=null;
                element._adminAnimationTimer=null;

            });

        },EXIT_DELAY);

    });

}
