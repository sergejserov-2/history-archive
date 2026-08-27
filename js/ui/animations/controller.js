// ======================================
// Animation controller
// ======================================

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
        return;

    cancelAnimation(element);

    element._animationState=ENTER_STATE;
    element.hidden=false;

    element.classList.add(HIDDEN_CLASS);

    animateExpand(element).then(()=>{
        if(element._animationState!==ENTER_STATE)
            return;

        element._animationTimer=setTimeout(()=>{
            if(element._animationState!==ENTER_STATE)
                return;

            showVisibility(element).then(()=>{
                if(element._animationState!==ENTER_STATE)
                    return;

                element._animationState=null;
                element._animationTimer=null;
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

    element._animationState=EXIT_STATE;


}
