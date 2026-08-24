// ======================================
// Admin buttons
// ======================================

// ======================================
// Show
// ======================================

export function showAdminButton(
    button
){

    if(!button)
        return;

    button.hidden = false;

    requestAnimationFrame(()=>{

        button.classList.remove(
            "admin-button--hidden"
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

    button.classList.add(
        "admin-button--hidden"
    );

    button.addEventListener(
        "transitionend",
        ()=>{

            // Проверяем, что кнопка всё ещё
            // должна быть скрыта.

            if(
                button.classList.contains(
                    "admin-button--hidden"
                )
            ){

                button.hidden = true;

            }

        },
        {
            once:true
        }
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
${options.disabled?
    "admin-button--disabled":
    ""}
"
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
