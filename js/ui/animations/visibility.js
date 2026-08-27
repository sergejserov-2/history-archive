// ======================================
// Visibility animations
// ======================================

const ENTER_VISUAL_DURATION=300;
const EXIT_VISUAL_DURATION=300;

const HIDDEN_CLASS="animation--hidden";
const ENTERING_CLASS="animation--entering";
const EXITING_CLASS="animation--exiting";

// ======================================
// Show
// ======================================

export function showVisibility(element){
    if(!element)
        return Promise.resolve();

    element.classList.remove(HIDDEN_CLASS);
    element.classList.add(ENTERING_CLASS);

    return new Promise(resolve=>{
        setTimeout(()=>{
            element.classList.remove(ENTERING_CLASS);
            resolve();
        },ENTER_VISUAL_DURATION+20);
    });
}

// ======================================
// Hide
// ======================================

export function hideVisibility(element){
    if(!element)
        return Promise.resolve();

    element.classList.remove(HIDDEN_CLASS);
    element.classList.remove(ENTERING_CLASS);
    element.classList.add(EXITING_CLASS);

    return new Promise(resolve=>{
        setTimeout(()=>{
            element.classList.remove(EXITING_CLASS);
            element.classList.add(HIDDEN_CLASS);
            resolve();
        },EXIT_VISUAL_DURATION+20);
    });
}
