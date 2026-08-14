// ======================================
// Page updates
// ======================================

import {
    getObject,
    deleteObject,
    createObject,
    updateObject
} from "../api/objects.js";

import {
    getPhoto,
    deletePhoto,
    createPhoto,
    updatePhoto,
    getPhotos
} from "../api/photos.js";

import {
    getSource,
    deleteSource,
    createSource,
    updateSource,
    getSources
} from "../api/sources.js";

import {
    getRecord,
    deleteRecord,
    createRecord,
    updateRecord,
    getRecords
} from "../api/records.js";

import {
    moveFileToDeleted,
    uploadPhoto,
    uploadSourceDocument
} from "../api/storage.js";

import {getType} from "../api/types.js";

import {renderRecords}
from "../ui/components/records.js";

import {renderPhotos}
from "../ui/components/photos.js";

import {renderSources}
from "../ui/components/sources.js";

import {renderChildren}
from "../ui/components/children.js";

// ======================================
// Entity API
// ======================================

const API = {

    object: {
        create: createObject,
        update: updateObject
    },

    photo: {
        create: createPhoto,
        update: updatePhoto
    },

    source: {
        create: createSource,
        update: updateSource
    },

    record: {
        create: createRecord,
        update: updateRecord
    }

};

// ======================================
// Get entity
// ======================================

export async function getEntity(type, id) {

    if(type === "object")
        return await getObject(id);

    if(type === "photo")
        return await getPhoto(id);

    if(type === "source")
        return await getSource(id);

    if(type === "record")
        return await getRecord(id);

    throw new Error(
        `Unknown entity type: ${type}`
    );
}

// ======================================
// Create / update entity
// ======================================

export async function updateEntity(
    type,
    entity,
    data,
    context = {},
    updates = []
) {

    const api = API[type];

    if(!api) {

        throw new Error(
            `Unknown entity type: ${type}`
        );
    }

    let savedData;

    // ==================================
    // Update
    // ==================================

    if(entity?.id) {

        await api.update(
            entity.id,
            data
        );

        savedData = {
            id: entity.id,
            ...data
        };

    }

    // ==================================
    // Create
    // ==================================

    else {

        savedData =
            await api.create(data);
    }

    // ==================================
    // Temporary upload state
    //
    // Только для фотографии.
    // В Firestore НЕ записывается.
    // ==================================

    if(
        type === "photo" &&
        context.uploadingPhotoIds &&
        savedData?.id
    ) {

        context.uploadingPhotoIds.add(
            savedData.id
        );
    }

    // ==================================
    // Page updates
    // ==================================

    for(const update of updates) {

        const callback =
            context.updates?.[update];

        if(typeof callback === "function") {

            await callback(
                savedData
            );
        }
    }

    return savedData;
}

// ======================================
// Delete entity
// ======================================

export async function deleteEntity(
    type,
    id,
    context = {}
) {

    // ==================================
    // Object
    // ==================================

    if(type === "object") {

        const object =
            (context.objects ?? [])
                .find(
                    object =>
                        object.id === id
                );

        const parentId =
            object?.parents?.[0]?.objectId ??
            object?.parents?.[0] ??
            null;

        await deleteObject(id);

        await context.updates
            ?.onObjectDeleted?.(id);

        return {
            parentId
        };
    }

    // ==================================
    // Photo
    // ==================================

    if(type === "photo") {

        const photo =
            (context.photos ?? [])
                .find(
                    photo =>
                        photo.id === id
                );

        if(photo?.storagePath) {

            await moveFileToDeleted(
                photo.storagePath
            );
        }

        await deletePhoto(id);

        await context.updates
            ?.updatePhotosBlock?.();

        return;
    }

    // ==================================
    // Source
    // ==================================

    if(type === "source") {

        const source =
            (context.sources ?? [])
                .find(
                    source =>
                        source.id === id
                );

        if(source?.storagePath) {

            await moveFileToDeleted(
                source.storagePath
            );
        }

        await deleteSource(id);

        await context.updates
            ?.updateSourcesBlock?.();

        return;
    }

    // ==================================
    // Record
    // ==================================

    if(type === "record") {

        await deleteRecord(id);

        await context.updates
            ?.updateRecordsBlock?.();

        return;
    }

    throw new Error(
        `Unknown entity type: ${type}`
    );
}

// ======================================
// Page updates
// ======================================

