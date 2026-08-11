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

    // ==================================
    // New entity defaults
    // ==================================

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

    // ==================================
    // Parents
    // ==================================

    const parents = entity.parents
        ? [...entity.parents]
        : context.parentId
            ? [context.parentId]
            : [];

    // ==================================
    // Render form
    // ==================================

    const form = renderConfiguredEntityEditor(
        cfg,
        entity,
        context
    );

    // ==================================
    // Modal
    // ==================================

    const modal = createModal({
        title:
            entity?.id
                ? `Изменить ${cfg.title.toLowerCase()}`
                : `Добавить ${cfg.title.toLowerCase()}`,
        content: form
    });

    const root = modal.root;

    // ==================================
    // Editor components
    // ==================================

    const {
        fileEditor,
        parentsEditor,
        coverEditor,
        fieldsEditor
    } = setupEditorComponents(
        root,
        cfg,
        context,
        entity,
        parents
    );

    // ==================================
    // Buttons
    // ==================================

    setupEditorButtons(
        root,
        async() => {
            try {
                // ==================================
                // Photo must have a file
                // ==================================

                if(type === "photo" && !fileEditor?.hasFile()) {
                    alert("Для фотографии необходимо выбрать файл");
                    return;
                }

                // ==================================
                // Entity data
                // ==================================

                const data = {
                    ...fieldsEditor.getData(),
                    parents: parentsEditor.getParents()
                };

                // ==================================
                // Cover data
                // ==================================

                if(coverEditor) {
                    Object.assign(
                        data,
                        coverEditor.getData()
                    );
                }

                // ==================================
                // File data
                // ==================================

                const fileData = await fileEditor?.getData();

                if(fileData) {
                    Object.assign(data, fileData);
                }

                // ==================================
                // Update existing entity
                // ==================================

                if(!isNew) {
                    await cfg.update(entity.id, data);
                }

                // ==================================
                // Create new entity
                // ==================================

                else {
                    if(parentsEditor.getParents().length === 0) {
                        alert("Нужен хотя бы один родитель");
                        return;
                    }

                    await cfg.create(data);
                }

                // ==================================
                // Close
                // ==================================

                modal.close();
                onSave?.();
            }
            catch(error) {
                console.error(error);
                alert("Ошибка сохранения");
            }
        },
        () => {
            modal.close();
        }
    );
}
