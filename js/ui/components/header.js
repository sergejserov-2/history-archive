import {isAdmin,onAdminStateChanged,logout} from "../../admin/adminMode.js";
import {openLoginModal} from "./loginModal.js";
import {openSubjectsModal} from "./subjects.js";
import {openTypesModal} from "./types.js";
import {setModalUrl} from "./modal.js";

const favicon=document.getElementById("favicon");

if(favicon){
    const dark=window.matchMedia("(prefers-color-scheme: dark)");

    const update=()=>{
        favicon.href=dark.matches
            ?"icons/logoDark.svg"
            :"icons/logoLight.svg";
    };

    update();
    dark.addEventListener("change",update);
}

export function renderHeader(page=null,updates=null){

    const html=`
<header class="header">
    <div class="header__logo">
        <img src="icons/logoDark.svg" alt="Historical Archive">
        <a href="index.html">Краснохолмское краеведение</a>
    </div>

    <div class="header__search">
        <input type="text" id="searchInput" placeholder="Поиск...">
    </div>

    <div class="header__buttons">
        <button
            id="subjectsButton"
            class="header__button"
        >
                            <img src="icons/subjects.svg" class="header-icon">
         </button>

        <button
            id="typesButton"
            class="header__button header__button--admin"
            hidden
        >
                            <img src="icons/types.svg" class="header-icon">
        </button>

        <button
            id="loginButton"
            class="header__button"
        >
            Войти
        </button>
    </div>
</header>
`;

    setTimeout(()=>{

        const subjectsButton=document.querySelector("#subjectsButton");

        if(subjectsButton){
            subjectsButton.onclick=async()=>{
                setModalUrl("subjects");

                try{
                    await openSubjectsModal({page,updates});
                }catch(error){
                    console.error(
                        "Ошибка открытия списка субъектов:",
                        error
                    );
                    alert("Не удалось загрузить субъекты");
                }
            };
        }

        const typesButton=document.querySelector("#typesButton");

        if(typesButton){
            typesButton.onclick=async()=>{
                setModalUrl("types");

                try{
                    await openTypesModal();
                }catch(error){
                    console.error(
                        "Ошибка открытия списка типов:",
                        error
                    );
                    alert("Не удалось загрузить типы");
                }
            };
        }

        const loginButton=document.querySelector("#loginButton");

        if(!loginButton)return;

        const updateButtons=(ADMIN_MODE)=>{

            if(typesButton){
                typesButton.hidden=!ADMIN_MODE;
            }

            loginButton.textContent=
                ADMIN_MODE
                    ?"Выйти"
                    :"Войти";

            loginButton.classList.toggle(
                "header__button--admin",
                ADMIN_MODE
            );
        };

        updateButtons(isAdmin());

        onAdminStateChanged(updateButtons);

        loginButton.onclick=async()=>{

            if(isAdmin()){

                try{
                    await logout();
                }catch(error){
                    console.error(error);
                    alert("Не удалось выйти");
                }

                return;
            }

            openLoginModal();
        };

    },0);

    return html;
}
