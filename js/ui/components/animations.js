// ======================================
// Universal geometry animations
// TEST VERSION — BEFORE / AFTER LAYOUT
// ======================================

const EXPAND_DURATION = 1400;
const COLLAPSE_DURATION = 1400;

const EASING = "cubic-bezier(.25,.8,.25,1)";

// ======================================
// Helpers
// ======================================

function getName(el) {
    return el?.id || el?.className || el?.tagName || "element";
}

function getGeometry(el) {
    if (!el) return null;

    const r = el.getBoundingClientRect();

    return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height
    };
}

function forceLayout() {
    document.documentElement.offsetHeight;
}

function getParent(el) {
    return el?.parentElement || null;
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el) {
    if (!el) return;

    const animation = el._layoutAnimation;

    if (animation) {
        animation.cancel();
        el._layoutAnimation = null;
    }

    const parent = getParent(el);

    if (parent?._layoutAnimation) {
        parent._layoutAnimation.cancel();
        parent._layoutAnimation = null;
    }

    if (parent) {
        parent.style.width = "";
        parent.style.height = "";
        parent.style.transition = "";
        parent.style.overflow = "";
        parent.style.transform = "";
    }
}

// ======================================
// Measure parent BEFORE / AFTER
// ======================================

function measureParentBefore(el) {
    const parent = getParent(el);

    if (!parent) return null;

    forceLayout();

    return getGeometry(parent);
}

function measureParentAfter(el) {
    const parent = getParent(el);

    if (!parent) return null;

    forceLayout();

    return getGeometry(parent);
}

// ======================================
// Animate parent geometry
// ======================================

function animateParent(
    parent,
    before,
    after,
    duration
) {
    if (!parent || !before || !after)
        return Promise.resolve();

    const widthChanged =
        Math.abs(before.width - after.width) > 0.5;

    const heightChanged =
        Math.abs(before.height - after.height) > 0.5;

    const xChanged =
        Math.abs(before.x - after.x) > 0.5;

    const yChanged =
        Math.abs(before.y - after.y) > 0.5;

    if (
        !widthChanged &&
        !heightChanged &&
        !xChanged &&
        !yChanged
    ) {
        return Promise.resolve();
    }

    /*
     * ВАЖНО:
     *
     * Сначала фиксируем BEFORE.
     *
     * Сам DOM уже находится в AFTER,
     * но визуально родитель остаётся
     * в старой геометрии.
     */

    parent.style.overflow = "hidden";

    parent.style.width =
        `${before.width}px`;

    parent.style.height =
        `${before.height}px`;

    forceLayout();

    /*
     * Считаем смещение между двумя
     * состояниями.
     *
     * Это нужно потому, что изменение
     * layout может сдвинуть самого
     * родителя относительно viewport.
     */

    const dx =
        before.x - after.x;

    const dy =
        before.y - after.y;

    if (xChanged || yChanged) {
        parent.style.transform =
            `translate(${dx}px, ${dy}px)`;
    }

    forceLayout();

    return new Promise(resolve => {

        const animation =
            parent.animate(
                [
                    {
                        width:
                            `${before.width}px`,

                        height:
                            `${before.height}px`,

                        transform:
                            `translate(${dx}px, ${dy}px)`
                    },

                    {
                        width:
                            `${after.width}px`,

                        height:
                            `${after.height}px`,

                        transform:
                            "translate(0, 0)"
                    }
                ],
                {
                    duration,
                    easing: EASING,
                    fill: "forwards"
                }
            );

        parent._layoutAnimation =
            animation;

        animation.finished
            .then(() => {

                if (
                    parent._layoutAnimation !==
                    animation
                )
                    return;

                parent._layoutAnimation = null;

                /*
                 * После завершения возвращаем
                 * управление CSS обратно.
                 */

                parent.style.width = "";
                parent.style.height = "";
                parent.style.transform = "";
                parent.style.overflow = "";

                resolve();
            })
            .catch(() => {

                if (
                    parent._layoutAnimation ===
                    animation
                ) {
                    parent._layoutAnimation = null;
                }

                parent.style.width = "";
                parent.style.height = "";
                parent.style.transform = "";
                parent.style.overflow = "";

                resolve();
            });
    });
}

// ======================================
// EXPAND
// ======================================

export function animateExpand(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const parent = getParent(el);

    if (!parent) {
        el.hidden = false;
        return Promise.resolve();
    }

    /*
     * 1. Снимаем состояние ДО.
     */

    const before =
        measureParentBefore(el);

    /*
     * 2. Показываем элемент.
     *
     * Здесь происходит настоящий layout.
     */

    el.hidden = false;

    forceLayout();

    /*
     * 3. Снимаем состояние ПОСЛЕ.
     */

    const after =
        measureParentAfter(el);

    /*
     * 4. Теперь layout уже AFTER.
     *
     * Возвращаем родителя визуально
     * в BEFORE и плавно ведём к AFTER.
     */

    return animateParent(
        parent,
        before,
        after,
        EXPAND_DURATION
    );
}

// ======================================
// COLLAPSE
// ======================================

export function animateCollapse(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const parent = getParent(el);

    if (!parent) {
        el.hidden = true;
        return Promise.resolve();
    }

    /*
     * 1. Состояние ДО.
     */

    const before =
        measureParentBefore(el);

    /*
     * 2. Сначала убираем элемент
     * из layout.
     */

    el.hidden = true;

    forceLayout();

    /*
     * 3. Состояние ПОСЛЕ.
     */

    const after =
        measureParentAfter(el);

    /*
     * 4. Родитель плавно переходит
     * BEFORE → AFTER.
     */

    return animateParent(
        parent,
        before,
        after,
        COLLAPSE_DURATION
    );
}

// ======================================
// RESIZE
// ======================================

export function animateResize(el) {
    if (!el)
        return Promise.resolve();

    cancelSizeAnimation(el);

    const parent = getParent(el);

    if (!parent)
        return Promise.resolve();

    /*
     * Для resize элемент остаётся
     * видимым.
     *
     * Меняется только его содержимое /
     * естественный layout.
     */

    const before =
        measureParentBefore(el);

    /*
     * Форсируем пересчёт естественной
     * геометрии.
     */

    forceLayout();

    const after =
        measureParentAfter(el);

    return animateParent(
        parent,
        before,
        after,
        EXPAND_DURATION
    );
}
