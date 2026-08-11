// ======================================
// Entity editor
// ======================================

import {createModal} from "../../ui/components/modal.js";
import {
    renderConfiguredEntityEditor,
    setupEditorComponents,
    setupEditorButtons
} from "../../ui/components/editor.js";
import {
    uploadPhoto,
    uploadSourceDocument
} from "../../api/storage.js";
import {
    updatePhoto,
    createPhoto
} from "../../api/photos.js";
import {
    updateSource,
    createSource
} from "../../api/sources.js";
import {
    updateRecord,
    createRecord
} from "../../api/records.js";

// ======================================
// Config
// ======================================

const CONFIG = {
    photo: {
        title: "Фото",
        update: updatePhoto,
        create: createPhoto,
        upload: uploadPhoto,
        file: true,
        dateMode: "date",
        limits: {
            title: 45,
            description: 350,
            author: 45
        },
        fields: [
            "author",
            "date"
        ]
    },
    source: {
        title: "Источник",
        update: updateSource,
        create: createSource,
        upload: uploadSourceDocument,
        file: true,
        dateMode: "date",
        limits: {
            title: 45,
            description: 2000,
            author: 45
        },
        fields: [
            "author",
            "date"
        ]
    },
    record: {
        title: "Запись",
        update: updateRecord,
        create: createRecord,
        file: false,
        dateMode: "period",
        limits: {
            title: 45,
            description: 75
        },
        fields: [
            "dateStart",
            "dateEnd"
        ],
        options: {
            typeSelector: true
        }
    }
};

// ======================================
// Open
// ======================================

export function openEntityEditor(type, entity, context, onSave) {
    const cfg = CONFIG[type];
    if(!cfg) {
        console.error("Unknown entity type", type);
        return;
    }
    const isNew = !entity;
    if(isNew) {
        entity = {
            title:
                type === "photo"
                    ? "Новая фотография"
                    : type === "source"
                        ? "Новый источник"
                        : "Новая запись"
        };
    }
    const parents = entity.parents
        ? [...entity.parents]
        : context.parentId
            ? [context.parentId]
            : [];
    const form = renderConfiguredEntityEditor(cfg, entity, context);
    const modal = createModal({
        title: entity?.id
            ? `Изменить ${cfg.title.toLowerCase()}`
            : `Добавить ${cfg.title.toLowerCase()}`,
        content: form
    });
    const root = modal.root;
    const editor = setupEditorComponents(root, cfg, context, entity, parents);
    setupEditorButtons(
        root,
        async() => {
            try {
                if(type === "photo" && !editor.fileEditor?.hasFile()) {
                    alert("Для фотографии необходимо выбрать файл");
                    return;
                }
                const data = await editor.getData();
                if(!isNew) {
                    await cfg.update(entity.id, data);
                } else {
                    if(editor.parentsEditor.getParents().length === 0) {
                        alert("Нужен хотя бы один родитель");
                        return;
                    }
                    await cfg.create(data);
                }
                modal.close();
                onSave?.();
            } catch(error) {
                console.error(error);
                alert("Ошибка сохранения");
            }
        },
        () => {
            modal.close();
        }
    );
}
