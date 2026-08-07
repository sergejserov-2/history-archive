// ======================================
// Photos component
// ======================================

export function renderPhotos(

    photos,

    ADMIN_MODE = false

) {

    const cards = [];

    if(ADMIN_MODE){

        cards.push(`

        <div

            class="photo-card photo-card--add admin-button"

            data-action="add-photo"

        >

            + Добавить фото

        </div>

        `);

    }

    (photos ?? [])

    .forEach(photo=>{

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

        cards.push(`

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

    <img src="icons/edit.svg" class="admin-icon">

                </button>

                <button

                    class="admin-button"

                    data-action="delete-photo"

                    data-id="${photo.id}"

                >

    <img src="icons/delete.svg" class="admin-icon">

                </button>

                `

                :

                ""

                }

            </div>

            <div class="photo-card__author">

                ${
                photo.author

                ?

                photo.author

                :

                ""

                }

                ${
                photo.date

                ?

                `, <span class="photo-card__date">

                    ${photo.date}

                   </span>`

                :

                ""

                }

            </div>

        </div>

        `);

    });

    if(cards.length===0){

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
