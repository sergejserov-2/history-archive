// ======================================
// Universal geometry animations
// ======================================

const ANIMATION_DURATION = 350;
const EASING = "cubic-bezier(.25,.8,.25,1)";

// ======================================
// Helpers
// ======================================

function getName(el) {
    return el?.id || el?.className || el?.tagName || "element";
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

    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("transition");

    console.log("[animations] CANCEL", getName(el));
}

// ======================================
// Apply margins
// ======================================

function setMargins(el, top, left) {
    el.style.setProperty(
        "margin-top",
        `${top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${left}px`,
        "important"
    );
}

// ======================================
// Animate margins
// ======================================

function animateMargins(
    el,
    startTop,
    startLeft,
    targetTop,
    targetLeft,
    duration
) {
    cancelSizeAnimation(el);

    console.log("[animations] START", getName(el), {
        startTop,
        startLeft,
        targetTop,
        targetLeft
    });

    // Начальное положение
    setMargins(
        el,
        startTop,
        startLeft
    );

    // Принудительно применяем начальное состояние
    el.offsetWidth;

    return new Promise(resolve => {

        const startTime = performance.now();

        function frame(now) {

            const progress = Math.min(
                1,
                (now - startTime) / duration
            );

            const top =
                startTop +
                (targetTop - startTop) * progress;

            const left =
                startLeft +
                (targetLeft - startLeft) * progress;

            setMargins(
                el,
                top,
                left
            );

            if (progress < 1) {

                el._animationFrame =
                    requestAnimationFrame(frame);

                return;
            }

            el._animationFrame = null;

            // Оставляем итоговое положение на короткий момент,
            // затем очищаем inline-style.
            setMargins(
                el,
                targetTop,
                targetLeft
            );

            el._animationTimer = setTimeout(() => {

                el._animationTimer = null;

                el.style.removeProperty("margin-top");
                el.style.removeProperty("margin-left");

                console.log(
                    "[animations] END",
                    getName(el)
                );

                resolve();

            }, 20);
        }

        el._animationFrame =
            requestAnimationFrame(frame);
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    console.log(
        "[animations] EXPAND",
        getName(el)
    );

    return animateMargins(
        el,

        -300, // start top
        -300, // start left

        0,
        0,

        ANIMATION_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el) {
    if (!el) return Promise.resolve();

    cancelSizeAnimation(el);

    console.log(
        "[animations] COLLAPSE",
        getName(el)
    );

    return animateMargins(
        el,

        0,
        0,

        -300,
        -300,

        ANIMATION_DURATION
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(el) {
    if (!el) return Promise.resolve();

    // Пока resize нам вообще не нужен.
    // Оставляем элемент на месте.
    console.log(
        "[animations] RESIZE",
        getName(el)
    );

    return Promise.resolve();
}
