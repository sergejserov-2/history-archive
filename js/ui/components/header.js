import {
    isAdmin,
    onAdminStateChanged,
    logout,
    login
}
from "../../admin/adminMode.js";

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

            const email =

                prompt(
                    "Email администратора"
                );

            if(!email){

                return;

            }

            const password =

                prompt(
                    "Пароль"
                );

            if(!password){

                return;

            }

            try{

                await login(

                    email,
                    password

                );

            }
            catch(error){

                console.error(
                    error
                );

                alert(
                    "Неверный email или пароль"
                );

            }

        };

    },0);

    return html;

}
