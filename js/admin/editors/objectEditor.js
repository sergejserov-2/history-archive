// ======================================
// Object editor
// Part 1 — Render
// ======================================

export function renderObjectEditor(

    object,

    types,

    objects,

    photos

) {

    const currentType =

        types.find(

            t => t.id === object.typeId

        );

    return `

    <div class="object-editor">

        <!-- =========================
             Cover photo
        ========================== -->

        <label>

            Обложка

            <select id="objectCoverInput">

                <option value="">

                    Без фотографии

                </option>

                ${
                    photos.map(photo => `

                        <option

                            value="${photo.id}"

                            ${
                                photo.id === object.coverPhotoId

                                ?

                                "selected"

                                :

                                ""

                            }

                        >

                            ${photo.title ?? photo.id}

                        </option>

                    `).join("")
                }

            </select>

        </label>

        <!-- =========================
             Title
        ========================== -->

        <label>

            Название

            <input

                id="objectTitleInput"

                value="${object.title ?? ""}"

            >

        </label>

        <!-- =========================
             Description
        ========================== -->

        <label>

            Описание

            <textarea

                id="objectDescriptionInput"

            >${object.description ?? ""}</textarea>

        </label>

        <!-- =========================
             Type
        ========================== -->

        <label>

            Тип

            <select

                id="objectTypeInput"

            >

            ${
                types.map(type => `

                    <option

                        value="${type.id}"

                        ${
                            type.id === object.typeId

                            ?

                            "selected"

                            :

                            ""

                        }

                    >

                        ${type.title}

                    </option>

                `).join("")
            }

            </select>

        </label>

        <!-- =========================
             Parents
        ========================== -->

        <label>

            Родители

            <div

                id="parentsContainer"

            >

                ${

                    renderParentList(

                        object,

                        objects

                    )

                }

            </div>

        </label>

        <div class="parent-search">

            <input

                id="parentSearchInput"

                placeholder="Добавить родителя..."

                autocomplete="off"

            >

            <div

                id="parentSearchResults"

            ></div>

        </div>

        <!-- =========================
             Buttons
        ========================== -->

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
// Parent list
// ======================================

function renderParentList(

    object,

    objects

) {

    if (

        !object.parents ||

        object.parents.length === 0

    ) {

        return `

            <div class="parents-empty">

                Нет родителей

            </div>

        `;

    }

    return object.parents.map(parent => {

        const obj =

            objects.find(

                o =>

                o.id === parent.objectId

            );

        return `

        <div class="parent-item">

            <div class="parent-item__title">

                ${obj?.title ?? parent.objectId}

            </div>

            <input

                class="parent-address-input"

                data-parent="${parent.objectId}"

                value="${parent.address ?? ""}"

            >

            <button

                data-remove-parent="${parent.objectId}"

            >

                ×

            </button>

        </div>

        `;

    }).join("");

}
