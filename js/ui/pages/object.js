// ======================================
// Object page
// ======================================

import { 
    getObject,
    getType,
    getParents
} from "../../api/objects.js";

import { renderHeader } from "../components/header.js";

import { renderBreadcrumbs } 
from "../components/breadcrumbs.js";

// ======================================
// Get object id from URL
// ======================================

const params = new URLSearchParams(
    window.location.search
);

const objectId = params.get("id");

// ======================================
// Load page
// ======================================

async function loadPage() {

    const object = await getObject(objectId);

    if (!object) {

        document.body.innerHTML = `
            <h1>Объект не найден</h1>
        `;

        return;

    }

    console.log("OBJECT", object);

    const type = await getType(object.typeId);

    const parents = await getParents(object);

    console.log("PARENTS", parents);

    renderPage(
        object,
        type,
        parents
    );

}

// ======================================
// Render page
// ======================================

function renderPage(
    object,
    type,
    parents
) {

    document.body.innerHTML = `

        ${renderHeader()}

        <main class="page">

            <section class="object">

                <div class="object__cover">

                    Фото

                </div>

                <div class="object__info">

                    <div class="object__type">

                        ${type?.title ?? ""}

                    </div>

                    <h1 class="object__title">

                        ${object.title}

                    </h1>

                    ${renderBreadcrumbs(type, parents)}

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

            </section>

        </main>

    `;

}

// ======================================
// Start
// ======================================

loadPage();
