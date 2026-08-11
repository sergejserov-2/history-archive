export function renderTypesEditorHTML(types, entity, options = {}) {
    const sortedTypes = [...types]
        .sort((a, b) => {
            const levelA = Array.isArray(a.levels)
                ? Math.max(...a.levels.map(Number))
                : Number(a.level ?? Infinity);
            const levelB = Array.isArray(b.levels)
                ? Math.max(...b.levels.map(Number))
                : Number(b.level ?? Infinity);
            if (levelA !== levelB) {
                return levelB - levelA;
            }
            return (a.title ?? "").localeCompare(b.title ?? "", "ru");
        });
    return `
        <label class="entity-type">
            Тип
            <select id="entityType">
                ${sortedTypes
                    .map(type => `
                        <option
                            value="${type.id}"
                            ${type.id === (entity.typeId ?? options.defaultTypeId) ? "selected" : ""}
                            ${options.disabledTypeIds?.includes(type.id) ? "disabled" : ""}
                        >
                            ${type.title}
                        </option>
                    `)
                    .join("")}
            </select>
        </label>
    `;
}

export function setupTypesEditor(root, entity) {
    const select = root.querySelector("#entityType");
    let typeId = entity?.typeId ?? null;
    if (!select) {
        return {
            getTypeId() {
                return typeId;
            }
        };
    }
    select.addEventListener("change", () => {
        typeId = select.value || null;
    });
    return {
        getTypeId() {
            return typeId;
        }
    };
}
