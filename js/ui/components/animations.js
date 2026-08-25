// ======================================
// Universal layout animations — MARGIN
// ======================================
//
// Принцип:
//
//  EXPAND:
//      margin = отрицательный размер элемента
//          ↓
//      margin плавно идёт к 0
//
//  COLLAPSE:
//      margin = 0
//          ↓
//      margin плавно становится отрицательным
//
// Сам элемент НЕ скрывается.
// hidden НЕ трогаем.
// Родители перестраиваются естественным layout.
//
// Работает с flex / grid / обычным block layout.
// ======================================

const EXPAND_DURATION = 1800;
const COLLAPSE_DURATION = 1800;

const EASING = "cubic-bezier(.16, 1, .3, 1)";

const DEBUG_ANIMATIONS = true;

// ======================================
// Debug
// ======================================

function log(...args) {
    if (DEBUG_ANIMATIONS)
        console.log("[animations]", ...args);
}

function getName(el) {
    return el?.id ||
        el?.className ||
        el?.tagName ||
        "element";
}

// ======================================
// Geometry
// ======================================

function getRect(el) {

    if (!el)
        return {
            width: 0,
            height: 0,
            x: 0,
            y: 0
        };

    const r = el.getBoundingClientRect();

    return {
        width: r.width,
        height: r.height,
        x: r.x,
        y: r.y
    };
}

// ======================================
// Force layout
// ======================================

function forceLayout() {
    document.documentElement.offsetHeight;
}

// ======================================
// Axis
// ======================================

function getAxis(el) {

    if (el?.parentElement?.dataset?.animationAxis)
        return el.parentElement.dataset.animationAxis;

    const r = getRect(el);

    return r.width > r.height * 1.5
        ? "width"
        : "height";
}

// ======================================
// Margin helpers
// ======================================

function getMargins(el) {

    const style = getComputedStyle(el);

    return {
        top: parseFloat(style.marginTop) || 0,
        right: parseFloat(style.marginRight) || 0,
        bottom: parseFloat(style.marginBottom) || 0,
        left: parseFloat(style.marginLeft) || 0
    };
}

function getGap(el, axis) {

    const parent = el?.parentElement;

    if (!parent)
        return 0;

    const style = getComputedStyle(parent);

    if (axis === "height")
        return parseFloat(style.rowGap) || 0;

    return parseFloat(style.columnGap) || 0;
}

// ======================================
// Animation margin
// ======================================

function getMarginProperty(el, axis) {

    /*
        We deliberately use the trailing margin.

        Vertical:

            margin-bottom

        Horizontal:

            margin-right

        This makes the element itself stay in place
        while its contribution to the parent layout
        changes.
    */

    return axis === "height"
        ? "marginBottom"
        : "marginRight";
}

// ======================================
// Current animated margin
// ======================================

