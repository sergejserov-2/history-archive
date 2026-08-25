// ======================================
// Universal geometry animations
// ======================================

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;
const DEBUG_ANIMATIONS = true;

// ======================================
// Debug
// ======================================

function log(...args) {
    if (DEBUG_ANIMATIONS)
        console.log("[animations]", ...args);
}

function name(el) {
    return el?.id || el?.className || el?.tagName || "element";
}

function geometry(el) {
    const r = el.getBoundingClientRect();

    return {
        width: r.width,
        height: r.height,
        x: r.x,
        y: r.y
    };
}

function layoutState(el) {
    const parent = el?.parentElement;

    return {
        viewport: {
            innerWidth: window.innerWidth,
            clientWidth: document.documentElement.clientWidth,
            innerHeight: window.innerHeight,
            clientHeight: document.documentElement.clientHeight
        },

        page: {
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight,
            scrollY: window.scrollY
        },

        parent: parent
            ? geometry(parent)
            : null
    };
}

// ======================================
// Animation axis
// ======================================

function getAxis(el, size) {
    return (
        el.parentElement?.dataset?.animationAxis ||
        (size.width > size.height * 1.5
            ? "width"
            : "height")
    );
}

// ======================================
// Box extras
// ======================================

function getBoxExtras(el, axis) {
    const style = getComputedStyle(el);

    if (axis === "width") {
        return {
            paddingStart: parseFloat(style.paddingLeft) || 0,
            paddingEnd: parseFloat(style.paddingRight) || 0,
            borderStart: parseFloat(style.borderLeftWidth) || 0,
            borderEnd: parseFloat(style.borderRightWidth) || 0
        };
    }

    return {
        paddingStart: parseFloat(style.paddingTop) || 0,
        paddingEnd: parseFloat(style.paddingBottom) || 0,
        borderStart: parseFloat(style.borderTopWidth) || 0,
        borderEnd: parseFloat(style.borderBottomWidth) || 0
    };
}

// ======================================
// Parent gap compensation
// ======================================

function getParentGap(el, axis) {
    const parent = el.parentElement;

    if (!parent)
        return 0;

    const style = getComputedStyle(parent);

    const display = style.display;

    if (
        display !== "flex" &&
        display !== "grid" &&
        display !== "inline-flex"
    )
        return 0;

    if (axis === "width")
        return parseFloat(style.columnGap) || 0;

    return parseFloat(style.rowGap) || 0;
}

// ======================================
// Save / restore animation styles
// ======================================

function prepareAnimation(el, axis) {
    const extras = getBoxExtras(el, axis);
    const gap = getParentGap(el, axis);

    const style = el.style;

    style.overflow = "hidden";

    if (axis === "width") {
        style.paddingLeft = `${extras.paddingStart}px`;
        style.paddingRight = `${extras.paddingEnd}px`;
        style.borderLeftWidth = `${extras.borderStart}px`;
        style.borderRightWidth = `${extras.borderEnd}px`;
    } else {
        style.paddingTop = `${extras.paddingStart}px`;
        style.paddingBottom = `${extras.paddingEnd}px`;
        style.borderTopWidth = `${extras.borderStart}px`;
        style.borderBottomWidth = `${extras.borderEnd}px`;
    }

    return {
        extras,
        gap
    };
}

function collapseExtras(el, axis) {
    const style = el.style;

    if (axis === "width") {
        style.paddingLeft = "0px";
        style.paddingRight = "0px";
        style.borderLeftWidth = "0px";
        style.borderRightWidth = "0px";
    } else {
        style.paddingTop = "0px";
        style.paddingBottom = "0px";
        style.borderTopWidth = "0px";
        style.borderBottomWidth = "0px";
    }
}

