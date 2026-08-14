// ======================================
// Photos component
// ======================================

import {
    openPhotoViewer
} from "./photoViewer.js";

// ======================================
// Render photos
// ======================================

export function renderPhotos(
    photos,
    ADMIN_MODE = false
) {

    const cards = [];

    // ======================================
    // Add button
    // ======================================

    if(ADMIN_MODE) {

        cards.push(`

            <div
                class="photo-card photo-card--add admin-button"
                data-action="add-photo"
            >
                + Добавить фото
            </div>

        `);
    }

    // ======================================
    // Sort
    // ======================================

    const sortedPhotos =
        [...(photos ?? [])].sort(
            (a, b) => {

                const dateA =
                    a.date || "";

                const dateB =
                    b.date || "";

                if(!dateA && !dateB) {

                    const authorCompare =
                        (a.author ?? "")
                            .localeCompare(
                                b.author ?? "",
                                "ru"
                            );

                    if(authorCompare !== 0)
                        return authorCompare;

                    return (
                        a.title ?? ""
                    ).localeCompare(
                        b.title ?? "",
                        "ru"
                    );
                }

                if(!dateA)
                    return 1;

                if(!dateB)
                    return -1;

                const dateCompare =
                    String(dateB)
                        .localeCompare(
                            String(dateA)
                        );

                if(dateCompare !== 0)
                    return dateCompare;

                const authorCompare =
                    (a.author ?? "")
                        .localeCompare(
                            b.author ?? "",
                            "ru"
                        );

                if(authorCompare !== 0)
                    return authorCompare;

                return (
                    a.title ?? ""
                ).localeCompare(
                    b.title ?? "",
                    "ru"
                );
            }
        );

    // ======================================
    // Cards
    // ======================================

    sortedPhotos.forEach(
        photo => {

            const isUploading =
                photo.isUploading === true;

            const hasPreview =
                Boolean(
                    photo.previewPath
                );

            let mediaHTML;

            // ==================================
            // Uploading
            // ==================================

            if(
                isUploading &&
                !hasPreview
            ) {

                mediaHTML = `

                    <div
                        class="photo-card__loading"
                    >

                        <div
                            class="photo-card__loading-bg"
                        ></div>

                        <div
                            class="photo-card__loading-spinner"
                        ></div>

                    </div>

                `;
            }

            // ==================================
            // Preview
            // ==================================

            else if(hasPreview) {

                mediaHTML = `

                    <div
                        class="
                            photo-card__loading
                            photo-card__loading--preview
                        "
                    >

                        <div
                        class="photo-card__loading-bg"
                        ></div>

                        <div
                            class="photo-card__loading-spinner"
                        ></div>

                    </div>

                    <img
                        class="
                            photo-card__image
                            photo-card__image--loading
                        "
                        src="${photo.previewPath}"
                        alt="${photo.title ?? ""}"
                    >

                `;
            }

            // ==================================
            // No photo
            // ==================================

            else {

                mediaHTML = `

                    <div
                        class="photo-card__placeholder"
                    >
                        Фото отсутствует
                    </div>

                `;
            }

            cards.push(`

                <div
                    class="photo-card"
                    data-photo-id="${photo.id}"
                >

                    <div
                        class="photo-card__media"
                        data-photo-id="${photo.id}"
                        data-loading="${isUploading}"
                    >

                        ${mediaHTML}

                    </div>

                    <div
                        class="photo-card__title"
                    >

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
                                    <img
                                        src="icons/edit.svg"
                                        class="admin-icon"
                                    >
                                </button>

                                <button
                                    class="admin-button"
                                    data-action="delete-photo"
                                    data-id="${photo.id}"
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

                    </div>

                    <div
                        class="photo-card__author"
                    >

                        ${photo.author ?? ""}

                        ${
                            photo.dateMode === "period"

                            ?

                            (
                                photo.dateStart ||
                                photo.dateEnd
                            )

                            ?

                            `
                                , <span
                                    class="photo-card__date"
                                >
                                    ${
                                        photo.dateStart &&
                                        photo.dateEnd

                                        ?

                                        `${photo.dateStart} – ${photo.dateEnd}`

                                        :

                                        photo.dateStart

                                        ?

                                        `с ${photo.dateStart}`

                                        :

                                        `до ${photo.dateEnd}`
}
                                </span>
                            `

                            :

                            ""

                            :

                            photo.date

                            ?

                            `
                                , <span
                                    class="photo-card__date"
                                >
                                    ${photo.date}
                                </span>
                            `

                            :

                            ""
                        }

                    </div>

                </div>

            `);
        }
    );

    // ======================================
    // HTML
    // ======================================

    const html = `

        <div class="photos-list">

            ${cards.join("")}

        </div>

    `;

    // ======================================
    // Viewer
    // ======================================

    setTimeout(
        () => {

            const photosList =
                document.querySelector(
                    ".photos-list"
                );

            if(!photosList)
                return;

            photosList.onclick =
                event => {

                    const media =
                        event.target.closest(
                            ".photo-card__media"
                        );

                    if(!media)
                        return;

                    // ==================================
                    // Loading → no Viewer
                    // ==================================

                    if(
                        media.dataset.loading ===
                        "true"
                    ) {

                        return;
                    }

                    const photoId =
                        media.dataset.photoId;

                    const photo =
                        sortedPhotos.find(
                            item =>
                                item.id ===
                                photoId
                        );

                    if(!photo)
                        return;

                    if(!photo.storagePath)
                        return;

                    const image =
                        media.querySelector(
                            ".photo-card__image"
                        );

                    if(
                        !image ||
                        !image.complete ||
                        image.naturalWidth === 0
                    ) {

                        return;
                    }

                    openPhotoViewer(
                        photo,
                        {
                            photos:
                                sortedPhotos
                        }
                    );
                };

        },
        0
    );

    return html;
}
