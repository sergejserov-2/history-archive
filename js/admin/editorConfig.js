// ======================================
// Editor config
// ======================================
import {createModal} from "../ui/components/modal.js";
import {
    renderEntityEditor,
    setupEditorComponents,
    setupEditorButtons
}
from "../ui/components/editor.js";
import {
    getEntity,
    updateEntity,
    uploadPhoto,
    uploadSourceDocument
}
from "./update.js";
// ======================================
// Config
// ======================================
const CONFIG = {
    object: {
        title: "Объект",
        fields: [],
        status: true,
        parentsType: "objectsWithAddress",
        parentsRequiredMessage: "Нужен хотя бы один родитель",
        limits: {
            title: 60,
            description: 350
        },
        cover: {
            photos: []
        },
        options: {
            typeSelector: true,
            types: [],
            defaultTypeId: "",
            disabledTypeIds: []
        },
        updates: [
            "updateObjectBlock",
            "updateRecordsBlock"
        ]
    },
    photo: {
        title: "Фото",
        upload: uploadPhoto,
        file: true,
        fileRequired: true,
        fileRequiredMessage: "Для фотографии необходимо выбрать файл",
        parentsType: "objects",
        dateMode: "date",
        limits: {
            title: 45,
            description: 350,
            author: 45
        },
        fields: [
            "author",
            "date"
        ],
        updates: [
            "updatePhotosBlock"
        ]
    },
    source: {
        title: "Источник",
        upload: uploadSourceDocument,
        file: true,
        parentsType: "objects",
        dateMode: "date",
        limits: {
            title: 45,
            description: 2000,
            author: 45
        },
        fields: [
            "author",
            "date"
        ],
        updates: [
            "updateSourcesBlock"
        ]
    },
    record: {
        title: "Запись",
        file: false,
        parentsType: "objects",
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
        },
        updates: [
            "updateRecordsBlock"
        ]
    }
};
// ======================================
// Default entity
// ======================================
function getDefaultEntity(type) {
    if(type === "object") return {title: "Новый объект"};
    if(type === "photo") return {title: "Новая фотография"};
    if(type === "source") return {title: "Новый источник"};
    if(type === "record") return {title: "Новая запись"};
    return {};
}
// ======================================
// Config
// ======================================
function getConfig(type, entity, context = {}) {
    const base = CONFIG[type];
    if(!base) {
        console.error("Unknown entity type", type);
        return null;
    }
    const cfg = {
        ...base,
        options: {
            ...(base.options ?? {})
        }
    };
    if(cfg.options.typeSelector) {
        cfg.options.types =
            context.recordTypes ??
            context.types ??
            [];
        cfg.options.objects =
            context.objects ??
            [];
        cfg.options.children =
            context.children ??
            [];
        cfg.options.parentId =
            context.parentId;
    }
    if(type === "object") {
        cfg.options.types =
            context.types ??
            [];
        cfg.options.objects =
            context.objects ??
            [];
        cfg.options.children =
            context.children ??
            [];
        cfg.options.parentId =
            context.parentId;
        cfg.cover = {
            ...cfg.cover,
            photos: entity
                ? (context.photos ?? []).filter(
                    photo =>
                        photo.parents?.includes(
                            entity.id
                        )
                )
                : []
        };
    }
    return cfg;
}
// ======================================
// Open
// ======================================

export async function openEditor(type, entity, context = {}) {
    if(entity?.id) {
        entity = await getEntity(type, entity.id);
        if(!entity) return;
    }

    const isNew = !entity;
    entity = entity ?? getDefaultEntity(type);

    const cfg = getConfig(type, entity, context);
    if(!cfg) return;
    const form =
        renderEntityEditor(
            cfg,
            entity
        );
    const modal =
        createModal({
            title:
                entity.id
                ? `Изменить ${cfg.title.toLowerCase()}`
                : `Добавить ${cfg.title.toLowerCase()}`,
            content: form
        });
    const root =
        modal.root;
    const editor =
        setupEditorComponents(
            root,
            cfg,
            context,
            entity
        );
    setupEditorButtons(
        root,
        async() => {
            try {
                const data =
                    await editor.getData();
                if(!data) return;
                await updateEntity(
                    type,
                    entity,
                    data,
                    context,
                    cfg.updates ?? []
                );
                modal.close();
            } catch(error) {
                console.error(
                    "Ошибка сохранения:",
                    error
                );
                alert(
                    "Ошибка сохранения"
                );
            }
        },
        () => modal.close()
    );
}
