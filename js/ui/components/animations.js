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

function getPadding(el) {
    const style = getComputedStyle(el);

    return {
        top: parseFloat(style.paddingTop) || 0,
        right: parseFloat(style.paddingRight) || 0,
        bottom: parseFloat(style.paddingBottom) || 0,
        left: parseFloat(style.paddingLeft) || 0
    };
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
}

// ======================================
// Animate
// ======================================

function animate(
    el,
    start,
    target,
    axis,
    duration,
    done
) {
    cancelSizeAnimation(el);

    el.style.overflow = "hidden";

    el.style.width = `${start.width}px`;
    el.style.height = `${start.height}px`;

    el.style.paddingTop = `${start.paddingTop}px`;
    el.style.paddingRight = `${start.paddingRight}px`;
    el.style.paddingBottom = `${start.paddingBottom}px`;
    el.style.paddingLeft = `${start.paddingLeft}px`;

    forceLayout(el);

    el.style.transition =
        `${axis} ${duration}ms ${EASING}, ` +
        `padding-top ${duration}ms ${EASING}, ` +
        `padding-right ${duration}ms ${EASING}, ` +
        `padding-bottom ${duration}ms ${EASING}, ` +
        `padding-left ${duration}ms ${EASING}`;

    requestAnimationFrame(() => {

        el.style.width = `${target.width}px`;
        el.style.height = `${target.height}px`;

        el.style.paddingTop = `${target.paddingTop}px`;
        el.style.paddingRight = `${target.paddingRight}px`;
        el.style.paddingBottom = `${target.paddingBottom}px`;
        el.style.paddingLeft = `${target.paddingLeft}px`;
    });

    el._animationTimer = setTimeout(() => {

        el._animationTimer = null;

        el.style.width = "";
        el.style.height = "";

        el.style.paddingTop = "";
        el.style.paddingRight = "";
        el.style.paddingBottom = "";
        el.style.paddingLeft = "";

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
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    // ----------------------------------
    // Natural geometry
    // ----------------------------------

    const size = getSize(el);
    const padding = getPadding(el);

    const axis = getAxis(el);

    const target = {
        width: size.width,
        height: size.height,

        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left
    };

    // ----------------------------------
    // Start from zero CONTENT + padding
    // ----------------------------------

    const start = {
        width: size.width,
        height: size.height,

        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left
    };

    start[axis] = 0;

    start.paddingTop = 0;
    start.paddingRight = 0;
    start.paddingBottom = 0;
    start.paddingLeft = 0;

    return new Promise(resolve => {

        animate(
            el,
            start,
            target,
            axis,
            EXPAND_DURATION,
            resolve
        );

    });
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    // ----------------------------------
    // Current geometry
    // ----------------------------------

    const size = getSize(el);
    const padding = getPadding(el);

    const axis = getAxis(el);

    const start = {
        width: size.width,
        height: size.height,

        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left
    };

    // ----------------------------------
    // End
    // ----------------------------------

    const target = {
        width: size.width,
        height: size.height,

        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0
    };

    target[axis] = 0;

    return new Promise(resolve => {

        animate(
            el,
            start,
            target,
            axis,
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
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    // ----------------------------------
    // Current geometry
    // ----------------------------------

    const currentSize = getSize(el);

    const currentPadding = getPadding(el);

    // ----------------------------------
    // Remove explicit geometry
    // ----------------------------------

    el.style.width = "";
    el.style.height = "";

    el.style.paddingTop = "";
    el.style.paddingRight = "";
    el.style.paddingBottom = "";
    el.style.paddingLeft = "";

    forceLayout(el);

    // ----------------------------------
    // Natural geometry
    // ----------------------------------

    const naturalSize = getSize(el);

    const naturalPadding = getPadding(el);

    // ----------------------------------
    // Difference
    // ----------------------------------

    const dx =
        Math.abs(
            currentSize.width -
            naturalSize.width
        );

    const dy =
        Math.abs(
            currentSize.height -
            naturalSize.height
        );

    if (dx < 1 && dy < 1) {

        el.style.overflow = "";

        return Promise.resolve();
    }

    const axis = getAxis(el);

    // ----------------------------------
    // Start
    // ----------------------------------

    const start = {
        width: currentSize.width,
        height: currentSize.height,

        paddingTop: currentPadding.top,
        paddingRight: currentPadding.right,
        paddingBottom: currentPadding.bottom,
        paddingLeft: currentPadding.left
    };

    // ----------------------------------
    // Target
    // ----------------------------------

    const target = {
        width: naturalSize.width,
        height: naturalSize.height,

        paddingTop: naturalPadding.top,
        paddingRight: naturalPadding.right,
        paddingBottom: naturalPadding.bottom,
        paddingLeft: naturalPadding.left
    };

    return new Promise(resolve => {
        animate(
            el,
            start,
            target,
            axis,
            EXPAND_DURATION,
            resolve
        );

    });
}
