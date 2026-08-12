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
}
from "../../admin/admin.js";

import {
    getObject,
    getType,
    getParents,
    getChildren,
    getAllObjects
}
from "../../api/objects.js";

import {
    getTypes
}
from "../../api/types.js";

import {
    renderHeader
}
from "../components/header.js";

import {
    renderBreadcrumbs
}
from "../components/breadcrumbs.js";

import {
    renderChildren
}
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
    renderStatusBadgeHTML
}
from "../components/editor/status.js";

import {
    restoreModalFromUrl
}
from "../components/modal.js";

// ======================================
// Get object id
// ======================================

const params =
    new URLSearchParams(
        window.location.search
    );

const objectId =
    params.get("id");

// ======================================
// Page state
// ======================================

let pageObject = null;
let pageType = null;
let pageParents = [];
let pageChildren = [];
let pageRecords = [];
let pagePhotos = [];
let pageSources = [];
let pageRecordTypes = [];
let pageAdminMode = false;
let pageTypes = [];
let pageObjects = [];

// ======================================
// Load page
// ======================================

async function loadPage() {
    console.time("LOAD DATA");

    const [objects, types] =
        await Promise.all([
            getAllObjects(),
            getTypes()
        ]);

    const object = objects.find(
        item => item.id === objectId
    );

    if(!object) {
        document.body.innerHTML =
            `<h1>Объект не найден</h1>`;
        return;
    }

    document.title =
        object.title ||
        "Исторический архив";

    pageObject = object;
    pageObjects = objects;
    pageTypes = types;

    pageType =
        types.find(
            type => type.id === object.typeId
        ) ?? null;

    const timed = (name, promise) =>
        promise.then(result => {
            console.timeEnd(name);
            return result;
        });

    console.time("getRecordTypes");
    console.time("getParents");
    console.time("getChildren");
    console.time("getRecords");
    console.time("getPhotos");
    console.time("getSources");

    [
        pageRecordTypes,
        pageParents,
        pageChildren,
        pageRecords,
        pagePhotos,
        pageSources
    ] = await Promise.all([
        timed("getRecordTypes", getRecordTypes()),
        timed(
            "getParents",
            getParents(object, objects, types)
        ),
        timed(
            "getChildren",
            getChildren(object.id)
        ),
        timed(
            "getRecords",
            getRecords(object.id)
        ),
        timed(
            "getPhotos",
            getPhotos(object.id)
        ),
        timed(
            "getSources",
            getSources(object.id)
        )
    ]);

    console.timeEnd("LOAD DATA");
}
export async function onPhotoDeleted() {
    await updatePhotosBlock();
}

export async function onSourceDeleted() {
    await updateSourcesBlock();
}

export async function onRecordDeleted() {
    await updateRecordsBlock();
}

export async function onObjectDeleted() {
    const parent =
        pageParents?.[0];

    if(parent?.id) {
        window.location.href =
            `object.html?id=${parent.id}`;

        return;
    }

    window.location.href =
        "index.html";
}


// ======================================
// Update object block
// ======================================

export async function updateObjectBlock(data) {
    if(data) {
        pageObject = {
            ...pageObject,
            ...data
        };
    }

    pageObject =
        await getObject(
            pageObject.id
        );

    if(!pageObject) {
        return;
    }

pageType =
        await getType(
            pageObject.typeId
        );

    const oldBlock =
        document.querySelector(
            ".object"
        );

    if(!oldBlock) {
        return;
    }

    oldBlock.outerHTML =
        renderObjectBlock();
}

// ======================================
// Update records block
// ======================================

export async function updateRecordsBlock() {
    if(!pageObject) {
        return;
    }

    pageRecords =
        await getRecords(
            pageObject.id
        );

    const recordsBlock =
        document.querySelector(
            ".records"
        );

    if(recordsBlock) {
        recordsBlock.outerHTML =
            renderRecords(
                pageRecords,
                pageRecordTypes,
                pageAdminMode
            );

        return;
    }

    if(
        pageAdminMode ||
        pageRecords.length > 0
    ) {
        const objectInfo =
            document.querySelector(
                ".object__info"
            );

        if(objectInfo) {
            objectInfo.insertAdjacentHTML(
                "beforeend",
                renderRecords(
                    pageRecords,
                    pageRecordTypes,
                    pageAdminMode
                )
            );
        }
    }
}

// ======================================
// Update photos block
// ======================================

export async function updatePhotosBlock() {
    if(!pageObject) {
        return;
    }

    pagePhotos =
        await getPhotos(
            pageObject.id
        );

    const gallery =
        document.querySelector(
            "#gallery"
        );

    if(!gallery) {
        if(
            pageAdminMode ||
            pagePhotos.length > 0
        ) {
            const sources =
                document.querySelector(
                    "#sources"
                );

            const html = `
                <section id="gallery">
                    <h2>
                        Фотографии
                    </h2>
                    ${renderPhotos(
                        pagePhotos,
                        pageAdminMode
                    )}
                </section>
            `;

            if(sources) {
                sources.insertAdjacentHTML(
                    "beforebegin",
                    html
                );
            } else {
                document
                    .querySelector(".page")
                    ?.insertAdjacentHTML(
                        "beforeend",
                        html
                    );
            }
        }

        return;
    }

    gallery.innerHTML = `
        <h2>
            Фотографии
        </h2>
        ${renderPhotos(
            pagePhotos,
            pageAdminMode
        )}
    `;
}

