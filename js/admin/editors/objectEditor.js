// ======================================
// Object editor
// ======================================

import {
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    db
}
from "../../api/firebase.js";

// ======================================
// Render editor
// ======================================

export function renderObjectEditor(
    object
) {

    return `

        <div class="object-editor">

            <label>

                Название

                <input
                    id="objectTitleInput"
                    value="${object.title ?? ""}"
                >

            </label>

            <label>

                Описание

                <textarea
                    id="objectDescriptionInput"
                >${object.description ?? ""}</textarea>

            </label>

            <div class="object-editor__buttons">

                <button
                    id="saveObjectButton"
                >

                    Сохранить

                </button>

                <button
                    id="cancelObjectButton"
                >

                    Отмена

                </button>

            </div>

        </div>

    `;

}

// ======================================
// Save
// ======================================

export function initObjectEditor(
    object,
    onSave
) {

    const saveButton =
        document.getElementById(
            "saveObjectButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelObjectButton"
        );

    saveButton.onclick = async () => {

        const title =
            document.getElementById(
                "objectTitleInput"
            ).value;

        const description =
            document.getElementById(
                "objectDescriptionInput"
            ).value;

        await updateDoc(

            doc(
                db,
                "objects",
                object.id
            ),

            {

                title,

                description

            }

        );

        onSave();

    };

    cancelButton.onclick = () => {

        onSave();

    };

}
