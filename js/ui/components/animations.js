// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 420;
const COLLAPSE_DURATION = 420;

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
// Hidden position
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


    /*
     * Уводим элемент вверх до тех пор,
     * пока его нижняя граница не окажется
     * выше верхней границы родителя.
     *
     * Дополнительные 20px дают небольшой
     * запас, чтобы край элемента гарантированно
     * не оставался видимым.
     */

    const top =
        parentRect.top -
        elementRect.bottom -
        20;


    /*
     * Второе направление рассчитываем
     * независимо.
     *
     * Пока направление фиксировано:
     * вверх + немного влево.
     *
     * Позже это можно заменить
     * на direction.
     */

    const left =
        -Math.abs(top) * 0.35;


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
     * Симметричный плавный
     * ease-in / ease-out.
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


    /*
     * Фиксируем ВСЕ значения ДО начала.
     *
     * После этого геометрию больше
     * вообще не измеряем.
     */

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


    /*
     * Начальная позиция.
     */

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
             * ОДНА и та же прогрессия
             * используется для обеих осей.
             */

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


            /*
             * Гарантированно выставляем
             * финальное значение.
             */

            setMargin(
                el,
                to.top,
                to.left
            );


            /*
             * Даём браузеру применить
             * последнее положение.
             */

            el._animationTimer =
                setTimeout(() => {

                    el._animationTimer = null;


                    /*
                     * Возвращаем CSS
                     * в исходное состояние.
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
     * Для раскрытия рассчитываем,
     * откуда элемент должен приехать.
     *
     * hidden НЕ трогаем.
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
     * Рассчитываем конечное положение
     * только ОДИН раз перед стартом.
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
     * Размеры больше не анимируем.
     *
     * Layout сам занимается своим
     * изменением размера.
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
