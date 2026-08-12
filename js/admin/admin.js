// ======================================
// Admin
// ======================================

import {openEditor} from "./editorConfig.js";
import {deleteObject} from "../api/objects.js";
import {deletePhoto} from "../api/photos.js";
import {deleteSource} from "../api/sources.js";
import {deleteRecord} from "../api/records.js";
import {moveFileToDeleted} from "../api/storage.js";
import {setModalUrl} from "../ui/components/modal.js";

// ======================================
// Init
// ======================================

export function initAdmin(
    object,
    types,
    objects,
    photos,
    sources,
    records,
    children,
    recordTypes,
    updates = {}
) {
    document.addEventListener("click", async event => {
        const button =
            event.target.closest(
                ".admin-button"
            );

        if(!button) return;

        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

        const objectType =
            types.find(
                type =>
                    type.id ===
                    object?.typeId
            );

        const objectLevel =
            Number(
                objectType?.level
            );

        const availableRecordTypes =
            (recordTypes ?? []).filter(
                recordType =>
                    recordType.levels
                        ?.map(Number)
                        .includes(
                            objectLevel
                        )
            );

        const context = {
            objects,
            parentId: object.id,
            recordTypes: availableRecordTypes,
            types,
            photos,
            children,
            updates
        };

        if(action === "edit-object") {
            setModalUrl(
                "object-editor",
                {
                    entityId:
                        object.id
                }
            );

            openEditor(
                "object",
                object,
                context
            );

            return;
        }

        if(action === "delete-object") {
            if(
                !confirm(
                    "Удалить объект и все дочерние сущности?"
                )
            ) {
                return;
            }

            await deleteObject(id);
            location.reload();

            return;
        }

        if(action === "add-object") {
            setModalUrl(
                "object-editor",
                {
                    entityId: null
                }
            );

            openEditor(
                "object",
                null,
                {
                    ...context,
                    children: []
                }
            );

            return;
        }

        if(action === "add-photo") {
            setModalUrl(
                "entity-editor",
                {
                    entityId: null,
                    entityType: "photo"
                }
            );

            openEditor(
                "photo",
                null,
                context
            );

            return;
        }

        if(action === "edit-photo") {
            const photo =
                photos.find(
                    photo =>
                        photo.id === id
                );

            if(!photo) return;

            setModalUrl(
                "entity-editor",
                {
                    entityId: photo.id,
                    entityType: "photo"
                }
            );

            openEditor(
                "photo",
                photo,
                context
            );

            return;
        }

        if(action === "delete-photo") {
            if(
                !confirm(
                    "Удалить фотографию?"
                )
            ) {
                return;
            }

            const photo =
                photos.find(
                    photo =>
                        photo.id === id
                );

            try {
                if(photo?.storagePath) {
                    await moveFileToDeleted(
                        photo.storagePath
                    );
                }

                await deletePhoto(id);
                location.reload();
            } catch(error) {
                console.error(
                    "Ошибка удаления фотографии:",
                    error
                );

                alert(
                    "Не удалось удалить фотографию"
                );
            }

            return;
        }

        if(action === "add-source") {
            setModalUrl(
                "entity-editor",
                {
                    entityId: null,
                    entityType: "source"
                }
            );

            openEditor(
                "source",
                null,
                context
            );

            return;
        }

        if(action === "edit-source") {
            const source =
                sources.find(
                    source =>
                        source.id === id
                );

            if(!source) return;

            setModalUrl(
                "entity-editor",
                {
                    entityId: source.id,
                    entityType: "source"
                }
            );

            openEditor(
                "source",
                source,
                context
            );

            return;
        }

        if(action === "delete-source") {
            if(
                !confirm(
                    "Удалить источник?"
                )
            ) {
                return;
            }

            const source =
                sources.find(
                    source =>
                        source.id === id
                );

            try {
                if(source?.storagePath) {
                    await moveFileToDeleted(
                        source.storagePath
                    );
                }

                await deleteSource(id);
                location.reload();
            } catch(error) {
                console.error(
                    "Ошибка удаления источника:",
                    error
                );

                alert(
                    "Не удалось удалить источник"
                );
            }

            return;
        }

        if(action === "add-record") {
            setModalUrl(
                "entity-editor",
                {
                    entityId: null,
                    entityType: "record"
                }
            );

            openEditor(
                "record",
                null,
                context
            );

            return;
        }

        if(action === "edit-record") {
            const record =
                records.find(
                    record =>
                        record.id === id
                );

            if(!record) return;

            setModalUrl(
                "entity-editor",
                {
                    entityId: record.id,
                    entityType: "record"
                }
            );

            openEditor(
                "record",
                record,
                context
            );

            return;
        }

        if(action === "delete-record") {
            if(
                !confirm(
                    "Удалить запись?"
                )
            ) {
                return;
            }

            await deleteRecord(id);
            location.reload();

            return;
        }
    });
}
