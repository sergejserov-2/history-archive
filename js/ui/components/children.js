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
            <p>
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

            return `

                <a
                    class="child-card"
                    href="object.html?id=${child.id}"
                >

                    <div class="child-card__type">

                        ${type?.title ?? ""}

                    </div>

                    <div class="child-card__title">

                        ${child.title}

                    </div>

                    <div class="child-card__address">

                        ${renderBreadcrumbs(
                            type,
                            parents
                        )}

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
