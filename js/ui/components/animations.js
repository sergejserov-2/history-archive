// ======================================
// Universal block animations
// ======================================
//
// Только геометрия.
//
// Анимируем:
//   width
//   height
//
// Не анимируем:
//   opacity
//   transform
//   margin
//   padding
//
// Геометрия меняется покадрово через
// requestAnimationFrame.
//
// Временно включено расширенное логирование.
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

// Логировать приблизительно раз в 50ms.
const DEBUG_FRAME_INTERVAL = 50;

// ======================================
// Logging
// ======================================

function animationLog(
    ...args
){

    if(!DEBUG_ANIMATIONS)
        return;

    console.log(
        "[animations]",
        ...args
    );

}

// ======================================
// Get element name
// ======================================

function getElementName(
    element
){

    if(!element)
        return "null";

    return (
        element.id
        ||
        element.className
        ||
        element.tagName
        ||
        "element"
    );

}

// ======================================
// Read full debug geometry
// ======================================

function readDebugGeometry(
    element
){

    if(!element){

        return null;

    }

    const rect =
        element.getBoundingClientRect();

    const parent =
        element.parentElement;

    const parentRect =
        parent
            ? parent.getBoundingClientRect()
            : null;

    const bodyRect =
        document.body
            ? document.body.getBoundingClientRect()
            : null;

    const documentElement =
        document.documentElement;

    return {

        // ------------------------------
        // Element
        // ------------------------------

        element: {

            x:
                Number(
                    rect.x.toFixed(2)
                ),

            y:
                Number(
                    rect.y.toFixed(2)
                ),

            top:
                Number(
                    rect.top.toFixed(2)
                ),

            left:
                Number(
                    rect.left.toFixed(2)
                ),

            right:
                Number(
                    rect.right.toFixed(2)
                ),

            bottom:
                Number(
                    rect.bottom.toFixed(2)
                ),

            width:
                Number(
                    rect.width.toFixed(2)
                ),

            height:
                Number(
                    rect.height.toFixed(2)
                )

        },

        // ------------------------------
        // CSS/layout dimensions
        // ------------------------------

        layout: {

            offsetWidth:
                element.offsetWidth,

            offsetHeight:
                element.offsetHeight,

            clientWidth:
                element.clientWidth,

            clientHeight:
                element.clientHeight,

            scrollWidth:
                element.scrollWidth,

            scrollHeight:
                element.scrollHeight

        },

        // ------------------------------
        // Parent
        // ------------------------------

        parent: parent
            ? {

                name:
                    getElementName(parent),

                x:
                    Number(
                        parentRect.x.toFixed(2)
                    ),

                y:
                    Number(
                        parentRect.y.toFixed(2)
                    ),

                width:
                    Number(
                        parentRect.width.toFixed(2)
                    ),

                height:
                    Number(
                        parentRect.height.toFixed(2)
                    ),

                offsetWidth:
                    parent.offsetWidth,

                offsetHeight:
                    parent.offsetHeight,

                clientWidth:
                    parent.clientWidth,

                clientHeight:
                    parent.clientHeight,

                scrollWidth:
                    parent.scrollWidth,

                scrollHeight:
                    parent.scrollHeight

            }
            : null,

        // ------------------------------
        // Body
        // ------------------------------

        body: bodyRect
            ? {

                width:
                    Number(
                        bodyRect.width.toFixed(2)
                    ),

                height:
                    Number(
                        bodyRect.height.toFixed(2)
                    ),

                scrollWidth:
                    document.body.scrollWidth,

                scrollHeight:
                    document.body.scrollHeight,

                clientWidth:
                    document.body.clientWidth,

                clientHeight:
                    document.body.clientHeight

            }
            : null,

        // ------------------------------
        // Document
        // ------------------------------

        document: documentElement
            ? {

                clientWidth:
                    documentElement.clientWidth,

                clientHeight:
                    documentElement.clientHeight,

                scrollWidth:
                    documentElement.scrollWidth,

                scrollHeight:
                    documentElement.scrollHeight

            }
            : null,

        // ------------------------------
        // Viewport
        // ------------------------------

        viewport: {

            width:
                window.innerWidth,

            height:
                window.innerHeight

        },

        // ------------------------------
        // Horizontal page overflow
        // ------------------------------

        horizontalOverflow:
            documentElement
                ? documentElement.scrollWidth >
                  documentElement.clientWidth
                : false

    };

}

