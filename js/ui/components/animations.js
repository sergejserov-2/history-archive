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
    if (!el) return null;

    const r = el.getBoundingClientRect();

    return {
        width: r.width,
        height: r.height,
        x: r.x,
        y: r.y
    };
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
// Axis
// ======================================

function getAxis(el, start, target) {
    return (
        el.parentElement?.dataset?.animationAxis ||
        (
            Math.abs(target.width - start.width) >
            Math.abs(target.height - start.height)
                ? "width"
                : "height"
        )
    );
}

// ======================================
// Box model
// ======================================

function boxModel(el, axis) {
    const s = getComputedStyle(el);

    const paddingStart =
        axis === "width"
            ? parseFloat(s.paddingLeft) || 0
            : parseFloat(s.paddingTop) || 0;

    const paddingEnd =
        axis === "width"
            ? parseFloat(s.paddingRight) || 0
            : parseFloat(s.paddingBottom) || 0;

    const borderStart =
        axis === "width"
            ? parseFloat(s.borderLeftWidth) || 0
            : parseFloat(s.borderTopWidth) || 0;

    const borderEnd =
        axis === "width"
            ? parseFloat(s.borderRightWidth) || 0
            : parseFloat(s.borderBottomWidth) || 0;

    return {
        paddingStart,
        paddingEnd,
        borderStart,
        borderEnd,
        extra:
            paddingStart +
            paddingEnd +
            borderStart +
            borderEnd,
        boxSizing: s.boxSizing
    };
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
    complete
) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    const box = boxModel(el, axis);

    /*
     * В border-box width/height уже включают
     * padding и border.
     *
     * В content-box они добавляются браузером.
     */
    const startContent =
        box.boxSizing === "border-box"
            ? start[axis]
            : Math.max(0, start[axis] - box.extra);

    const targetContent =
        box.boxSizing === "border-box"
            ? target[axis]
            : Math.max(0, target[axis] - box.extra);

    el.style.overflow = "hidden";

    const startTime = performance.now();

    log("START", name(el), {
        axis,
        start,
        target,
        duration
    });

    return new Promise(resolve => {

        function frame(now) {

            const progress = Math.min(
                1,
                Math.max(
                    0,
                    (now - startTime) / duration
                )
            );

            // ease-out cubic
            const eased =
                1 - Math.pow(1 - progress, 3);

            const contentSize =
                startContent +
                (targetContent - startContent) *
                eased;

            const paddingStart =
                box.paddingStart * eased;

            const paddingEnd =
                box.paddingEnd * eased;

            const borderStart =
                box.borderStart * eased;

            const borderEnd =
                box.borderEnd * eased;

            if (axis === "width") {

                el.style.width =
                    `${contentSize}px`;

                el.style.paddingLeft =
                    `${paddingStart}px`;

                el.style.paddingRight =
                    `${paddingEnd}px`;

                el.style.borderLeftWidth =
                    `${borderStart}px`;

                el.style.borderRightWidth =
                    `${borderEnd}px`;

            } else {

                el.style.height =
                    `${contentSize}px`;

                el.style.paddingTop =
                    `${paddingStart}px`;

                el.style.paddingBottom =
                    `${paddingEnd}px`;

                el.style.borderTopWidth =
                    `${borderStart}px`;

                el.style.borderBottomWidth =
                    `${borderEnd}px`;
            }

            if (
                DEBUG_ANIMATIONS &&
                (
                    progress === 1 ||
                    Math.floor(now / 50) !==
                    Math.floor((now - 16) / 50)
                )
            ) {
                const g = geometry(el);

                log("FRAME", name(el), {
                    axis,
                    progress:
                        Number(progress.toFixed(3)),
                    width:
                        Number(g.width.toFixed(2)),
                    height:
                        Number(g.height.toFixed(2))
                });
            }

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
// Natural size
// ======================================

function naturalGeometry(el) {
    const width = el.scrollWidth;
    const height = el.scrollHeight;

    return {
        width,
        height
    };
}

// ======================================
// Expand
// ======================================

export function animateExpand(el) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    /*
     * Сначала полностью раскрываем элемент,
     * чтобы получить настоящий natural size.
     */
    el.style.width = "";
    el.style.height = "";
    el.style.overflow = "";

    const target = naturalGeometry(el);
    const current = geometry(el);

    const axis = getAxis(el, current, target);

    const start = {
        width: current.width,
        height: current.height
    };

    start[axis] = 0;

    log("EXPAND", name(el), {
        axis,
        start,
        target
    });

    return animateGeometry(
        el,
        start,
        target,
        axis,
        EXPAND_DURATION,
        () => {
            el.style.width = "";
            el.style.height = "";
            el.style.paddingLeft = "";
            el.style.paddingRight = "";
            el.style.paddingTop = "";
            el.style.paddingBottom = "";
            el.style.borderLeftWidth = "";
            el.style.borderRightWidth = "";
            el.style.borderTopWidth = "";
            el.style.borderBottomWidth = "";
            el.style.overflow = "";
        }
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    const current = geometry(el);

    const target = {
        width: current.width,
        height: current.height
    };

    const axis = getAxis(el, current, {
        width: 0,
        height: 0
    });

    target[axis] = 0;

    log("COLLAPSE", name(el), {
        axis,
        start: current,
        target
    });

    return animateGeometry(
        el,
        current,
        target,
        axis,
        COLLAPSE_DURATION,
        () => {
            el.style.width = "";
            el.style.height = "";
            el.style.paddingLeft = "";
            el.style.paddingRight = "";
            el.style.paddingTop = "";
            el.style.paddingBottom = "";
            el.style.borderLeftWidth = "";
            el.style.borderRightWidth = "";
            el.style.borderTopWidth = "";
            el.style.borderBottomWidth = "";
            el.style.overflow = "";
            el.hidden = true;
        }
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el) return;

    cancelSizeAnimation(el);

    const current = geometry(el);

    el.style.width =
        `${current.width}px`;

    el.style.height =
        `${current.height}px`;

    el.style.overflow = "hidden";

    el.offsetWidth;

    const target = naturalGeometry(el);

    const dx =
        Math.abs(current.width - target.width);

    const dy =
        Math.abs(current.height - target.height);

    if (dx < 1 && dy < 1) {

        log("RESIZE SKIPPED", name(el));

        el.style.width = "";
        el.style.height = "";
        el.style.overflow = "";

        return;
    }

    const axis =
        el.parentElement?.dataset?.animationAxis ||
        (dx > dy ? "width" : "height");

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
            el.style.width = "";
            el.style.height = "";
            el.style.paddingLeft = "";
            el.style.paddingRight = "";
            el.style.paddingTop = "";
            el.style.paddingBottom = "";
            el.style.borderLeftWidth = "";
            el.style.borderRightWidth = "";
            el.style.borderTopWidth = "";
            el.style.borderBottomWidth = "";
            el.style.overflow = "";
        }
    );
}
