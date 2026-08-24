// ======================================
// Admin buttons
// ======================================

let enabled=false;

// ======================================
// State
// ======================================

export function setAdminButtonsEnabled(value){

    enabled=value;

    refreshAdminButtons();

}

// ======================================
// Refresh existing buttons
// ======================================

export function refreshAdminButtons(){

    document
        .querySelectorAll(".admin-button")
        .forEach(button=>{

            button.classList.toggle(
                "admin-button--hidden",
                !enabled
            );

        });

}

// ======================================
// Button generator
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
            class="${[
                "admin-button",
                options.className||"",
                !enabled
                    ?
                    "admin-button--hidden"
                    :
                    ""
            ]
            .filter(Boolean)
            .join(" ")}"
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
        options.title||"Редактировать",
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
        options.title||"Удалить",
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
            class="${[
                options.className||"entity-list__add",
                "admin-button",
                options.disabled
                    ?
                    "admin-button--disabled"
                    :
                    "",
                !enabled
                    ?
                    "admin-button--hidden"
                    :
                    ""
            ]
            .filter(Boolean)
            .join(" ")}"
            data-action="${action}"
            ${options.title?`title="${options.title}`:""}
        >
            + ${text}
        </div>
    `;

}

// ======================================
// Header
// ======================================

export function adminHeaderButton(
    id,
    icon,
    title=""
){

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

// ======================================
// Login
// ======================================

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

// ======================================
// Header updates
// ======================================

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

    button.innerHTML=
        admin
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

// ======================================
// Icons
// ======================================

function getIcon(action){

    if(action.startsWith("edit"))
        return"edit";

    if(action.startsWith("delete"))
        return"delete";

    return"edit";

}
