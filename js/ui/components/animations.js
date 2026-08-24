// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию:
//
// height
//
// Никакого opacity.
// Никакого scale.
// Никакого margin.
// Никакого padding.
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


    const targetHeight =
        element.scrollHeight;


    element.style.overflow =
        "hidden";

    element.style.height =
        "0px";


    element.offsetHeight;


    element.style.transition =
        `height ${EXPAND_DURATION}ms ease`;


    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

    });


    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.height =
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


    element.hidden = false;


    const currentHeight =
        element.getBoundingClientRect().height;


    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;

    // ВАЖНО:
    // min-height не должен мешать
    // геометрическому схлопыванию до 0.

    element.style.minHeight =
        "0px";


    element.offsetHeight;


    element.style.transition =
        `height ${COLLAPSE_DURATION}ms ease`;


    requestAnimationFrame(()=>{

        element.style.height =
            "0px";

    });


    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.height =
                    "";

                element.style.minHeight =
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


    element.style.height =
        `${currentHeight}px`;

    element.style.overflow =
        "hidden";


    element.offsetHeight;


    element.style.transition =
        `height ${EXPAND_DURATION}ms ease`;


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
