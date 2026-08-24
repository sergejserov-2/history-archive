// ======================================
// Universal block animations
// ======================================
//
// Отвечает только за геометрию.
//
// Анимируем ТОЛЬКО height.
//
// Высоты можно подготовить заранее,
// чтобы во время анимации не выполнять
// дополнительные измерения layout.
//
// Никакого opacity.
// Никакого scale.
// Никакого margin.
// Никакого padding.
// ======================================


const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;


// ======================================
// Prepare size
// ======================================
//
// Вызывается ДО начала анимации.
//
// Запоминаем текущую и естественную высоту.
// Во время самой анимации layout больше
// не измеряем.
//

export function prepareSize(
    element
){

    if(!element)
        return;


    cancelSizeAnimation(
        element
    );


    const wasHidden =
        element.hidden;


    // Для получения scrollHeight
    // элемент должен быть видимым.

    if(wasHidden)
        element.hidden = false;


    const height =
        element.scrollHeight;


    element._preparedHeight =
        height;


    if(wasHidden)
        element.hidden = true;

}


// ======================================
// Get prepared height
// ======================================

function getPreparedHeight(
    element
){

    if(
        Number.isFinite(
            element?._preparedHeight
        )
    ){

        return element._preparedHeight;

    }


    // Fallback только если размер
    // заранее не подготовили.

    return element?.scrollHeight ?? 0;

}


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


    // ==================================
    // Берём заранее рассчитанную высоту
    // ==================================

    const targetHeight =
        getPreparedHeight(
            element
        );


    // ==================================
    // Начальное состояние
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        "0px";


    // Применяем начальное состояние.

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition =
        `height ${EXPAND_DURATION}ms ease`;


    // ==================================
    // Фаза раскрытия
    // ==================================

    requestAnimationFrame(()=>{

        element.style.height =
            `${targetHeight}px`;

    });


    // ==================================
    // Завершение
    // ==================================

    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.height =
                    "";

                element.style.transition =
                    "";

                element.style.overflow =
                    "";

                element._preparedHeight =
                    null;

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


    element.hidden = false;


    // ==================================
    // Используем заранее рассчитанную
    // высоту.
    // ==================================

    const currentHeight =
        getPreparedHeight(
            element
        );


    // ==================================
    // Начальное состояние
    // ==================================

    element.style.overflow =
        "hidden";

    element.style.height =
        `${currentHeight}px`;


    // ==================================
    // Фиксируем стартовую высоту
    // ==================================

    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition =
        `height ${COLLAPSE_DURATION}ms ease`;


    // ==================================
    // Фаза схлопывания
    // ==================================

    requestAnimationFrame(()=>{

        element.style.height =
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

                element.style.transition =
                    "";

                element.style.overflow =
                    "";

                element.hidden =
                    true;

                element._preparedHeight =
                    null;

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


    // ==================================
    // Здесь измеряем только один раз.
    // ==================================

    const currentHeight =
        element.getBoundingClientRect().height;


    const targetHeight =
        element.scrollHeight;


    // Сохраняем новый размер.

    element._preparedHeight =
        targetHeight;


    // ==================================
    // Размер практически не изменился
    // ==================================

    if(
        Math.abs(
            currentHeight -
            targetHeight
        ) < 1
    ){

        element.style.height =
            "";

        element.style.overflow =
            "";

        return;

    }


    // ==================================
    // Фиксируем текущую высоту
    // ==================================

    element.style.height =
        `${currentHeight}px`;

    element.style.overflow =
        "hidden";


    element.offsetHeight;


    // ==================================
    // Transition
    // ==================================

    element.style.transition =
        `height ${EXPAND_DURATION}ms ease`;


    // ==================================
    // Resize
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
                "";

            element.style.transition =
                "";

            element.style.overflow =
                "";

            element._preparedHeight =
                null;

            element._sizeAnimationTimer =
                null;

        }, EXPAND_DURATION + 20);

}


// ======================================
// Prepare all elements
// ======================================
//
// Удобный helper для контроллера.
//
// Перед входом в админку:
//
// prepareAdminButtonSizes(buttons);
//

export function prepareSizes(
    elements
){

    if(!elements)
        return;


    elements.forEach?.(
        element => {

            prepareSize(
                element
            );

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
