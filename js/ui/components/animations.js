// ======================================
// Universal geometry animations
// Margin-based version
// ======================================

const EXPAND_DURATION = 1500;
const COLLAPSE_DURATION = 1500;

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

function getMarginProperty(axis) {
    return axis === "width"
        ? "margin-right"
        : "margin-bottom";
}

function getCurrentMargin(el, property) {
    return parseFloat(
        getComputedStyle(el)[property]
    ) || 0;
}

function forceLayout(el) {
    void el.offsetHeight;
    void el.parentElement?.offsetHeight;
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {
    if (!el) return;

    if (el._marginAnimationFrame) {
        cancelAnimationFrame(
            el._marginAnimationFrame
        );

        el._marginAnimationFrame = null;
    }

    if (el._marginAnimationTimer) {
        clearTimeout(
            el._marginAnimationTimer
        );

        el._marginAnimationTimer = null;
    }

    el.style.setProperty(
        "transition",
        "",
        "important"
    );

    console.log(
        "[animations] CANCEL",
        getName(el)
    );
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
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    console.log(
        "[animations] START",
        getName(el),
        {
            property,
            from,
            to,
            duration
        }
    );

    // Start value
    el.style.setProperty(
        property,
        `${from}px`,
        "important"
    );

    // Force browser to commit start state
    forceLayout(el);

    return new Promise(resolve => {

        // Start transition on next frame
        el._marginAnimationFrame =
            requestAnimationFrame(() => {

                el._marginAnimationFrame = null;

                el.style.setProperty(
                    "transition",
                    `${property} ${duration}ms cubic-bezier(.25,.8,.25,1)`,
                    "important"
                );

                // Target value
                el.style.setProperty(
                    property,
                    `${to}px`,
                    "important"
                );
            });

        // Finish after transition
        el._marginAnimationTimer =
            setTimeout(() => {

                el._marginAnimationTimer = null;

                el.style.setProperty(
                    "transition",
                    "",
                    "important"
                );

                if (typeof complete === "function")
                    complete();

                console.log(
                    "[animations] END",
                    getName(el),
                    {
                        property,
                        value: to
                    }
                );

                resolve();

            }, duration + 50);
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const axis = getAxis(el);
    const property = getMarginProperty(axis);

    const current =
        getCurrentMargin(el, property);

    console.log(
        "[animations] EXPAND",
        getName(el),
        {
            axis,
            property,
            current
        }
    );

    /*
        Expand = restore normal margin.

        We do NOT touch:
        - hidden
        - width
        - height
        - display
        - overflow

        The element remains fully present.
    */

    return animateMargin(
        el,
        property,
        current,
        0,
        EXPAND_DURATION,
        () => {

            // Return control to CSS
            el.style.removeProperty(
                property
            );

            el.style.removeProperty(
                "transition"
            );
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

    const axis = getAxis(el);
    const property = getMarginProperty(axis);

    const current =
        getCurrentMargin(el, property);

    /*
        IMPORTANT:

        We don't calculate height.
        We don't set height: 0.
        We don't set hidden.
        We don't remove the element.

        We simply move its layout contribution
        in the negative direction.

        The actual target is based on the
        element's current rendered size.
    */

    const rect =
        el.getBoundingClientRect();

    const amount =
        axis === "width"
            ? rect.width
            : rect.height;

    const target =
        current - amount;

    console.log(
        "[animations] COLLAPSE",
        getName(el),
        {
            axis,
            property,
            current,
            amount,
            target
        }
    );

    return animateMargin(
        el,
        property,
        current,
        target,
        COLLAPSE_DURATION,
        () => {

            /*
                Leave the final margin in place.

                We intentionally do NOT:
                - hidden = true
                - width = 0
                - height = 0

                The caller/admin-buttons can decide
                when the element should actually disappear.
            */

            el.style.removeProperty(
                "transition"
            );
        }
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    /*
        Margin animation is not a true resize
        animation.

        Therefore Resize simply restores
        normal layout contribution.

        The actual content dimensions remain
        untouched.
    */

    const axis = getAxis(el);
    const property = getMarginProperty(axis);

    const current =
        getCurrentMargin(el, property);

    return animateMargin(
        el,
        property,
        current,
        0,
        EXPAND_DURATION,
        () => {

            el.style.removeProperty(
                property
            );

            el.style.removeProperty(
                "transition"
            );
        }
    );
}
