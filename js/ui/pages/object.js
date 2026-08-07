// ======================================
// Object page
// ======================================

import {
    ADMIN_MODE
}
from "../../admin/adminMode.js";

import {
    initAdmin
} from "../../admin/admin.js";

import {

    getObject,

    getType,

    getParents,

    getChildren,

    getAllObjects

} from "../../api/objects.js";

import {
    getTypes }
    from "../../api/types.js";

import { renderHeader }

from "../components/header.js";

import { renderBreadcrumbs }

from "../components/breadcrumbs.js";

import { renderChildren }

from "../components/children.js";

import {
    getRecords
}
from "../../api/records.js";

import {
    renderRecords
}
from "../components/records.js";

import {
    getPhotos
}
from "../../api/photos.js";

import {
    renderPhotos
}
from "../components/photos.js";

import {
    getSources
}
from "../../api/sources.js";

import {
    renderSources
}
from "../components/sources.js";

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

    const types = await getTypes ();
    const objects = await getAllObjects ();
    
    const parents = await getParents(
        object
    );

    const children = await getChildren(
        object.id
    );

    const records = await getRecords(
        object.id
    );

    const photos = await getPhotos(
        object.id
    );

    const sources = await getSources(
        object.id
    );

    renderPage(

        object,

        type,

        parents,

        children,

        records,

        photos,

        sources

    );

        if (ADMIN_MODE) {
        initAdmin(object, types, objects, photos, sources, records, children);
    }

}

// ======================================
// Render
// ======================================

async function renderPage(

    object,

    type,

    parents,

    children,

    records,

    photos,

    sources

) {

    const childrenHTML = await renderChildren(

        children,

        ADMIN_MODE

    );

    const coverPhoto =
        photos.find(
            photo =>
                photo.id === object.coverPhotoId
                );

    document.body.innerHTML = `

        ${renderHeader()}

        <main class="page">

            <section class="object">

                 <div class="object__cover">
                
                    ${
                        coverPhoto?.storagePath
                
                        ?
                
                        `
                
                        <div
                            class="object__cover-bg"
                            style="background-image:url('${coverPhoto.storagePath}')"
                        ></div>
                
                        <img
                            class="object__cover-image"
                            src="${coverPhoto.storagePath}"
                            alt="${coverPhoto.title ?? ""}"
                        >
                
                        `
                
                        :
                
                        `<div class="object__cover-placeholder">
                            Фото отсутствует
                        </div>`
                
                    }
                
                </div>

                <div class="object__info">

                    <div class="object__type">

                        ${type?.title ?? ""}

                    </div>

                    <h1 class="object__title">

                        ${object.title}

                        ${
                            ADMIN_MODE

                            ?

                            `

                            <button
                                class="admin-button"
                                data-action="edit-object"
                            >
                            
    <img src="icons/edit.svg" class="admin-icon">
                            
                            </button>
                            
                            <button
                                class="admin-button"
                                data-action="delete-object"
                                data-id="${object.id}"
                            >
                            
    <img src="icons/delete.svg" class="admin-icon">
                            
                            </button>

                            `

                            :

                            ""

                        }

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

                    ${
                        renderRecords(

                            records,

                            ADMIN_MODE

                        )
                    }

                </div>

            </section>

            <section id="gallery">

                <h2>

                    Фотографии

                </h2>

                ${
                    renderPhotos(

                        photos,

                        ADMIN_MODE

                    )
                }

            </section>

            <section id="sources">

                <h2>

                    Источники

                </h2>

                ${
                    renderSources(

                        sources,

                        ADMIN_MODE

                    )
                }

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
