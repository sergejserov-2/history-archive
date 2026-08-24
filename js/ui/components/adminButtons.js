import {
    animateExpand,
    animateCollapse,
    waitAnimationGap
} from "./animations.js";


// ======================================
// Admin buttons
// ======================================

const ENTER_DURATION = 420;
const EXIT_DURATION = 300;


// ======================================
// Large admin blocks
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
// State
// ======================================

function isHidden(
    button
){

    return (
        button.hidden ||
        button.classList.contains(
            "admin-button--hidden"
        )
    );

}


function isVisible(
    button
){

    return (
        !button.hidden &&
        !button.classList.contains(
            "admin-button--hidden"
        ) &&
        !button.classList.contains(
            "admin-button--exiting"
        )
    );

}


// ======================================
// Show
// ======================================

export async function showAdminButton(
    button
){

    if(!button)
        return;


    // Если уже полностью показана —
    // ничего не делаем.

    if(
        isVisible(button) &&
        !button.classList.contains(
            "admin-button--entering"
        )
    ){

        return;

    }


    cancelAnimation(
        button
    );


    button.hidden =
        false;


    button.classList.add(
        "admin-button--hidden"
    );


    // ==================================
    // Фаза 1
    // РАСКРЫТИЕ
    // ==================================

    await animateExpand(
        button
    );


    if(button.hidden)
        return;


    // ==================================
    // 1ms пауза
    // ==================================

    await waitAnimationGap();


    if(button.hidden)
        return;


    // ==================================
    // Фаза 2
    // ПОЯВЛЕНИЕ
    // ==================================

    button.classList.remove(
        "admin-button--hidden"
    );


    button.classList.add(
        "admin-button--entering"
    );


    await waitVisualAnimation(
        button,
        ENTER_DURATION
    );


    button.classList.remove(
        "admin-button--entering"
    );

}


// ======================================
// Hide
// ======================================

export async function hideAdminButton(
    button
){

    if(!button)
        return;


    // Если уже скрыта —
    // ничего не делаем.

    if(
        isHidden(button) &&
        !button.classList.contains(
            "admin-button--entering"
        )
    ){

        return;

    }


    cancelAnimation(
        button
    );


    // ==================================
    // Фаза 1
    // РАЗВОПЛОЩЕНИЕ
    // ==================================

    button.classList.remove(
        "admin-button--entering"
    );


    button.classList.add(
        "admin-button--exiting"
    );


    await waitVisualAnimation(
        button,
        EXIT_DURATION
    );


    button.classList.remove(
        "admin-button--exiting"
    );


    if(button.hidden)
        return;


    // ==================================
    // 1ms пауза
    // ==================================

    await waitAnimationGap();


    if(button.hidden)
        return;


    // ==================================
    // Фаза 2
    // СХЛОПЫВАНИЕ
    // ==================================

    await animateCollapse(
        button
    );

}


// ======================================
// Visual animation helper
// ======================================

function waitVisualAnimation(
    button,
    duration
){

    return new Promise(
        resolve => {

            let finished = false;


            const finish = ()=>{

                if(finished)
                    return;

                finished = true;


                button.removeEventListener(
                    "animationend",
                    onAnimationEnd
                );


                clearTimeout(
                    timer
                );


                button._adminAnimationTimer =
                    null;


                resolve();

            };


            const onAnimationEnd = event =>{

                if(
                    event.target !== button
                ){

                    return;

                }


                finish();

            };


            button.addEventListener(
                "animationend",
                onAnimationEnd
            );


            const timer =
                setTimeout(
                    finish,
                    duration + 50
                );


            button._adminAnimationTimer =
                timer;

        }
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


    admin = !!admin;


    if(admin){

        if(
            isVisible(button)
        ){

            return;

        }


        showAdminButton(
            button
        );

        return;

    }


    if(
        isHidden(button)
    ){

        return;

    }


    hideAdminButton(
        button
    );

}


// ======================================
// Set state immediately
// ======================================
//
// Для MutationObserver.
//
// Никакой анимации.
//

export function setAdminButtonState(
    button,
    admin
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.remove(
        "admin-button--exiting"
    );


    if(admin){

        button.hidden =
            false;

        button.classList.remove(
            "admin-button--hidden"
        );

    }else{

        button.hidden =
            true;

        button.classList.add(
            "admin-button--hidden"
        );

    }

}


// ======================================
// Cancel
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


    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.remove(
        "admin-button--exiting"
    );

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
${options.className || ""}
admin-button--hidden
"
hidden
data-action="${action}"
${id ? `data-id="${id}"` : ""}
${title ? `title="${title}"` : ""}
>

<img
src="icons/${icon || getIcon(action)}.svg"
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
${options.className || "entity-list__add"}
admin-button
admin-button--hidden
${options.disabled
    ? "admin-button--disabled"
    : ""}
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
