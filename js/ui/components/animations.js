// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 1420;
const COLLAPSE_DURATION = 1420;

const DEBUG_ANIMATIONS = false;

// Диагностические зазоры.
// Можно менять независимо друг от друга.
const VERTICAL_START_OFFSET = 64;
const VERTICAL_END_OFFSET = 14;


// ======================================
// Debug
// ======================================

function log(...args) {
    if (DEBUG_ANIMATIONS) {
        console.log("[animations]", ...args);
    }
}


function getName(el) {
    return (
        el?.id ||
        el?.className ||
        el?.tagName ||
        "element"
    );
}


// ======================================
// Geometry
// ======================================

function getRect(el) {
    return el?.getBoundingClientRect() || null;
}


function forceLayout() {
    document.documentElement.offsetHeight;
}


// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {
    if (!el) return;

    if (el._animationFrame) {
        cancelAnimationFrame(
            el._animationFrame
        );

        el._animationFrame = null;
    }

    if (el._animationTimer) {
        clearTimeout(
            el._animationTimer
        );

        el._animationTimer = null;
    }

    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("transition");

    log("CANCEL", getName(el));
}


// ======================================
// Margin
// ======================================

function setMargin(el, top, left) {
    el.style.setProperty(
        "margin-top",
        `${top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${left}px`,
        "important"
    );
}


// ======================================
// Hidden offset
// ======================================

function getHiddenOffset(el) {

    const parent = el?.parentElement;

    if (!parent) {
        return {
            top: -300,
            left: -100
        };
    }

    const elementRect = getRect(el);
    const parentRect = getRect(parent);

    if (!elementRect || !parentRect) {
        return {
            top: -300,
            left: -100
        };
    }


    // ----------------------------------
    // Vertical
    // ----------------------------------

    /*
     * Уводим элемент вверх до тех пор,
     * пока его нижняя граница не окажется
     * выше верхней границы родителя.
     *
     * VERTICAL_END_OFFSET — запас в конце
     * скрытия.
     */

    const top =
        parentRect.top -
        elementRect.bottom -
        VERTICAL_END_OFFSET;


    // ----------------------------------
    // Horizontal
    // ----------------------------------

    const distanceLeft =
        Math.abs(
            elementRect.left -
            parentRect.left
        );

    const distanceRight =
        Math.abs(
            parentRect.right -
            elementRect.right
        );

    let left;


    if (distanceLeft <= distanceRight) {

        left =
            parentRect.left -
            elementRect.right -
            20;

    } else {

        left =
            parentRect.right -
            elementRect.left +
            20;

    }


    return {
        top,
        left
    };
}


// ======================================
// Easing
// ======================================

function easeInOut(progress) {

    return (
        1 -
        Math.cos(
            progress * Math.PI
        )
    ) / 2;
}


// ======================================
// Margin animation
// ======================================

function animateMargins(
    el,
    start,
    target,
    duration,
    complete
) {
    if (!el) {
        return Promise.resolve();
    }

    cancelSizeAnimation(el);


    const from = {
        top: Number(start.top) || 0,
        left: Number(start.left) || 0
    };

    const to = {
        top: Number(target.top) || 0,
        left: Number(target.left) || 0
    };


    log("START", getName(el), {
        from,
        to,
        duration
    });


    // ----------------------------------
    // Initial position
    // ----------------------------------

    setMargin(
        el,
        from.top,
        from.left
    );

    forceLayout();


    return new Promise(resolve => {

        const startTime =
            performance.now();


        function frame(now) {

            const elapsed =
                now - startTime;

            const progress =
                Math.min(
                    1,
                    elapsed / duration
                );


            // Одна общая прогрессия
            // для обеих осей.

            const eased =
                easeInOut(progress);


            const top =
                from.top +
                (
                    to.top -
                    from.top
                ) * eased;


            const left =
                from.left +
                (
                    to.left -
                    from.left
                ) * eased;


            setMargin(
                el,
                top,
                left
            );


            if (progress < 1) {

                el._animationFrame =
                    requestAnimationFrame(
                        frame
                    );

                return;
            }


            el._animationFrame = null;


            // ----------------------------------
            // Final exact position
            // ----------------------------------

            setMargin(
                el,
                to.top,
                to.left
            );


            /*
             * Небольшая задержка позволяет
             * браузеру применить последний кадр.
             */

            el._animationTimer =
                setTimeout(() => {

                    el._animationTimer = null;


                    // Возвращаем управление CSS.

                    el.style.removeProperty(
                        "margin-top"
                    );

                    el.style.removeProperty(
                        "margin-left"
                    );

                    el.style.removeProperty(
                        "transition"
                    );


                    if (
                        typeof complete ===
                        "function"
                    ) {
                        complete();
                    }


                    log(
                        "END",
                        getName(el)
                    );


                    resolve();

                }, 20);
        }


        el._animationFrame =
            requestAnimationFrame(
                frame
            );
    });
}


// ======================================
// Expand
// ======================================

export function animateExpand(el) {

    if (!el) {
        return Promise.resolve();
    }


    cancelSizeAnimation(el);


    /*
     * hidden здесь НЕ трогаем.
     *
     * Его состояние управляется
     * внешней логикой / adminButtons.
     */


    const hidden =
        getHiddenOffset(el);


    /*
     * Диагностический зазор начала.
     *
     * Мы начинаем движение немного дальше
     * конечной скрытой позиции.
     *
     * Это позволяет проверить, связан ли
     * начальный микро-рывок с самой стартовой
     * геометрией.
     */

    const start = {
        top:
            hidden.top -
            VERTICAL_START_OFFSET,

        left:
            hidden.left
    };


    const target = {
        top: 0,
        left: 0
    };


    log(
        "EXPAND",
        getName(el),
        {
            from: start,
            to: target,
            startOffset:
                VERTICAL_START_OFFSET,
            endOffset:
                VERTICAL_END_OFFSET
        }
    );


    return animateMargins(

        el,

        start,

        target,

        EXPAND_DURATION

    );
}


// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {

    if (!el) {
        return Promise.resolve();
    }


    cancelSizeAnimation(el);


    /*
     * Рассчитываем конечную скрытую
     * позицию до начала движения.
     */

    const hidden =
        getHiddenOffset(el);


    log(
        "COLLAPSE",
        getName(el),
        {
            from: {
                top: 0,
                left: 0
            },

            to: hidden,

            startOffset:
                VERTICAL_START_OFFSET,

            endOffset:
                VERTICAL_END_OFFSET
        }
    );


    return animateMargins(

        el,

        {
            top: 0,
            left: 0
        },

        hidden,

        COLLAPSE_DURATION

    );
}


// ======================================
// Resize
// ======================================

export function animateResize(el) {

    if (!el) {
        return Promise.resolve();
    }


    /*
     * Размеры элемента больше не
     * анимируем вообще.
     *
     * Layout самостоятельно пересчитывает
     * flex/grid после изменения контента.
     *
     * Функция оставлена для совместимости
     * с существующим кодом.
     */

    log(
        "RESIZE",
        getName(el)
    );


    return Promise.resolve();
}
