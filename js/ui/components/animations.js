// ======================================
// Universal block animations
// ======================================
//
// Универсальная визуальная анимация.
//
// Не изменяет:
// height
// width
// padding
// margin
//
// Геометрия блока не пересчитывается
// во время анимации.
//
// Используется clip-path.
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

    // Блок должен быть полностью
    // отрисован перед началом анимации.

    element.style.clipPath =
        "inset(100% 0 0 0)";

    element.style.webkitClipPath =
        "inset(100% 0 0 0)";

    element.style.transition = `
        clip-path ${EXPAND_DURATION}ms ease,
        -webkit-clip-path ${EXPAND_DURATION}ms ease
    `;

    // Принудительно фиксируем
    // начальное состояние.

    element.offsetHeight;

    requestAnimationFrame(()=>{

        element.style.clipPath =
            "inset(0 0 0 0)";

        element.style.webkitClipPath =
            "inset(0 0 0 0)";

    });

    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.clipPath =
                    "";

                element.style.webkitClipPath =
                    "";

                element.style.transition =
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

    element.hidden = false;

    // Начальное состояние — полностью видимое.

    element.style.clipPath =
        "inset(0 0 0 0)";

    element.style.webkitClipPath =
        "inset(0 0 0 0)";

    element.style.transition = `
        clip-path ${COLLAPSE_DURATION}ms ease,
        -webkit-clip-path ${COLLAPSE_DURATION}ms ease
    `;

    // Фиксируем начальное состояние.

    element.offsetHeight;

    requestAnimationFrame(()=>{

        element.style.clipPath =
            "inset(100% 0 0 0)";

        element.style.webkitClipPath =
            "inset(100% 0 0 0)";

    });

    return new Promise(resolve=>{

        element._sizeAnimationTimer =
            setTimeout(()=>{

                element.style.clipPath =
                    "";

                element.style.webkitClipPath =
                    "";

                element.style.transition =
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
//
// Пока оставляем простой вариант.
//
// Он нужен, если существующий код проекта
// вызывает animateResize().
//
// Но сам по себе clip-path не требует
// resize-анимации.
// ======================================

export function animateResize(
    element
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
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
