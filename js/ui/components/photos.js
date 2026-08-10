// ======================================
// Photos component
// ======================================

import {
    openPhotoViewer
}
from "./photoViewer.js";

// ======================================
// Render photos
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

    // ======================================
    // Sort photos
    //
    // 1. date
    // 2. author
    // 3. title
    //
    // От нового к старому
    // ======================================

    const sortedPhotos =

        [...(photos ?? [])].sort(

            (a, b) => {

                const dateA =
                    a.date || "";

                const dateB =
                    b.date || "";

                // ==================================
                // Фото без даты — в конец
                // ==================================

                if(
                    !dateA &&
                    !dateB
                ){

                    const authorCompare =

                        (a.author ?? "")
                            .localeCompare(

                                b.author ?? "",

                                "ru"

                            );

                    if(
                        authorCompare !== 0
                    ){

                        return authorCompare;

                    }

                    return (

                        a.title ?? ""

                    ).localeCompare(

                        b.title ?? "",

                        "ru"

                    );

                }

                if(!dateA){

                    return 1;

                }

                if(!dateB){

                    return -1;

                }

                // ==================================
                // От нового к старому
                // ==================================

                const dateCompare =

                    String(dateB)
                        .localeCompare(
                            String(dateA)
                        );

                if(
                    dateCompare !== 0
                ){

                    return dateCompare;

                }

                // ==================================
                // Одинаковая дата →
                // автор A → Я
                // ==================================

                const authorCompare =

                    (a.author ?? "")
                        .localeCompare(

                            b.author ?? "",

                            "ru"

                        );

                if(
                    authorCompare !== 0
                ){

                    return authorCompare;

                }

                // ==================================
                // Затем название A → Я
                // ==================================

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

            const image =
                photo.previewPath

                ?

                `

                <img

                    class="photo-card__image"

                    src="${photo.previewPath}"

                    alt="${photo.title ?? ""}"

                >

                `

                :

                `

                <div
                    class="photo-card__placeholder"
                >Фото отсутствует

                </div>

                `;

            cards.push(`

<div
    class="photo-card"
    data-photo-id="${photo.id}"
>

    <div
        class="photo-card__media"
        data-photo-id="${photo.id}"
    >

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

    <div class="photo-card__author">

        ${photo.author ?? ""}

${
    photo.dateMode === "period"
    ?
    (
        photo.dateStart || photo.dateEnd
        ?
        `
        , <span class="photo-card__date">
            ${
                photo.dateStart && photo.dateEnd
                    ? `${photo.dateStart} – ${photo.dateEnd}`
                    : photo.dateStart
                        ? `с ${photo.dateStart}`
                        : `до ${photo.dateEnd}`
            }
        </span>
        `
        :
        ""
    )
    :
    (
        photo.date
        ?
        `
        , <span class="photo-card__date">
            ${photo.date}
        </span>
        `
        :
        ""
    )
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
    // Photo click
    // ======================================

    setTimeout(()=>{

        const photosList =
            document.querySelector(
                ".photos-list"
            );

        if(!photosList){

            return;

        }

        photosList.onclick =
            event => {

                const media =
                    event.target.closest(
                        ".photo-card__media"
                    );

                if(!media){

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

                if(!photo){

                    return;

                }

                if(
                    !photo.storagePath
                ){

                    return;

                }

                // ==================================
                // Передаём Viewer весь набор
                // фотографий текущего объекта.
                // ==================================

                openPhotoViewer(

                    photo,

                    {
                        photos:
                            sortedPhotos
                    }

                );

            };

    }, 0);

    return html;

}
