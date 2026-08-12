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

const params =
    new URLSearchParams(
        window.location.search
    );
const objectId =
    params.get("id");

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

async function loadPage() {
    const object =
        await getObject(
            objectId
        );
    if(!object) {
        document.body.innerHTML = `
            <h1>
                Объект не найден
            </h1>
        `;
        return;
    }
    document.title =
        object.title ||
        "Исторический архив";
    pageObject = object;
    pageType =
        await getType(
            object.typeId
        );
    pageTypes =
        await getTypes();
    pageObjects =
        await getAllObjects();
    pageRecordTypes =
        await getRecordTypes();
    pageParents =
        await getParents(
            object
        );
    pageChildren =
        await getChildren(
            object.id
        );
    pageRecords =
        await getRecords(
            object.id
        );
    pagePhotos =
        await getPhotos(
            object.id
        );
    pageSources =
        await getSources(
            object.id
        );
    onAdminStateChanged(
        async ADMIN_MODE => {
            pageAdminMode =
                ADMIN_MODE;
            await renderPage();
            if(ADMIN_MODE) {
                initAdmin(
                    pageObject,
                    pageTypes,
                    pageObjects,
                    pagePhotos,
                    pageSources,
                    pageRecords,
                    pageChildren,
                    pageRecordTypes,
                    {
                        onObjectSaved:
                            handleObjectSaved
                    }
                );
            }
            await restoreModalFromUrl();
        }
    );
}

async function handleObjectSaved(data) {
    if(!pageObject) return;
    pageObject = {
        ...pageObject,
        ...data
    };
    pageType =
        await getType(
            pageObject.typeId
        );
    updateObjectBlock();
}

function updateObjectBlock() {
    const oldBlock =
        document.querySelector(
            ".object"
        );
    if(!oldBlock) return;
    const newBlock =
        renderObjectBlock();
    oldBlock.outerHTML =
        newBlock;
}

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
                    coverPhoto?.previewPath?
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

async function renderPage() {
    const childrenHTML =
        await renderChildren(
            pageChildren,
            pageAdminMode,
            pageObject
        );
    const breadcrumbsHTML =
        await renderBreadcrumbs(
            pageObject
        );
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
                    pageAdminMode || pageSources.length > 0
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
                    pageAdminMode || pageChildren.length > 0
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
