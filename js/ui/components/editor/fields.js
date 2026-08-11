// ======================================
// Entity fields editor
// ======================================

export function renderFieldsEditorHTML(cfg = {}, entity = {}, limits = {}) {
    const titleField = `
        <label>
            Название
            <input
                id="entityTitle"
                value="${entity.title ?? ""}"
                maxlength="${limits.title ?? 45}"
            >
            <div
                class="entity-field-counter"
                data-counter-for="entityTitle"
            ></div>
        </label>
    `;

    const descriptionField = `
        <label>
            Описание
            <textarea
                id="entityDescription"
                maxlength="${limits.description ?? 350}"
            >${entity.description ?? ""}</textarea>
            <div
                class="entity-field-counter"
                data-counter-for="entityDescription"
            ></div>
        </label>
    `;

    const authorField = cfg.fields?.includes("author")
        ? `
            <label>
                Автор
                <input
                    id="entity_author"
                    value="${entity.author ?? ""}"
                    maxlength="${limits.author ?? 45}"
                >
                <div
                    class="entity-field-counter"
                    data-counter-for="entity_author"
                ></div>
            </label>
        `
        : "";

    return {
        titleField,
        descriptionField,
        authorField
    };
}

export function setupFieldsEditor(root, cfg = {}, entity = {}) {
    return {
        getData() {
            const data = {};
            const titleInput = root.querySelector("#entityTitle");
            const descriptionInput = root.querySelector("#entityDescription");

            if(titleInput) {
                data.title = titleInput.value.trim();
            }

            if(descriptionInput) {
                data.description = descriptionInput.value.trim();
            }

            (cfg.fields ?? []).forEach(field => {
                if(field === "date" || field === "dateStart" || field === "dateEnd") {
                    return;
                }

                const input = root.querySelector(`#entity_${field}`);

                if(input) {
                    data[field] = input.value.trim();
                }
            });

            return data;
        }
    };
}
