import{
    show,
    hide
}from"../animations/controller.js";

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
animation--hidden
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

export function adminEdit(
    type,
    id,
    options={}
){
    return adminButton(
        `edit-${type}`,
        id,
        "edit",
        options.title||"Редактировать",
        options
    );
}

export function adminDelete(
    type,
    id,
    options={}
){
    return adminButton(
        `delete-${type}`,
        id,
        "delete",
        options.title||"Удалить",
        options
    );
}

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
animation--hidden
${options.disabled?"admin-button--disabled":""}
"
hidden
data-action="${action}"
${options.title?`title="${options.title}"`:""}
>
+ ${text}
</div>
`;
}

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
animation--hidden
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

export function adminUpdateLogin(
    button,
    admin
){
    if(!button)
        return;

    button.innerHTML=admin
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

export function adminUpdateHeaderButton(
    button,
    admin
){
    updateAdminButton(
        button,
        admin
    );
}

export function updateAdminButton(
    button,
    admin
){
    if(!button)
        return;

    const shouldShow=!!admin;
    const state=button._animationState;

    if(
        shouldShow&&
        !button.hidden&&
        state!=="exit"&&
        !button.classList.contains(
            "animation--hidden"
        )
    )
        return;

    if(
        !shouldShow&&
        button.hidden&&
        state!=="enter"
    )
        return;

    if(shouldShow)
        show(button);
    else
        hide(button);
}

function getIcon(
    action
){
    if(
        action.startsWith("edit")
    )
        return"edit";

    if(
        action.startsWith("delete")
    )
        return"delete";

    return"edit";
}
