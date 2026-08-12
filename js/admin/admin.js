// ======================================
// Admin
// ======================================
import {openEditor} from "./editorConfig.js";
import {deleteEntity} from "./update.js";
import {setModalUrl} from "../ui/components/modal.js";
// ======================================
// Init
// ======================================
export function initAdmin(object, types, objects, photos, sources, records, children, recordTypes, updates = {}) {
    document.addEventListener("click", async event => {
        const button = event.target.closest(".admin-button");
        if(!button) return;
        const action = button.dataset.action;
        const id = button.dataset.id;
        const objectType = types.find(type => type.id === object?.typeId);
        const objectLevel = Number(objectType?.level);
        const availableRecordTypes = (recordTypes ?? []).filter(recordType => recordType.levels?.map(Number).includes(objectLevel));
        const context = {
            objects,
            parentId: object.id,
            recordTypes: availableRecordTypes,
            types,
            photos,
            children,
            updates
        };
        // ======================================
        // Object edit
        // ======================================
        if(action === "edit-object") {
            setModalUrl("object-editor", {entityId: object.id});
            openEditor("object", object, context);
            return;
        }
        // ======================================
        // Object delete
        // ======================================
        if(action === "delete-object") {
            if(!confirm("Удалить объект и все дочерние сущности?")) return;
            try {
                await deleteEntity("object", id, context);
            } catch(error) {
                console.error("Ошибка удаления объекта:", error);
                alert("Не удалось удалить объект");
            }
            return;
        }
        // ======================================
        // Add object
        // ======================================
        if(action === "add-object") {
            setModalUrl("object-editor", {entityId: null});
            openEditor("object", null, {...context, children: []});
            return;
        }
        // ======================================
        // Add photo
        // ======================================
        if(action === "add-photo") {
            setModalUrl("entity-editor", {entityId: null, entityType: "photo"});
            openEditor("photo", null, context);
            return;
        }
        // ======================================
        // Edit photo
        // ======================================
        if(action === "edit-photo") {
            const photo = photos.find(photo => photo.id === id);
            if(!photo) return;
            setModalUrl("entity-editor", {entityId: photo.id, entityType: "photo"});
            openEditor("photo", photo, context);
            return;
        }
        // ======================================
        // Delete photo
        // ======================================
        if(action === "delete-photo") {
            if(!confirm("Удалить фотографию?")) return;
            try {
                await deleteEntity("photo", id, context);
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
            openEditor("source", null, context);
            return;
        }
        // ======================================
        // Edit source
        // ======================================
        if(action === "edit-source") {
            const source = sources.find(source => source.id === id);
            if(!source) return;
            setModalUrl("entity-editor", {entityId: source.id, entityType: "source"});
            openEditor("source", source, context);
            return;
        }
        // ======================================
        // Delete source
        // ======================================
        if(action === "delete-source") {
            if(!confirm("Удалить источник?")) return;
            try {
                await deleteEntity("source", id, context);
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
            openEditor("record", null, context);
            return;
        }
        // ======================================
        // Edit record
        // ======================================
        if(action === "edit-record") {
            const record = records.find(record => record.id === id);
            if(!record) return;
            setModalUrl("entity-editor", {entityId: record.id, entityType: "record"});
            openEditor("record", record, context);
            return;
        }
        // ======================================
        // Delete record
        // ======================================
        if(action === "delete-record") {
            if(!confirm("Удалить запись?")) return;
            try {
                await deleteEntity("record", id, context);
            } catch(error) {
                console.error("Ошибка удаления записи:", error);
                alert("Не удалось удалить запись");
            }
            return;
        }
    });
}
