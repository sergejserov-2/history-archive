// ======================================
// Children cards
// ======================================

import {
    renderStatusBadgeHTML
}
from "./editor/status.js";

// ======================================
// Render children
// ======================================

export function renderChildren(
    children,
    ADMIN_MODE = false,
    currentObject = null,
    types = [],
    objects = [],
    photos = []
){

    const preparedChildren =
        (children ?? []).map(
            child => {

                const type =
                    types.find(
                        type =>
                            type.id ===
                            child.typeId
                    );

                const parents =
                    (child.parents ?? [])
                        .map(
                            parent => {

                                const parentId =
                                    parent?.objectId ??
                                    parent;

                                return objects.find(
                                    object =>
                                        object.id ===
                                        parentId
                                );

                            }
                        )
                        .filter(Boolean);

                const childPhotos =
                    photos.filter(
                        photo =>
                            photo.parents?.includes(
                                child.id
                            )
                    );

                const coverPhoto =
                    childPhotos.find(
                        photo =>
                            photo.id ===
                            child.coverPhotoId
                    );

                // ==================================
                // Address
                // ==================================

                const parentRelations =
                    Array.isArray(
                        child.parents
                    )
                        ? child.parents
                        : [];

                const addressLines =
                    parentRelations
                        .map(parent => {

                            const parentId =
                                parent?.objectId ??
                                parent;

                            if(!parentId){
                                return null;
                            }

                            const parentObject =
                                parents.find(
                                    item =>
                                        item.id ===
                                        parentId
                                );

                            if(!parentObject){
                                return null;
                            }

                            return {
                                parentId,
                                parentAddress:
                                    parentObject.address?.trim()
                                    || "",
                                childAddress:
                                    parent?.address?.trim()
                                    || ""
                            };

                        })
                        .filter(Boolean);

                // ==================================
                // Order address lines
                // ==================================

                if(currentObject){

                    addressLines.sort(
                        (a, b) => {

                            const aCurrent =
                                a.parentId ===
                                currentObject.id;

                            const bCurrent =
                                b.parentId ===
                                currentObject.id;

                            if(
                                aCurrent &&
                                !bCurrent
                            ){
                                return -1;
                            }

                            if(
                                !aCurrent &&
                                bCurrent
                            ){
                                return 1;
                            }

                            return 0;

                        }
                    );

                }

                // ==================================
                // Address HTML
                // ==================================

                const addressHTML =
                    addressLines.length > 0
                        ?
                        addressLines
                            .map(
                                line => `
                                    <div class="child-card__address-line">
                                        ${
                                            line.parentAddress
                                                ? `${line.parentAddress}, `
                                                : ""
                                        }
                                        ${line.childAddress}
                                    </div>
                                `
                            )
                            .join("")
                        :
                        "";

                // ==================================
                // Image
                // ==================================

                const image =
                    coverPhoto?.previewPath
                        ?
                        `
                            <img
                                class="child-card__image"
                                src="${coverPhoto.previewPath}"
                                alt="${child.title ?? ""}"
                            >
                        `
                        :
                        `
                            <div class="child-card__placeholder">
                                Фото отсутствует
                            </div>
                        `;

                // ==================================
                // Status
                // ==================================

                const status =
                    renderStatusBadgeHTML(
                        child.status
                    );

                // ==================================
                // Sort key
                // ==================================

                const sortAddress =
                    addressLines
                        .map(
                            line =>
                                `${line.parentAddress}, ${line.childAddress}`
                        )
                        .join(" ");

                return {
                    child,
                    type,
                    image,
                    addressHTML,
                    status,
                    sortAddress
                };

            }
        );

    // ======================================
    // Sort
    // ======================================

    preparedChildren.sort(
        (a, b) =>
            a.sortAddress.localeCompare(
                b.sortAddress,
                "ru",
                {
                    numeric: true,
                    sensitivity: "base"
                }
            )
    );

    // ======================================
    // Cards
    // ======================================

    const cards =
        preparedChildren.map(
            ({
                child,
                type,
                image,
                addressHTML,
                status
            }) => `
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
                            <span>
                                ${child.title ?? ""}
                            </span>

                            ${status}
                        </div>

                        <div class="child-card__address">
                            ${addressHTML}
                        </div>
                    </div>
                </a>
            `
        );

    // ======================================
    // Add object card
    // ======================================

    if(ADMIN_MODE){

        cards.unshift(`
            <div
                class="child-card child-card--add admin-button"
                data-action="add-object"
            >
                + Добавить объект
            </div>
        `);

    }

    return `
        <div class="children-list">
            ${cards.join("")}
        </div>
    `;

}
