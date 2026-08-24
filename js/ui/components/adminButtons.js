import {
    animateExpand,
    animateCollapse
} from "./animations.js";


// ======================================
// Durations
// ======================================

const ENTER_SIZE_DURATION = 320;
const ENTER_VISUAL_DELAY = 10;
const ENTER_VISUAL_DURATION = 300;

const EXIT_VISUAL_DURATION = 300;
const EXIT_SIZE_DELAY = 10;
const EXIT_SIZE_DURATION = 300;


// ======================================
// Large / expandable admin blocks
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

export async function showAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    button.hidden = false;


    // ----------------------------------
    // Large block
    // ----------------------------------

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        button.classList.add(
            "admin-button--hidden"
        );


        // ==================================
        // PHASE 1
        // Геометрическое раскрытие
        // ==================================

        await animateExpand(
            button
        );


        if(button.hidden)
            return;


        // Небольшая пауза между
        // геометрией и появлением.

        await delay(
            ENTER_VISUAL_DELAY
        );


        if(button.hidden)
            return;


        // ==================================
        // PHASE 2
        // Визуальное появление
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

                button._adminAnimationTimer =
                    null;

            }, ENTER_VISUAL_DURATION + 20);


        return;

    }


    // ----------------------------------
    // Small button
    // ----------------------------------

    button.classList.add(
        "admin-button--hidden"
    );


    await delay(0);


    if(button.hidden)
        return;


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

            button._adminAnimationTimer =
                null;

        }, ENTER_VISUAL_DURATION + 20);

}


// ======================================
// Hide
// ======================================

export async function hideAdminButton(
    button
){

    if(!button)
        return;


    cancelAnimation(
        button
    );


    if(button.hidden)
        return;


    // ----------------------------------
    // Large block
    // ----------------------------------

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        // ==================================
        // PHASE 1
        // Визуальное исчезновение
        // ==================================

        button.classList.remove(
            "admin-button--entering"
        );

        button.classList.add(
            "admin-button--exiting"
        );


        await delay(
            EXIT_VISUAL_DURATION
        );


        // На этом этапе opacity/scale уже
        // полностью закончились.

        button.classList.remove(
            "admin-button--exiting"
        );


        if(button.hidden)
            return;


        // ==================================
        // Небольшой зазор
        // ==================================

        await delay(
            EXIT_SIZE_DELAY
        );


        if(button.hidden)
            return;


        // ==================================
        // PHASE 2
        // Геометрическое схлопывание
        // ==================================

        await animateCollapse(
            button
        );


        return;

    }


    // ----------------------------------
    // Small button
    // ----------------------------------

    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.add(
        "admin-button--exiting"
    );


    await delay(
        EXIT_VISUAL_DURATION
    );


    button.classList.remove(
        "admin-button--exiting"
    );

    button.classList.add(
        "admin-button--hidden"
    );

    button.hidden = true;

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


    const isVisible =
        !button.hidden &&
        !button.classList.contains(
            "admin-button--hidden"
        );


    const isEntering =
        button.classList.contains(
            "admin-button--entering"
        );

    const isExiting =
        button.classList.contains(
            "admin-button--exiting"
        );


    // ==================================
    // Ничего не изменилось
    // ==================================

    if(
        shouldShow &&
        isVisible &&
        !isExiting
    ){

        return;

    }


    if(
        !shouldShow &&
        button.hidden &&
        !isEntering
    ){

        return;

    }


    // ==================================
    // State transition
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
// Delay
// ======================================

function delay(
    milliseconds
){

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
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