function restoreAnimationStyles(el, axis, gap) {
    const style = el.style;

    style.width = "";
    style.height = "";

    style.paddingLeft = "";
    style.paddingRight = "";
    style.paddingTop = "";
    style.paddingBottom = "";

    style.borderLeftWidth = "";
    style.borderRightWidth = "";
    style.borderTopWidth = "";
    style.borderBottomWidth = "";

    style.overflow = "";

    if (axis === "width")
        style.marginRight = "";
    else
        style.marginBottom = "";
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {
    if (!el) return;

    if (el._sizeAnimationFrame) {
        cancelAnimationFrame(el._sizeAnimationFrame);
        el._sizeAnimationFrame = null;
    }

    if (el._sizeAnimationTimer) {
        clearTimeout(el._sizeAnimationTimer);
        el._sizeAnimationTimer = null;
    }

    el.style.transition = "";

    log("cancel", name(el));
}

// ======================================
// Geometry animation
// ======================================

function animateGeometry(
    el,
    start,
    target,
    axis,
    duration,
    complete,
    mode = "normal"
) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const { gap } = prepareAnimation(el, axis);

    el.style.width = `${start.width}px`;
    el.style.height = `${start.height}px`;

    // The collapsed state must contain no padding/border.
    if (mode === "collapse")
        collapseExtras(el, axis);

    // Cancel the parent's gap visually while the element is zero-sized.
    if (gap > 0) {
        if (axis === "width")
            el.style.marginRight = `${-gap}px`;
        else
            el.style.marginBottom = `${-gap}px`;
    }

    el.offsetWidth;

    const startTime = performance.now();

    let lastParent = el.parentElement
        ? geometry(el.parentElement)
        : null;

    let lastPage = layoutState(el);

    log("START", name(el), {
        axis,
        start,
        target,
        duration,
        gap
    });

    return new Promise(resolve => {

        function frame(now) {

            const elapsed = now - startTime;

            const progress = Math.min(
                1,
                Math.max(0, elapsed / duration)
            );

            const value =
                start[axis] +
                (target[axis] - start[axis]) *
                progress;

            if (axis === "width")
                el.style.width = `${value}px`;
            else
                el.style.height = `${value}px`;

            // Animate padding/border together with the size.
            const extras = getBoxExtras(el, axis);

            const extraProgress =
                mode === "collapse"
                    ? 1 - progress
                    : progress;

            if (axis === "width") {
                el.style.paddingLeft =
                    `${extras.paddingStart * extraProgress}px`;

                el.style.paddingRight =
                    `${extras.paddingEnd * extraProgress}px`;

                el.style.borderLeftWidth =
                    `${extras.borderStart * extraProgress}px`;

                el.style.borderRightWidth =
                    `${extras.borderEnd * extraProgress}px`;
            } else {
                el.style.paddingTop =
                    `${extras.paddingStart * extraProgress}px`;

                el.style.paddingBottom =
                    `${extras.paddingEnd * extraProgress}px`;

                el.style.borderTopWidth =
                    `${extras.borderStart * extraProgress}px`;

                el.style.borderBottomWidth =
                    `${extras.borderEnd * extraProgress}px`;
            }

            // Animate the gap compensation away.
            if (gap > 0) {
                const compensation =
                    gap * (1 - progress);

                if (axis === "width")
                    el.style.marginRight =
                        `${-compensation}px`;
                else
                    el.style.marginBottom =
                        `${-compensation}px`;
            }

            // ----------------------------------
            // Diagnostics
            // ----------------------------------

            if (DEBUG_ANIMATIONS) {

                const parent =
                    el.parentElement
                        ? geometry(el.parentElement)
                        : null;

                const page =
                    layoutState(el);

                const parentMoved =
                    parent &&
                    lastParent &&
                    (
                        Math.abs(
                            parent.x - lastParent.x
                        ) > 0.5 ||

                        Math.abs(
                            parent.y - lastParent.y
                        ) > 0.5 ||

                        Math.abs(
                            parent.width -
                            lastParent.width
                        ) > 0.5 ||

                        Math.abs(
                            parent.height -
                            lastParent.height
                        ) > 0.5
                    );

                const pageChanged =
                    page.viewport.clientWidth !==
                        lastPage.viewport.clientWidth ||

                    page.viewport.clientHeight !==
                        lastPage.viewport.clientHeight ||

                    page.page.scrollWidth !==
                        lastPage.page.scrollWidth ||

                    page.page.scrollHeight !==
                        lastPage.page.scrollHeight;

                if (parentMoved)
                    log("PARENT MOVED", name(el), {
                        axis,
                        previous: lastParent,
                        current: parent
                    });

                if (pageChanged)
                    log("PAGE GEOMETRY CHANGED", name(el), {
                        axis,
                        previous: lastPage,
                        current: page
                    });

                if (
                    progress === 1 ||
                    Math.floor(elapsed / 50) !==
                    Math.floor((elapsed - 16) / 50)
                ) {
                    const g = geometry(el);

                    log("FRAME", name(el), {
                        axis,
                        elapsed: Math.round(elapsed),
                        progress: Number(
                            progress.toFixed(3)
                        ),
                        width: Number(
                            g.width.toFixed(2)
                        ),
                        height: Number(
                            g.height.toFixed(2)
                        )
                    });
                }

                lastParent = parent;
                lastPage = page;
            }

            // ----------------------------------
            // Next frame
            // ----------------------------------

            if (progress < 1) {

                el._sizeAnimationFrame =
                    requestAnimationFrame(frame);

                return;
            }

            el._sizeAnimationFrame = null;

            if (typeof complete === "function")
                complete();

            log("END", name(el), { axis });

            resolve();
        }

        el._sizeAnimationFrame =
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

    el.hidden = false;

    const natural = geometry(el);

    const axis = getAxis(el, natural);

    const target = {
        width: natural.width,
        height: natural.height
    };

    if (axis === "width")
        target.width = el.scrollWidth;
    else
        target.height = el.scrollHeight;

    const start = {
        width: natural.width,
        height: natural.height
    };

    start[axis] = 0;

    log("EXPAND", name(el), {
        axis,
        target
    });

    return animateGeometry(
        el,
        start,
        target,
        axis,
        EXPAND_DURATION,
        () => {
            restoreAnimationStyles(
                el,
                axis
            );
        },
        "expand"
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    const current = geometry(el);

    const axis = getAxis(el, current);

    const start = {
        width: current.width,
        height: current.height
    };

    const target = {
        width: current.width,
        height: current.height
    };

    target[axis] = 0;

    log("COLLAPSE", name(el), {
        axis,
        start,
        target
    });

    return animateGeometry(
        el,
        start,
        target,
        axis,
        COLLAPSE_DURATION,
        () => {
            restoreAnimationStyles(
                el,
                axis
            );

            el.hidden = true;
        },
        "collapse"
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el)
        return;

    cancelSizeAnimation(el);

    const current = geometry(el);

    el.style.width = `${current.width}px`;
    el.style.height = `${current.height}px`;
    el.style.overflow = "hidden";

    el.offsetWidth;

    const target = {
        width: el.scrollWidth,
        height: el.scrollHeight
    };

    const dx =
        Math.abs(
            current.width -
            target.width
        );

    const dy =
        Math.abs(
            current.height -
            target.height
        );

    if (dx < 1 && dy < 1) {

        log("RESIZE SKIPPED", name(el), {
            current,
            target
        });

        el.style.width = "";
        el.style.height = "";
        el.style.overflow = "";

        return;
    }

    const axis =
        el.parentElement?.dataset?.animationAxis ||
        (dx > dy
            ? "width"
            : "height");

    log("RESIZE", name(el), {
        axis,
        start: current,
        target
    });

    animateGeometry(
        el,
        current,
        target,
        axis,
        EXPAND_DURATION,
        () => {
            restoreAnimationStyles(
                el,
                axis
            );
        },
        "expand"
    );
}