// ======================================
// Geometry delta
// ======================================

function geometryDelta(
    previous,
    current
){

    if(!previous || !current)
        return null;

    return {

        element: {

            x:
                Number(
                    (
                        current.element.x -
                        previous.element.x
                    ).toFixed(2)
                ),

            y:
                Number(
                    (
                        current.element.y -
                        previous.element.y
                    ).toFixed(2)
                ),

            width:
                Number(
                    (
                        current.element.width -
                        previous.element.width
                    ).toFixed(2)
                ),

            height:
                Number(
                    (
                        current.element.height -
                        previous.element.height
                    ).toFixed(2)
                )

        },

        parent:
            current.parent &&
            previous.parent
                ? {

                    x:
                        Number(
                            (
                                current.parent.x -
                                previous.parent.x
                            ).toFixed(2)
                        ),

                    y:
                        Number(
                            (
                                current.parent.y -
                                previous.parent.y
                            ).toFixed(2)
                        ),

                    width:
                        Number(
                            (
                                current.parent.width -
                                previous.parent.width
                            ).toFixed(2)
                        ),

                    height:
                        Number(
                            (
                                current.parent.height -
                                previous.parent.height
                            ).toFixed(2)
                        )

                }
                : null,

        body:
            current.body &&
            previous.body
                ? {

                    width:
                        Number(
                            (
                                current.body.width -
                                previous.body.width
                            ).toFixed(2)
                        ),

                    height:
                        Number(
                            (
                                current.body.height -
                                previous.body.height
                            ).toFixed(2)
                        ),

                    scrollWidth:
                        current.body.scrollWidth -
                        previous.body.scrollWidth,

                    scrollHeight:
                        current.body.scrollHeight -
                        previous.body.scrollHeight

                }
                : null,

        document:
            current.document &&
            previous.document
                ? {

                    clientWidth:
                        current.document.clientWidth -
                        previous.document.clientWidth,

                    scrollWidth:
                        current.document.scrollWidth -
                        previous.document.scrollWidth,

                    scrollHeight:
                        current.document.scrollHeight -
                        previous.document.scrollHeight

                }
                : null

    };

}

// ======================================
// Easing
// ======================================
//
// Сейчас deliberately linear.
//
// Это важно для диагностики:
// каждая геометрическая единица проходит
// одинаковое расстояние за одинаковое время.
// ======================================

