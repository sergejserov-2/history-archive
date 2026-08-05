// ======================================
// Photos component
// ======================================

export function renderPhotos(photos) {

    if (!photos || photos.length === 0) {

        return `

            <p class="photos-empty">

                Нет фотографий

            </p>

        `;

    }

    const cards = photos.map(photo => {

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

    return `

        <div class="photos-list">

            ${cards.join("")}

        </div>

    `;

}
