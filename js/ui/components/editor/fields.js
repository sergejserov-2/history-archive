// ======================================
// Entity fields editor
// ======================================

import {setupFieldCounters, renderFieldCounterHTML} from "./counters.js";

export function renderFieldsEditorHTML(cfg = {}, entity = {}, limits = {}) {
    const titleField = `
        <label>
            Название
            <input
                id="entityTitle"
                value="${entity.title ?? ""}"
                maxlength="${limits.title ?? 45}"
            >
            ${renderFieldCounterHTML("entityTitle", entity.title, limits.title ?? 45)}
        </label>
    `;

    const descriptionField = `
        <label>
            Описание
            <textarea
                id="entityDescription"
                maxlength="${limits.description ?? 350}"
            >${entity.description ?? ""}</textarea>
            ${renderFieldCounterHTML("entityDescription", entity.description, limits.description ?? 350)}
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
                ${renderFieldCounterHTML("entity_author", entity.author, limits.author ?? 45)}
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
    const limits = {
        title: 45,
        description: 350,
        author: 45,
        ...(cfg.limits ?? {})
    };

    setupFieldCounters(root, cfg, limits);

    return {
        getData() {
            const data = {};
            const fields = ["title", "description", ...(cfg.fields ?? [])];

            fields.forEach(field => {
                if(field === "date" || field === "dateStart" || field === "dateEnd") return;

                const input = root.querySelector(`#entity_${field}`);

                if(input) data[field] = input.value.trim();
            });

            return data;
        }
    };
}
