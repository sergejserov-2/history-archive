// ======================================
// Object page
// ======================================

import { getObject } from "../../api/objects.js";
import { getType } from "../../api/objects.js";

import { renderHeader } from "../components/header.js";

// ======================================
// Get object id from URL
// ======================================

const params = new URLSearchParams(window.location.search);

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

    const type = await getType(object.typeId);

    renderPage(object, type);

}

// ======================================
// Render page
// ======================================

function renderPage(object, type) {

    document.body.innerHTML = `

        ${renderHeader()}

        <main class="page">

            <section class="object">

                <div class="object__cover">

                    Фото

                </div>

                <div class="object__info">

                    <div class="object__type">

                        ${type.title}

                    </div>

                    <h1 class="object__title">

                        ${object.title}

                    </h1>

                    <div
                        id="objectAddress"
                        class="object__address">

                    </div>

                    <div class="object__description">

                        ${object.description ?? ""}

                    </div>

                </div>

            </section>

            <section id="gallery">

            </section>

            <section id="sources">

            </section>

            <section id="children">

            </section>

        </main>

    `;

}

// ======================================

loadPage();
