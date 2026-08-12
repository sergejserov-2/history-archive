// ======================================
// Object editor
// ======================================

import {doc, updateDoc} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {db} from "../../firebase.js";
import {createObject} from "../../api/objects.js";
import {createModal} from "../../ui/components/modal.js";
import {renderEntityEditor, setupEditorComponents, setupEditorButtons} from "../../ui/components/editor.js";

// ======================================
// Config
// ======================================

const CONFIG = {
    title: "Объект",
    fields: [],
    status: true,
    parentsType: "objectsWithAddress",
    parentsRequiredMessage: "Нужен хотя бы один родитель",
    limits: {title: 60, description: 350},
    cover: {photos: []},
    options: {
        typeSelector: true,
        types: [],
        defaultTypeId: "",
        disabledTypeIds: []
    }
};

// ======================================
// Render
// ======================================

export function renderObjectEditor(object, types, objects, photos, children, context) {
    const objectPhotos = object ? photos.filter(photo => photo.parents?.includes(object.id)) : [];
    const parent = !object && context?.parentId ? objects.find(item => item.id === context.parentId) : null;
    const parentType = parent ? types.find(type => type.id === parent.typeId) : null;
    const cfg = {
        ...CONFIG,
        cover: {...CONFIG.cover, photos: objectPhotos},
        options: {
            ...CONFIG.options,
            types,
            defaultTypeId: getDefaultTypeId(object, parentType, types, objects),
            disabledTypeIds: getDisabledTypeIds(object, types, children)
        }
    };
    return renderEntityEditor(cfg, object);
}

// ======================================
// Type helpers
// ======================================

function getDefaultTypeId(object, parentType, types, objects) {
    if(object) return object.typeId ?? "";
    if(!parentType) return "";
    const level = Number(parentType.level) - 1;
    const available = types.filter(type => Number(type.level) === level);
    if(!available.length) return "";
    const counts = {};
    objects.forEach(item => {
        if(item.typeId) counts[item.typeId] = (counts[item.typeId] ?? 0) + 1;
    });
    available.sort((a, b) => {
        const countA = counts[a.id] ?? 0;
        const countB = counts[b.id] ?? 0;
        if(countA !== countB) return countB - countA;
        return (a.title ?? "").localeCompare(b.title ?? "", "ru");
    });
    return available[0].id;
}

function getDisabledTypeIds(object, types, children) {
    if(!object || !children.length) return [];
    const maxLevel = Math.max(...children.map(child => {
        const type = types.find(item => item.id === child.typeId);
        return type?.level ?? -Infinity;
    }));
    return types.filter(type => Number(type.level) <= Number(maxLevel)).map(type => type.id);
}

// ======================================
// Open
// ======================================

export function openObjectEditor(object, types, objects, photos, children, context, onSave) {
    const parentType = context?.parentId
        ? types.find(type => type.id === objects.find(item => item.id === context.parentId)?.typeId)
        : null;
    const cfg = {
        ...CONFIG,
        options: {
            ...CONFIG.options,
            types,
            defaultTypeId: getDefaultTypeId(object, parentType, types, objects),
            disabledTypeIds: getDisabledTypeIds(object, types, children)
        },
        cover: {
            ...CONFIG.cover,
            photos: object ? photos.filter(photo => photo.parents?.includes(object.id)) : []
        }
    };
    const form = renderEntityEditor(cfg, object);
    const modal = createModal({
        title: object ? "Изменить объект" : "Добавить объект",
        content: form
    });
    const root = modal.root;
    const editor = setupEditorComponents(root, cfg, {...context, objects, types, children}, object);
    setupEditorButtons(root, async() => {
        try {
            const data = await editor.getData();
            if(!data) return;
            if(object) {
                await updateDoc(doc(db, "objects", object.id), data);
            } else {
                await createObject(data);
            }
            modal.close();
            onSave?.();
        } catch(error) {
            console.error(error);
            alert("Ошибка сохранения");
        }
    }, () => modal.close());
}
