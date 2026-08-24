import {
    animateExpand,
    animateCollapse
} from "./animations.js";


// ======================================
// Durations
// ======================================

const ENTER_DELAY = 10;
const ENTER_VISUAL_DURATION = 300;

const EXIT_VISUAL_DURATION = 300;
const EXIT_DELAY = 10;


// ======================================
// Small button size
// ======================================

const SMALL_BUTTON_WIDTH = "22px";
const SMALL_BUTTON_HEIGHT = "22px";


// ======================================
// Expandable admin blocks
// ======================================

function isExpandableAdminBlock(
    element
){

    if(!element)
        return false;


    return (
        element.classList.contains(
            "entity-list__add"
        )
        ||
        element.classList.contains(
            "photo-card--add"
        )
        ||
        element.classList.contains(
            "source--add"
        )
        ||
        element.classList.contains(
            "child-card--add"
        )
    );

}


// ======================================
// Small admin button
// ======================================

function isSmallAdminButton(
    element
){

    if(!element)
        return false;


    return (
        element.matches(
            "button.admin-button"
        )
        ||
        element.classList.contains(
            "header__button--admin"
        )
    );

}


// ======================================
// Prepare small button geometry
// ======================================

function prepareSmallButtonForExpand(
    button
){

    const computed =
        window.getComputedStyle(
            button
        );


    const targetWidth =
        computed.width ||
        SMALL_BUTTON_WIDTH;

    const targetHeight =
        computed.height ||
        SMALL_BUTTON_HEIGHT;


    button.style.overflow =
        "hidden";

    button.style.width =
        "0px";

    button.style.height =
        "0px";


    button.style.padding =
        "0px";


    button.offsetHeight;


    return {
        targetWidth,
        targetHeight
    };

}


// ======================================
// Expand small button
// ======================================

function animateSmallExpand(
    button
){

    const {
        targetWidth,
        targetHeight
    } =
        prepareSmallButtonForExpand(
            button
        );


    button.style.transition = `
        width 320ms ease,
        height 320ms ease,
        padding 320ms ease
    `;


    requestAnimationFrame(()=>{

        button.style.width =
            targetWidth;

        button.style.height =
            targetHeight;

        button.style.padding =
            "2px";

    });


    return new Promise(resolve=>{

        button._adminSizeTimer =
            setTimeout(()=>{

                button.style.width =
                    "";

                button.style.height =
                    "";

                button.style.padding =
                    "";

                button.style.transition =
                    "";

                button.style.overflow =
                    "";

                button._adminSizeTimer =
                    null;

                resolve();

            },340);

    });

}


// ======================================
// Collapse small button
// ======================================

function animateSmallCollapse(
    button
){

    const computed =
        window.getComputedStyle(
            button
        );


    const currentWidth =
        computed.width;

    const currentHeight =
        computed.height;

    const currentPadding =
        computed.padding;


    button.style.overflow =
        "hidden";

    button.style.width =
        currentWidth;

    button.style.height =
        currentHeight;

    button.style.padding =
        currentPadding;


    button.offsetHeight;


    button.style.transition = `
        width 300ms ease,
        height 300ms ease,
        padding 300ms ease
    `;


    requestAnimationFrame(()=>{

        button.style.width =
            "0px";

        button.style.height =
            "0px";

        button.style.padding =
            "0px";

    });


    return new Promise(resolve=>{

        button._adminSizeTimer =
            setTimeout(()=>{

                button.style.width =
                    "";

                button.style.height =
                    "";

                button.style.padding =
                    "";

                button.style.transition =
                    "";

                button.style.overflow =
                    "";

                button._adminSizeTimer =
                    null;

                resolve();

            },320);

    });

}


// ======================================
// Show
// ======================================

export function showAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    button._adminAnimationState =
        "enter";


    // ==================================
    // ФАЗА 1
    // Убираем hidden
    // ==================================

    button.hidden =
        false;


    button.classList.add(
        "admin-button--hidden"
    );


    // ==================================
    // ФАЗА 2
    // Растягивание
    // ==================================

    const sizePromise =
        isExpandableAdminBlock(button)

        ? animateExpand(button)

        : isSmallAdminButton(button)

            ? animateSmallExpand(button)

            : Promise.resolve();


    sizePromise.then(()=>{

        if(
            button._adminAnimationState !==
            "enter"
        ){

            return;

        }


        // ==================================
        // Зазор между фазами
        // ==================================

        button._adminAnimationTimer =
            setTimeout(()=>{

                if(
                    button._adminAnimationState !==
                    "enter"
                ){

                    return;

                }


                // ==================================
                // ФАЗА 3
                // Проявление
                // ==================================

                button.classList.remove(
                    "admin-button--hidden"
                );

                button.classList.add(
                    "admin-button--entering"
                );


                button._adminAnimationTimer =
                    setTimeout(()=>{

                        button.classList.remove(
                            "admin-button--entering"
                        );

                        button._adminAnimationState =
                            null;

                        button._adminAnimationTimer =
                            null;

                    },
                    ENTER_VISUAL_DURATION + 20
                );

            },
            ENTER_DELAY
        );

    });

}


// ======================================
// Hide
// ======================================

