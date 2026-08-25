// ======================================
// Universal geometry animations
// TEST VERSION — SLOW MARGIN ANIMATION
// ======================================

const EXPAND_DURATION = 1400;
const COLLAPSE_DURATION = 1400;

const EASING = "cubic-bezier(.25,.8,.25,1)";

// ======================================
// Helpers
// ======================================

function getAxis(el) {
    return (
        el?.parentElement?.dataset?.animationAxis ||
        (() => {
            const r = el.getBoundingClientRect();

            return r.width > r.height * 1.5
                ? "width"
                : "height";
        })()
    );
}

function getSize(el) {
    const r = el.getBoundingClientRect();

    return {
        width: r.width,
        height: r.height
    };
}

function forceLayout() {
    document.documentElement.offsetHeight;
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {
    if (!el) return;

    if (el._marginAnimation) {
        el._marginAnimation.cancel();
        el._marginAnimation = null;
    }

    el.style.transition = "";
    el.style.overflow = "";
}

// ======================================
// Animate
// ======================================

function animateMargin(
    el,
    axis,
    from,
    to,
    duration,
    complete
) {
    cancelSizeAnimation(el);

    const margin = axis === "width"
        ? "margin-right"
        : "margin-bottom";

    el.style.transition = "none";
    el.style.overflow = "hidden";
    el.style[margin] = `${from}px`;

    forceLayout();

    const animation =
        el.animate(
            [
                {
                    [margin]: `${from}px`
                },
                {
                    [margin]: `${to}px`
                }
            ],
            {
                duration,
                easing: EASING,
                fill: "forwards"
            }
        );

    el._marginAnimation = animation;

    animation.finished
        .then(() => {
            if (el._marginAnimation !== animation)
                return;

            el._marginAnimation = null;

            el.style[margin] = "";
            el.style.transition = "";
            el.style.overflow = "";

            if (complete)
                complete();
        })
        .catch(() => {
            if (el._marginAnimation === animation)
                el._marginAnimation = null;
        });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    const axis = getAxis(el);

    const margin = axis === "width"
        ? "margin-right"
        : "margin-bottom";

    /*
     * Суть:
     *
     * Сам элемент НЕ уменьшаем.
     * Он сразу остаётся нормального размера.
     *
     * Мы только создаём отрицательный margin,
     * который временно "забирает" его место
     * из родительского layout.
     *
     * Поэтому контент не появляется рывком
     * из-за изменения width/height.
     */

    const size = getSize(el);

    const occupied = axis === "width"
        ? size.width
        : size.height;

    return new Promise(resolve => {

        // Сначала полностью убираем занимаемое место.
        el.style[margin] = `${-occupied}px`;

        forceLayout();

        requestAnimationFrame(() => {

            animateMargin(
                el,
                axis,
                -occupied,
                0,
                EXPAND_DURATION,
                resolve
            );

        });
    });
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    const axis = getAxis(el);

    const margin = axis === "width" ? "margin-right"
        : "margin-bottom";

    const size = getSize(el);

    const occupied = axis === "width"
        ? size.width
        : size.height;

    return new Promise(resolve => {

        /*
         * Элемент остаётся полностью видимым
         * и НЕ уменьшается.
         *
         * Вместо этого отрицательный margin
         * постепенно выталкивает его из layout.
         */

        animateMargin(
            el,
            axis,
            0,
            -occupied,
            COLLAPSE_DURATION,
            () => {

                el.hidden = true;

                resolve();
            }
        );
    });
}

// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const axis = getAxis(el);

    const margin = axis === "width"
        ? "margin-right"
        : "margin-bottom";

    const current = getSize(el);

    /*
     * Для resize здесь ничего искусственно
     * не уменьшаем.
     *
     * Сначала получаем новую естественную геометрию,
     * затем компенсируем изменение через margin.
     */

    el.style[margin] = "0px";

    forceLayout();

    const target = getSize(el);

    const currentSize = axis === "width"
        ? current.width
        : current.height;

    const targetSize = axis === "width"
        ? target.width
        : target.height;

    const difference =
        targetSize - currentSize;

    if (Math.abs(difference) < 1) {
        el.style[margin] = "";
        return Promise.resolve();
    }

    /*
     * Если блок должен стать больше,
     * временно забираем дополнительное место
     * отрицательным margin.
     *
     * Если меньше — аналогично используем
     * положительную компенсацию.
     */

    const compensation = -difference;

    return new Promise(resolve => {

        el.style[margin] = `${compensation}px`;

        forceLayout();

        requestAnimationFrame(() => {

            animateMargin(
                el,
                axis,
                compensation,
                0,
                EXPAND_DURATION,
                resolve
            );

        });
    });
}
