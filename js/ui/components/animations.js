// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 420;
const COLLAPSE_DURATION = 420;

const VERTICAL_OVERSHOOT = 6;

const DEBUG_ANIMATIONS = false;


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

    el.style.removeProperty(
        "margin-top"
    );

    el.style.removeProperty(
        "margin-left"
    );

    el.style.removeProperty(
        "transition"
    );

    log("CANCEL", getName(el));
}


// ======================================
// Margin
// ======================================

function setMargin(
    el,
    top,
    left
) {
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

    const parent =
        el?.parentElement;

    if (!parent) {
        return {
            top: -300,
            left: -100
        };
    }

    const elementRect =
        getRect(el);

    const parentRect =
        getRect(parent);

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
     * Уводим элемент чуть дальше верхней
     * границы родителя.
     *
     * Небольшой запас убирает финальный
     * визуальный рывок из-за субпиксельного
     * позиционирования и пересчёта layout.
     */

    const top =
        parentRect.top -
        elementRect.bottom -
        VERTICAL_OVERSHOOT;


    // ----------------------------------
    // Horizontal
    // ----------------------------------

    /*
     * Горизонтальная логика пока остаётся
     * прежней. Позже будем отдельно
     * подбирать направление и расстояние.
     */

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

function easeInOutCubic(progress) {

    if (progress < 0.5) {

        return (
            4 *
            progress *
            progress *
            progress
        );

    }

    return (
        1 -
        Math.pow(
            -2 * progress + 2,
            3
        ) / 2
    );
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


    // Initial position
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


            /*
             * Одна общая easing-кривая
             * для обеих осей.
             */

            const eased =
                easeInOutCubic(
                    progress
                );


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


            // Финальная точная позиция
            setMargin(
                el,
                to.top,
                to.left
            );


            el._animationTimer =
                setTimeout(() => {

                    el._animationTimer = null;


                    /*
                     * Возвращаем управление
                     * обычному CSS.
                     */

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


    log(
        "EXPAND",
        getName(el),
        {
            from: hidden,
            to: {
                top: 0,
                left: 0
            }
        }
    );


    return animateMargins(

        el,

        hidden,

        {
            top: 0,
            left: 0
        },

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
     * Рассчитываем конечную позицию
     * до начала движения.
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
            to: hidden
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
     */

    log(
        "RESIZE",
        getName(el)
    );


    return Promise.resolve();
}
