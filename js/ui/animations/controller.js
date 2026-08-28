import{
    animateExpand,
    animateCollapse,
    animateExpandGroup,
    animateCollapseGroup,
    cancelSizeAnimation,
    clearSizeAnimation
}from"./resize.js";

import{
    showVisibility,
    hideVisibility
}from"./visibility.js";

const ENTER_DELAY=10;
const EXIT_DELAY=10;

const HIDDEN_CLASS="animation--hidden";

const ENTER_STATE="enter";
const EXIT_STATE="exit";

function getGroup(element,state){
    const parent=element?.parentElement;
    if(!parent)return[element];
    const tagName=element.tagName;
    return[...parent.children].filter(item=>item.tagName===tagName&&item._animationState===state);
}

function setState(group,state){
    for(const element of group)element._animationState=state;
}

function setPromise(group,promise){
    for(const element of group)element._groupAnimationPromise=promise;
}

function getPromise(element){
    return element?._groupAnimationPromise||null;
}

function clearPromise(group,promise){
    for(const element of group){
        if(element._groupAnimationPromise===promise)
            element._groupAnimationPromise=null;
    }
}

function finishExpand(group){
    for(const element of group){
        if(element._animationState!==ENTER_STATE)continue;
        clearSizeAnimation(element);
        element.classList.remove(HIDDEN_CLASS);
        element._animationState=null;
        element._animationTimer=null;
    }
}

function finishCollapse(group){
    for(const element of group){
        if(element._animationState!==EXIT_STATE)continue;
        element.hidden=true;
        clearSizeAnimation(element);
        element.classList.remove(HIDDEN_CLASS);
        element._animationState=null;
        element._animationTimer=null;
    }
}

function runExpand(group){
    if(!group.length)return Promise.resolve();
    const existing=getPromise(group[0]);
    if(existing)return existing;
    for(const element of group){
        element.hidden=false;
        element.classList.add(HIDDEN_CLASS);
    }
    void document.documentElement.offsetHeight;
    const resize=group.length>1?animateExpandGroup(group):animateExpand(group[0]);
    const promise=resize.then(()=>Promise.all(group.map(element=>showVisibility(element)))).then(()=>finishExpand(group));
    setPromise(group,promise);
    promise.then(()=>clearPromise(group,promise));
    return promise;
}

function runCollapse(group){
    if(!group.length)return Promise.resolve();
    const existing=getPromise(group[0]);
    if(existing)return existing;
    const visibility=Promise.all(group.map(element=>hideVisibility(element)));
    const promise=visibility.then(()=>group.length>1?animateCollapseGroup(group):animateCollapse(group[0])).then(()=>finishCollapse(group));
    setPromise(group,promise);
    promise.then(()=>clearPromise(group,promise));
    return promise;
}

export function cancelAnimation(element){
    if(!element)return;
    if(element._animationTimer){
        clearTimeout(element._animationTimer);
        element._animationTimer=null;
    }
    cancelSizeAnimation(element);
    element.classList.remove("animation--entering");
    element.classList.remove("animation--exiting");
    element.classList.remove(HIDDEN_CLASS);
    element._animationState=null;
    element._groupAnimationPromise=null;
}

export function show(element){
    if(!element)return Promise.resolve();
    if(element._animationState===ENTER_STATE)
        return getPromise(element)||Promise.resolve();
    cancelAnimation(element);
    element._animationState=ENTER_STATE;
    return new Promise(resolve=>{
        element._animationTimer=setTimeout(()=>{
            element._animationTimer=null;
            if(element._animationState!==ENTER_STATE){
                resolve();
                return;
            }
            const group=getGroup(element,ENTER_STATE);
            setState(group,ENTER_STATE);
            runExpand(group).then(resolve);
        },ENTER_DELAY);
    });
}

export function hide(element){
    if(!element)return Promise.resolve();
    if(element.hidden)return Promise.resolve();
    if(element._animationState===EXIT_STATE)
        return getPromise(element)||Promise.resolve();
    cancelAnimation(element);
    element._animationState=EXIT_STATE;
    return new Promise(resolve=>{
        element._animationTimer=setTimeout(()=>{
            element._animationTimer=null;
            if(element._animationState!==EXIT_STATE){
                resolve();
                return;
            }
            const group=getGroup(element,EXIT_STATE);
            setState(group,EXIT_STATE);
            runCollapse(group).then(resolve);
        },EXIT_DELAY);
    });
}