function linear(
    progress
){

    return progress;

}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(
    element
){

    if(!element)
        return;

    if(
        element._sizeAnimationFrame
    ){

        cancelAnimationFrame(
            element._sizeAnimationFrame
        );

        element._sizeAnimationFrame =
            null;

    }

    if(
        element._sizeAnimationTimer
    ){

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
){

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
// Animate geometry
// ======================================

function animateGeometry(
    element,
    start,
    target,
    duration,
    onComplete
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    animationLog(
        "START",
        getElementName(element),
        {
            start,
            target,
            duration
        }
    );

    element.style.overflow =
        "hidden";

    element.style.width =
        `${start.width}px`;

    element.style.height =
        `${start.height}px`;

    // ==================================
    // Force initial layout
    // ==================================

    element.offsetWidth;

    const startTime =
        performance.now();

    let lastProgress =
        0;

    let lastDebugTime =
        -DEBUG_FRAME_INTERVAL;

    let previousDebugGeometry =
        readDebugGeometry(
            element
        );

    return new Promise(resolve=>{

        function frame(
            now
        ){

            const elapsed =
                now -
                startTime;

            let progress =
                elapsed /
                duration;

            if(progress > 1)
                progress = 1;

            if(progress < 0)
                progress = 0;

            const eased =
                linear(progress);

            const width =
                start.width +
                (
                    target.width -
                    start.width
                ) *
                eased;

            const height =
                start.height +
                (
                    target.height -
                    start.height
                ) *
                eased;

            element.style.width =
                `${width}px`;

            element.style.height =
                `${height}px`;

            // ==================================
            // Debug geometry
            // ==================================

            if(
                DEBUG_ANIMATIONS
                &&
                (
                    now -
                    lastDebugTime
                    >=
                    DEBUG_FRAME_INTERVAL
                    ||
                    progress === 1
                )
            ){

                const currentDebugGeometry =
                    readDebugGeometry(
                        element
                    );

                const delta =
                    geometryDelta(
                        previousDebugGeometry,
                        currentDebugGeometry
                    );

                const progressDelta =
                    progress -
                    lastProgress;

                animationLog(
                    "FRAME",
                    getElementName(element),
                    {

                        elapsed:
                            Math.round(
                                elapsed
                            ),

                        progress:
                            Number(
                                progress.toFixed(3)
                            ),

                        progressDelta:
                            Number(
                                progressDelta.toFixed(4)
                            ),

                        // ----------------------
                        // Requested animation
                        // ----------------------

                        animation: {

                            width:
                                Number(
                                    width.toFixed(2)
                                ),

                            height:
                                Number(
                                    height.toFixed(2)
                                )

                        },

                        // ----------------------
                        // Actual geometry
                        // ----------------------

                        geometry:
                            currentDebugGeometry,

                        // ----------------------
                        // Geometry change
                        // ----------------------

                        delta

                    }
                );

                // ==================================
                // Explicit warning
                // ==================================

                if(
                    delta
                    &&
                    delta.parent
                    &&
                    (
                        Math.abs(
                            delta.parent.width
                        ) > 0.5
                        ||
                        Math.abs(
                            delta.parent.height
                        ) > 0.5
                        ||
                        Math.abs(
                            delta.parent.x
                        ) > 0.5
                        ||
                        Math.abs(
                            delta.parent.y
                        ) > 0.5
                    )
                ){

                    animationLog(
                        "PARENT MOVED",
                        getElementName(element),
                        {
                            parent:
                                currentDebugGeometry.parent,

                            delta:
                                delta.parent
                        }
                    );

                }

                if(
                    delta
                    &&
                    delta.body
                    &&
                    (
                        delta.body.width !== 0
                        ||
                        delta.body.scrollWidth !== 0
                        ||
                        delta.body.height !== 0
                        ||
                        delta.body.scrollHeight !== 0
                    )
                ){

                    animationLog(
                        "PAGE GEOMETRY CHANGED",
                        getElementName(element),
                        {
                            body:
                                currentDebugGeometry.body,

                            document:
                                currentDebugGeometry.document,

                            delta: {

                                body:
                                    delta.body,

                                document:
                                    delta.document

                            }

                        }
                    );

                }

                if(
                    currentDebugGeometry
                    &&
                    currentDebugGeometry.horizontalOverflow
                ){

                    animationLog(
                        "HORIZONTAL OVERFLOW",
                        getElementName(element),
                        {
                            document:
                                currentDebugGeometry.document,

                            body:
                                currentDebugGeometry.body,

                            viewport:
                                currentDebugGeometry.viewport
                        }
                    );

                }

                previousDebugGeometry =
                    currentDebugGeometry;

                lastDebugTime =
                    now;

            }

            lastProgress =
                progress;

            if(
                progress <
                1
            ){

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

            if(
                typeof onComplete ===
                "function"
            ){

                onComplete();

            }

            animationLog(
                "END",
                getElementName(element),
                {
                    finalGeometry:
                        readDebugGeometry(
                            element
                        )
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
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Make visible for measurement
    // ==================================

    element.hidden =
        false;

    // ==================================
    // Read natural geometry
    // ==================================

    const natural =
        readGeometry(
            element
        );

    const target = {

        width:
            natural.width,

        height:
            element.scrollHeight

    };

    const start = {

        width:
            natural.width,

        height:
            0

    };

    animationLog(
        "EXPAND",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
        }
    );

    // ==================================
    // Prepare
    // ==================================

    element.style.width =
        `${start.width}px`;

    element.style.height =
        "0px";

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}

// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    element.hidden =
        false;

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    const start = {

        width:
            current.width,

        height:
            current.height

    };

    const target = {

        width:
            0,

        height:
            0

    };

    animationLog(
        "COLLAPSE",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
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
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

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
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    // ==================================
    // Freeze current geometry
    // ==================================

    element.style.widthnalGeometry:
                        readDebugGeometry(
                            element
                        )
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
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Make visible for measurement
    // ==================================

    element.hidden =
        false;

    // ==================================
    // Read natural geometry
    // ==================================

    const natural =
        readGeometry(
            element
        );

    const target = {

        width:
            natural.width,

        height:
            element.scrollHeight

    };

    const start = {

        width:
            natural.width,

        height:
            0

    };

    animationLog(
        "EXPAND",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
        }
    );

    // ==================================
    // Prepare
    // ==================================

    element.style.width =
        `${start.width}px`;

    element.style.height =
        "0px";

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}

// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    element.hidden =
        false;

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    const start = {

        width:
            current.width,

        height:
            current.height

    };

    const target = {

        width:
            0,

        height:
            0

    };

    animationLog(
        "COLLAPSE",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
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
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

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
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    // ==================================
    // Freeze current geometry
    // ==================================

    element.style.widthnalGeometry:
                        readDebugGeometry(
                            element
                        )
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
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Make visible for measurement
    // ==================================

    element.hidden =
        false;

    // ==================================
    // Read natural geometry
    // ==================================

    const natural =
        readGeometry(
            element
        );

    const target = {

        width:
            natural.width,

        height:
            element.scrollHeight

    };

    const start = {

        width:
            natural.width,

        height:
            0

    };

    animationLog(
        "EXPAND",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
        }
    );

    // ==================================
    // Prepare
    // ==================================

    element.style.width =
        `${start.width}px`;

    element.style.height =
        "0px";

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}

// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    element.hidden =
        false;

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    const start = {

        width:
            current.width,

        height:
            current.height

    };

    const target = {

        width:
            0,

        height:
            0

    };

    animationLog(
        "COLLAPSE",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
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
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

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
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    // ==================================
    // Freeze current geometry
    // ==================================

    element.style.widthnalGeometry:
                        readDebugGeometry(
                            element
                        )
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
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Make visible for measurement
    // ==================================

    element.hidden =
        false;

    // ==================================
    // Read natural geometry
    // ==================================

    const natural =
        readGeometry(
            element
        );

    const target = {

        width:
            natural.width,

        height:
            element.scrollHeight

    };

    const start = {

        width:
            natural.width,

        height:
            0

    };

    animationLog(
        "EXPAND",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
        }
    );

    // ==================================
    // Prepare
    // ==================================

    element.style.width =
        `${start.width}px`;

    element.style.height =
        "0px";

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Animate
    // ==================================

    return animateGeometry(
        element,
        start,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}

// ======================================
// Collapse
// ======================================

export function animateCollapse(
    element
){

    if(!element)
        return Promise.resolve();

    cancelSizeAnimation(
        element
    );

    element.hidden =
        false;

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    const start = {

        width:
            current.width,

        height:
            current.height

    };

    const target = {

        width:
            0,

        height:
            0

    };

    animationLog(
        "COLLAPSE",
        getElementName(element),
        {
            start,
            target,

            before:
                readDebugGeometry(
                    element
                )
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
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

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
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
    );

    // ==================================
    // Read current geometry
    // ==================================

    const current =
        readGeometry(
            element
        );

    // ==================================
    // Freeze current geometry
    // ==================================

    element.style.width=
        `${current.width}px`;

    element.style.height =
        `${current.height}px`;

    element.style.overflow =
        "hidden";

    element.offsetWidth;

    // ==================================
    // Read target geometry
    // ==================================

    const target = {

        width:
            element.scrollWidth,

        height:
            element.scrollHeight

    };

    // ==================================
    // Nothing changed
    // ==================================

    if(
        Math.abs(
            current.width -
            target.width
        ) < 1
        &&
        Math.abs(
            current.height -
            target.height
        ) < 1
    ){

        animationLog(
            "RESIZE SKIPPED",
            getElementName(element),
            {
                current,
                target
            }
        );

        element.style.width =
            "";

        element.style.height =
            "";

        element.style.overflow =
            "";

        return;

    }

    // ==================================
    // Animate
    // ==================================

    animationLog(
        "RESIZE",
        getElementName(element),
        {
            start: current,
            target,

            before:
                readDebugGeometry(
                    element
                )
        }
    );

    animateGeometry(
        element,
        current,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width =
                "";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}
