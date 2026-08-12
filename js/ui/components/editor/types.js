// ======================================
// Types editor
// ======================================

export function renderTypesEditorHTML(types, entity, options = {}) {
    const defaultTypeId = getDefaultTypeId(entity, types, options);
    const disabledTypeIds = getDisabledTypeIds(entity, types, options);
    const sortedTypes = sortTypes(types);
    const selectedTypeId = entity?.typeId ?? defaultTypeId;
    return `
        <label class="entity-type">
            Тип
            <select id="entityType">
                ${sortedTypes.map(type => `
                    <option
                        value="${type.id}"
                        ${type.id === selectedTypeId ? "selected" : ""}
                        ${disabledTypeIds.includes(type.id) ? "disabled" : ""}
                    >
                        ${type.title}
                    </option>
                `).join("")}
            </select>
        </label>
    `;
}

// ======================================
// Setup
// ======================================

export function setupTypesEditor(root, entity, options = {}) {
    const select = root.querySelector("#entityType");
    if(!select) return {getTypeId() {return null;}};
    return {getTypeId() {return select.value || null;}};
}

// ======================================
// Default type
// ======================================

function getDefaultTypeId(entity, types, options) {
    if(entity?.typeId) return entity.typeId;
    const parentType = getParentType(options);
    if(!parentType) return "";
    const parentLevel = Number(parentType.level);
    const available = types.filter(type => Number(type.level) === parentLevel - 1);
    if(!available.length) return "";
    const counts = {};
    (options.objects ?? []).forEach(object => {
        if(object.typeId) counts[object.typeId] = (counts[object.typeId] ?? 0) + 1;
    });
    available.sort((a, b) => {
        const countA = counts[a.id] ?? 0;
        const countB = counts[b.id] ?? 0;
        if(countA !== countB) return countB - countA;
        return (a.title ?? "").localeCompare(b.title ?? "", "ru");
    });
    return available[0].id;
}

// ======================================
// Disabled types
// ======================================

function getDisabledTypeIds(entity, types, options) {
    if(!entity?.id) return [];
    const children = options.children ?? [];
    if(!children.length) return [];
    const maxLevel = Math.max(...children.map(child => {
        const type = getType(child.typeId, types);
        return type ? Number(type.level) : -Infinity;
    }));
    return types.filter(type => Number(type.level) <= maxLevel).map(type => type.id);
}

// ======================================
// Parent type
// ======================================

function getParentType(options) {
    if(!options.parentId) return null;
    const parent = (options.objects ?? []).find(object => object.id === options.parentId);
    return getType(parent?.typeId, options.types ?? []);
}

// ======================================
// Type helpers
// ======================================

function getType(id, types) {
    return types.find(type => type.id === id) ?? null;
}

function sortTypes(types) {
    return [...types].sort((a, b) => {
        const levelA = Number(a.level ?? Infinity);
        const levelB = Number(b.level ?? Infinity);
        if(levelA !== levelB) return levelB - levelA;
        return (a.title ?? "").localeCompare(b.title ?? "", "ru");
    });
}
