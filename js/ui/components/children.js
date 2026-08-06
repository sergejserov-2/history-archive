// ======================================
// Children cards
// ======================================

import { 
    getType,
    getParents
} from "../../api/objects.js";

import {
    getPhotos
}
from "../../api/photos.js";

import { 
    renderBreadcrumbs 
}
from "./breadcrumbs.js";

// ======================================
// Render children
// ======================================

export async function renderChildren(

    children,

    ADMIN_MODE = false

) {

    const cards = await Promise.all(

        (children ?? []).map(async child => {

            const type = await getType(
                child.typeId
            );

            const parents = await getParents(
                child
            );

            const photos = await getPhotos(
                child.id
            );

            const coverPhoto = photos.find(

                photo =>

                photo.id === child.coverPhotoId

            );

            const address = renderBreadcrumbs(
                type,
                parents
            );

            const image = coverPhoto?.storagePath

                ?

                `
                <img

                    class="child-card__image"

                    src="${coverPhoto.storagePath}"

                    alt="${child.title}"

                >
                `

                :

                `
                <div class="child-card__placeholder">

                    Фото отсутствует

                </div>
                `;

            return `

                <a

                    class="child-card"

                    href="object.html?id=${child.id}"

                >

                    <div class="child-card__media">

                        ${image}

                    </div>

                    <div class="child-card__body">

                        <div class="child-card__type">

                            ${type?.title ?? ""}

                        </div>

                        <div class="child-card__name">

                            ${child.title}

                        </div>

                        <div class="child-card__address">

                            ${address}

                        </div>

                    </div>

                </a>

            `;

        })

    );

    // ======================================
    // Add object card
    // ======================================

    if(ADMIN_MODE){

        cards.unshift(`

            <div

                class="child-card child-card--add admin-button"

                data-action="add-object"

            >

                + Добавить объект

            </div>

        `);

    }

    // ======================================
    // Empty state
    // ======================================

    if(

        cards.length === 0 &&

        !ADMIN_MODE

    ){

        return `

            <p class="children-empty">

                Нет связанных объектов

            </p>

        `;

    }

    return `

        <div class="children-list">

            ${cards.join("")}

        </div>

    `;

}
