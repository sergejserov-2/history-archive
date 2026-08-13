import { createDropdown } from "../dropdown.js";

// ======================================
// Types editor
// ======================================

export function renderTypesEditorHTML() {
    return `
        <label class="entity-type">
            Тип
            <input
                id="entityType"
                class="entity-type__input"
                type="text"
                readonly
                autocomplete="off"
                placeholder="Выберите тип"
            >
        </label>
    `;
}

// ======================================
// Setup
// ======================================

export function setupTypesEditor(root, entity, options = {}) {
    const container = root.querySelector("#entityType");

    if(!container) {
        return {
            getTypeId() {
                return null;
            }
        };
    }

    const types = options.types ?? [];
    const disabledTypeIds = getDisabledTypeIds(entity, types, options);
    const sortedTypes = sortTypes(types);
    const selectedTypeId =
        entity?.typeId ??
        getDefaultTypeId(entity, types, options);

    const dropdown = createDropdown();

    let selectedType =
        getType(selectedTypeId, types);

    dropdown.setItems(
        sortedTypes.map(type => ({
            id: type.id,
            title: type.title,
            disabled: disabledTypeIds.includes(type.id)
        })),
        {
            onSelect(type) {
                selectedType =
                    getType(type.id, types);

                container.textContent =
                    selectedType?.title ?? "Выберите тип";

                dropdown.close();

                container.dispatchEvent(
                    new CustomEvent(
                        "typechange",
                        {
                            bubbles: true,
                            detail: selectedType
                        }
                    )
                );
            }
        }
    );

    container.textContent =
        selectedType?.title ??
        "Выберите тип";

    container.addEventListener(
        "click",
        () => {
            dropdown.toggle(container);
        }
    );

    return {
        getTypeId() {
            return selectedType?.id ?? null;
        }
    };
}

// ======================================
// Default type
// ======================================

function getDefaultTypeId(entity, types, options) {
    if(entity?.typeId) {
        return entity.typeId;
    }

    const parentType =
        getParentType(options);

    if(!parentType) {
        return "";
    }

    const parentLevel =
        Number(parentType.level);

    const available =
        types.filter(
            type =>
                Number(type.level) ===
                parentLevel - 1
        );

    if(!available.length) {
        return "";
    }

    const counts = {};

    (options.objects ?? []).forEach(object => {
        if(object.typeId) {
            counts[object.typeId] =
                (counts[object.typeId] ?? 0) + 1;
        }
    });

    available.sort((a, b) => {
        const countA =
            counts[a.id] ?? 0;

        const countB =
            counts[b.id] ?? 0;

        if(countA !== countB) {
            return countB - countA;
        }

        return (a.title ?? "").localeCompare(
            b.title ?? "",
            "ru"
        );
    });

    return available[0].id;
}

// ======================================
// Disabled types
// ======================================

function getDisabledTypeIds(entity, types, options) {
    if(!entity?.id) {
        return [];
    }

    const children =
        options.children ?? [];

    if(!children.length) {
        return [];
    }

    const maxLevel =
        Math.max(
            ...children.map(child => {
                const type =
                    getType(
                        child.typeId,
                        types
                    );

                return type
                    ? Number(type.level)
                    : -Infinity;
            })
        );

    return types
        .filter(
            type =>
                Number(type.level) <=
                maxLevel
        )
        .map(
            type => type.id
        );
}

// ======================================
// Parent type
// ======================================

function getParentType(options) {
    if(!options.parentId) {
        return null;
    }

    const parent =
        (options.objects ?? []).find(
            object =>
                object.id ===
                options.parentId
        );

    return getType(
        parent?.typeId,
        options.types ?? []
    );
}

// ======================================
// Type helpers
// ======================================

function getType(id, types) {
    return types.find(
        type => type.id === id
    ) ?? null;
}

function sortTypes(types) {
    return [...types].sort((a, b) => {
        const levelA =
            Number(a.level ?? Infinity);

        const levelB =
            Number(b.level ?? Infinity);

        if(levelA !== levelB) {
            return levelB - levelA;
        }

        return (a.title ?? "").localeCompare(
            b.title ?? "",
            "ru"
        );
    });
}
