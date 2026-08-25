// ======================================
// Universal geometry animations
// ======================================

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;

const EASING = "cubic-bezier(.25,.8,.25,1)";

// ======================================
// Helpers
// ======================================

function getName(el) {
    return el?.id || el?.className || el?.tagName || "element";
}

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

function getParentSize(el) {
    const parent = el?.parentElement;

    if (!parent)
        return null;

    return getSize(parent);
}

function forceLayout(el) {
    void el.offsetHeight;
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

    el.style.transition = "";

    el.style.marginTop = "";
    el.style.marginRight = "";
    el.style.marginBottom = "";
    el.style.marginLeft = "";

    el.style.clipPath = "";
    el.style.overflow = "";
}

// ======================================
// Measure layout contribution
// ======================================

function measureContribution(el, axis) {
    const parent = el?.parentElement;

    if (!parent)
        return 0;

    const before = getParentSize(el);

    const display = el.style.display;
    const hidden = el.hidden;

    // Temporarily remove element from layout.
    el.style.display = "none";
    el.hidden = false;

    forceLayout(parent);

    const without = getParentSize(el);

    // Restore.
    el.style.display = display;
    el.hidden = hidden;

    forceLayout(parent);

    if (!before || !without)
        return getSize(el)[axis];

    return Math.max(
        0,
        Math.abs(
            before[axis] -
            without[axis]
        )
    );
}

// ======================================
// Margin animation
// ======================================

function animateMargin(
    el,
    axis,
    from,
    to,
    duration,
    done
) {
    cancelSizeAnimation(el);

    el.hidden = false;

    el.style.overflow = "hidden";

    // ----------------------------------
    // Select margin
    // ----------------------------------

    const marginProperty =
        axis === "height"
            ? "marginBottom"
            : "marginRight";

    // ----------------------------------
    // Start
    // ----------------------------------

    el.style[marginProperty] =
        `${from}px`;

    // Hide the part outside the animated
    // layout contribution.
    el.style.clipPath =
        axis === "height"
            ? "inset(0 0 0 0)"
            : "inset(0 0 0 0)";

    forceLayout(el);

    // ----------------------------------
    // Animate
    // ----------------------------------

    el.style.transition =
        `${marginProperty} ${duration}ms ${EASING}`;

    requestAnimationFrame(() => {

        el.style[marginProperty] =
            `${to}px`;

    });

    // ----------------------------------
    // Finish
    // ----------------------------------

    el._animationTimer = setTimeout(() => {

        el._animationTimer = null;

        el.style[marginProperty] = "";

        el.style.clipPath = "";
        el.style.overflow = "";
        el.style.transition = "";

        if (typeof done === "function")
            done();

    }, duration + 40);
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

    // ----------------------------------
    // Calculate actual layout contribution
    // ----------------------------------

    const contribution =
        measureContribution(el, axis);

    if (contribution <= 0) {

        el.style.marginBottom = "";
        el.style.marginRight = "";

        return Promise.resolve();
    }

    // ----------------------------------
    // Start completely removed from layout
    // ----------------------------------

    const marginStart =
        -contribution;

    const marginTarget = 0;

    // ----------------------------------
    // Animate
    // ----------------------------------

    return new Promise(resolve => {

        animateMargin(
            el,
            axis,
            marginStart,
            marginTarget,
            EXPAND_DURATION,
            resolve
        );

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

    // ----------------------------------
    // Calculate actual layout contribution
    // ----------------------------------

    const contribution =
        measureContribution(el, axis);

    if (contribution <= 0) {

        el.hidden = true;

        return Promise.resolve();
    }

    // ----------------------------------
    // Start normally
    // ----------------------------------

    const marginStart = 0;

    const marginTarget =
        -contribution;

    // ----------------------------------
    // Animate
    // ----------------------------------

    return new Promise(resolve => {

        animateMargin(
            el,
            axis,
            marginStart,
            marginTarget,
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

    const before =
        measureContribution(el, axis);

    // Temporarily remove any explicit margin.
    el.style.marginTop = "";
    el.style.marginRight = "";
    el.style.marginBottom = "";
    el.style.marginLeft = "";

    forceLayout(el);

    const after =
        measureContribution(el, axis);

    const difference =
        Math.abs(after - before);

    if (difference < 1)
        return Promise.resolve();

    /*
     * Resize through the layout contribution.
     *
     * If the element became larger:
     *
     *     margin: 0 → negative
     *
     * If it became smaller:
     *
     *     negative → 0
     *
     * The element itself keeps its natural geometry.
     */

    const delta =
        after - before;

    if (delta > 0) {

        return new Promise(resolve => {

            animateMargin(
                el,
                axis,
                -delta,
                0,
                EXPAND_DURATION,
                resolve
            );

        });

    }

    return new Promise(resolve => {

        animateMargin(
            el,
            axis,
            0,
            delta,
            COLLAPSE_DURATION,
            resolve
        );

    });
}
