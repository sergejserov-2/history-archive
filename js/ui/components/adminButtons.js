import {
    animateExpand,
    animateCollapse
} from "./animations.js";


// ======================================
// Durations
// ======================================

const ENTER_SIZE_DURATION = 320;
const ENTER_DELAY = 10;
const ENTER_VISUAL_DURATION = 300;

const EXIT_VISUAL_DURATION = 300;
const EXIT_DELAY = 10;
const EXIT_SIZE_DURATION = 300;


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


    button.hidden = false;


    // ==================================
    // Большой / expandable блок
    // ==================================

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        button.classList.add(
            "admin-button--hidden"
        );


        // ----------------------------------
        // ФАЗА 1
        // Только раскрытие геометрии
        // ----------------------------------

        animateExpand(
            button
        ).then(()=>{

            if(
                button._adminAnimationState !==
                "enter"
            ){

                return;

            }


            // ----------------------------------
            // ФАЗА 2
            // Небольшая пауза
            // ----------------------------------

            button._adminAnimationTimer =
                setTimeout(()=>{

                    if(
                        button._adminAnimationState !==
                        "enter"
                    ){

                        return;

                    }


                    // ----------------------------------
                    // ФАЗА 3
                    // Только появление
                    // ----------------------------------

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

                        },
                        ENTER_VISUAL_DURATION + 20
                    );

                },
                ENTER_DELAY
            );

        });

        return;

    }


    // ==================================
    // Маленькая кнопка
    // ==================================
    //
    // Маленькие кнопки тоже проходят
    // через тот же механизм.
    //
    // Здесь геометрия самого button
    // фактически мгновенная, после чего
    // идёт визуальное появление.
    // ==================================

    button.classList.add(
        "admin-button--hidden"
    );


    button._adminAnimationState =
        "enter";


    button._adminAnimationTimer =
        setTimeout(()=>{

            if(
                button._adminAnimationState !==
                "enter"
            ){

                return;

            }


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

                },
                ENTER_VISUAL_DURATION + 20
            );

        },
        ENTER_DELAY
    );

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
    // Большой / expandable блок
    // ==================================

    if(
        isExpandableAdminBlock(
            button
        )
    ){

        // ----------------------------------
        // ФАЗА 1
        // Только исчезновение
        // ----------------------------------

        button.classList.remove(
            "admin-button--entering"
        );

        button.classList.remove(
            "admin-button--hidden"
        );

        button.classList.add(
            "admin-button--exiting"
        );


        // ВАЖНО:
        // Здесь НЕТ animateCollapse().
        //
        // Никакой геометрии.
        //
        // Только opacity + scale.
        // ----------------------------------


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


                // ----------------------------------
                // ФАЗА 2
                // Пауза между анимациями
                // ----------------------------------

                button._adminAnimationTimer =
                    setTimeout(()=>{

                        if(
                            button._adminAnimationState !==
                            "exit"
                        ){

                            return;

                        }


                        // ----------------------------------
                        // ФАЗА 3
                        // Только схлопывание
                        // ----------------------------------

                        animateCollapse(
                            button
                        ).then(()=>{

                            if(
                                button._adminAnimationState ===
                                "exit"
                            ){

                                button._adminAnimationState =
                                    null;

                            }

                        });

                    },
                    EXIT_DELAY
                );

            },
            EXIT_VISUAL_DURATION
        );


        return;

    }


    // ==================================
    // Маленькая кнопка
    // ==================================

    button.classList.remove(
        "admin-button--entering"
    );

    button.classList.remove(
        "admin-button--hidden"
    );

    button.classList.add(
        "admin-button--exiting"
    );


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

            button.classList.add(
                "admin-button--hidden"
            );

            button.hidden = true;

            button._adminAnimationState =
                null;

            button._adminAnimationTimer =
                null;

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
    // Запускаем переход
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
