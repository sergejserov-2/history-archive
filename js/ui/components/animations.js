// ======================================
// Universal geometry animations
// Margin-based test version
// ======================================

const ANIMATION_DURATION = 900;

const EASING =
    "cubic-bezier(.42, 0, .58, 1)";


// ======================================
// Helpers
// ======================================

function getName(el) {
    return el?.id ||
        el?.className ||
        el?.tagName ||
        "element";
}


function getRect(el) {
    return el.getBoundingClientRect();
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
        cancelAnimationFrame(el._animationFrame);
        el._animationFrame = null;
    }

    if (el._animationTimer) {
        clearTimeout(el._animationTimer);
        el._animationTimer = null;
    }

    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("transition");

    console.log(
        "[animations] CANCEL",
        getName(el)
    );
}


// ======================================
// Margin setter
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
// Calculate hidden offset
// ======================================

function getHiddenOffset(el) {
    const parent = el.parentElement;

    if (!parent) {
        return {
            top: -300,
            left: -300
        };
    }

    const elementRect = getRect(el);
    const parentRect = getRect(parent);

    /*
     * Уводим элемент полностью
     * за верхнюю границу родителя.
     *
     * + небольшой запас, чтобы
     * граница гарантированно исчезла.
     */

    const top =
        parentRect.top -
        elementRect.bottom -
        20;

    /*
     * Одновременно немного
     * уводим его влево.
     *
     * Пока это фиксированная доля
     * от высоты сдвига.
     */

    const left =
        top * 0.35;

    return {
        top,
        left
    };
}


// ======================================
// Animate margins
// ======================================

function animateMargins(
    el,
    start,
    target
) {
    cancelSizeAnimation(el);

    console.log(
        "[animations] START",
        getName(el),
        {
            start,
            target
        }
    );

    setMargin(
        el,
        start.top,
        start.left
    );

    forceLayout();

    return new Promise(resolve => {

        const startTime =
            performance.now();

        function frame(now) {

            const progress =
                Math.min(
                    1,
                    (now - startTime) /
                    ANIMATION_DURATION
                );

            /*
             * cubic ease-in-out
             *
             * 0 → 1:
             * медленно стартуем,
             * быстро двигаемся,
             * медленно останавливаемся.
             */

            const eased =
                progress < 0.5
                    ? 4 *
                      progress *
                      progress *
                      progress
                    : 1 -
                      Math.pow(
                          -2 * progress + 2,
                          3
                      ) / 2;

            const top =
                start.top +
                (
                    target.top -
                    start.top
                ) * eased;

            const left =
                start.left +
                (
                    target.left -
                    start.left
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

            setMargin(
                el,
                target.top,
                target.left
            );

            el._animationTimer =
                setTimeout(() => {

                    el._animationTimer = null;

                    el.style.removeProperty(
                        "margin-top"
                    );

                    el.style.removeProperty(
                        "margin-left"
                    );

                    console.log(
                        "[animations] END",
                        getName(el)
                    );

                    resolve();

                }, 20);
        }

        el._animationFrame =
            requestAnimationFrame(frame);
    });
}


// ======================================
// Expand
// ======================================

export function animateExpand(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    /*
     * Показываем из текущей
     * геометрической позиции.
     *
     * Никакого hidden.
     */

    const hiddenOffset =
        getHiddenOffset(el);

    console.log(
        "[animations] EXPAND",
        getName(el),
        {
            from: hiddenOffset,
            to: {
                top: 0,
                left: 0
            }
        }
    );

    return animateMargins(
        el,

        hiddenOffset,

        {
            top: 0,
            left: 0
        }
    );
}


// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    /*
     * Элемент сейчас находится
     * в нормальном положении.
     */

    const hiddenOffset =
        getHiddenOffset(el);

    console.log(
        "[animations] COLLAPSE",
        getName(el),
        {
            from: {
                top: 0,
                left: 0
            },
            to: hiddenOffset
        }
    );

    return animateMargins(
        el,

        {
            top: 0,
            left: 0
        },

        hiddenOffset
    );
}


// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el)
        return Promise.resolve();

    /*
     * Пока ничего не меняем.
     *
     * Наш эксперимент сейчас
     * исключительно про движение
     * через margin.
     */

    return Promise.resolve();
}
