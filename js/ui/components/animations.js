// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию:
//
// height
// padding
//
// margin НЕ анимируется.
//
// Никакого opacity.
// Никакого scale.
// ======================================


const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;


// ======================================
// Expand
// ======================================

export function animateExpand(
    element
){

    if(!element)
        return Promise.resolve();


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


    element.style.overflow =
        "hidden";

    element.style.height =
        "0px";

    element.style.paddingTop =
        "0px";

    element.style.paddingBottom =
        "0px";


    element.offsetHeight;


    element.style.transition = `
        height ${EXPAND_DURATION}ms ease,
        padding-top ${EXPAND_DURATION}ms ease,
        padding-bottom ${EXPAND_DURATION}ms ease
    `;


    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

        element.style.paddingTop =
            targetPaddingTop;

        element.style.paddingBottom =
            targetPaddingBottom;

    });


    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.height =
                    "auto";

                element.style.paddingTop =
                    "";

                element.style.paddingBottom =
                    "";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";

                element._sizeAnimationTimer =
                    null;


                resolve();

            }, EXPAND_DURATION + 20);

    });

}


// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
){

    if(!element)
        return Promise.resolve();


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


    element.hidden = false;


    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;

    element.style.paddingTop =
        currentPaddingTop;

    element.style.paddingBottom =
        currentPaddingBottom;


    element.offsetHeight;


    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ease,
        padding-top ${COLLAPSE_DURATION}ms ease,
        padding-bottom ${COLLAPSE_DURATION}ms ease
    `;


    requestAnimationFrame(()=>{

        element.style.height =
            "0px";

        element.style.paddingTop =
            "0px";

        element.style.paddingBottom =
            "0px";

    });


    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.height =
                    "";

                element.style.paddingTop =
                    "";

                element.style.paddingBottom =
                    "";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";

                element.hidden =
                    true;

                element._sizeAnimationTimer =
                    null;


                resolve();

            }, COLLAPSE_DURATION + 20);

    });

}


// ======================================
// Resize
// ======================================

export function animateResize(
    element
){

    if(!element)
        return;


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

        return;

    }


    element.style.transition = `
        height ${EXPAND_DURATION}ms ease
    `;


    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

    });


    element._sizeAnimationTimer =
        setTimeout(()=>{

            element.style.height =
                "auto";

            element.style.transition =
                "";

            element.style.overflow =
                "";

            element._sizeAnimationTimer =
                null;

        }, EXPAND_DURATION + 20);

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
