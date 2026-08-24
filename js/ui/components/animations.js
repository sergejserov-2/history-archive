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
// Используется как универсальный механизм
// для больших и маленьких динамических
// элементов.
// ======================================

const EXPAND_DURATION = 280;
const COLLAPSE_DURATION = 240;


// ======================================
// Expand
// ======================================

export function animateExpand(
    element,
    callback = null
){

    if(!element)
        return;


    cancelSizeAnimation(
        element
    );


    // Элемент обязан быть в layout.

    element.hidden = false;


    const computed =
        window.getComputedStyle(
            element
        );


    // ----------------------------------
    // Целевые значения
    // ----------------------------------

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


    // ----------------------------------
    // Начальное состояние
    // ----------------------------------

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


    // Принудительно применяем
    // начальное состояние.

    element.offsetHeight;


    // ----------------------------------
    // Transition
    // ----------------------------------

    element.style.transition = `
        height ${EXPAND_DURATION}ms ease,
        padding-top ${EXPAND_DURATION}ms ease,
        padding-bottom ${EXPAND_DURATION}ms ease,
        margin-top ${EXPAND_DURATION}ms ease,
        margin-bottom ${EXPAND_DURATION}ms ease
    `;


    // ----------------------------------
    // Запуск
    // ----------------------------------

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


    // ----------------------------------
    // Завершение
    // ----------------------------------

    const finish = ()=>{

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


        if(callback){

            callback();

        }

    };


    element._sizeAnimationTimer =
        setTimeout(
            finish,
            EXPAND_DURATION + 30
        );

}


// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element,
    callback = null
){

    if(!element)
        return;


    cancelSizeAnimation(
        element
    );


    element.hidden = false;


    const computed =
        window.getComputedStyle(
            element
        );


    // ----------------------------------
    // Текущее состояние
    // ----------------------------------

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


    // ----------------------------------
    // Фиксируем текущее состояние
    // ----------------------------------

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


    element.offsetHeight;


    // ----------------------------------
    // Transition
    // ----------------------------------

    element.style.transition = `
        height ${COLLAPSE_DURATION}ms ease,
        padding-top ${COLLAPSE_DURATION}ms ease,
        padding-bottom ${COLLAPSE_DURATION}ms ease,
        margin-top ${COLLAPSE_DURATION}ms ease,
        margin-bottom ${COLLAPSE_DURATION}ms ease
    `;


    // ----------------------------------
    // Запуск
    // ----------------------------------

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


    // ----------------------------------
    // Завершение
    // ----------------------------------

    const finish = ()=>{

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

    };


    element._sizeAnimationTimer =
        setTimeout(
            finish,
            COLLAPSE_DURATION + 30
        );

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
