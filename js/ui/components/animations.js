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


    // Зафиксировать начальное состояние.
    element.offsetHeight;


    element.style.transition = `
        height ${EXPAND_DURATION}ms ease,
        padding-top ${EXPAND_DURATION}ms ease,
        padding-bottom ${EXPAND_DURATION}ms ease,
        margin-top ${EXPAND_DURATION}ms ease,
        margin-bottom ${EXPAND_DURATION}ms ease
    `;


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

            }, EXPAND_DURATION + 30);

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


    // ==================================
    // Сначала получаем реальные размеры
    // ==================================

    const computed =
        window.getComputedStyle(
            element
        );


    const currentHeight =
        element.scrollHeight;


    const currentPaddingTop =
        computed.paddingTop;

    const currentPaddingBottom =
        computed.paddingBottom;

    const currentMarginTop =
        computed.marginTop;

    const currentMarginBottom =
        computed.marginBottom;


    // ==================================
    // Фиксируем начальное состояние
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


    // Критически важно:
    // браузер должен один раз
    // применить зафиксированное состояние.
    element.offsetHeight;


    // ==================================
    // Включаем переход
    // ==================================

    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ease,
        padding-top ${COLLAPSE_DURATION}ms ease,
        padding-bottom ${COLLAPSE_DURATION}ms ease,
        margin-top ${COLLAPSE_DURATION}ms ease,
        margin-bottom ${COLLAPSE_DURATION}ms ease
    `;


    // ==================================
    // Запускаем схлопывание
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

            }, COLLAPSE_DURATION + 30);

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


    element.hidden = false;


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

        return;

    }


    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;


    element.offsetHeight;


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

        }, EXPAND_DURATION + 30);

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
