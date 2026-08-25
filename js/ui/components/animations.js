// ======================================
// Universal block animations
// ======================================
//
// Универсальная геометрическая анимация.
//
// Управляет:
//   width
//   height
//   flex-basis
//
// Не управляет:
//   opacity
//   transform
//   margin
//   padding
//
// Подходит для:
//   - вертикальных блоков
//   - горизонтальных flex-галерей
//   - карточек
//   - add-блоков
//   - кнопок
//
// ======================================

const EXPAND_DURATION = 320;
const COLLAPSE_DURATION = 300;

// ======================================
// Helpers
// ======================================

function px(value){

    const number =
        parseFloat(value);

    return Number.isFinite(number)
        ? number
        : 0;

}

// ======================================
// Read current geometry
// ======================================

function getGeometry(
    element
){

    const rect =
        element.getBoundingClientRect();

    const computed =
        window.getComputedStyle(
            element
        );

    return {

        width:
            rect.width,

        height:
            rect.height,

        flexBasis:
            computed.flexBasis

    };

}

// ======================================
// Get natural geometry
// ======================================

function getNaturalGeometry(
    element
){

    const computed =
        window.getComputedStyle(
            element
        );

    // ----------------------------------
    // Remember inline values
    // ----------------------------------

    const previousWidth =
        element.style.width;

    const previousHeight =
        element.style.height;

    const previousFlexBasis =
        element.style.flexBasis;

    const previousPosition =
        element.style.position;

    const previousVisibility =
        element.style.visibility;

    // ----------------------------------
    // Remove animation geometry
    // ----------------------------------

    element.style.width =
        "";

    element.style.height =
        "";

    element.style.flexBasis =
        "";

    element.style.visibility =
        "hidden";

    // ----------------------------------
    // Force layout
    // ----------------------------------

    element.offsetHeight;

    const rect =
        element.getBoundingClientRect();

    const naturalWidth =
        rect.width;

    const naturalHeight =
        rect.height;

    const naturalFlexBasis =
        window.getComputedStyle(
            element
        ).flexBasis;

    // ----------------------------------
    // Restore
    // ----------------------------------

    element.style.width =
        previousWidth;

    element.style.height =
        previousHeight;

    element.style.flexBasis =
        previousFlexBasis;

    element.style.position =
        previousPosition;

    element.style.visibility =
        previousVisibility;

    return {

        width:
            naturalWidth,

        height:
            naturalHeight,

        flexBasis:
            naturalFlexBasis

    };

}

// ======================================
// Apply geometry
// ======================================

function setGeometry(
    element,
    geometry
){

    element.style.width =
        `${geometry.width}px`;

    element.style.height =
        `${geometry.height}px`;

    // flex-basis может быть:
    //
    // auto
    // content
    // 0
    // 150px
    //
    // Для числового значения
    // используем пиксели.

    if(
        geometry.flexBasis !==
        "auto" &&
        geometry.flexBasis !==
        "content"
    ){

        const basis =
            parseFloat(
                geometry.flexBasis
            );

        if(
            Number.isFinite(basis)
        ){

            element.style.flexBasis =
                `${basis}px`;

        }

    }

}

// ======================================
// Apply collapsed geometry
// ======================================

function setCollapsedGeometry(
    element
){

    element.style.width =
        "0px";

    element.style.height =
        "0px";

    element.style.flexBasis =
        "0px";

}

// ======================================
// Clear geometry
// ======================================

