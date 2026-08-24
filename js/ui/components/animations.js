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
// Используется для любых динамических
// блоков, включая маленькие admin-button.
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


    element.hidden =
        false;


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
    // Новый токен анимации
    // ----------------------------------

    const token =
        Symbol();

    element._sizeAnimationToken =
        token;


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


    // Применяем начальное состояние.

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


    return new Promise(resolve => {

        const finish = ()=>{

            if(
                element._sizeAnimationToken !==
                token
            ){

                resolve();

                return;

            }


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

            element._sizeAnimationResolve =
                null;

            element._sizeAnimationToken =
                null;


            resolve();

        };


        element._sizeAnimationResolve =
            resolve;


        element._sizeAnimationTimer =
            setTimeout(
                finish,
                EXPAND_DURATION + 30
            );


        requestAnimationFrame(()=>{

            if(
                element._sizeAnimationToken !==
                token
            ){

                resolve();

                return;

            }


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


    element.hidden =
        false;


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
    // Новый токен анимации
    // ----------------------------------

    const token =
        Symbol();

    element._sizeAnimationToken =
        token;


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


    return new Promise(resolve => {

        const finish = ()=>{

            if(
                element._sizeAnimationToken !==
                token
            ){

                resolve();

                return;

            }


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

            element._sizeAnimationResolve =
                null;

            element._sizeAnimationToken =
                null;


            resolve();

        };


        element._sizeAnimationResolve =
            resolve;


        element._sizeAnimationTimer =
            setTimeout(
                finish,
                COLLAPSE_DURATION + 30
            );


        requestAnimationFrame(()=>{

            if(
                element._sizeAnimationToken !==
                token
            ){

                resolve();

                return;

            }


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


    // Разрешаем старый Promise,
    // если анимация была прервана.

    if(
        element._sizeAnimationResolve
    ){

        const resolve =
            element._sizeAnimationResolve;

        element._sizeAnimationResolve =
            null;

        resolve();

    }


    element._sizeAnimationToken =
        null;


    element.style.transition =
        "";

}


// ======================================
// Recalculate
// ======================================
//
// Используется, когда содержимое уже
// открытого блока изменилось.
//
// Например:
//
// было 2 строки
// стало 8 строк
//
// Блок плавно переходит
// на новую высоту.
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


    const token =
        Symbol();

    element._sizeAnimationToken =
        token;


    element.style.transition = `
        height ${EXPAND_DURATION}ms ease
    `;


    requestAnimationFrame(()=>{

        if(
            element._sizeAnimationToken !==
            token
        ){

            return;

        }


        element.style.height =
            `${targetHeight}px`;

    });


    element._sizeAnimationTimer =
        setTimeout(()=>{

            if(
                element._sizeAnimationToken !==
                token
            ){

                return;

            }


            element.style.height =
                "auto";

            element.style.transition =
                "";

            element.style.overflow =
                "";

            element._sizeAnimationTimer =
                null;

            element._sizeAnimationToken =
                null;

        }, EXPAND_DURATION + 30);

}
