// ======================================
// MODAL REGISTRY
// ======================================

import {getPhotos} from "../../api/photos.js";
import {getSources} from "../../api/sources.js";
import {getRecords} from "../../api/records.js";
import {getObject, getType, getChildren, getAllObjects} from "../../api/objects.js";
import {getTypes} from "../../api/types.js";
import {getSubject, getSubjects} from "../../api/subjects.js";
import {openPhotoViewer} from "./photoViewer.js";
import {openEditor} from "../../admin/editorConfig.js";
import {openSubjectModal} from"./subject.js";
// ======================================
// PHOTO PREVIEW
// ======================================

export const photoPreviewModal = {
    type: "photo-preview",
    params: ["id", "entityId"],
    load: async params => {
        if(!params.id || !params.entityId) return null;
        const photos = await getPhotos(params.id);
        const photo = photos.find(item => item.id === params.entityId);
        if(!photo) return null;
        return {photo, photos};
    },
    open: async data => {
        if(!data) return;
        openPhotoViewer(data.photo, {fromUrl: true, photos: data.photos});
    }
};

// ======================================
// ENTITY EDITOR
// ======================================

export const entityEditorModal = {
    type: "entity-editor",
    params: ["id", "entityId", "entityType"],
    load: async params => {
        if(!params.id || !params.entityType) return null;
        if(!["photo", "source", "record"].includes(params.entityType)) {
            console.error("Unknown entity type:", params.entityType);
            return null;
        }

        const objects = await getAllObjects();

        if(!params.entityId) {
            return {
                entity: null,
                objects,
                parentId: params.id,
                type: params.entityType
            };
        }

        let entities = [];

        if(params.entityType === "photo") {
            entities = await getPhotos(params.id);
        } else if(params.entityType === "source") {
            entities = await getSources(params.id);
        } else if(params.entityType === "record") {
            entities = await getRecords(params.id);
        }

        const entity = entities.find(item => item.id === params.entityId);

        if(!entity) return null;

        return {
            entity,
            objects,
            parentId: params.id,
            type: params.entityType
        };
    },
    open: async data => {
        if(!data) return;
        openEditor(
            data.type,
            data.entity,
            {
                parentId: data.parentId,
                objects: data.objects
            },
            () => location.reload()
        );
    }
};

// ======================================
// OBJECT EDITOR
// ======================================

export const objectEditorModal = {
    type: "object-editor",
    params: ["id", "entityId"],
    load: async params => {
        if(!params.id || !params.entityId) return null;

        const object = await getObject(params.entityId);
        if(!object) return null;

        const hasParent = (object.parents ?? []).some(parent =>
            typeof parent === "string"
                ? parent === params.id
                : parent?.objectId === params.id
        );

        if(!hasParent) return null;

        const [type, types, objects, children, photos] = await Promise.all([
            getType(object.typeId),
            getTypes(),
            getAllObjects(),
            getChildren(object.id),
            getPhotos(object.id)
        ]);

        return {
            object,
            type,
            types,
            objects,
            children,
            photos,
            context: {
                parentId: params.id,
                objects
            }
        };
    },
    open: async data => {
        if(!data) return;
        openEditor(
            "object",
            data.object,
            {
                ...data.context,
                types: data.types,
                objects: data.objects,
                children: data.children,
                photos: data.photos
            },
            () => location.reload()
        );
    }
};

// ======================================
// LOGIN
// ======================================

export const loginModal = {
    type: "login",
    params: [],
    load: null,
    open: null
};

// ======================================
// SUBJECT
// ======================================

// ======================================
// SUBJECT
// ======================================
export const subjectModal={
    type:"subject",
    params:["id","entityId"],
    load:async params=>{
        if(!params.id||!params.entityId)return null;
        const subject=
            await getSubject(
                params.entityId
            );
        if(!subject)return null;
        const subjects=
            await getSubjects();
        return{
            subject,
            subjects
        };
    },
    open:async data=>{
        if(!data)return;
openSubjectModal(
    data.subject,
    {
        subjects:data.subjects,
        fromUrl: true,
        ADMIN_MODE:data.ADMIN_MODE
    }
);
    }
};

// ======================================
// ALL MODALS
// ======================================

export const modalRegistry = [
    photoPreviewModal,
    entityEditorModal,
    objectEditorModal,
    loginModal,
    subjectModal
];
