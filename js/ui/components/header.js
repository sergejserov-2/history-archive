// ======================================
// Header component
// ======================================

import {
    isAdmin,
    onAdminStateChanged,
    logout
}
from "../../admin/adminMode.js";

import {
    openLoginModal
}
from "./loginModal.js";

// ======================================
// Header component
// ======================================

export function renderHeader() {

    const html = `

<header class="header">

    <div class="header__logo">

        <a href="index.html">
            <img src="icons/logoDark.svg" alt="Historical Archive">
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

        // ==================================
        // Button state
        // ==================================

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

        // ==================================
        // Click
        // ==================================

        button.onclick = async()=>{

            // ==================================
            // Logout
            // ==================================

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

            // ==================================
            // Login
            // ==================================

            openLoginModal();

        };

    },0);

    return html;

}
