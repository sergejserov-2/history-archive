import{animateExpand,animateCollapse}from"./resize.js";

const ENTER_DELAY=10;
const ENTER_VISUAL_DURATION=300;
const EXIT_VISUAL_DURATION=300;
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

export function showAdminButton(button){
    if(!button)return;
    cancelAnimation(button);
    button._adminAnimationState="enter";
    button.hidden=false;
    button.classList.add("admin-button--hidden");
    const sizePromise=isExpandableAdminBlock(button)?animateExpand(button):isSmallAdminButton(button)?animateSmallExpand(button):Promise.resolve();
    sizePromise.then(()=>{
        if(button._adminAnimationState!=="enter")return;
        button._adminAnimationTimer=setTimeout(()=>{
            if(button._adminAnimationState!=="enter")return;
            button.classList.remove("admin-button--hidden");
            button.classList.add("admin-button--entering");
            button._adminAnimationTimer=setTimeout(()=>{
                button.classList.remove("admin-button--entering");
                button._adminAnimationState=null;
                button._adminAnimationTimer=null;
            },ENTER_VISUAL_DURATION+20);
        },ENTER_DELAY);
    });
}

export function hideAdminButton(button){
    if(!button)return;
    cancelAnimation(button);
    if(button.hidden)return;
    button._adminAnimationState="exit";
    button.classList.remove("admin-button--hidden");
    button.classList.remove("admin-button--entering");
    button.classList.add("admin-button--exiting");
    button._adminAnimationTimer=setTimeout(()=>{
        if(button._adminAnimationState!=="exit")return;
        button.classList.remove("admin-button--exiting");
        button.classList.add("admin-button--hidden");
        button._adminAnimationTimer=setTimeout(()=>{
            if(button._adminAnimationState!=="exit")return;
            let collapsePromise;
            if(isExpandableAdminBlock(button)){
                collapsePromise=animateCollapse(button);
            }else if(isSmallAdminButton(button)){
                collapsePromise=animateSmallCollapse(button);
            }else{
                collapsePromise=Promise.resolve();
            }
            collapsePromise.then(()=>{
                if(button._adminAnimationState!=="exit")return;
                button.hidden=true;
                button._adminAnimationState=null;
                button._adminAnimationTimer=null;
            });
        },EXIT_DELAY);
    },EXIT_VISUAL_DURATION+20);
}

export function cancelAnimation(button){
    if(!button)return;
    if(button._adminAnimationTimer){
        clearTimeout(button._adminAnimationTimer);
        button._adminAnimationTimer=null;
    }
    if(button._adminSizeTimer){
        clearTimeout(button._adminSizeTimer);
        button._adminSizeTimer=null;
    }
    button.classList.remove("admin-button--entering");
    button.classList.remove("admin-button--exiting");
    button._adminAnimationState=null;
}
