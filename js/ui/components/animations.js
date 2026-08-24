// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию.
//
// height
// padding
// margin
//
// Никакого opacity.
// Никакого scale.
//
// Геометрия и визуальная анимация
// никогда не должны конкурировать.
// ======================================


const EXPAND_DURATION = 220;
const COLLAPSE_DURATION = 200;


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


    // Элемент должен участвовать
    // в layout.

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


    // Фиксируем начальное состояние.

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
            EXPAND_DURATION + 20
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


    // Элемент должен быть в layout
    // во время схлопывания.

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


    // Фиксируем текущее состояние.

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
            COLLAPSE_DURATION + 20
        );

}


// ======================================
// Resize
// ======================================
//
// Для уже открытого блока.
//
// Контент изменился:
// 2 строки → 8 строк
// или
// 8 строк → 2 строки
//
// Блок плавно меняет высоту.
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

        return;

    }


    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;


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


    // Если элемент сейчас находится
    // в середине height-transition,
    // сначала сохраняем его фактическую
    // текущую высоту.

    const computed =
        window.getComputedStyle(
            element
        );


    if(
        computed.height !== "auto" &&
        element.offsetParent !== null
    ){

        const currentHeight =
            element.getBoundingClientRect().height;


        element.style.transition =
            "none";

        element.style.height =
            `${currentHeight}px`;

        element.offsetHeight;

    }


    element.style.transition =
        "";

}
