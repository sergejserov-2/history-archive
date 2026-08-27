import{login}from"../../admin/adminMode.js";
import{createModal}from"./modal.js";

export function openLoginModal(){
    const savedEmail=localStorage.getItem("adminEmail")??"";
    const savedPassword=localStorage.getItem("adminPassword")??"";

    const form=`
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
                <button id="adminLoginSubmit">
                    Войти
                </button>
                <button id="adminLoginCancel">
                    Отмена
                </button>
            </div>
        </div>
    `;

    const modal=createModal({
        title:"Войти как редактор",
        content:form
    });

    const root=modal.root;
    const emailInput=root.querySelector("#adminLoginEmail");
    const passwordInput=root.querySelector("#adminLoginPassword");
    const loginButton=root.querySelector("#adminLoginSubmit");
    const cancelButton=root.querySelector("#adminLoginCancel");

    emailInput?.focus();

    cancelButton.onclick=()=>{
        modal.close();
    };

    loginButton.onclick=async()=>{
        const email=emailInput.value.trim();
        const password=passwordInput.value;

        if(!email){
            alert("Введите email");
            emailInput.focus();
            return;
        }

        if(!password){
            alert("Введите пароль");
            passwordInput.focus();
            return;
        }

        loginButton.disabled=true;

        try{
            await login(email,password);

            localStorage.setItem("adminEmail",email);
            localStorage.setItem("adminPassword",password);

            modal.close();
        }catch(error){
            console.error(error);
            alert("Неверный email или пароль");
            passwordInput.focus();
        }finally{
            loginButton.disabled=false;
        }
    };

    passwordInput.onkeydown=event=>{
        if(event.key==="Enter")loginButton.click();
    };

    return modal;
}