function clearGeometry(
    element
){

    element.style.width =
        "";

    element.style.height =
        "";

    element.style.flexBasis =
        "";

    element.style.transition =
        "";

    element.style.overflow =
        "";

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

    // ----------------------------------
    // Make element measurable
    // ----------------------------------

    element.hidden =
        false;

    // ----------------------------------
    // Calculate natural size FIRST
    // ----------------------------------

    const natural =
        getNaturalGeometry(
            element
        );

    // ----------------------------------
    // Start from zero
    // ----------------------------------

    element.style.overflow =
        "hidden";

    setCollapsedGeometry(
        element
    );

    // ----------------------------------
    // Force initial layout
    // ----------------------------------

    element.offsetHeight;

    // ----------------------------------
    // Transition
    // ----------------------------------

    element.style.transition = `
        width ${EXPAND_DURATION}ms ease,
        height ${EXPAND_DURATION}ms ease,
        flex-basis ${EXPAND_DURATION}ms ease
    `;

    // ----------------------------------
    // Animate
    // ----------------------------------

    requestAnimationFrame(()=>{

        element.style.width =
            `${natural.width}px`;

        element.style.height =
            `${natural.height}px`;

        if(
            natural.flexBasis !==
            "auto" &&
            natural.flexBasis !==
            "content"
        ){

            const basis =
                parseFloat(
                    natural.flexBasis
                );

            if(
                Number.isFinite(basis)
            ){

                element.style.flexBasis =
                    `${basis}px`;

            }

        }

    });

    return new Promise(
        resolve => {

            element._sizeAnimationTimer =
                setTimeout(()=>{

                    clearGeometry(
                        element
                    );

                    element._sizeAnimationTimer =
                        null;

                    resolve();

                },
                EXPAND_DURATION + 20
            );

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

    // ----------------------------------
    // Make element measurable
    // ----------------------------------

    element.hidden =
        false;

    // ----------------------------------
    // Read CURRENT geometry
    // ----------------------------------

    const current =
        getGeometry(
            element
        );

    // ----------------------------------
    // Fix current geometry
    // ----------------------------------

    element.style.overflow =
        "hidden";

    setGeometry(
        element,
        current
    );

    // ----------------------------------
    // Force layout
    // ----------------------------------

    element.offsetHeight;

    // ----------------------------------
    // Transition
    // ----------------------------------

    element.style.transition = `
        width ${COLLAPSE_DURATION}ms ease,
        height ${COLLAPSE_DURATION}ms ease,
        flex-basis ${COLLAPSE_DURATION}ms ease
    `;

    // ----------------------------------
    // Animate to zero
    // ----------------------------------

    requestAnimationFrame(()=>{

        setCollapsedGeometry(
            element
        );

    });

    return new Promise(
        resolve => {

            element._sizeAnimationTimer =
                setTimeout(()=>{

                    clearGeometry(
                        element
                    );

                    element.hidden =
                        true;

                    element._sizeAnimationTimer =
                        null;

                    resolve();

                },
                COLLAPSE_DURATION + 20
            );

        }
    );

}

// ======================================
// Resize
// ======================================
//
// Используется, когда содержимое уже
// показанного блока изменило размер.
//
// Например:
//
// добавилась фотография
// удалился элемент
// изменился текст
//
// ======================================

export function animateResize(
    element
){

    if(!element)
        return;

    cancelSizeAnimation(
        element
    );

    // ----------------------------------
    // Current geometry
    // ----------------------------------

    const current =
        getGeometry(
            element
        );

    // ----------------------------------
    // Natural geometry
    // ----------------------------------

    const natural =
        getNaturalGeometry(
            element
        );

    // ----------------------------------
    // Nothing changed
    // ----------------------------------

    const widthChanged =
        Math.abs(
            current.width -
            natural.width
        ) > 0.5;

    const heightChanged =
        Math.abs(
            current.height -
            natural.height
        ) > 0.5;

    if(
        !widthChanged &&
        !heightChanged
    ){

        clearGeometry(
            element
        );

        return;

    }

    // ----------------------------------
    // Fix current geometry
    // ----------------------------------

    element.style.overflow =
        "hidden";

    setGeometry(
        element,
        current
    );

    // ----------------------------------
    // Force layout
    // ----------------------------------

    element.offsetHeight;

    // ----------------------------------
    // Transition
    // ----------------------------------

    element.style.transition = `
        width ${EXPAND_DURATION}ms ease,
        height ${EXPAND_DURATION}ms ease,
        flex-basis ${EXPAND_DURATION}ms ease
    `;

    // ----------------------------------
    // Animate
    // ----------------------------------

    requestAnimationFrame(()=>{

        element.style.width =
            `${natural.width}px`;

        element.style.height =
            `${natural.height}px`;

        if(
            natural.flexBasis !==
            "auto" &&
            natural.flexBasis !==
            "content"
        ){

            const basis =
                parseFloat(
                    natural.flexBasis
                );

            if(
                Number.isFinite(basis)
            ){

                element.style.flexBasis =
                    `${basis}px`;

            }

        }

    });

    element._sizeAnimationTimer =
        setTimeout(()=>{

            clearGeometry(
                element
            );

            element._sizeAnimationTimer =
                null;

        },
        EXPAND_DURATION + 20
    );

}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(
    element
){

    if(!element)
        return;

    // ----------------------------------
    // Stop timer
    // ----------------------------------

    if(
        element._sizeAnimationTimer
    ){

        clearTimeout(
            element._sizeAnimationTimer
        );

        element._sizeAnimationTimer =
            null;

    }

    // ----------------------------------
    // Freeze current geometry
    // ----------------------------------
    //
    // ВАЖНО:
    //
    // transition просто удалять сразу
    // нельзя, если элемент находится
    // посреди анимации.
    //
    // Поэтому сначала фиксируем
    // фактический текущий размер.

    const rect =
        element.getBoundingClientRect();

    if(
        rect.width > 0
    ){

        element.style.width =
            `${rect.width}px`;

    }

    if(
        rect.height > 0
    ){

        element.style.height =
            `${rect.height}px`;

    }

    // ----------------------------------
    // Freeze flex-basis
    // ----------------------------------

    const computed =
        window.getComputedStyle(
            element
        );

    if(
        computed.flexBasis !==
        "auto" &&
        computed.flexBasis !==
        "content"
    ){

        const basis =
            parseFloat(
                computed.flexBasis
            );

        if(
            Number.isFinite(basis)
        ){

            element.style.flexBasis =
                `${basis}px`;

        }

    }

    // ----------------------------------
    // Remove transition
    // ----------------------------------

    element.style.transition =
        "";

}
