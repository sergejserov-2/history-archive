import {getObject, deleteObject, createObject, updateObject} from "../api/objects.js";
import {getPhoto, deletePhoto, createPhoto, updatePhoto} from "../api/photos.js";
import {getSource, deleteSource, createSource, updateSource} from "../api/sources.js";
import {getRecord, deleteRecord, createRecord, updateRecord} from "../api/records.js";
import {moveFileToDeleted} from "../api/storage.js";

export async function getEntity(type, id) {
    if(type === "object") return await getObject(id);
    if(type === "photo") return await getPhoto(id);
    if(type === "source") return await getSource(id);
    if(type === "record") return await getRecord(id);
    throw new Error(`Unknown entity type: ${type}`);
}
// ======================================
// Save
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
// Save entity
// ======================================
export async function updateEntity(type, entity, data, context = {}, updates = []) {
    const api = API[type];
    if(!api) throw new Error(`Unknown entity type: ${type}`);
    let savedData;
    if(entity?.id) {
        await api.update(entity.id, data);
        savedData = {
            id: entity.id,
            ...data
        };
    } else {
        savedData = await api.create(data);
    }
    for(const update of updates) {
        const callback = context.updates?.[update];
        if(typeof callback === "function") {
            await callback(savedData);
        }
    }
    return savedData;
}
// ======================================
// Delete entity
// ======================================
export async function deleteEntity(type, id, context = {}) {
    if(type === "object") {
        await deleteObject(id);
        await context.updates?.onObjectDeleted?.(id);
        return;
    }
    if(type === "photo") {
        const photo = (context.photos ?? []).find(photo => photo.id === id);
        if(photo?.storagePath) {
            await moveFileToDeleted(photo.storagePath);
        }
        await deletePhoto(id);
        await context.updates?.updatePhotosBlock?.();
        return;
    }
    if(type === "source") {
        const source = (context.sources ?? []).find(source => source.id === id);
        if(source?.storagePath) {
            await moveFileToDeleted(source.storagePath);
        }
        await deleteSource(id);
        await context.updates?.updateSourcesBlock?.();
        return;
    }
    if(type === "record") {
        await deleteRecord(id);
        await context.updates?.updateRecordsBlock?.();
        return;
    }
    throw new Error(`Unknown entity type: ${type}`);
}
// ======================================
// Upload
// ======================================
export {
    uploadPhoto,
    uploadSourceDocument
};
