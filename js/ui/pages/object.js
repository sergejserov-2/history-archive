// ======================================
// Object page
// ======================================

import {

    getObject,

    getType,

    getParents,

    getChildren

} from "../../api/objects.js";

import { renderHeader }

from "../components/header.js";

import { renderBreadcrumbs }

from "../components/breadcrumbs.js";

import { renderChildren }

from "../components/children.js";

import { renderObjectTitle }

from "../components/objectTitle.js";

// ======================================
// Get object id
// ======================================

const params = new URLSearchParams(
    window.location.search
);

const objectId = params.get("id");

// ======================================
// Load page
// ======================================

async function loadPage() {

    const object = await getObject(
        objectId
    );

    if (!object) {

        document.body.innerHTML = `

            <h1>
                Объект не найден
            </h1>

        `;

        return;

    }

    const type = await getType(
        object.typeId
    );

    const parents = await getParents(
        object
    );

    const children = await getChildren(
        object.id
    );

    renderPage(

        object,

        type,

        parents,

        children

    );

}

// ======================================
// Render
// ======================================

async function renderPage(

    object,

    type,

    parents,

    children

) {

    const childrenHTML = await renderChildren(
        children
    );

    document.body.innerHTML = `

        ${renderHeader()}

        <main class="page">

            <section class="object">

                <div class="object__cover">

                    Фото

                </div>

                <div class="object__info">

                    ${renderObjectTitle(

                        type,

                        object.title,

                        renderBreadcrumbs(

                            type,

                            parents

                        )

                    )}

                    <div class="object__description">

                        ${object.description ?? ""}

                    </div>

                </div>

            </section>

            <section id="gallery">

                <h2>

                    Фотографии

                </h2>

            </section>

            <section id="sources">

                <h2>

                    Источники

                </h2>

            </section>

            <section id="children">

                <h2>

                    Дочерние объекты

                </h2>

                ${childrenHTML}

            </section>

        </main>

    `;

}

loadPage();
