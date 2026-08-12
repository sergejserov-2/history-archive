// ======================================
// Types editor
// ======================================

export function renderTypesEditorHTML(types, entity, options = {}) {
    const defaultTypeId = getDefaultTypeId(entity, types, options);
    const disabledTypeIds = getDisabledTypeIds(entity, types, options);
    const sortedTypes = sortTypes(types);
    return `
        <label class="entity-type">
            Тип
            <select id="entityType">
                ${sortedTypes.map(type => `
                    <option
                        value="${type.id}"
                        ${type.id === (entity?.typeId ?? defaultTypeId) ? "selected" : ""}
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
    let typeId = entity?.typeId ?? getDefaultTypeId(entity, options.types ?? [], options);
    if(!select) return {getTypeId() {return typeId;}};
    typeId = select.value || typeId || null;
    select.onchange = () => {
        typeId = select.value || null;
        options.onChange?.(getType(typeId, options.types ?? []));
    };
    return {getTypeId() {return typeId;}};
}

// ======================================
// Default type
// ======================================

function getDefaultTypeId(entity, types, options) {
    if(entity?.typeId) return entity.typeId;
    const parentType = getParentType(options);
    if(!parentType) return "";
    const parentLevel = getTypeLevel(parentType);
    if(parentLevel === null) return "";
    const level = parentLevel - 1;
    const available = types.filter(type => getTypeLevel(type) === level);
    if(!available.length) return "";
    const counts = {};
    const objects = options.objects ?? [];
    objects.forEach(object => {
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
    const maxLevel = Math.max(
        ...children.map(child => {
            const type = getType(child.typeId, types);
            return getTypeLevel(type) ?? -Infinity;
        })
    );
    return types
        .filter(type => {
            const level = getTypeLevel(type);
            return level !== null && level <= maxLevel;
        })
        .map(type => type.id);
}

// ======================================
// Parent type
// ======================================

function getParentType(options) {
    const parentId = options.parentId;
    if(!parentId) return null;
    const objects = options.objects ?? [];
    const types = options.types ?? [];
    const parent = objects.find(object => object.id === parentId);
    return getType(parent?.typeId, types);
}

// ======================================
// Type helpers
// ======================================

function getType(id, types) {
    return types.find(type => type.id === id);
}

function getTypeLevel(type) {
    if(!type) return null;
    if(type.level !== undefined && type.level !== null) {
        const level = Number(type.level);
        return Number.isFinite(level) ? level : null;
    }
    if(Array.isArray(type.levels) && type.levels.length) {
        const levels = type.levels.map(Number).filter(Number.isFinite);
        return levels.length ? Math.max(...levels) : null;
    }
    return null;
}

function sortTypes(types) {
    return [...types].sort((a, b) => {
        const levelA = getTypeLevel(a) ?? Infinity;
        const levelB = getTypeLevel(b) ?? Infinity;
        if(levelA !== levelB) return levelB - levelA;
        return (a.title ?? "").localeCompare(b.title ?? "", "ru");
    });
}
