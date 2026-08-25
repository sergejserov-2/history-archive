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
    complete
) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.style.overflow = "hidden";
    el.style.width = `${start.width}px`;
    el.style.height = `${start.height}px`;

    el.offsetWidth;

    const startTime = performance.now();
    let lastParent = geometry(el.parentElement);
    let lastPage = layoutState(el);

    log("START", name(el), {
        axis,
        start,
        target,
        duration
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

            // ------------------------------
            // Diagnostics
            // ------------------------------

            if (DEBUG_ANIMATIONS) {

                const parent =
                    el.parentElement
                        ? geometry(el.parentElement)
                        : null;

                const page =
                    layoutState(el);

                const parentMoved =
                    parent &&
                    (
                        Math.abs(parent.x - lastParent.x) > 0.5 ||
                        Math.abs(parent.y - lastParent.y) > 0.5 ||
                        Math.abs(parent.width - lastParent.width) > 0.5 ||
                        Math.abs(parent.height - lastParent.height) > 0.5
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

                if (
                    parentMoved
                )
                    log("PARENT MOVED", name(el), {
                        axis,
                        previous: lastParent,
                        current: parent
                    });

                if (
                    pageChanged
                )
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
                    log("FRAME", name(el), {
                        axis,
                        elapsed: Math.round(elapsed),
                        progress: Number(progress.toFixed(3)),
                        width: Number(
                            geometry(el).width.toFixed(2)
                        ),
                        height: Number(
                            geometry(el).height.toFixed(2)
                        ),
                        viewportWidth:
                            page.viewport.innerWidth,
                        clientWidth:
                            page.viewport.clientWidth,
                        scrollWidth:
                            page.page.scrollWidth,
                        scrollHeight:
                            page.page.scrollHeight
                    });
                }

                lastParent = parent;
                lastPage = page;
            }

            // ------------------------------
            // Next frame
            // ------------------------------

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
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    el.hidden = false;

    const natural = geometry(el);

    const axis =
        el.parentElement?.dataset?.animationAxis ||
        (
            natural.width > natural.height * 1.5
                ? "width"
                : "height"
        );

    const target = {
        width: natural.width,
        height: el.scrollHeight
    };

    if (axis === "width")
        target.width = el.scrollWidth;

    const start = {
        width: natural.width,
        height: natural.height
    };

    start[axis] = 0;

    log("EXPAND", name(el), {
        axis,
        parentLayout:
            el.parentElement
                ? geometry(el.parentElement)
                : null
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

    const axis =
        el.parentElement?.dataset?.animationAxis ||
        (
            current.width > current.height * 1.5
                ? "width"
                : "height"
        );

    const start = {
        width: current.width,height: current.height
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
            el.style.width = "";
            el.style.height = "";
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

    el.style.width = `${current.width}px`;
    el.style.height = `${current.height}px`;
    el.style.overflow = "hidden";

    el.offsetWidth;

    const target = {
        width: el.scrollWidth,
        height: el.scrollHeight
    };

    const dx = Math.abs(
        current.width - target.width
    );

    const dy = Math.abs(
        current.height - target.height
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
            el.style.overflow = "";
        }
    );
}
