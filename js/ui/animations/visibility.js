// ======================================
// Visibility animations
// ======================================

const ENTER_VISUAL_DURATION=300;
const EXIT_VISUAL_DURATION=300;

// ======================================
// Show visibility
// ======================================

export function showVisibility(element){

    if(!element)
        return Promise.resolve();

    element.classList.remove(
        "admin-button--hidden"
    );

    element.classList.add(
        "admin-button--entering"
    );

    return new Promise(resolve=>{

        setTimeout(()=>{

            element.classList.remove(
                "admin-button--entering"
            );

            resolve();

        },ENTER_VISUAL_DURATION+20);

    });

}

// ======================================
// Hide visibility
// ======================================

export function hideVisibility(element){

    if(!element)
        return Promise.resolve();

    element.classList.remove(
        "admin-button--hidden"
    );

    element.classList.remove(
        "admin-button--entering"
    );

    element.classList.add(
        "admin-button--exiting"
    );

    return new Promise(resolve=>{

        setTimeout(()=>{

            element.classList.remove(
                "admin-button--exiting"
            );

            element.classList.add(
                "admin-button--hidden"
            );

            resolve();

        },EXIT_VISUAL_DURATION+20);

    });

}
