// ======================================
// Children cards
// ======================================

import { 
    getType,
    getParents
} from "../../api/objects.js";

import { renderBreadcrumbs }
from "./breadcrumbs.js";

// ======================================
// Render children
// ======================================

export async function renderChildren(children) {

    if (!children || children.length === 0) {

        return `

            <p class="children-empty">

                Нет связанных объектов

            </p>

        `;

    }

    const cards = await Promise.all(

        children.map(async child => {

            const type = await getType(
                child.typeId
            );

            const parents = await getParents(
                child
            );

            const address = renderBreadcrumbs(
                type,
                parents
            );

            const image = child.coverPhotoId

                ?

                `
                <img

                    class="child-card__image"

                    src="${child.coverPhotoId}"

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

    return `

        <div class="children-list">

            ${cards.join("")}

        </div>

    `;

}
