import{
    animateExpand,
    animateCollapse,
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

function getCollapseGroup(element){
    const parent=element?.parentElement;

    if(!parent)
        return[element];

    const tagName=element.tagName;

    return[...parent.children].filter(child=>{
        return child.tagName===tagName&&
            child.hidden===false&&
            child._animationState===EXIT_STATE;
    });
}

function finishCollapse(element){
    if(element._animationState!==EXIT_STATE)
        return;

    element.hidden=true;
    clearSizeAnimation(element);

    element._animationState=null;
    element._animationTimer=null;
    element._collapsePromise=null;
}

function startCollapseGroup(element){
    if(element._collapsePromise)
        return element._collapsePromise;

    const group=getCollapseGroup(element);

    console.log("[animation] collapse group:",group);

    const promise=group.length>1
        ?animateCollapseGroup(group)
        :animateCollapse(element);

    for(const item of group)
        item._collapsePromise=promise;

    promise.then(()=>{
        for(const item of group){
            if(item._collapsePromise===promise)
                item._collapsePromise=null;
        }
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
    element._collapsePromise=null;
}

export function show(element){
    if(!element)
        return Promise.resolve();

    cancelAnimation(element);

    element._animationState=ENTER_STATE;
    element.hidden=false;

    element.classList.add(HIDDEN_CLASS);

    return animateExpand(element).then(()=>{
        if(element._animationState!==ENTER_STATE)
            return;

        return new Promise(resolve=>{
            element._animationTimer=setTimeout(()=>{
                if(element._animationState!==ENTER_STATE){
                    resolve();
                    return;
                }

                showVisibility(element).then(()=>{
                    if(element._animationState!==ENTER_STATE){
                        resolve();
                        return;
                    }

                    element._animationState=null;
                    element._animationTimer=null;
                    resolve();
                });
            },ENTER_DELAY);
        });
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
