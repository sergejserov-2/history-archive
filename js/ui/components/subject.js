// ======================================
// Subject modal
// ======================================

import{isAdmin}from"../../admin/adminMode.js";
import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{createModal}from"./modal.js";

// ======================================
// Render subject
// ======================================

export function renderSubject(
    subject,
    subjects=[],
    ADMIN_MODE=false
){

    if(!subject)return"";

    const years=
        subject.dateStart&&subject.dateEnd
            ?`${subject.dateStart} – ${subject.dateEnd}`
            :subject.dateStart
                ?`с ${subject.dateStart}`
                :subject.dateEnd
                    ?`до ${subject.dateEnd}`
                    :"";

    const cover=
        subject.previewPath
        ?
        `
        <div class="subject__cover">

            <div
                class="subject__cover-bg"
                style="background-image:url('${subject.previewPath}')"
            ></div>

            <img
                class="subject__cover-image"
                src="${subject.previewPath}"
                alt="${escapeHTML(subject.title??"")}"
            >

        </div>
        `
        :
        `
        <div class="subject__cover">

            <div class="subject__cover-placeholder">
                Фото отсутствует
            </div>

        </div>
        `;

    return`

        <div class="subject-modal">

            <div class="subject-modal__card">

                ${cover}

                <div class="subject-modal__info">

                    <div class="subject-modal__type">

                        ${escapeHTML(subject.typeId??"")}

                    </div>

                    <h1 class="subject-modal__title">

                        <span class="subject-modal__title-text">

                            ${escapeHTML(subject.title??"")}

                        </span>

                        ${
                            ADMIN_MODE
                            ?
                            `
                            <button
                                class="admin-button"
                                data-action="edit-subject"
                                data-id="${escapeHTML(subject.id??"")}"
                            >
                                <img
                                    src="icons/edit.svg"
                                    class="admin-icon"
                                >
                            </button>

                            <button
                                class="admin-button"
                                data-action="delete-subject"
                                data-id="${escapeHTML(subject.id??"")}"
                            >
                                <img
                                    src="icons/delete.svg"
                                    class="admin-icon"
                                >
                            </button>
                            `
                            :
                            ""
                        }

                    </h1>

                    ${
                        years
                        ?
                        `
                        <div class="subject-modal__years">

                            ${escapeHTML(years)}

                        </div>
                        `
                        :
                        ""
                    }

                    ${
                        subject.description?.trim()
                        ?
                        `
                        <div class="subject-modal__description">

                            ${renderMentions(
                                subject.description.trim(),
                                subjects,
                                getSubjectHref
                            )}

                        </div>
                        `:
                        ""
                    }

                </div>

            </div>

        </div>

    `;
}

// ======================================
// Open subject modal
// ======================================

export function openSubjectModal(
    subject,
    {
        subjects=[],
        fromUrl=false
    }={}
){

    if(!subject)return null;

    const ADMIN_MODE=isAdmin();

    const modal=createModal({
        title:"",
        content:renderSubject(
            subject,
            subjects,
            ADMIN_MODE
        )
    });

    // ==================================
    // Admin buttons
    // ==================================

    if(ADMIN_MODE){

        modal.root.addEventListener(
            "click",
            event=>{

                const button=
                    event.target.closest(
                        ".admin-button"
                    );

                if(!button)return;

                const action=
                    button.dataset.action;

                const id=
                    button.dataset.id;

                if(!id)return;

                // Пока действия редактора
                // подключаются снаружи.
                //
                // Событие специально не
                // перезагружаем и не
                // закрываем модалку здесь.

                modal.root.dispatchEvent(
                    new CustomEvent(
                        "subject-admin-action",
                        {
                            bubbles:true,
                            detail:{
                                action,
                                id,
                                subject
                            }
                        }
                    )
                );

            }
        );

    }

    // ==================================
    // Opened from URL
    // ==================================

    if(!fromUrl){

        // URL для обычного открытия
        // здесь не меняем.
        //
        // Его должен устанавливать
        // вызывающий компонент через
        // setModalUrl().
    }

    return modal;

}

// ======================================
// Escape HTML
// ======================================

function escapeHTML(value=""){

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "'"
        );

}
