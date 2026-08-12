// ======================================
// Object editor
// ======================================
import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {db} from "../../firebase.js";
import {createObject} from "../../api/objects.js";
import {createModal} from "../../ui/components/modal.js";
import {
    renderEntityEditor,
    setupEditorComponents,
    setupEditorButtons
} from "../../ui/components/editor.js";
// ======================================
// Config
// ======================================
const CONFIG = {
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
    }
};
// ======================================
// Render
// ======================================
export function renderObjectEditor(
    object,
    types,
    objects,
    photos,
    children,
    context
) {
    const objectPhotos = object
        ? photos.filter(
            photo => photo.parents?.includes(object.id)
        )
        : [];
    const parent = !object && context?.parentId
        ? objects.find(
            o => o.id === context.parentId
        )
        : null;
    const parentType = parent
        ? types.find(
            type => type.id === parent.typeId
        )
        : null;
    const defaultTypeId = getDefaultTypeId(
        object,
        parentType,
        types,
        objects
    );
    const disabledTypeIds = getDisabledTypeIds(
        object,
        types,
        children
    );
    const cfg = {
        ...CONFIG,
        cover: {
            ...CONFIG.cover,
            photos: objectPhotos
        },
        options: {
            ...CONFIG.options,
            types,
            defaultTypeId,
            disabledTypeIds
        }
    };
    return renderEntityEditor(cfg, object);
}
// ======================================
// Default type
// ======================================
function getDefaultTypeId(
    object,
    parentType,
    types,
    objects
) {
    if(object) {
        return object.typeId ?? "";
    }
    if(!parentType) {
        return "";
    }
    const targetLevel =
        Number(parentType.level) - 1;
    const availableTypes =
        types.filter(
            type =>
                Number(type.level) === targetLevel
        );
    if(availableTypes.length === 0) {
        return "";
    }
    const typeCounts = {};
    objects.forEach(existingObject => {
        if(!existingObject.typeId) {
            return;
        }
        typeCounts[existingObject.typeId] =
            (typeCounts[existingObject.typeId] ?? 0) + 1;
    });
    const sortedTypes = [...availableTypes].sort(
        (a, b) => {
            const countA =
                typeCounts[a.id] ?? 0;
            const countB =
                typeCounts[b.id] ?? 0;
            if(countA !== countB) {
                return countB - countA;
            }
            return (
                a.title ?? ""
            ).localeCompare(
                b.title ?? "",
                "ru"
            );
        }
    );
    return sortedTypes[0].id;
}
// ======================================
// Disabled types
// ======================================
function getDisabledTypeIds(
    object,
    types,
    children
) {
    if(!object || children.length === 0) {
        return [];
    }
    const maxChildLevel =
        Math.max(
            ...children.map(child => {
                const childType =
                    types.find(
                        type => type.id === child.typeId
                    );
                return childType?.level ?? -Infinity;
            })
        );
    return types
        .filter(
            type =>
                Number(type.level) <=
                Number(maxChildLevel)
        )
        .map(type => type.id);
}
// ======================================
// Open editor
// ======================================
export function openObjectEditor(
    object,
    types,
    objects,
    photos,
    children,
    context,
    onSave
) {
    const form = renderObjectEditor(
        object,
        types,
        objects,
        photos,
        children,
        context
    );
    const modal = createModal({
        title: object
            ? "Изменить объект"
            : "Добавить объект",
        content: form
    });
    const root = modal.root;
    const editor = setupEditorComponents(
        root,
        {
            ...CONFIG,
            options: {
                ...CONFIG.options,
                types,
                defaultTypeId: getDefaultTypeId(
                    object,
                    context?.parentId
                        ? types.find(
                            type =>
                                type.id ===
                                objects.find(
                                    o =>
                                        o.id ===
                                        context.parentId
                                )?.typeId
                        )
                        : null,
                    types,
                    objects
                ),
                disabledTypeIds: getDisabledTypeIds(
                    object,
                    types,
                    children
                )
            },
            cover: {
                ...CONFIG.cover,
                photos: object
                    ? photos.filter(
                        photo =>
                            photo.parents?.includes(
                                object.id
                            )
                    )
                    : []
            }
        },
        context,
        object
    );
    setupEditorButtons(
        root,
        async () => {
            try {
                const data = await editor.getData();
                if(!data) {
                    return;
                }
                if(object) {
                    await updateDoc(
                        doc(db, "objects", object.id),
                        data
                    );
                } else {
                    await createObject(data);
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