export function hideAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    if(button.hidden)
        return;


    button._adminAnimationState =
        "exit";


    // ==================================
    // ФАЗА 1
    // Растворение
    // ==================================

    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.add(
        "admin-button--exiting"
    );


    // ==================================
    // После растворения
    // ==================================

    button._adminAnimationTimer =
        setTimeout(()=>{

            if(
                button._adminAnimationState !==
                "exit"
            ){

                return;

            }


            button.classList.remove(
                "admin-button--exiting"
            );


            // ==================================
            // ФАЗА 2
            // Зазор
            // ==================================

            button._adminAnimationTimer =
                setTimeout(()=>{

                    if(
                        button._adminAnimationState !==
                        "exit"
                    ){

                        return;

                    }


                    // ==================================
                    // ФАЗА 3
                    // Сжатие
                    // ==================================

                    let collapsePromise;


                    if(
                        isExpandableAdminBlock(
                            button
                        )
                    ){

                        collapsePromise =
                            animateCollapse(
                                button
                            );

                    }else if(
                        isSmallAdminButton(
                            button
                        )){

                        collapsePromise =
                            animateSmallCollapse(
                                button
                            );

                    }else{

                        collapsePromise =
                            Promise.resolve();

                    }


                    collapsePromise.then(()=>{

                        if(
                            button._adminAnimationState !==
                            "exit"
                        ){

                            return;

                        }


                        button.hidden =
                            true;


                        button._adminAnimationState =
                            null;

                        button._adminAnimationTimer =
                            null;

                    });

                },
                EXIT_DELAY
            );

        },
        EXIT_VISUAL_DURATION + 20
    );

}


// ======================================
// Update
// ======================================

export function updateAdminButton(
    button,
    admin
){

    if(!button)
        return;


    const shouldShow =
        !!admin;


    const state =
        button._adminAnimationState;


    // ==================================
    // Уже полностью показана
    // ==================================

    if(
        shouldShow &&
        !button.hidden &&
        state !== "exit" &&
        !button.classList.contains(
            "admin-button--hidden"
        )
    ){

        return;

    }


    // ==================================
    // Уже полностью скрыта
    // ==================================

    if(
        !shouldShow &&
        button.hidden &&
        state !== "enter"
    ){

        return;

    }


    // ==================================
    // Переход
    // ==================================

    if(shouldShow){

        showAdminButton(
            button
        );

    }else{

        hideAdminButton(
            button
        );

    }

}


// ======================================
// Cancel animation
// ======================================

function cancelAnimation(
    button
){

    if(!button)
        return;


    if(
        button._adminAnimationTimer
    ){

        clearTimeout(
            button._adminAnimationTimer
        );

        button._adminAnimationTimer =
            null;

    }


    if(
        button._adminSizeTimer
    ){

        clearTimeout(
            button._adminSizeTimer
        );

        button._adminSizeTimer =
            null;

    }


    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.remove(
        "admin-button--exiting"
    );


    button._adminAnimationState =
        null;

}


// ======================================
// Base button
// ======================================

export function adminButton(
    action,
    id="",
    icon=null,
    title="",
    options={}
){

    return`

<button
class="
admin-button
${options.className||""}
admin-button--hidden
"
hidden
data-action="${action}"
${id?`data-id="${id}"`:""}
${title?`title="${title}"`:""}
>

<img
src="icons/${icon||getIcon(action)}.svg"
class="admin-icon">

</button>

`;

}


// ======================================
// Edit
// ======================================

export function adminEdit(
    type,
    id,
    options={}
){

    return adminButton(

        `edit-${type}`,

        id,

        "edit",

        options.title ||
        "Редактировать",

        options

    );

}


// ======================================
// Delete
// ======================================

export function adminDelete(
    type,
    id,
    options={}
){

    return adminButton(

        `delete-${type}`,

        id,

        "delete",

        options.title ||
        "Удалить",

        options

    );

}


// ======================================
// Add
// ======================================

export function adminAdd(
    action,
    text,
    options={}
){

    return`

<div
class="
${options.className||"entity-list__add"}
admin-button
admin-button--hidden
${options.disabled?"admin-button--disabled":""}
"
hidden
data-action="${action}"
>

+ ${text}

</div>

`;

}


// ======================================
// Header admin button
// ======================================

export function adminHeaderButton(
    id,
    icon,
    title=""
){

    return`

<button
id="${id}"
class="
header__button
header__button--admin
admin-button
admin-button--hidden
"
hidden
title="${title}"
>

<img
src="icons/${icon}.svg"
class="header-icon">

</button>

`;

}


// ======================================
// Login button
// ======================================

export function adminLoginButton(){

    return`

<button
id="loginButton"
class="header__button"
>

<img
src="icons/login.svg"
class="header-icon">

Войти

</button>

`;

}


// ======================================
// Login button update
// ======================================

export function adminUpdateLogin(
    button,
    admin
){

    if(!button)
        return;


    button.innerHTML =

        admin

        ?

`
<img
src="icons/logout.svg"
class="header-icon">

Выйти
`

        :

`
<img
src="icons/login.svg"
class="header-icon">

Войти
`;


    button.classList.toggle(
        "header__button--admin",
        admin
    );

}


// ======================================
// Header admin button update
// ======================================

export function adminUpdateHeaderButton(
    button,
    admin
){

    updateAdminButton(
        button,
        admin
    );

}


// ======================================
// Icons
// ======================================

function getIcon(
    action
){

    if(
        action.startsWith("edit")
    ){

        return "edit";

    }


    if(
        action.startsWith("delete")
    ){

        return "delete";

    }


    return "edit";

}
