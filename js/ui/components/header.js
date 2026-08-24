import {
    adminHeaderButton,
    adminLoginButton,
    adminUpdateHeaderButton,
    adminUpdateLogin
} from "./adminButtons.js";

import {
    isAdmin,
    onAdminStateChanged,
    logout
} from "../../admin/adminMode.js";

import {
    openLoginModal
} from "./loginModal.js";

import {
    openSubjectsModal
} from "./subjects.js";

import {
    openTypesModal
} from "./types.js";

import {
    openActivityModal
} from "./activity.js";

import {
    openFeedbacksModal
} from "./feedbacks.js";

import {
    setModalUrl
} from "./modalReload.js";

import {
    getHighestLevelObject
} from "../../api/objects.js";

// ======================================
// Favicon
// ======================================

const favicon =
    document.getElementById("favicon");

if(favicon){

    const dark =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

    const update = ()=>{

        favicon.href =
            dark.matches
            ?
            "icons/logoDark.svg"
            :
            "icons/logoLight.svg";

    };

    update();

    dark.addEventListener(
        "change",
        update
    );

}

// ======================================
// Header render
// ======================================

export function renderHeader(
    page=null,
    updates=null
){

    const html = `

<header class="header">

    <a 
        class="header__logo"
        id="headerLogo"
        href="index.html"
    >

        <img
            src="icons/logoDark.svg"
            alt="Historical Archive"
        >

        <span>
            Краснохолмское краеведение
        </span>

    </a>

    <div class="header__search">

        <input
            type="text"
            id="searchInput"
            placeholder="Поиск..."
        >

    </div>

    <div class="header__buttons">

        <button
            id="subjectsButton"
            class="header__button"
        >

            <img
                src="icons/subjects.svg"
                class="header-icon"
            >

        </button>

        ${adminHeaderButton(
            "typesButton",
            "types",
            "Типы"
        )}

        ${adminHeaderButton(
            "feedbacksButton",
            "feedbacks",
            "Обращения"
        )}

        ${adminHeaderButton(
            "activityButton",
            "activity",
            "История изменений"
        )}

        ${adminLoginButton()}

    </div>

</header>

`;

    setTimeout(
        async()=>{

            // ==============================
            // Logo
            // ==============================

            const headerLogo =
                document.querySelector(
                    "#headerLogo"
                );

            if(headerLogo){

                try{

                    const object =
                        await getHighestLevelObject(
                            page?.objects,
                            page?.types
                        );

                    if(object?.id){

                        headerLogo.href =
                            `object.html?id=${object.id}`;

                    }

                }catch(error){

                    console.error(
                        "Не удалось определить главный объект:",
                        error
                    );

                }

            }

            // ==============================
            // Subjects
            // ==============================

            const subjectsButton =
                document.querySelector(
                    "#subjectsButton"
                );

            if(subjectsButton){

                subjectsButton.onclick =
                    async()=>{

                        setModalUrl(
                            "subjects"
                        );

                        try{

                            await openSubjectsModal({
                                page,
                                updates
                            });

                        }catch(error){

                            console.error(
                                "Ошибка открытия списка субъектов:",
                                error
                            );

                            alert(
                                "Не удалось загрузить субъекты"
                            );

                        }

                    };

            }

            // ==============================
            // Types
            // ==============================

            const typesButton =
                document.querySelector(
                    "#typesButton"
                );

            if(typesButton){

                typesButton.onclick =
                    async()=>{

                        setModalUrl(
                            "types"
                        );

                        try{

                            await openTypesModal();

                        }catch(error){

                            console.error(
                                "Ошибка открытия списка типов:",
                                error
                            );

                            alert(
                                "Не удалось загрузить типы"
                            );

                        }

                    };

            }

            // ==============================
            // Feedbacks
            // ==============================

            const feedbacksButton =
                document.querySelector(
                    "#feedbacksButton"
                );

            if(feedbacksButton){

                feedbacksButton.onclick =
                    async()=>{

                        setModalUrl(
                            "feedbacks"
                        );

                        try{

                            await openFeedbacksModal();

                        }catch(error){

                            console.error(
                                "Ошибка открытия списка обращений:",
                                error
                            );

                            alert(
                                "Не удалось загрузить обращения"
                            );

                        }

                    };

            }

            // ==============================
            // Activity
            // ==============================

            const activityButton =
                document.querySelector(
                    "#activityButton"
                );

            if(activityButton){

                activityButton.onclick =
                    async()=>{

                        setModalUrl(
                            "activity"
                        );

                        try{

                            await openActivityModal();

                        }catch(error){

                            console.error(
                                "Ошибка открытия истории изменений:",
                                error
                            );

                            alert(
                                "Не удалось загрузить историю изменений"
                            );

                        }

                    };

            }

            // ==============================
            // Login / Logout
            // ==============================

            const loginButton =
                document.querySelector(
                    "#loginButton"
                );

            if(!loginButton)
                return;

            const updateButtons =
                (admin)=>{

                    adminUpdateHeaderButton(
                        typesButton,
                        admin
                    );

                    adminUpdateHeaderButton(
                        feedbacksButton,
                        admin
                    );

                    adminUpdateHeaderButton(
                        activityButton,
                        admin
                    );

                    adminUpdateLogin(
                        loginButton,
                        admin
                    );

                };

            updateButtons(
                isAdmin()
            );

            onAdminStateChanged(
                updateButtons
            );

            loginButton.onclick =
                async()=>{

                    if(isAdmin()){

                        try{

                            await logout();

                        }catch(error){

                            console.error(
                                "Не удалось выйти:",
                                error
                            );

                            alert(
                                "Не удалось выйти"
                            );

                        }

                        return;

                    }

                    openLoginModal();

                };

        },
        0
    );

    return html;

}
