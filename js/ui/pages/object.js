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

import { getRecords }
from "../../api/records.js";

import { renderRecords }
from "../components/records.js";

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

    const records = await getRecords(
        object.id
    );


    
    renderPage(

        object,

        type,

        parents,

        children,

        records

    );

}

// ======================================
// Render
// ======================================

async function renderPage(

    object,

    type,

    parents,

    children,

    records

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

                    <div class="object__type">

                        ${type?.title ?? ""}

                    </div>

                    <h1 class="object__title">

                        ${object.title}

                    </h1>

                    <div class="object__address">

                        ${renderBreadcrumbs(

                            type,

                            parents

                        )}

                    </div>

                    <div class="object__description">

                        ${object.description ?? ""}

                    </div>
            
                ${renderRecords(records)}
            
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
