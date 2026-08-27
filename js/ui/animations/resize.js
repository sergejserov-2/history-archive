import{
    animateExpand,
    animateCollapse,
    cancelSizeAnimation
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

// ======================================
// Cancel
// ======================================

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
}

// ======================================
// Show
// ======================================

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

// ======================================
// Hide
// ======================================

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

                animateCollapse(element).then(()=>{
                    if(element._animationState!==EXIT_STATE){
                        resolve();
                        return;
                    }

                    element.hidden=true;
                    element._animationState=null;
                    element._animationTimer=null;
                    resolve();
                });
            },EXIT_DELAY);
        });
    });
}
