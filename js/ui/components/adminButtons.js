// ======================================
// Admin buttons
// ======================================

import {
    animateExpand,
    animateCollapse
} from "./animations.js";


const ENTER_DURATION = 420;
const EXIT_DURATION = 300;


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


    // ----------------------------------
    // Элемент должен быть в layout
    // ----------------------------------

    button.hidden =
        false;


    // ----------------------------------
    // Начальное визуальное состояние
    // ----------------------------------

    button.classList.add(
        "admin-button--hidden"
    );


    // ----------------------------------
    // Сначала геометрия
    // ----------------------------------

    requestAnimationFrame(async ()=>{

        if(button.hidden)
            return;


        await animateExpand(
            button
        );


        if(button.hidden)
            return;


        // --------------------------------
        // Затем opacity + scale
        // --------------------------------

        button.classList.remove(
            "admin-button--hidden"
        );

        button.classList.remove(
            "admin-button--exiting"
        );

        button.classList.add(
            "admin-button--entering"
        );


        const finish = ()=>{

            button.classList.remove(
                "admin-button--entering"
            );

            button.removeEventListener(
                "animationend",
                finish
            );

        };


        button.addEventListener(
            "animationend",
            finish,
            {
                once:true
            }
        );


        button._adminAnimationTimer =
            setTimeout(
                finish,
                ENTER_DURATION + 50
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


    if(button.hidden){

        button.classList.add(
            "admin-button--hidden"
        );

        return;

    }


    // ----------------------------------
    // Сначала opacity + scale
    // ----------------------------------

    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.add(
        "admin-button--exiting"
    );


    const finishVisual = ()=>{

        button.classList.remove(
            "admin-button--exiting"
        );

        button.removeEventListener(
            "animationend",
            finishVisual
        );

    };


    button.addEventListener(
        "animationend",
        finishVisual,
        {
            once:true
        }
    );


    button._adminAnimationTimer =
        setTimeout(
            finishVisual,
            EXIT_DURATION + 50
        );


    // ----------------------------------
    // После исчезновения —
    // геометрическое схлопывание
    // ----------------------------------

    button._adminCollapseTimer =
        setTimeout(()=>{

            if(button.hidden)
                return;


            animateCollapse(
                button
            );

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


    if(
        button._adminCollapseTimer
    ){

        clearTimeout(
            button._adminCollapseTimer
        );

        button._adminCollapseTimer =
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
