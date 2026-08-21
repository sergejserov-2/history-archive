import{isAdmin,onAdminStateChanged,logout}from"../../admin/adminMode.js";
import{openLoginModal}from"./loginModal.js";
import{openSubjectsModal}from"./subjects.js";
import{setModalUrl}from"./modal.js";
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
        <button id="subjectsButton">Субъекты</button>
        <button id="loginButton">Войти</button>
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
                    console.error("Ошибка открытия списка субъектов:",error);
                    alert("Не удалось загрузить субъекты");
                }
            };
        }
        const button=document.querySelector("#loginButton");
        if(!button)return;
        const updateButton=ADMIN_MODE=>{
            button.textContent=ADMIN_MODE
                ?"Выйти"
                :"Войти";
        };
        updateButton(isAdmin());
        onAdminStateChanged(ADMIN_MODE=>{
            updateButton(ADMIN_MODE);
        });
        button.onclick=async()=>{
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
