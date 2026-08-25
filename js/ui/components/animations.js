// ======================================
// Universal block animations
// ======================================
//
// Геометрическая анимация.
//
// Главный принцип:
//
//   horizontal layout → только width
//   vertical layout   → только height
//
// Для horizontal flex-item используем
// flex-basis, чтобы не конфликтовать
// с flex: 0 0 ...
//
// Не анимируем:
//   opacity
//   transform
//   margin
//   padding
//
// Временно включено подробное логирование.
// ======================================

// ======================================
// Durations
// ======================================

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;

// ======================================
// Debug
// ======================================

const DEBUG_ANIMATIONS = true;

function animationLog(...args) {

    if (!DEBUG_ANIMATIONS)
        return;

    console.log(
        "[animations]",
        ...args
    );
}

// ======================================
// Get element name
// ======================================

function getElementName(element) {

    if (!element)
        return "null";

    return (
        element.id ||
        (
            typeof element.className === "string"
                ? element.className
                : ""
        ) ||
        element.tagName ||
        "element"
    );
}

// ======================================
// Linear easing
// ======================================
//
// Пока намеренно linear.
//
// Это позволяет проверить именно
// геометрию без влияния easing.
// ======================================

function linear(progress) {

    return progress;
}

// ======================================
// Get parent layout
// ======================================

function getParentLayout(element) {

    if (!element || !element.parentElement)
        return {
            display: "unknown",
            direction: null
        };

    const style =
        getComputedStyle(
            element.parentElement
        );

    return {
        display:
            style.display,

        direction:
            style.flexDirection
    };
}

// ======================================
// Determine animation axis
// ======================================
//
// Возможные значения:
//
//   "width"
//   "height"
//   "both"
//
// Приоритет:
//
//   flex row      → width
//   flex column   → height
//   grid          → height
//   block         → height
//   unknown       → both
// ======================================

function getAnimationAxis(element) {

    const layout =
        getParentLayout(element);

    // ==================================
    // FLEX
    // ==================================

    if (layout.display === "flex") {

        if (
            layout.direction === "row" ||
            layout.direction === "row-reverse"
        ) {

            return "width";
        }

        if (
            layout.direction === "column" ||
            layout.direction === "column-reverse"
        ) {

            return "height";
        }
    }

    // ==================================
    // GRID
    // ==================================

    if (layout.display === "grid")
        return "height";

    // ==================================
    // BLOCK
    // ==================================

    if (layout.display === "block")
        return "height";

    // ==================================
    // UNKNOWN
    // ==================================

    return "both";
}

// ======================================
// Determine actual property
// ======================================
//
// Для horizontal flex-item:
//
//   flex-basis
//
// Для остальных:
//
//   width
//
// Vertical:
//
//   height
// ======================================

function getAnimationProperty(
    element,
    axis
) {

    const layout =
        getParentLayout(element);

    if (
        axis === "width" &&
        layout.display === "flex" &&
        (
            layout.direction === "row" ||
            layout.direction === "row-reverse"
        )
    ) {

        return "flex-basis";
    }

    if (axis === "width")
        return "width";

    if (axis === "height")
        return "height";

    return null;
}

// ======================================
// Cancel animation
// ======================================

export function cancelSizeAnimation(
    element
) {

    if (!element)
        return;

    if (
        element._sizeAnimationFrame
    ) {

        cancelAnimationFrame(
            element._sizeAnimationFrame
        );

        element._sizeAnimationFrame =
            null;
    }

    if (
        element._sizeAnimationTimer
    ) {

        clearTimeout(
            element._sizeAnimationTimer
        );

        element._sizeAnimationTimer =
            null;
    }

    element.style.transition =
        "";

    animationLog(
        "cancel",
        getElementName(element)
    );
}

// ======================================
// Read geometry
// ======================================

function readGeometry(
    element
) {

    const rect =
        element.getBoundingClientRect();

    return {

        width:
            rect.width,

        height:
            rect.height
    };
}

// ======================================
// Read target geometry
// ======================================
//
// Важно:
//
// width:
//   scrollWidth
//
// height:
//   scrollHeight
//
// Но только если соответствующая
// ось реально используется.
// ======================================

function readTargetGeometry(
    element,
    axis
) {

    const current =
        readGeometry(element);

    const target = {

        width:
            current.width,

        height:
            current.height
    };

    if (
        axis === "width" ||
        axis === "both"
    ) {

        target.width =
            element.scrollWidth;
    }

    if (
        axis === "height" ||
        axis === "both"
    ) {

        target.height =
            element.scrollHeight;
    }

    return target;
}

// ======================================
// Freeze geometry
// ======================================

function freezeGeometry(
    element,
    geometry,
    axis
) {

    if (
        axis === "width" ||
        axis === "both"
    ) {

        const property =
            getAnimationProperty(
                element,
                "width"
            );

        if (property === "flex-basis") {

            element.style.flexBasis =
                `${geometry.width}px`;

        } else {

            element.style.width =
                `${geometry.width}px`;
        }
    }

    if (
        axis === "height" ||
        axis === "both"
    ) {

        element.style.height =
            `${geometry.height}px`;
    }
}

