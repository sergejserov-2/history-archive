let enabled=true;

export function setAdminButtonsEnabled(value){
    enabled=value;
}

export function adminButton(
    action,
    id="",
    icon=null,
    title=""
){

    if(!enabled)return"";

    return`
        <button
            class="admin-button"
            data-action="${action}"
            ${id?`data-id="${id}"`:""}
            ${title?`title="${title}"`:""}
        >
            <img
                src="icons/${icon||getIcon(action)}.svg"
                class="admin-icon"
            >
        </button>
    `;
}

export function adminEdit(
    type,
    id
){

    return adminButton(
        `edit-${type}`,
        id,
        "edit",
        "Редактировать"
    );

}

export function adminDelete(
    type,
    id
){

    return adminButton(
        `delete-${type}`,
        id,
        "delete",
        "Удалить"
    );

}

export function adminAdd(
    action,
    text
){

    if(!enabled)return"";

    return`
        <div
            class="entity-list__add admin-button"
            data-action="${action}"
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

    if(!enabled)return"";

    return`
        <button
            id="${id}"
            class="header__button header__button--admin"
            hidden
            title="${title}"
        >
            <img
                src="icons/${icon}.svg"
                class="header-icon"
            >
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
                class="header-icon"
            >
            Войти
        </button>
    `;

}

export function adminUpdateHeaderButton(
    button,
    admin
){

    if(!button)return;

    button.hidden=!admin;

}

export function adminUpdateLogin(
    button,
    admin
){

    if(!button)return;

    button.innerHTML=admin
        ?
        `
        <img
            src="icons/logout.svg"
            class="header-icon"
        >
        Выйти
        `
        :
        `
        <img
            src="icons/login.svg"
            class="header-icon"
        >
        Войти
        `;

    button.classList.toggle(
        "header__button--admin",
        admin
    );

}

function getIcon(action){

    if(action.startsWith("edit"))
        return"edit";

    if(action.startsWith("delete"))
        return"delete";

    return"edit";

}
