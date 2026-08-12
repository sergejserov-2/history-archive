// ======================================
// Admin updates
// ======================================
import {deleteObject, createObject, updateObject} from "../api/objects.js";
import {deletePhoto} from "../api/photos.js";
import {deleteSource} from "../api/sources.js";
import {deleteRecord} from "../api/records.js";
import {moveFileToDeleted} from "../api/storage.js";
// ======================================
// Save
// ======================================
export async function saveEntity(type, entity, data, cfg) {
    if(!entity?.id) return await cfg.create(data);
    await cfg.update(entity.id, data);
    return {id: entity.id, ...data};
}
// ======================================
// Delete
// ======================================
export async function deleteEntity(type, id, context = {}) {
    if(type === "object") {
        await deleteObject(id);
        await context.updates?.onObjectDeleted?.(id);
        return;
    }
    if(type === "photo") {
        const photo = (context.photos ?? []).find(photo => photo.id === id);
        if(photo?.storagePath) await moveFileToDeleted(photo.storagePath);
        await deletePhoto(id);
        await context.updates?.onPhotoDeleted?.(id);
        return;
    }
    if(type === "source") {
        const source = (context.sources ?? []).find(source => source.id === id);
        if(source?.storagePath) await moveFileToDeleted(source.storagePath);
        await deleteSource(id);
        await context.updates?.onSourceDeleted?.(id);
        return;
    }
    if(type === "record") {
        await deleteRecord(id);
        await context.updates?.onRecordDeleted?.(id);
        return;
    }
    throw new Error(`Unknown entity type: ${type}`);
}