// ======================================
// Clear geometry
// ======================================

function clearGeometry(
    element
) {

    element.style.width =
        "";

    element.style.height =
        "";

    element.style.flexBasis =
        "";

    element.style.overflow =
        "";
}

// ======================================
// Animate geometry
// ======================================

function animateGeometry(
    element,
    start,
    target,
    duration,
    axis,
    onComplete
) {

    if (!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    animationLog(
        "START",
        getElementName(element),
        {
            axis,
            start,
            target,
            duration
        }
    );

    element.style.overflow =
        "hidden";

    // ==================================
    // Initial width
    // ==================================

    if (
        axis === "width" ||
        axis === "both"
    ) {

        const property =
            getAnimationProperty(
                element,
                "width"
            );

        if (
            property === "flex-basis"
        ) {

            element.style.flexBasis =
                `${start.width}px`;

        } else {

            element.style.width =
                `${start.width}px`;
        }
    }

    // ==================================
    // Initial height
    // ==================================

    if (
        axis === "height" ||
        axis === "both"
    ) {

        element.style.height =
            `${start.height}px`;
    }

    // ==================================
    // Force layout
    // ==================================

    element.offsetWidth;

    const startTime =
        performance.now();

    let lastProgress =
        0;

    let lastGeometry =
        readGeometry(element);

    return new Promise(resolve => {

        function frame(now) {

            const elapsed =
                now -
                startTime;

            let progress =
                elapsed /
                duration;

            if (progress > 1)
                progress = 1;

            if (progress < 0)
                progress = 0;

            const eased =
                linear(progress);

            // ==================================
            // Width
            // ==================================

            let width =
                start.width;

            if (
                axis === "width" ||
                axis === "both"
            ) {

                width =
                    start.width +
                    (
                        target.width -
                        start.width
                    ) *
                    eased;

                const property =
                    getAnimationProperty(
                        element,
                        "width"
                    );

                if (
                    property === "flex-basis"
                ) {

                    element.style.flexBasis =
                        `${width}px`;

                } else {

                    element.style.width =
                        `${width}px`;
                }
            }

            // ==================================
            // Height
            // ==================================

            let height =
                start.height;

            if (
                axis === "height" ||
                axis === "both"
            ) {

                height =
                    start.height +
                    (
                        target.height -
                        start.height
                    ) *
                    eased;

                element.style.height =
                    `${height}px`;
            }

            // ==================================
            // Actual geometry
            // ==================================

            const actual =
                readGeometry(element);

            const parent =
                element.parentElement;

            const parentGeometry =
                parent
                    ? readGeometry(parent)
                    : null;

            const parentMoved =
                lastGeometry &&
                (
                    Math.abs(
                        actual.width -
                        lastGeometry.width
                    ) > 0.1
                    ||
                    Math.abs(
                        actual.height -
                        lastGeometry.height
                    ) > 0.1
                );

            // ==================================
            // Debug
            // ==================================

            if (DEBUG_ANIMATIONS) {

                const progressDelta =
                    progress -
                    lastProgress;

                if (
                    progress === 1
                    ||
                    Math.floor(
                        elapsed / 50
                    )
                    !==
                    Math.floor((
                            elapsed -
                            16
                        ) / 50
                    )
                ) {

                    animationLog(
                        "FRAME",
                        getElementName(element),
                        {
                            axis,

                            elapsed:
                                Math.round(
                                    elapsed
                                ),

                            progress:
                                Number(
                                    progress.toFixed(3)
                                ),

                            width:
                                Number(
                                    width.toFixed(2)
                                ),

                            height:
                                Number(
                                    height.toFixed(2)
                                ),

                            actualWidth:
                                Number(
                                    actual.width.toFixed(2)
                                ),

                            actualHeight:
                                Number(
                                    actual.height.toFixed(2)
                                ),

                            progressDelta:
                                Number(
                                    progressDelta.toFixed(4)
                                )
                        }
                    );
                }

                // ==================================
                // Detect parent movement
                // ==================================

                if (
                    parentMoved
                ) {

                    animationLog(
                        "PARENT MOVED",
                        getElementName(element),
                        {
                            axis,

                            previous: {
                                width:
                                    Number(
                                        lastGeometry.width
                                            .toFixed(2)
                                    ),

                                height:
                                    Number(
                                        lastGeometry.height
                                            .toFixed(2)
                                    )
                            },

                            current: {
                                width:
                                    Number(
                                        actual.width
                                            .toFixed(2)
                                    ),

                                height:
                                    Number(
                                        actual.height
                                            .toFixed(2)
                                    )
                            }
                        }
                    );
                }

                // ==================================
                // Detect page geometry changes
                // ==================================

                if (
                    parent &&
                    parentGeometry
                ) {

                    const previousParent =
                        element._lastParentGeometry;

                    if (
                        previousParent
                        &&
                        (
                            Math.abs(
                                parentGeometry.width -
                                previousParent.width
                            ) > 0.5
                            ||
                            Math.abs(
                                parentGeometry.height -
                                previousParent.height
                            ) > 0.5
                            )
                    ) {

                        animationLog(
                            "PAGE GEOMETRY CHANGED",
                            getElementName(element),
                            {
                                axis,

                                previous:
                                    previousParent,

                                current:
                                    parentGeometry
                            }
                        );
                    }

                    element._lastParentGeometry = {

                        width:
                            parentGeometry.width,

                        height:
                            parentGeometry.height
                    };
                }
            }

            lastGeometry =
                actual;

            lastProgress =
                progress;

            // ==================================
            // Continue
            // ==================================

            if (
                progress < 1
            ) {

                element._sizeAnimationFrame =
                    requestAnimationFrame(
                        frame
                    );

                return;
            }

            element._sizeAnimationFrame =
                null;

            // ==================================
            // Complete
            // ==================================

            if (
                typeof onComplete ===
                "function"
            ) {

                onComplete();
            }

            animationLog(
                "END",
                getElementName(element),
                {
                    axis
                }
            );

            resolve();
        }

        element._sizeAnimationFrame =
            requestAnimationFrame(
                frame
            );
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(
    element
) {

    if (!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    const axis =
        getAnimationAxis(element);

    animationLog(
        "EXPAND",
        getElementName(element),
        {
            axis,
            parentLayout:
                getParentLayout(element)
        }
    );

    // ==================================
    // Make visible
    // ==================================

    element.hidden =
        false;

    // ==================================
    // Read natural geometry
    // ==================================

    const natural =
        readGeometry(element);

    const target =
        readTargetGeometry(
            element,
            axis
        );

    const start = {

        width:
            natural.width,

        height:
            natural.height
    };

    // ==================================
    // Collapse only selected axis
    // ==================================

    if (
        axis === "width"
    ) {

        start.width =
            0;
    }

    if (
        axis === "height"
    ) {

        start.height =
            0;
    }

    if (
        axis === "both"
    ) {

        start.width =
            0;

        start.height =
            0;
    }

    // ==================================
    // Prepare geometry
    // ==================================

    freezeGeometry(
        element,
        start,
        axis
    );

    element.offsetWidth;

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        EXPAND_DURATION,
        axis,
        () => {

            clearGeometry(element);
        }
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
) {

    if (!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    const axis =
        getAnimationAxis(element);

    element.hidden =
        false;

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(element);

    const start = {

        width:
            current.width,

        height:
            current.height
    };

    const target = {

        width:
            current.width,

        height:
            current.height
    };

    // ==================================
    // Collapse selected axis only
    // ==================================

    if (
        axis === "width"
    ) {

        target.width =
            0;
    }

    if (
        axis === "height"
    ) {

        target.height =
            0;
    }

    if (
        axis === "both"
    ) {

        target.width =
            0;

        target.height =
            0;
    }

    animationLog(
        "COLLAPSE",
        getElementName(element),
        {
            axis,
            start,
            target
        }
    );

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        COLLAPSE_DURATION,
        axis,
        () => {

            clearGeometry(element);

            element.hidden =
                true;
        }
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(
    element
) {

    if (!element)
        return;

    cancelSizeAnimation(
        element
    );

    const axis =
        getAnimationAxis(element);

    // ==================================
    // Current
    // ==================================

    const current =
        readGeometry(element);

    // ==================================
    // Freeze current geometry
    // ==================================

    freezeGeometry(
        element,
        current,
        axis
    );

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Target
    // ==================================

    const target =
        readTargetGeometry(
            element,
            axis
        );

    // ==================================
    // Compare only active axis
    // ==================================

    let changed =
        false;

    if (
        axis === "width" ||
        axis === "both"
    ) {

        if (
            Math.abs(
                current.width -
                target.width
            ) >= 1
        ) {

            changed = true;
        }
    }

    if (
        axis === "height" ||
        axis === "both"
    ) {

        if (
            Math.abs(
                current.height -
                target.height
            ) >= 1
        ) {

            changed = true;
        }
    }

    // ==================================
    // Nothing changed
    // ==================================

    if (!changed) {

        animationLog(
            "RESIZE SKIPPED",
            getElementName(element),
            {
                axis,
                current,
                target
            }
        );

        clearGeometry(element);

        return;
    }

    // ==================================
    // Animate
    // ==================================

    animationLog(
        "RESIZE",
        getElementName(element),
        {
            axis,
            start: current,
            target
        }
    );

    animateGeometry(
        element,
        current,
        target,
        EXPAND_DURATION,
        axis,
        () => {

            clearGeometry(element);
        }
    );
}
