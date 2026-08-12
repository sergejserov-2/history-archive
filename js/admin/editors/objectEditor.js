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
    options: {typeSelector: true, types: [], defaultTypeId: "", disabledTypeIds: []}
};

// ======================================
// Render
// ======================================

export function renderObjectEditor(object, types, objects, photos, children, context) {
    const objectPhotos = object ? photos.filter(photo => photo.parents?.includes(object.id)) : [];
    const cfg = {...CONFIG, cover: {...CONFIG.cover, photos: objectPhotos}, options: {...CONFIG.options, types}};
    return renderEntityEditor(cfg, object);
}

// ======================================
// Open
// ======================================

export function openObjectEditor(object, types, objects, photos, children, context, onSave) {
    const objectPhotos = object ? photos.filter(photo => photo.parents?.includes(object.id)) : [];
    const cfg = {...CONFIG, cover: {...CONFIG.cover, photos: objectPhotos}, options: {...CONFIG.options, types}};
    const form = renderEntityEditor(cfg, object);
    const modal = createModal({title: object ? "Изменить объект" : "Добавить объект", content: form});
    const root = modal.root;
    const editor = setupEditorComponents(root, cfg, {...context, objects, types, children}, object);
    setupEditorButtons(root, async() => {
        try {
            const data = await editor.getData();
            if(!data) return;
            if(object) await updateDoc(doc(db, "objects", object.id), data);
            else await createObject(data);
            modal.close();
            onSave?.();
        } catch(error) {
            console.error(error);
            alert("Ошибка сохранения");
        }
    }, () => modal.close());
}
