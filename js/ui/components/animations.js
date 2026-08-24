// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию блока:
//
// height
// padding
// margin
//
// Никакого opacity.
// Никакого scale.
//
// Геометрическая анимация возвращает
// Promise, который завершается только
// после фактического окончания фазы.
// ======================================


export const EXPAND_DURATION = 320;
export const COLLAPSE_DURATION = 300;

const PHASE_GAP = 1;


// ======================================
// Expand
// ======================================

export function animateExpand(
    element
){

    if(!element){

        return Promise.resolve();

    }


    cancelSizeAnimation(
        element
    );


    element.hidden = false;


    const computed =
        window.getComputedStyle(
            element
        );


    const targetHeight =
        element.scrollHeight;

    const targetPaddingTop =
        computed.paddingTop;

    const targetPaddingBottom =
        computed.paddingBottom;

    const targetMarginTop =
        computed.marginTop;

    const targetMarginBottom =
        computed.marginBottom;


    // ==================================
    // Initial state
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        "0px";

    element.style.paddingTop =
        "0px";

    element.style.paddingBottom =
        "0px";

    element.style.marginTop =
        "0px";

    element.style.marginBottom =
        "0px";


    // Применяем начальное состояние.

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${EXPAND_DURATION}ms ease,
        padding-top ${EXPAND_DURATION}ms ease,
        padding-bottom ${EXPAND_DURATION}ms ease,
        margin-top ${EXPAND_DURATION}ms ease,
        margin-bottom ${EXPAND_DURATION}ms ease
    `;


    return new Promise(
        resolve => {

            let finished = false;


            const finish = ()=>{

                if(finished)
                    return;

                finished = true;


                element.removeEventListener(
                    "transitionend",
                    onTransitionEnd
                );


                clearTimeout(
                    fallbackTimer
                );


                element.style.height =
                    "auto";

                element.style.paddingTop =
                    "";

                element.style.paddingBottom =
                    "";

                element.style.marginTop =
                    "";

                element.style.marginBottom =
                    "";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";


                element._sizeAnimationTimer =
                    null;


                resolve();

            };


            const onTransitionEnd = event =>{

                if(
                    event.target !== element
                ){

                    return;

                }


                if(
                    event.propertyName !==
                    "height"
                ){

                    return;

                }


                finish();

            };


            element.addEventListener(
                "transitionend",
                onTransitionEnd
            );


            const fallbackTimer =
                setTimeout(
                    finish,
                    EXPAND_DURATION + 50
                );


            element._sizeAnimationTimer =
                fallbackTimer;


            // ==================================
            // Start
            // ==================================

            requestAnimationFrame(()=>{

                element.style.height =
                    `${targetHeight}px`;

                element.style.paddingTop =
                    targetPaddingTop;

                element.style.paddingBottom =
                    targetPaddingBottom;

                element.style.marginTop =
                    targetMarginTop;

                element.style.marginBottom =
                    targetMarginBottom;

            });

        }
    );

}


// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element,
    callback=null
){

    if(!element){

        if(callback)
            callback();

        return Promise.resolve();

    }


    cancelSizeAnimation(
        element
    );


    const computed =
        window.getComputedStyle(
            element
        );


    const currentHeight =
        element.getBoundingClientRect().height;

    const currentPaddingTop =
        computed.paddingTop;

    const currentPaddingBottom =
        computed.paddingBottom;

    const currentMarginTop =
        computed.marginTop;

    const currentMarginBottom =
        computed.marginBottom;


    element.hidden = false;


    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;

    element.style.paddingTop =
        currentPaddingTop;

    element.style.paddingBottom =
        currentPaddingBottom;

    element.style.marginTop =
        currentMarginTop;

    element.style.marginBottom =
        currentMarginBottom;


    // Применяем текущее состояние.

    element.offsetHeight;


    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ease,
        padding-top ${COLLAPSE_DURATION}ms ease,
        padding-bottom ${COLLAPSE_DURATION}ms ease,
        margin-top ${COLLAPSE_DURATION}ms ease,
        margin-bottom ${COLLAPSE_DURATION}ms ease
    `;


    return new Promise(
        resolve => {

            let finished = false;


            const finish = ()=>{

                if(finished)
                    return;

                finished = true;


                element.removeEventListener(
                    "transitionend",
                    onTransitionEnd
                );


                clearTimeout(
                    fallbackTimer
                );


                element.style.height =
                    "";

                element.style.paddingTop =
                    "";

                element.style.paddingBottom =
                    "";

                element.style.marginTop =
                    "";

                element.style.marginBottom =
                    "";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";


                element.hidden =
                    true;


                element._sizeAnimationTimer =
                    null;


                if(callback){

                    callback();

                }


                resolve();

            };


            const onTransitionEnd = event =>{

                if(
                    event.target !== element
                ){

                    return;

                }


                if(
                    event.propertyName !==
                    "height"
                ){

                    return;

                }


                finish();

            };


            element.addEventListener(
                "transitionend",
                onTransitionEnd
            );


            const fallbackTimer =
                setTimeout(
                    finish,
                    COLLAPSE_DURATION + 50
                );


            element._sizeAnimationTimer =
                fallbackTimer;


            // ==================================
            // Start
            // ==================================

            requestAnimationFrame(()=>{

                element.style.height =
                    "0px";

                element.style.paddingTop =
                    "0px";

                element.style.paddingBottom =
                    "0px";

                element.style.marginTop =
                    "0px";

                element.style.marginBottom =
                    "0px";

            });

        }
    );

}


// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(
    element
){

    if(!element)
        return;


    if(
        element._sizeAnimationTimer
    ){

        clearTimeout(
            element._sizeAnimationTimer
        );

        element._sizeAnimationTimer =
            null;

    }


    element.style.transition =
        "";

}


// ======================================
// Resize
// ======================================

export function animateResize(
    element
){

    if(!element)
        return Promise.resolve();


    cancelSizeAnimation(
        element
    );


    const currentHeight =
        element.getBoundingClientRect().height;


    element.style.height =
        `${currentHeight}px`;

    element.style.overflow =
        "hidden";


    element.offsetHeight;


    const targetHeight =
        element.scrollHeight;


    if(
        Math.abs(
            currentHeight -
            targetHeight
        ) < 1
    ){

        element.style.height =
            "auto";

        element.style.overflow =
            "";

        return Promise.resolve();

    }


    element.style.transition = `
        height ${EXPAND_DURATION}ms ease
    `;


    return new Promise(
        resolve => {

            let finished = false;


            const finish = ()=>{

                if(finished)
                    return;

                finished = true;


                element.removeEventListener(
                    "transitionend",
                    onTransitionEnd
                );


                clearTimeout(
                    fallbackTimer
                );


                element.style.height =
                    "auto";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";

                element._sizeAnimationTimer =
                    null;


                resolve();

            };


            const onTransitionEnd = event =>{

                if(
                    event.target !== element
                ){

                    return;

                }


                if(
                    event.propertyName !==
                    "height"
                ){

                    return;

                }


                finish();

            };


            element.addEventListener(
                "transitionend",
                onTransitionEnd
            );


            const fallbackTimer =
                setTimeout(
                    finish,
                    EXPAND_DURATION + 50
                );


            element._sizeAnimationTimer =
                fallbackTimer;


            requestAnimationFrame(()=>{

                element.style.height =
                    `${targetHeight}px`;

            });

        }
    );

}


// ======================================
// Phase gap
// ======================================
//
// Минимальная пауза между двумя фазами.
// ======================================

export function waitAnimationGap(){

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                PHASE_GAP
            );

        }
    );

}
