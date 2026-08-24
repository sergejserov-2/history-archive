import {
    animateExpand,
    animateCollapse
} from "./animations.js";


// ======================================
// Visual animation duration
// ======================================

const ENTER_DURATION = 140;
const EXIT_DURATION = 120;


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
// Show
// ======================================
//
// Всегда:
//
// 1. появляется место
// 2. раскрывается геометрия
// 3. после этого появляется содержимое
//
// Никакого наложения.
// ======================================

export function showAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    button.hidden = false;


    // ----------------------------------
    // Начальное визуальное состояние
    // ----------------------------------

    button.classList.add(
        "admin-button--hidden"
    );


    // ----------------------------------
    // Сначала геометрия
    // ----------------------------------

    animateExpand(
        button,
        ()=>{

            // Геометрия закончилась.
            //
            // Только теперь разрешаем
            // визуальную анимацию.

            requestAnimationFrame(()=>{

                if(button.hidden)
                    return;


                button.classList.remove(
                    "admin-button--hidden"
                );

                button.classList.remove(
                    "admin-button--exiting"
                );

                button.classList.add(
                    "admin-button--entering"
                );


                button._adminAnimationTimer =
                    setTimeout(()=>{

                        button.classList.remove(
                            "admin-button--entering"
                        );

                        button.classList.remove(
                            "admin-button--hidden"
                        );

                        button._adminAnimationTimer =
                            null;

                    }, ENTER_DURATION);

            });

        }
    );

}


// ======================================
// Hide
// ======================================
//
// Всегда:
//
// 1. исчезает визуально
// 2. после этого схлопывается геометрия
//
// Никакого наложения.
// ======================================

export function hideAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    if(button.hidden){

        button.classList.add(
            "admin-button--hidden"
        );

        return;

    }


    // ==================================
    // Этап 1 — исчезновение
    // ==================================

    button.classList.remove(
        "admin-button--hidden"
    );

    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.add(
        "admin-button--exiting"
    );


    button._adminAnimationTimer =
        setTimeout(()=>{

            button.classList.remove(
                "admin-button--exiting"
            );


            // ==================================
            // Этап 2 — схлопывание
            // ==================================

            animateCollapse(
                button
            );


            button._adminAnimationTimer =
                null;

        }, EXIT_DURATION);

}


// ======================================
// Update one button
// ======================================

export function updateAdminButton(
    button,
    admin
){

    if(!button)
        return;


    if(admin){

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

    button.classList.remove(
        "admin-button--hidden"
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

        options.title||
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

        options.title||
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
