// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию:
//
// height
// padding
// margin
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

    const targetMarginTop =
        computed.marginTop;

    const targetMarginBottom =
        computed.marginBottom;


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

    element.style.marginTop =
        "0px";

    element.style.marginBottom =
        "0px";


    // ==================================
    // Принудительно фиксируем layout
    // ==================================

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


    // ==================================
    // Запуск через два кадра
    // ==================================

    requestAnimationFrame(()=>{

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

            },
            EXPAND_DURATION + 40
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


    // ==================================
    // Элемент должен оставаться видимым
    // до конца анимации
    // ==================================

    element.hidden = false;


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

    element.style.marginTop =
        currentMarginTop;

    element.style.marginBottom =
        currentMarginBottom;


    // ==================================
    // Фиксируем layout
    // ==================================

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ease,
        padding-top ${COLLAPSE_DURATION}ms ease,
        padding-bottom ${COLLAPSE_DURATION}ms ease,
        margin-top ${COLLAPSE_DURATION}ms ease,
        margin-bottom ${COLLAPSE_DURATION}ms ease
    `;


    // ==================================
    // Запуск через два кадра
    // ==================================

    requestAnimationFrame(()=>{

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


                resolve();

            },
            COLLAPSE_DURATION + 40
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


    // ==================================
    // Текущая высота
    // ==================================

    const currentHeight =
        element.getBoundingClientRect().height;


    // ==================================
    // Фиксируем текущее состояние
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;


    element.offsetHeight;


    // ==================================
    // Получаем новую высоту
    // ==================================

    const targetHeight =
        element.scrollHeight;


    // ==================================
    // Высота практически не изменилась
    // ==================================

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


    // ==================================
    // Transition
    // ==================================

    element.style.transition = `
        height ${EXPAND_DURATION}ms ease
    `;


    // ==================================
    // Запуск через два кадра
    // ==================================

    requestAnimationFrame(()=>{

        requestAnimationFrame(()=>{

            element.style.height =
                `${targetHeight}px`;

        });

    });


    // ==================================
    // Завершение
    // ==================================

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

        },
        EXPAND_DURATION + 40
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
