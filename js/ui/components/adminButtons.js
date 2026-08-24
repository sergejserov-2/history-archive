// ======================================
// Admin buttons
// ======================================

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
            class="${[
                "admin-button",
                options.className||""
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
// Header buttons
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
// Header login update
// ======================================

export function adminUpdateLogin(
    button,
    admin
){

    if(!button)return;

    button.innerHTML =
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
        return "edit";

    if(action.startsWith("delete"))
        return "delete";

    return "edit";

}
