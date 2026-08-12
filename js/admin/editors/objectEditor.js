// ======================================
// Object editor
// ======================================

import {createObject, updateObject} from "../../api/objects.js";
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
// Open
// ======================================

export function openObjectEditor(object, types, objects, photos, children, context, onSave) {
    const cfg = {
        ...CONFIG,
        cover: {
            ...CONFIG.cover,
            photos: object ? photos.filter(photo => photo.parents?.includes(object.id)) : []
        },
        options: {
            ...CONFIG.options,
            types,
            objects,
            children,
            parentId: context?.parentId
        }
    };
    const form = renderEntityEditor(cfg, object);
    const modal = createModal({
        title: object ? "Изменить объект" : "Добавить объект",
        content: form
    });
    const root = modal.root;
    const editor = setupEditorComponents(root, cfg, { ...context, objects, types, children }, object);
    setupEditorButtons(root, async() => {
        try {
            const data = await editor.getData();
            if(!data) return;
            if(object) await updateObject(object.id, data);
            else await createObject(data);
            modal.close();
            onSave?.();
        } catch(error) {
            console.error(error);
            alert("Ошибка сохранения");
        }
    }, () => modal.close());
}
