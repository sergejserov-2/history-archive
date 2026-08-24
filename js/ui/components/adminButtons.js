let enabled=false;

export function setAdminButtonsEnabled(value){

    enabled=value;

    refreshAdminButtons();

}

export function refreshAdminButtons(){

    document
        .querySelectorAll(".admin-button")
        .forEach(button=>{

            if(enabled){

                button.hidden=false;

                requestAnimationFrame(()=>{

                    button.classList.remove(
                        "admin-button--hidden"
                    );

                });

                return;

            }

            button.classList.add(
                "admin-button--hidden"
            );

            button.addEventListener(
                "transitionend",
                ()=>{

                    if(!enabled){

                        button.hidden=true;

                    }

                },
                {
                    once:true
                }
            );

        });

}

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
title="${title}"
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

if(!button)return;

button.innerHTML=
admin
?
`
<img src="icons/logout.svg" class="header-icon">
Выйти
`
:
`
<img src="icons/login.svg" class="header-icon">
Войти
`;

button.classList.toggle(
"header__button--admin",
admin
);

}


// ======================================
// Update header admin button
// ======================================

export function adminUpdateHeaderButton(
    button,
    admin
){

    if(!button) return;

    if(admin){

        button.hidden = false;

        // дать браузеру отрисовать
        requestAnimationFrame(()=>{

            button.classList.add(
                "admin-button--visible"
            );

            button.classList.remove(
                "admin-button--hidden"
            );

        });

        return;

    }

    button.classList.remove(
        "admin-button--visible"
    );

    button.classList.add(
        "admin-button--hidden"
    );

    const hide = ()=>{

        if(!admin){

            button.hidden = true;

        }

        button.removeEventListener(
            "transitionend",
            hide
        );

    };

    button.addEventListener(
        "transitionend",
        hide
    );

}


function getIcon(action){

if(action.startsWith("edit"))
return "edit";

if(action.startsWith("delete"))
return "delete";

return "edit";

}