// ======================================
// Update sources block
// ======================================

export async function updateSourcesBlock() {
    if(!pageObject) {
        return;
    }

    pageSources =
        await getSources(
            pageObject.id
        );

    const sourcesBlock =
        document.querySelector(
            "#sources"
        );

    if(!sourcesBlock) {
        if(
            pageAdminMode ||
            pageSources.length > 0
        ) {
            const children =
                document.querySelector(
                    "#children"
                );

            const html = `
                <section id="sources">
                    <h2>
                        Источники
                    </h2>
                    ${renderSources(
                        pageSources,
                        pageAdminMode
                    )}
                </section>
            `;

            if(children) {
                children.insertAdjacentHTML(
                    "beforebegin",
                    html
                );
            } else {
                document
                    .querySelector(".page")
                    ?.insertAdjacentHTML(
                        "beforeend",
                        html
                    );
            }
        }

        return;
    }

    sourcesBlock.innerHTML = `
        <h2>
            Источники
        </h2>
        ${renderSources(
            pageSources,
            pageAdminMode
        )}
    `;
}

// ======================================
// Render object block
// ======================================

function renderObjectBlock() {
    const coverPhoto =
        pagePhotos.find(
            photo =>
                photo.id ===
                pageObject.coverPhotoId
        );

    const status =
        renderStatusBadgeHTML(
            pageObject.status
        );

    return `
        <section class="object">
            <div class="object__cover">
                ${
                    coverPhoto?.previewPath
                    ?
                    `
                    <div
                        class="object__cover-bg"
                        style="
                            background-image:
                            url('${coverPhoto.previewPath}')
                        "
                    ></div>
                    <img
                        class="object__cover-image"
                        src="${coverPhoto.previewPath}"
                        alt="${coverPhoto.title ?? ""}"
                    >
                    `
                    :
                    `
                    <div
                        class="object__cover-placeholder"
                    >
                        Фото отсутствует
                    </div>
                    `
                }
            </div>

            <div class="object__info">
                <div class="object__type">
                    ${pageType?.title ?? ""}
                </div>

                <h1 class="object__title">
                    <span class="object__title-text">
                        ${pageObject.title ?? ""}
                    </span>

                    ${
                        pageAdminMode
                        ?
                        `
                        <button
                            class="admin-button"
                            data-action="edit-object"
                        >
                            <img
                                src="icons/edit.svg"
                                class="admin-icon"
                            >
                        </button>

                        <button
                            class="admin-button"
                            data-action="delete-object"
                            data-id="${pageObject.id}"
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

                    ${status}
                </h1>

                ${
                    pageObject.description?.trim()
                    ?
                    `
                    <div class="object__description">
                        ${pageObject.description}
                    </div>
                    `
                    :
                    ""
                }

                ${
                    (
                        pageAdminMode ||
                        pageRecords.length > 0
                    )
                    ?
                    renderRecords(
                        pageRecords,
                        pageRecordTypes,
                        pageAdminMode
                    )
                    :
                    ""
                }
            </div>
        </section>
    `;
}

// ======================================
// Render page
// ======================================

async function renderPage() {

    console.time("renderChildren");
    const childrenHTML = await renderChildren(pageChildren, pageAdminMode, pageObject);

    console.timeEnd("renderChildren");

    console.time("renderBreadcrumbs");

    const breadcrumbsHTML =
        renderBreadcrumbs(
            pageObject,
            pageParents
        );

    console.timeEnd("renderBreadcrumbs");

    console.time("body.innerHTML");

    document.body.innerHTML = `
        ${renderHeader()}

        <main class="page">
            ${breadcrumbsHTML}

            ${renderObjectBlock()}

            ${
                (
                    pageAdminMode ||
                    pagePhotos.length > 0
                )
                ?
                `
                <section id="gallery">
                    <h2>
                        Фотографии
                    </h2>

                    ${renderPhotos(
                        pagePhotos,
                        pageAdminMode
                    )}
                </section>
                `
                :
                ""
            }

            ${
                (
                    pageAdminMode ||
                    pageSources.length > 0
                )
                ?
                `
                <section id="sources">
                    <h2>
                        Источники
                    </h2>

                    ${renderSources(
                        pageSources,
                        pageAdminMode
                    )}
                </section>
                `
                :
                ""
            }

            ${
                (
                    pageAdminMode ||
                    pageChildren.length > 0
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

    console.timeEnd("body.innerHTML");
}

loadPage();
