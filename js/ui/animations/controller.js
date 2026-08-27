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

function getAnimationGroup(element,state){
    const parent=element?.parentElement;

    if(!parent)
        return[element];

    const tagName=element.tagName;

    return[...parent.children].filter(child=>{
        return child.tagName===tagName&&
            child._animationState===state;
    });
}

function getGroupPromise(element){
    return element?._sizeAnimationPromise||null;
}

function setGroupPromise(group,promise){
    for(const element of group)
        element._sizeAnimationPromise=promise;
}

function clearGroupPromise(group,promise){
    for(const element of group){
        if(element._sizeAnimationPromise===promise)
            element._sizeAnimationPromise=null;
    }
}

function finishCollapse(element){
    if(element._animationState!==EXIT_STATE)
        return;

    element.hidden=true;
    clearSizeAnimation(element);

    element._animationState=null;
    element._animationTimer=null;
}

function finishExpand(element){
    if(element._animationState!==ENTER_STATE)
        return;

    clearSizeAnimation(element);
    element.classList.remove(HIDDEN_CLASS);

    element._animationState=null;
    element._animationTimer=null;
}

function startCollapseGroup(element){
    const existing=getGroupPromise(element);

    if(existing)
        return existing;

    const group=getAnimationGroup(element,EXIT_STATE);

    console.log("[animation] collapse group:",group);

    const promise=group.length>1
        ?animateCollapseGroup(group)
        :animateCollapse(element);

    setGroupPromise(group,promise);

    promise.then(()=>{
        clearGroupPromise(group,promise);
    });

    return promise;
}

function startExpandGroup(element){
    const existing=getGroupPromise(element);

    if(existing)
        return existing;

    const group=getAnimationGroup(element,ENTER_STATE);

    console.log("[animation] expand group:",group);

    const promise=group.length>1
        ?animateExpandGroup(group)
        :animateExpand(element);

    setGroupPromise(group,promise);

    promise.then(()=>{
        clearGroupPromise(group,promise);
    });

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

    element._animationState=null;
    element._sizeAnimationPromise=null;
}

export function show(element){
    if(!element)
        return Promise.resolve();

    cancelAnimation(element);

    element._animationState=ENTER_STATE;
    element.hidden=false;

    element.classList.add(HIDDEN_CLASS);

    return new Promise(resolve=>{
        element._animationTimer=setTimeout(()=>{
            if(element._animationState!==ENTER_STATE){
                resolve();
                return;
            }

            startExpandGroup(element).then(()=>{
                if(element._animationState!==ENTER_STATE){
                    resolve();
                    return;
                }

                showVisibility(element).then(()=>{
                    if(element._animationState!==ENTER_STATE){
                        resolve();
                        return;
                    }

                    finishExpand(element);
                    resolve();
                });
            });
        },ENTER_DELAY);
    });
}

export function hide(element){
    if(!element)
        return Promise.resolve();

    cancelAnimation(element);

    if(element.hidden)
        return Promise.resolve();

    element._animationState=EXIT_STATE;

    return hideVisibility(element).then(()=>{
        if(element._animationState!==EXIT_STATE)
            return;

        return new Promise(resolve=>{
            element._animationTimer=setTimeout(()=>{
                if(element._animationState!==EXIT_STATE){
                    resolve();
                    return;
                }

                startCollapseGroup(element).then(()=>{
                    finishCollapse(element);
                    resolve();
                });
            },EXIT_DELAY);
        });
    });
}
