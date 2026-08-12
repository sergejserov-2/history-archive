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

export function initAdmin(object, types, objects, photos, sources, records, children, recordTypes) {
    document.addEventListener("click", async event => {
        const button = event.target.closest(".admin-button");
        if(!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        const objectType = types.find(type => type.id === object?.typeId);
        const objectLevel = Number(objectType?.level);

        const availableRecordTypes = (recordTypes ?? []).filter(recordType =>
            recordType.levels?.map(Number).includes(objectLevel)
        );

        const context = {
            objects,
            parentId: object.id,
            recordTypes: availableRecordTypes
        };

        // ======================================
        // Object edit
        // ======================================

        if(action === "edit-object") {
            setModalUrl("object-editor", {entityId: object.id});
            openEditor("object", object, {...context, types, photos, children}, () => location.reload());
            return;
        }

        // ======================================
        // Object delete
        // ======================================

        if(action === "delete-object") {
            if(!confirm("Удалить объект и все дочерние сущности?")) return;
            await deleteObject(id);
            location.reload();
            return;
        }

        // ======================================
        // Add object
        // ======================================

        if(action === "add-object") {
            setModalUrl("object-editor", {entityId: null});
            openEditor("object", null, {...context, types, photos, children: []}, () => location.reload());
            return;
        }

        // ======================================
        // Add photo
        // ======================================

        if(action === "add-photo") {
            setModalUrl("entity-editor", {entityId: null, entityType: "photo"});
            openEditor("photo", null, context, () => location.reload());
            return;
        }

        // ======================================
        // Edit photo
        // ======================================

        if(action === "edit-photo") {
            const photo = photos.find(photo => photo.id === id);
            if(!photo) return;
            setModalUrl("entity-editor", {entityId: photo.id, entityType: "photo"});
            openEditor("photo", photo, context, () => location.reload());
            return;
        }

        // ======================================
        // Delete photo
        // ======================================

        if(action === "delete-photo") {
            if(!confirm("Удалить фотографию?")) return;

            const photo = photos.find(photo => photo.id === id);

            try {
                if(photo?.storagePath) await moveFileToDeleted(photo.storagePath);
                await deletePhoto(id);
                location.reload();
            } catch(error) {
                console.error("Ошибка удаления фотографии:", error);
                alert("Не удалось удалить фотографию");
            }

            return;
        }

        // ======================================
        // Add source
        // ======================================

        if(action === "add-source") {
            setModalUrl("entity-editor", {entityId: null, entityType: "source"});
            openEditor("source", null, context, () => location.reload());
            return;
        }

        // ======================================
        // Edit source
        // ======================================

        if(action === "edit-source") {
            const source = sources.find(source => source.id === id);
            if(!source) return;
            setModalUrl("entity-editor", {entityId: source.id, entityType: "source"});
            openEditor("source", source, context, () => location.reload());
            return;
        }

        // ======================================
        // Delete source
        // ======================================

        if(action === "delete-source") {
            if(!confirm("Удалить источник?")) return;

            const source = sources.find(source => source.id === id);

            try {
                if(source?.storagePath) await moveFileToDeleted(source.storagePath);
                await deleteSource(id);
                location.reload();
            } catch(error) {
                console.error("Ошибка удаления источника:", error);
                alert("Не удалось удалить источник");
            }

            return;
        }

        // ======================================
        // Add record
        // ======================================

        if(action === "add-record") {
            setModalUrl("entity-editor", {entityId: null, entityType: "record"});
            openEditor("record", null, context, () => location.reload());
            return;
        }

        // ======================================
        // Edit record
        // ======================================

        if(action === "edit-record") {
            const record = records.find(record => record.id === id);
            if(!record) return;
            setModalUrl("entity-editor", {entityId: record.id, entityType: "record"});
            openEditor("record", record, context, () => location.reload());
            return;
        }

        // ======================================
        // Delete record
        // ======================================

        if(action === "delete-record") {
            if(!confirm("Удалить запись?")) return;
            await deleteRecord(id);
            location.reload();
            return;
        }
    });
}
