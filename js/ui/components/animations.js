// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию:
//
// height
// padding
//
// Никакого opacity.
// Никакого scale.
// ======================================


const EXPAND_DURATION = 340;
const COLLAPSE_DURATION = 320;

const EXPAND_EASING =
    "cubic-bezier(.22,1,.36,1)";

const COLLAPSE_EASING =
    "cubic-bezier(.4,0,.7,1)";


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


    // ==================================
    // Начальное состояние
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        "0px";

    element.style.paddingTop =
        "0px";

    element.style.paddingBottom =
        "0px";


    // Принудительно фиксируем
    // начальное состояние.

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${EXPAND_DURATION}ms ${EXPAND_EASING},
        padding-top ${EXPAND_DURATION}ms ${EXPAND_EASING},
        padding-bottom ${EXPAND_DURATION}ms ${EXPAND_EASING}
    `;


    // ==================================
    // Запуск
    // ==================================

    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

        element.style.paddingTop =
            targetPaddingTop;

        element.style.paddingBottom =
            targetPaddingBottom;

    });


    // ==================================
    // Завершение
    // ==================================

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

            },
            EXPAND_DURATION + 30
        );

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


    element.hidden = false;


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


    // ==================================
    // Начальное состояние
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;

    element.style.paddingTop =
        currentPaddingTop;

    element.style.paddingBottom =
        currentPaddingBottom;


    // Принудительно фиксируем
    // начальное состояние.

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ${COLLAPSE_EASING},
        padding-top ${COLLAPSE_DURATION}ms ${COLLAPSE_EASING},
        padding-bottom ${COLLAPSE_DURATION}ms ${COLLAPSE_EASING}
    `;


    // ==================================
    // Запуск
    // ==================================

    requestAnimationFrame(()=>{

        element.style.height =
            "0px";

        element.style.paddingTop =
            "0px";

        element.style.paddingBottom =
            "0px";

    });


    // ==================================
    // Завершение
    // ==================================

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

            },
            COLLAPSE_DURATION + 30
        );

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


    // ==================================
    // Фиксируем текущее состояние
    // ==================================

    element.style.height =
        `${currentHeight}px`;

    element.style.paddingTop =
        currentPaddingTop;

    element.style.paddingBottom =
        currentPaddingBottom;

    element.style.overflow =
        "hidden";


    element.offsetHeight;


    // ==================================
    // Получаем новую высоту
    // ==================================

    const targetHeight =
        element.scrollHeight;


    // ==================================
    // Ничего менять не нужно
    // ==================================

    if(
        Math.abs(
            currentHeight -
            targetHeight
        ) < 1
    ){

        element.style.height =
            "auto";

        element.style.paddingTop =
            "";

        element.style.paddingBottom =
            "";

        element.style.overflow =
            "";

        return;

    }


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${EXPAND_DURATION}ms ${EXPAND_EASING}
    `;


    // ==================================
    // Запуск
    // ==================================

    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

    });


    // ==================================
    // Завершение
    // ==================================

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

        },
        EXPAND_DURATION + 30
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
