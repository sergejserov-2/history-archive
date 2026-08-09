// ======================================
// Object page
// ======================================

import {
    isAdmin,
    onAdminStateChanged,
    logout,
    login
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
    getRecordTypes
}
from "../../api/recordTypes.js";

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

import {
    restoreModalFromUrl
}
from "../components/modal.js";

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
    const recordTypes = await getRecordTypes();
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

onAdminStateChanged(

    async ADMIN_MODE => {

        // ==================================
        // Сначала полностью рисуем страницу
        // ==================================

        await renderPage(

            object,
            type,
            parents,
            children,
            records,
            photos,
            sources,
            recordTypes
            ADMIN_MODE

        );

        // ==================================
        // Затем подключаем admin
        // ==================================

        if (ADMIN_MODE) {

                initAdmin(
                
                    object,
                    types,
                    objects,
                    photos,
                    sources,
                    records,
                    children,
                    recordTypes
                
                );

        }

        // ==================================
        // И только после этого
        // восстанавливаем модалку из URL
        // ==================================

        await restoreModalFromUrl();

    }

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

    records,

    photos,

    sources,

    recordTypes

    ADMIN_MODE

) {

    const childrenHTML = await renderChildren(

        children,

        ADMIN_MODE

    );

    const breadcrumbsHTML =
        await renderBreadcrumbs(
            object
        );

    const coverPhoto =
        photos.find(
            photo =>
                photo.id === object.coverPhotoId
        );

    document.body.innerHTML = `

        ${renderHeader()}


<main class="page">

    ${breadcrumbsHTML}

            <section class="object">
            
                <div class="object__cover">
            
                    ${
                        coverPhoto?.previewPath
            
                        ?
            
                        `
            
                        <div
                            class="object__cover-bg"
                            style="background-image:url('${coverPhoto.previewPath}')"
                        ></div>
            
                        <img
                            class="object__cover-image"
                            src="${coverPhoto.previewPath}"
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

                    <div class="object__description">

                        ${object.description ?? ""}

                    </div>

                    ${
                        (
                            ADMIN_MODE ||
                            records.length > 0
                        )
                        ?
                        renderRecords(
                            records,
                            ADMIN_MODE
                        )
                        :
                        ""
                    }

                </div>

            </section>

        ${
                (
                    ADMIN_MODE ||
                    photos.length > 0
                )
                ?
                `
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
                `
                :
                ""
            }

            ${
                (
                    ADMIN_MODE ||
                    sources.length > 0
                )
                ?
                `
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
                `
                :
                ""
            }

            ${
                (
                    ADMIN_MODE ||
                    children.length > 0
                )
                ?
                `
                <section id="children">

                    <h2>
                        Дочерние объекты
                    </h2>

                    ${childrenHTML}

                </section>
                `
                :
                ""
            }
        </main>

    `;

}

loadPage();
