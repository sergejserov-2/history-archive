// ======================================
// Photos component
// ======================================

export function renderPhotos(

    photos,

    ADMIN_MODE = false,

    context = {}

) {

    const cards =

        (photos ?? [])

        .map(photo => {

            const image = photo.storagePath

                ?

                `

                <img

                    class="photo-card__image"

                    src="${photo.storagePath}"

                    alt="${photo.title ?? ""}"

                >

                `

                :

                `

                <div class="photo-card__placeholder">

                    Фото отсутствует

                </div>

                `;

            return `

            <div class="photo-card">

                <div class="photo-card__media">

                    ${image}

                </div>

                <div class="photo-card__title">

                    ${photo.title ?? ""}

                    ${
                        ADMIN_MODE

                        ?

                        `

                        <button

                            class="admin-button"

                            data-action="edit-photo"

                            data-id="${photo.id}"

                        >

                            ✏

                        </button>

                        <button

                            class="admin-button"

                            data-action="delete-photo"

                            data-id="${photo.id}"

                        >

                            🗑

                        </button>

                        `

                        :

                        ""

                    }

                </div>

                <div class="photo-card__date">

                    ${photo.date ?? ""}

                </div>

                ${
                    photo.author

                    ?

                    `

                    <div class="photo-card__author">

                        ${photo.author}

                    </div>

                    `

                    :

                    ""

                }

            </div>

            `;

        });

    if(ADMIN_MODE){

        cards.push(`

            <div

                class="photo-card photo-card--add"

                data-action="add-photo"

            >

                + Добавить фото

            </div>

        `);

    }

    if(cards.length === 0){

        return `

            <p class="photos-empty">

                Нет фотографий

            </p>

        `;

    }

    return `

        <div class="photos-list">

            ${cards.join("")}

        </div>

    `;

}
