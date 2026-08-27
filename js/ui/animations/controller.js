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

    if(!parent)
        return[element];

    const tagName=element.tagName;

    return[...parent.children].filter(item=>{
        return item.tagName===tagName&&
            item._animationState===state;
    });
}

function setGroupState(group,state){
    for(const element of group)
        element._animationState=state;
}

function clearGroupState(group){
    for(const element of group){
        element._animationState=null;
        element._animationTimer=null;
        element._groupAnimationPromise=null;
    }
}

function setGroupPromise(group,promise){
    for(const element of group)
        element._groupAnimationPromise=promise;
}

function getGroupPromise(element){
    return element?._groupAnimationPromise||null;
}

function finishExpand(group){
    for(const element of group){
        if(element._animationState!==ENTER_STATE)
            continue;

        clearSizeAnimation(element);
        element.classList.remove(HIDDEN_CLASS);
    }

    clearGroupState(group);
}

function finishCollapse(group){
    for(const element of group){
        if(element._animationState!==EXIT_STATE)
            continue;

        element.hidden=true;
        clearSizeAnimation(element);
        element.classList.remove(HIDDEN_CLASS);
    }

    clearGroupState(group);
}

function runExpand(group){
    if(!group.length)
        return Promise.resolve();

    const existing=getGroupPromise(group[0]);

    if(existing)
        return existing;

    console.log("[animation] expand group:",group);

    for(const element of group){
        element.hidden=false;
        element.classList.add(HIDDEN_CLASS);
    }

    const resize=group.length>1
        ?animateExpandGroup(group)
        :animateExpand(group[0]);

    const visibility=Promise.all(
        group.map(element=>showVisibility(element))
    );

    const promise=Promise.all([resize,visibility]).then(()=>{
        finishExpand(group);
    });

    setGroupPromise(group,promise);

    return promise;
}

function runCollapse(group){
    if(!group.length)
        return Promise.resolve();

    const existing=getGroupPromise(group[0]);

    if(existing)
        return existing;

    console.log("[animation] collapse group:",group);

    const visibility=Promise.all(
        group.map(element=>hideVisibility(element))
    );

    const resize=group.length>1
        ?animateCollapseGroup(group)
        :animateCollapse(group[0]);

    const promise=Promise.all([visibility,resize]).then(()=>{
        finishCollapse(group);
    });

    setGroupPromise(group,promise);

    return promise;
}

export function cancelAnimation(element){
    if(!element)
        return;

    if(element._animationTimer){
        clearTimeout(element._animationTimer);
        element._animationTimer=null;
    }

    cancelSizeAnimation(element);

    element.classList.remove("animation--entering");
    element.classList.remove("animation--exiting");

    const promise=element._groupAnimationPromise;

    if(promise)
        element._groupAnimationPromise=null;

    element._animationState=null;
}

export function show(element){
    if(!element)
        return Promise.resolve();

    if(element._animationState===ENTER_STATE)
        return getGroupPromise(element)||Promise.resolve();

    cancelAnimation(element);

    element._animationState=ENTER_STATE;
    element.hidden=false;
    element.classList.add(HIDDEN_CLASS);

    return new Promise(resolve=>{
        element._animationTimer=setTimeout(()=>{
            element._animationTimer=null;

            if(element._animationState!==ENTER_STATE){
                resolve();
                return;
            }

            const group=getGroup(element,ENTER_STATE);
            setGroupState(group,ENTER_STATE);

            runExpand(group).then(resolve);
        },ENTER_DELAY);
    });
}

export function hide(element){
    if(!element)
        return Promise.resolve();

    if(element.hidden)
        return Promise.resolve();

    if(element._animationState===EXIT_STATE)
        return getGroupPromise(element)||Promise.resolve();

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
            setGroupState(group,EXIT_STATE);

            runCollapse(group).then(resolve);
        },EXIT_DELAY);
    });
}
