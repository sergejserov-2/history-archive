// ======================================
// Universal animations
// ======================================


// ======================================
// Constants
// ======================================

const DEFAULT_DURATION = 300;


// ======================================
// Helpers
// ======================================

function nextFrame(callback){

    requestAnimationFrame(()=>{

        requestAnimationFrame(callback);

    });

}


function getDuration(element, duration){

    if(duration != null)
        return duration;

    const value =
        getComputedStyle(element)
            .getPropertyValue(
                "--animation-duration"
            );

    const parsed =
        parseFloat(value);

    return Number.isFinite(parsed)
        ? parsed
        : DEFAULT_DURATION;

}


// ======================================
// Prepare
// ======================================

function prepareElement(element){

    if(!element)
        return;

    element.style.overflow =
        "hidden";

}


// ======================================
// Clear
// ======================================

function clearAnimationStyles(element){

    if(!element)
        return;

    element.style.height = "";

    element.style.overflow = "";

    element.style.transition = "";

}


// ======================================
// Expand
// ======================================

export function expand(
    element,
    options={}
){

    if(!element)
        return Promise.resolve();

    const duration =
        getDuration(
            element,
            options.duration
        );

    prepareElement(element);

    // Если hidden — сначала показываем
    if(element.hidden){

        element.hidden = false;

    }

    // Убираем старое состояние
    element.classList.remove(
        "block-collapsed"
    );

    // Начинаем с нулевой высоты
    element.style.height =
        "0px";

    // Принудительно фиксируем
    // начальное состояние
    element.offsetHeight;

    return new Promise(resolve=>{

        const finish = ()=>{

            element.removeEventListener(
                "transitionend",
                onTransitionEnd
            );

            element.style.height =
                "auto";

            element.style.transition =
                "";

            element.style.overflow =
                "";

            resolve();

        };

        const onTransitionEnd = event=>{

            if(
                event.propertyName !==
                "height"
            ){

                return;

            }

            finish();

        };

        element.addEventListener(
            "transitionend",
            onTransitionEnd
        );

        // Получаем реальную высоту
        // уже после того, как элемент видим
        const height =
            element.scrollHeight;

        element.style.transition =
            `height ${duration}ms cubic-bezier(.34,1.56,.64,1)`;

        nextFrame(()=>{

            element.style.height =
                `${height}px`;

        });

        // Резерв
        setTimeout(
            finish,
            duration + 50
        );

    });

}


// ======================================
// Collapse
// ======================================

export function collapse(
    element,
    options={}
){

    if(!element)
        return Promise.resolve();

    // Если уже hidden — ничего делать
    if(element.hidden)
        return Promise.resolve();

    const duration =
        getDuration(
            element,
            options.duration
        );

    prepareElement(element);

    // Текущая реальная высота
    const height =
        element.scrollHeight;

    // Фиксируем её
    element.style.height =
        `${height}px`;

    // Принудительный reflow
    element.offsetHeight;

    return new Promise(resolve=>{

        let finished = false;

        const finish = ()=>{

            if(finished)
                return;

            finished = true;

            element.removeEventListener(
                "transitionend",
                onTransitionEnd
            );

            element.hidden = true;

            element.classList.add(
                "block-collapsed"
            );

            clearAnimationStyles(
                element
            );

            resolve();

        };

        const onTransitionEnd = event=>{

            if(
                event.propertyName !==
                "height"
            ){

                return;

            }

            finish();

        };

        element.addEventListener(
            "transitionend",
            onTransitionEnd
        );

        element.style.transition =
            `height ${duration}ms cubic-bezier(.4,0,.7,1)`;

        nextFrame(()=>{

            element.style.height =
                "0px";

        });

        // Резерв
        setTimeout(
            finish,
            duration + 50
        );

    });

}


// ======================================
// Toggle
// ======================================

export function toggle(
    element,
    visible,
    options={}
){

    return visible
        ? expand(element, options)
        : collapse(element, options);

}


// ======================================
// Animate height change
// ======================================

export function animateHeight(
    element,
    callback,
    options={}
){

    if(!element)
        return Promise.resolve();

    if(element.hidden){

        callback?.();

        return Promise.resolve();

    }

    const duration =
        getDuration(
            element,
            options.duration
        );

    prepareElement(element);

    // Старая высота
    const oldHeight =
        element.scrollHeight;

    // Фиксируем старую высоту
    element.style.height =
        `${oldHeight}px`;

    // Меняем содержимое
    callback?.();

    // Получаем новую высоту
    const newHeight =
        element.scrollHeight;

    // Если высота не изменилась —
    // ничего анимировать не нужно
    if(oldHeight === newHeight){

        element.style.height =
            "auto";

        element.style.overflow =
            "";

        return Promise.resolve();

    }

    // Снова принудительно фиксируем
    // старое состояние
    element.style.height =
        `${oldHeight}px`;

    element.offsetHeight;

    return new Promise(resolve=>{

        let finished = false;

        const finish = ()=>{

            if(finished)
                return;

            finished = true;

            element.removeEventListener(
                "transitionend",
                onTransitionEnd
            );

            element.style.height =
                "auto";

            element.style.overflow =
                "";

            element.style.transition =
                "";

            resolve();

        };

        const onTransitionEnd = event=>{

            if(
                event.propertyName !==
                "height"
            ){

                return;

            }

            finish();

        };

        element.addEventListener(
            "transitionend",
            onTransitionEnd
        );

        element.style.transition =
            `height ${duration}ms cubic-bezier(.34,1.56,.64,1)`;

        nextFrame(()=>{

            element.style.height =
                `${newHeight}px`;

        });

        setTimeout(
            finish,
            duration + 50
        );

    });

}


// ======================================
// Insert + expand
// ======================================

export function insertAnimated(
    container,
    html,
    options={}
){

    if(!container)
        return null;

    container.insertAdjacentHTML(
        "beforeend",
        html
    );

    const element =
        container.lastElementChild;

    if(!element)
        return null;

    // Начальное состояние
    element.hidden = false;

    element.style.height =
        "0px";

    element.style.overflow =
        "hidden";

    element.classList.add(
        "block-collapsed"
    );

    // Первый кадр:
    // элемент существует,
    // но имеет высоту 0.
    requestAnimationFrame(()=>{

        expand(
            element,
            options
        );

    });

    return element;

}


// ======================================
// Replace content with height animation
// ======================================

export function replaceAnimated(
    element,
    html,
    options={}
){

    if(!element)
        return Promise.resolve();

    return animateHeight(
        element,
        ()=>{

            element.innerHTML =
                html;

        },
        options
    );

}


// ======================================
// Remove with collapse
// ======================================

export function removeAnimated(
    element,
    options={}
){

    if(!element)
        return Promise.resolve();

    return collapse(
        element,
        options
    )
    .then(()=>{

        element.remove();

    });

}


// ======================================
// Reset
// ======================================

export function resetAnimation(
    element
){

    if(!element)
        return;

    clearAnimationStyles(
        element
    );

    element.classList.remove(
        "block-collapsed"
    );

}
