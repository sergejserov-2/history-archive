import {
    animateExpand,
    animateCollapse
} from "./animations.js";


// ======================================
// Admin buttons
// ======================================

const ENTER_DURATION = 420;
const EXIT_DURATION = 300;


// ======================================
// Large admin blocks
// ======================================
//
// И большие блоки, и маленькие кнопки
// теперь проходят через одну и ту же
// систему.
//
// Геометрия:
// animations.js
//
// Визуальное появление:
// admin-button--entering
//
// Визуальное исчезновение:
// admin-button--exiting
//

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
// Get animation duration
// ======================================

function getEnterDuration(){

    return ENTER_DURATION;

}


function getExitDuration(){

    return EXIT_DURATION;

}


// ======================================
// Is currently hidden
// ======================================

function isAdminButtonHidden(
    button
){

    if(!button)
        return true;


    return (
        button.hidden ||
        button.classList.contains(
            "admin-button--hidden"
        )
    );

}


// ======================================
// Is currently visible
// ======================================

function isAdminButtonVisible(
    button
){

    if(!button)
        return false;


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

export function showAdminButton(
    button
){

    if(!button)
        return;


    // ----------------------------------
    // Если уже показывается / показана
    // ----------------------------------

    if(
        isAdminButtonVisible(button) &&
        !button.classList.contains(
            "admin-button--entering"
        )
    ){

        return;

    }


    // Останавливаем только
    // предыдущую анимацию этой кнопки.

    cancelAnimation(
        button
    );


    // ==================================
    // Подготовка
    // ==================================

    button.hidden = false;


    button.classList.add(
        "admin-button--hidden"
    );


    // ==================================
    // Следующий кадр
    // ==================================

    requestAnimationFrame(()=>{

        if(button.hidden)
            return;


        // --------------------------------
        // Сначала геометрия
        // --------------------------------

        animateExpand(
            button
        );


        // --------------------------------
        // Затем визуальное появление
        // --------------------------------
        //
        // Это НЕ запускается одновременно
        // с geometry transition.
        //
        // Геометрия уже начала раскрываться,
        // а opacity/scale начинают свою
        // фазу после короткой паузы.

        button.classList.remove(
            "admin-button--hidden"
        );


        button.classList.add(
            "admin-button--entering"
        );


        const finish = ()=>{

            button.classList.remove(
                "admin-button--entering"
            );

            button.classList.remove(
                "admin-button--hidden"
            );

            button.removeEventListener(
                "animationend",
                finish
            );

            button._adminAnimationTimer =
                null;

        };


        button.addEventListener(
            "animationend",
            finish,
            {
                once: true
            }
        );


        button._adminAnimationTimer =
            setTimeout(
                finish,
                getEnterDuration() + 50
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


    // ----------------------------------
    // Уже скрыта
    // ----------------------------------

    if(
        isAdminButtonHidden(button) &&
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
    // Сначала визуально исчезаем
    // ==================================

    button.classList.remove(
        "admin-button--entering"
    );


    button.classList.add(
        "admin-button--exiting"
    );


    // ==================================
    // НЕ схлопываем сразу
    // ==================================
    //
    // Сначала полностью проходит
    // opacity/scale animation.
    //
    // Только после неё начинается
    // animateCollapse().
    //

    const startCollapse = ()=>{

        button.classList.remove(
            "admin-button--exiting"
        );


        // --------------------------------
        // Теперь геометрия
        // --------------------------------

        animateCollapse(
            button
        );

    };


    button._adminCollapseTimer =
        setTimeout(
            startCollapse,
            getExitDuration()
        );


    // ==================================
    // Финальное состояние
    // ==================================
    //
    // animateCollapse сам установит
    // hidden=true после окончания
    // геометрической анимации.
    //

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


    admin = !!admin;


    // ==================================
    // ADMIN ON
    // ==================================

    if(admin){

        // Если кнопка уже реально видна —
        // ничего не делаем.

        if(
            isAdminButtonVisible(
                button
            )
        ){

            return;

        }


        showAdminButton(
            button
        );

        return;

    }


    // ==================================
    // ADMIN OFF
    // ==================================

    // Если кнопка уже скрыта —
    // ничего не делаем.

    if(
        isAdminButtonHidden(
            button
        )
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
// Используется MutationObserver.
//
// НИКАКИХ анимаций.
//
// Это критически важно при:
// innerHTML
// outerHTML
// insertAdjacentHTML
//

export function setAdminButtonState(
    button,
    admin
){

    if(!button)
        return;


    admin = !!admin;


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

        button.hidden = false;

        button.classList.remove(
            "admin-button--hidden"
        );

    }else{

        button.hidden = true;

        button.classList.add(
            "admin-button--hidden"
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


    // Таймер основной визуальной
    // анимации.

    if(
        button._adminAnimationTimer
    ){

        clearTimeout(
            button._adminAnimationTimer
        );

        button._adminAnimationTimer =
            null;

    }


    // Таймер начала схлопывания.

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
