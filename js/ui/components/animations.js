// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 1420;
const COLLAPSE_DURATION = 1420;

// ======================================
// Diagnostic gaps
// ======================================

const END_GAP = 14;
const START_GAP = 14;

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
            top: -300 - END_GAP,
            left: -100 - END_GAP
        };
    }

    const elementRect = getRect(el);
    const parentRect = getRect(parent);

    if (!elementRect || !parentRect) {
        return {
            top: -300 - END_GAP,
            left: -100 - END_GAP
        };
    }


    // ----------------------------------
    // Vertical
    // ----------------------------------

    /*
     * Базовая скрытая позиция:
     *
     * нижняя граница элемента должна
     * оказаться выше верхней границы родителя.
     */

    const hiddenTop =
        parentRect.top -
        elementRect.bottom;


    /*
     * END_GAP:
     *
     * дополнительно уводим элемент вверх.
     */

    const top =
        hiddenTop -
        END_GAP;


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

        /*
         * Уводим влево.
         */

        const hiddenLeft =
            parentRect.left -
            elementRect.right;

        left =
            hiddenLeft -
            END_GAP;

    } else {

        /*
         * Уводим вправо.
         */

        const hiddenLeft =
            parentRect.right -
            elementRect.left;

        left =
            hiddenLeft +
            END_GAP;
    }


    return {
        top,
        left
    };
}


// ======================================
// Start offset
// ======================================

function getStartOffset(hidden) {

    /*
     * START_GAP должен двигать стартовую
     * точку в ту же сторону, куда элемент
     * уже был спрятан.
     */

    let top;

    if (hidden.top < 0) {

        top =
            hidden.top -
            START_GAP;

    } else if (hidden.top > 0) {

        top =
            hidden.top +
            START_GAP;

    } else {

        top = hidden.top;
    }


    /*
     * Аналогично для horizontal.
     */

    let left;

    if (hidden.left < 0) {

        left =
            hidden.left -
            START_GAP;

    } else if (hidden.left > 0) {

        left =
            hidden.left +
            START_GAP;

    } else {

        left = hidden.left;
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

    /*
     * Мягкое начало и мягкий конец.
     */

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

        /*
         * Даём браузеру отдельный кадр,
         * чтобы стартовая позиция была
         * реально отрисована.
         */

        requestAnimationFrame(() => {

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
                // Exact final position
                // ----------------------------------

                setMargin(
                    el,
                    to.top,
                    to.left
                );


                /*
                 * Даём браузеру применить последний
                 * кадр перед очисткой inline-стилей.
                 */

                el._animationTimer =
                    setTimeout(() => {

                        el._animationTimer = null;


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
     * Его состояние контролирует внешняя
     * логика / adminButtons.
     */

    const hidden =
        getHiddenOffset(el);


    /*
     * START_GAP:
     *
     * стартуем ещё дальше в той же стороне,
     * куда элемент должен быть спрятан.
     */

    const start =
        getStartOffset(hidden);


    log(
        "EXPAND",
        getName(el),
        {
            from: start,
            calculatedHidden: hidden,
            to: {
                top: 0,
                left: 0
            },
            startGap: START_GAP,
            endGap: END_GAP
        }
    );


    return animateMargins(

        el,

        start,

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
     * Сначала вычисляем нормальную скрытую
     * позицию.
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
            endGap: END_GAP
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
     * Размеры больше не анимируем.
     *
     * Flex/Grid самостоятельно пересчитывают
     * layout после изменения содержимого.
     */

    log(
        "RESIZE",
        getName(el)
    );


    return Promise.resolve();
}
