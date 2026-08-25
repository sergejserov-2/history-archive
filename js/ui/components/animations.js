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
// Временно включено логирование.
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
// Easing
// ======================================
//
// Сейчас deliberately linear.
//
// Это важно для диагностики:
// каждая геометрическая единица проходит
// одинаковое расстояние за одинаковое время.
//
// Позже можем вернуть нужную кривую,
// когда найдём источник рывка.
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
            // Debug
            // ==================================

            if(DEBUG_ANIMATIONS){

                const progressDelta =
                    progress -
                    lastProgress;

                // Логируем не каждый кадр,
                // а примерно каждые 50ms.
                if(
                    progress === 1
                    ||
                    Math.floor(
                        elapsed / 50
                    )
                    !==
                    Math.floor(
                        (
                            elapsed -
                            16
                        ) / 50
                    )
                ){

                    animationLog(
                        "FRAME",
                        getElementName(element),
                        {
                            elapsed:
                                Math.round(elapsed),

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

                            progressDelta:
                                Number(
                                    progressDelta.toFixed(4)
                                )
                        }
                    );

                }

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
                getElementName(element)
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
            target
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

    element.style.width =
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
            target
        }
    );

    animateGeometry(
        element,
        current,
        target,
        EXPAND_DURATION,
        ()=>{

            element.style.width ="";

            element.style.height =
                "";

            element.style.overflow =
                "";

        }
    );

}
