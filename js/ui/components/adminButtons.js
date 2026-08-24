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

export function showAdminButton(
    button
){

    if(!button)
        return;


    // Отменяем предыдущую анимацию.

    cancelAnimation(
        button
    );


    // ----------------------------------
    // Большой блок
    // ----------------------------------

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        button.hidden = false;

        button.classList.add(
            "admin-button--hidden"
        );


        requestAnimationFrame(()=>{

            if(button.hidden)
                return;


            // Запускаем геометрическое
            // раскрытие.

            animateExpand(
                button
            );


            // Убираем hidden-состояние
            // только после того, как блок
            // уже появился в layout.

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

        return;

    }


    // ----------------------------------
    // Обычная маленькая кнопка
    // ----------------------------------

    button.hidden = false;


    button.classList.add(
        "admin-button--hidden"
    );


    requestAnimationFrame(()=>{

        if(
            button.hidden
        ){

            return;

        }


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

            button.classList.remove(
                "admin-button--hidden"
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


    // ----------------------------------
    // Большой блок
    // ----------------------------------

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        if(button.hidden){

            button.classList.add(
                "admin-button--hidden"
            );

            return;

        }


        // Сначала запускаем
        // геометрическое схлопывание.

        animateCollapse(
            button
        );


        // Одновременно запускаем
        // уже существующую визуальную
        // анимацию opacity + scale.

        button.classList.remove(
            "admin-button--entering"
        );

        button.classList.add(
            "admin-button--exiting"
        );


        const finish = ()=>{

            button.classList.remove(
                "admin-button--exiting"
            );

            button.classList.add(
                "admin-button--hidden"
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
                EXIT_DURATION + 50
            );


        return;

    }


    // ----------------------------------
    // Обычная маленькая кнопка
    // ----------------------------------

    if(button.hidden){

        button.classList.add(
            "admin-button--hidden"
        );

        return;

    }


    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.add(
        "admin-button--exiting"
    );


    const finish = ()=>{

        button.classList.remove(
            "admin-button--exiting"
        );

        button.classList.add(
            "admin-button--hidden"
        );

        button.hidden = true;


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
            EXIT_DURATION + 50
        );

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