export function createPageUpdates(state) {

    // ==================================
    // Temporary upload state
    // ==================================

    state.uploadingPhotoIds ??=
        new Set();

    // ==================================
    // Expose state through context
    // ==================================

    state.updatesContext ??= {};

    state.updatesContext.uploadingPhotoIds =
        state.uploadingPhotoIds;

    return {

        // ==================================
        // Object
        // ==================================

        async updateObjectBlock(data) {

            if(data) {

                state.object = {
                    ...state.object,
                    ...data
                };
            }

            state.object =
                await getObject(
                    state.object.id
                );

            if(!state.object)
                return;

            state.type =
                await getType(
                    state.object.typeId
                );

            const block =
                document.querySelector(
                    ".object"
                );

            if(block) {

                block.outerHTML =
                    state.renderObjectBlock();
            }
        },

        // ==================================
        // Records
        // ==================================

        async updateRecordsBlock(
            savedRecord = null
        ) {

            if(!state.object)
                return;

            state.records =
                await getRecords(
                    state.object.id
                );

            if(
                savedRecord?.id &&
                !state.records.some(
                    record =>
                        record.id ===
                        savedRecord.id
                )
            ) {

                state.records.push(
                    savedRecord
                );
            }

            const block =
                document.querySelector(
                    ".records"
                );

            if(block) {

                block.outerHTML =
                    renderRecords(
                        state.records,
                        state.recordTypes,
                        state.admin
                    );

                return;
            }

            if(
                state.admin ||
                state.records.length
            ) {

                document
                    .querySelector(
                        ".object__info"
                    )
                    ?.insertAdjacentHTML(
                        "beforeend",
                        renderRecords(
                            state.records,
                            state.recordTypes,
                            state.admin
                        )
                    );
            }
        },

        // ==================================
        // Photos
        // ==================================

        async updatePhotosBlock(
            savedPhoto = null
        ) {

            if(!state.object)
                return;

            // ==================================
            // Actual Firestore photos
            // ==================================

            state.photos =
                await getPhotos(
                    state.object.id
                );

            // ==================================
            // New photo may not be returned yet
            // ==================================

            if(
                savedPhoto?.id &&
                !state.photos.some(
                    photo =>
                        photo.id ===
                        savedPhoto.id
                )
            ) {

                state.photos.push(
                    savedPhoto
                );
            }

            // ==================================
            // Add temporary loading state
            // ==================================

            const photosForRender =
                state.photos.map(
                    photo => ({

                        ...photo,

                        isUploading:
                            state.uploadingPhotoIds
                                .has(photo.id)

                    })
                );

            // ==================================
            // Gallery
            // ==================================

            const gallery =
                document.querySelector(
                    "#gallery"
                );

            // ==================================
            // Create gallery
            // ==================================

            if(!gallery) {

                if(
                    state.admin ||
                    photosForRender.length
                ) {

                    const sources =
                        document.querySelector(
                            "#sources"
                        );

                    const html = `
                        <section id="gallery">

                            <h2>Фотографии</h2>

                            ${renderPhotos(
                                photosForRender,
                                state.admin
                            )}

                        </section>
                    `;

                    if(sources) {

                        sources.insertAdjacentHTML(
                            "beforebegin",
                            html
                        );

                    }

                    else {

                        document
                            .querySelector(
                                ".page"
                            )
                            ?.insertAdjacentHTML(
                                "beforeend",
                                html
                            );
                    }
                }

            }

            // ==================================
            // Update gallery
            // ==================================

            else {

                gallery.innerHTML = `

                    <h2>Фотографии</h2>

                    ${renderPhotos(
                        photosForRender,
                        state.admin
                    )}

                `;
            }

            await state
                .renderCoverState?.();
        },

        // ==================================
        // Sources
        // ==================================

        async updateSourcesBlock(
            savedSource = null
        ) {

            if(!state.object)
                return;

            state.sources =
                await getSources(
                    state.object.id
                );

            if(
                savedSource?.id &&
                !state.sources.some(
                    source =>
                        source.id ===
                        savedSource.id
                )
            ) {

                state.sources.push(
                    savedSource
                );
            }

            const block =
                document.querySelector(
                    "#sources"
                );

            if(!block) {

                if(
                    state.admin ||
                    state.sources.length
                ) {

                    const children =
                        document.querySelector(
                            "#children"
                        );

                    const html = `
                        <section id="sources">

                            <h2>Источники</h2>

                            ${renderSources(
                                state.sources,
                                state.admin
                            )}

                        </section>
                    `;

                    if(children) {

                        children.insertAdjacentHTML(
                            "beforebegin",
                            html
                        );

                    }

                    else {

                        document
                            .querySelector(
                                ".page"
                            )
                            ?.insertAdjacentHTML(
                                "beforeend",
                                html
                            );
                    }
                }

                return;
            }

            block.innerHTML = `

                <h2>Источники</h2>

                ${renderSources(
                    state.sources,
                    state.admin
                )}

            `;
        },

        // ==================================
        // Children
        // ==================================

        async updateChildrenBlock() {

            if(!state.object)
                return;

            state.children =
                await state.getChildren();

            const block =
                document.querySelector(
                    "#children"
                );

            const html = `

                <h2>Дочерние объекты</h2>

                ${await renderChildren(
                    state.children,
                    state.admin,
                    state.object,
                    state.objects,
                    state.types
                )}

            `;

            if(block) {

                block.innerHTML =
                    html;

            }

            else if(
                state.admin ||
                state.children.length
            ) {

                document
                    .querySelector(
                        ".page"
                    )
                    ?.insertAdjacentHTML(
                        "beforeend",
                        `
                            <section id="children">
                                ${html}
                            </section>
                        `
                    );
            }
        },

        // ==================================
        // Object deleted
        // ==================================

        async onObjectDeleted() {

            const parent =
                state.parents?.[0];

            window.location.href =
                parent?.id
                    ? `object.html?id=${parent.id}`
                    : "index.html";
        }

    };
}

// ======================================
// Exports
// ======================================

export {
    uploadPhoto,
    uploadSourceDocument
};
