import {
    isAdmin,
    onAdminStateChanged,
    logout,
    login
}
from "../../admin/adminMode.js";

import {
    createModal
}
from "./modal.js";

// ======================================
// Header component
// ======================================

export function renderHeader() {

    const html = `

<header class="header">

    <div class="header__logo">

        <a href="index.html">
            История района
        </a>

    </div>

    <div class="header__search">

        <input
            type="text"
            id="searchInput"
            placeholder="Поиск..."
        >

    </div>

    <div class="header__buttons">

        <button id="loginButton">

            Войти

        </button>

    </div>

</header>

`;

    setTimeout(()=>{

        const button =
            document.querySelector(
                "#loginButton"
            );

        if(!button){

            return;

        }

        function updateButton(

            ADMIN_MODE

        ){

            button.textContent =

                ADMIN_MODE
                ?
                "Выйти"
                :
                "Войти";

        }

        updateButton(

            isAdmin()

        );

        onAdminStateChanged(

            ADMIN_MODE => {

                updateButton(
                    ADMIN_MODE
                );

            }

        );

        button.onclick = async()=>{

    // ======================================
    // Logout
    // ======================================

    if(isAdmin()){

        try{

            await logout();

        }
        catch(error){

            console.error(
                error
            );

            alert(
                "Не удалось выйти"
            );

        }

        return;

    }

    // ======================================
    // Saved login data
    // ======================================

    const savedEmail =
        localStorage.getItem(
            "adminEmail"
        ) ?? "";

    const savedPassword =
        localStorage.getItem(
            "adminPassword"
        ) ?? "";

    // ======================================
    // Login form
    // ======================================

    const form = `

        <div class="login-form">

            <label>

                Email

                <input
                    id="adminLoginEmail"
                    type="email"
                    autocomplete="username"
                    value="${savedEmail}"
                >

            </label>

            <label>

                Пароль

                <input
                    id="adminLoginPassword"
                    type="password"
                    autocomplete="current-password"
                    value="${savedPassword}"
                >

            </label>

            <div class="entity-editor__buttons">

                <button
                    id="adminLoginSubmit"
                >

                    Войти

                </button>

                <button
                    id="adminLoginCancel"
                >

                    Отмена

                </button>

            </div>

        </div>

    `;

    const modal =

        createModal({

            title:"Вход в админку",

            content:form

        });

    const root =
        modal.root;

    const emailInput =
        root.querySelector(
            "#adminLoginEmail"
        );

    const passwordInput =
        root.querySelector(
            "#adminLoginPassword"
        );

    const loginButton =
        root.querySelector(
            "#adminLoginSubmit"
        );

    const cancelButton =
        root.querySelector(
            "#adminLoginCancel"
        );

    // ======================================
    // Cancel
    // ======================================

    cancelButton.onclick = ()=>{

        modal.close();

    };

    // ======================================
    // Login
    // ======================================

    loginButton.onclick = async()=>{

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        if(!email){

            alert(
                "Введите email"
            );

            emailInput.focus();

            return;

        }

        if(!password){

            alert(
                "Введите пароль"
            );

            passwordInput.focus();

            return;

        }

        loginButton.disabled = true;

        try{

            await login(

                email,
                password

            );

            // ==================================
            // Запоминаем данные
            // ==================================

            localStorage.setItem(
                "adminEmail",
                email
            );

            localStorage.setItem(
                "adminPassword",
                password
            );

            modal.close();

        }
        catch(error){

            console.error(
                error
            );

            alert(
                "Неверный email или пароль"
            );

            passwordInput.focus();

        }
        finally{

            loginButton.disabled = false;

        }

    };

    // ======================================
    // Enter
    // ======================================

    passwordInput.onkeydown = event=>{

        if(event.key === "Enter"){

            loginButton.click();

        }

    };

};
    },0);

    return html;

}