function getCurrentMargin(el, property) {

    const inline = parseFloat(el.style[property]);

    if (Number.isFinite(inline))
        return inline;

    const computed =
        parseFloat(
            getComputedStyle(el)[
                property.replace(
                    /[A-Z]/g,
                    m => "-" + m.toLowerCase()
                )
            ]
        );

    return Number.isFinite(computed)
        ? computed
        : 0;
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {

    if (!el)
        return;

    if (el._layoutAnimation)
        el._layoutAnimation.cancel();

    el._layoutAnimation = null;

    el.style.transition = "";

    log("CANCEL", getName(el));
}

// ======================================
// Animate margin
// ======================================

function animateMargin(
    el,
    property,
    from,
    to,
    duration,
    complete
) {

    cancelSizeAnimation(el);

    el.style.transition = "none";
    el.style[property] = `${from}px`;

    /*
        Force browser to acknowledge the starting
        layout before changing the margin.
    */
    forceLayout();

    let finished = false;

    const finish = () => {

        if (finished)
            return;

        finished = true;

        if (el._layoutAnimation?.timer)
            clearTimeout(
                el._layoutAnimation.timer
            );

        el._layoutAnimation = null;

        el.style.transition = "";
        el.style[property] = "";

        if (typeof complete === "function")
            complete();

        log("END", getName(el), {
            property
        });
    };

    /*
        CSS transition is used here intentionally.

        The browser itself recalculates flex/grid layout
        on every interpolated margin value.
    */

    requestAnimationFrame(() => {

        if (finished)
            return;

        el.style.transition =
            `${property} ${duration}ms ${EASING}`;

        /*
            Second frame guarantees that the transition
            starts from the already-established layout.
        */

        requestAnimationFrame(() => {

            if (finished)
                return;

            el.style[property] = `${to}px`;
        });
    });

    const timer = setTimeout(
        finish,
        duration + 80
    );

    el._layoutAnimation = {
        timer,

        cancel() {

            if (finished)
                return;

            finished = true;

            clearTimeout(timer);

            el.style.transition = "";
            el.style[property] = "";

            el._layoutAnimation = null;
        }
    };
}

// ======================================
// Calculate collapsed margin
// ======================================

function getCollapsedMargin(el, axis) {

    const rect = getRect(el);
    const margins = getMargins(el);
    const gap = getGap(el, axis);

    /*
        Current margin is part of the layout.

        We only add the amount necessary to remove
        the element's occupied contribution.

        Existing margin is preserved.
    */

    const currentMargin =
        axis === "height"
            ? margins.bottom
            : margins.right;

    const size =
        axis === "height"
            ? rect.height
            : rect.width;

    /*
        gap is included because flex/grid gap
        is independent of margin.

        Without this correction a visible "empty slot"
        can remain after the element visually reaches
        zero contribution.
    */

    return -(
        size +
        gap
    );
}

// ======================================
// Expand
// ======================================

export function animateExpand(el) {

    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const axis = getAxis(el);
    const property = getMarginProperty(
        el,
        axis
    );

    /*
        Measure the real element while it is fully visible.
    */

    forceLayout();

    const collapsedMargin =
        getCollapsedMargin(
            el,
            axis
        );

    log("EXPAND", getName(el), {
        axis,
        property,
        from: collapsedMargin,
        to: 0,
        element: getRect(el),
        parent: getRect(el.parentElement),
        gap: getGap(el, axis)
    });

    return new Promise(resolve => {

        animateMargin(
            el,
            property,
            collapsedMargin,
            0,
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

    const axis = getAxis(el);
    const property = getMarginProperty(
        el,
        axis
    );

    /*
        Important:

        We DO NOT set hidden.
        We DO NOT set display:none.
        We DO NOT set width:0.
        We DO NOT set height:0.

        The element remains completely rendered.

        Only its contribution to the parent layout
        is gradually removed through negative margin.
    */

    forceLayout();

    const margins = getMargins(el);

    const currentMargin =
        axis === "height"
            ? margins.bottom
            : margins.right;

    const collapsedMargin =
        getCollapsedMargin(
            el,
            axis
        );

    log("COLLAPSE", getName(el), {
        axis,
        property,
        from: currentMargin,
        to: collapsedMargin,
        element: getRect(el),
        parent: getRect(el.parentElement),
        gap: getGap(el, axis)
    });

    return new Promise(resolve => {

        animateMargin(
            el,
            property,
            currentMargin,
            collapsedMargin,
            COLLAPSE_DURATION,
            resolve
        );

    });
}

// ======================================
// Resize
// ======================================
//
// Resize теперь тоже работает через margin.
//
// Это особенно полезно, если изменение размера
// одного блока заставляет перестраиваться flex/grid.
// ======================================

export function animateResize(el) {

    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const axis = getAxis(el);
    const property = getMarginProperty(
        el,
        axis
    );

    /*
        Для resize сначала фиксируем текущий
        contribution через отрицательный margin,
        затем возвращаем его к нормальному значению.

        Это позволяет родителю плавно перестроиться.
    */

    forceLayout();

    const rect = getRect(el);
    const margins = getMargins(el);

    const currentMargin =
        axis === "height"
            ? margins.bottom
            : margins.right;

    const size =
        axis === "height"
            ? rect.height
            : rect.width;

    /*
        Величина текущего layout contribution.
    */

    const currentContribution =
        size +
        currentMargin;

    /*
        После изменения содержимого браузер уже
        должен был получить новый natural size.
    */

    el.style[property] = "0px";

    forceLayout();

    const newRect = getRect(el);

    const newSize =
        axis === "height"
            ? newRect.height
            : newRect.width;

    /*
        Возвращаем начальное состояние.
    */

    const newContribution =
        newSize +
        currentMargin;

    el.style[property] =
        `${currentMargin}px`;

    forceLayout();

    /*
        Если реального изменения нет —
        ничего не анимируем.
    */

    if (
        Math.abs(
            currentContribution -
            newContribution
        ) < 1
    ) {

        el.style[property] = "";

        return Promise.resolve();
    }

    /*
        Анимируем изменение layout contribution
        через margin.

        Это намеренно очень простой механизм:
        браузер сам занимается flex/grid layout.
    */

    const delta =
        newSize - size;

    const targetMargin =
        currentMargin - delta;

    log("RESIZE", getName(el), {
        axis,
        property,
        currentContribution,
        newContribution,
        from: currentMargin,
        to: targetMargin
    });

    return new Promise(resolve => {

        animateMargin(
            el,
            property,
            currentMargin,
            targetMargin,
            EXPAND_DURATION,
            resolve
        );

    });
}
