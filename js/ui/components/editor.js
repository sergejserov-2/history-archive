// ======================================
// Editor UI
// ======================================

import {setupTypesEditor, renderTypesEditorHTML} from "./editor/types.js";
import {setupStatusEditor, renderStatusEditorHTML} from "./editor/status.js";
import {setupParentsEditor, renderParentsEditorHTML} from "./editor/parents.js";
import {setupFileEditor, renderFileEditorHTML} from "./editor/file.js";
import {setupCoverEditor, renderCoverEditorHTML} from "./editor/cover.js";
import {setupDateModeEditor, renderDateModeEditorHTML} from "./editor/date.js";
import {setupFieldsEditor, renderFieldsEditorHTML} from "./editor/fields.js";
import {setupFieldCounters, renderFieldCounterHTML} from "./editor/counters.js";

// ======================================
// Render Editor
// ======================================

export function renderEntityEditor(cfg, entity) {
    entity = entity ?? {};
    const options = cfg.options ?? {};
    const limits = {
        title: 45,
        description: 350,
        author: 45,
        ...(cfg.limits ?? {})
    };

    const hasSingleDate = cfg.fields?.includes("date");
    const hasDatePeriod = cfg.fields?.includes("dateStart") && cfg.fields?.includes("dateEnd");
    const hasDateEditor = hasSingleDate || hasDatePeriod;

    const dateEditor = hasDateEditor
        ? renderDateModeEditorHTML(cfg, entity)
        : "";

    const typeEditorHTML = options.typeSelector
        ? renderTypesEditorHTML(options.types ?? [], entity, options)
        : "";

    const fieldsHTML = renderFieldsEditorHTML(cfg, entity, limits);
    const parentsHTML = renderParentsEditorHTML();
    const fileField = cfg.file ? renderFileEditorHTML() : "";
    const coverField = cfg.cover ? renderCoverEditorHTML(cfg, entity) : "";
    const statusContainer = cfg.status ? renderStatusEditorHTML() : "";

    return `
    <div class="entity-editor">
        ${
            options.typeSelector
                ? `
        <div class="entity-row entity-row--title-type">
            ${typeEditorHTML}
            ${fieldsHTML.titleField}
        </div>
        `
                : fieldsHTML.titleField
        }

        ${fieldsHTML.descriptionField}

        <label>
            Родители
            ${parentsHTML}
        </label>

        ${
            fieldsHTML.authorField
                ? `
        <div class="entity-row entity-row--author-date">
            ${fieldsHTML.authorField}
            ${dateEditor}
        </div>
        `
                : dateEditor
        }

        ${fileField}
        ${coverField}
        ${statusContainer}

        <div class="entity-editor__buttons">
            <button id="entitySave">Сохранить</button>
            <button id="entityCancel">Отмена</button>
        </div>
    </div>
    `;
}

// ======================================
// Editor buttons
// ======================================

export function setupEditorButtons(root, onSave, onCancel) {
    const saveButton = root.querySelector("#entitySave");
    const cancelButton = root.querySelector("#entityCancel");

    if(saveButton) saveButton.onclick = onSave;
    if(cancelButton) cancelButton.onclick = onCancel;
}

// ======================================
// Entity fields editor
// ======================================

export function setupEntityFieldsEditor(root, cfg = {}, extraFields = {}, entity = {}) {
    const dateModeEditor = setupDateModeEditor(root, {
        mode: entity?.dateMode ?? cfg.dateMode ?? "date"
    });

    const statusEditor = setupStatusEditor(
        root,
        entity,
        cfg.status === true
    );

    const typeEditor = setupTypesEditor(root, entity);
    const fieldsEditor = setupFieldsEditor(root, cfg, entity);

    return {
        getData() {
            const data = {};

            Object.assign(
                data,
                fieldsEditor.getData()
            );

            if(typeEditor.getTypeId()) {
                data.typeId = typeEditor.getTypeId();
            }

            if(cfg.status) {
                data.status = statusEditor.getStatus();
                }

            if(dateModeEditor) {
                Object.assign(
                    data,
                    dateModeEditor.getData()
                );

                data.dateMode =
                    dateModeEditor.getMode();
            }

            Object.entries(extraFields).forEach(([field, selector]) => {
                const input = root.querySelector(selector);

                if(input) {
                    data[field] =
                        input.value.trim();
                }
            });

            return data;
        },

        getDateMode() {
            return dateModeEditor?.getMode();
        },

        getStatus() {
            return statusEditor.getStatus();
        }
    };
}

// ======================================
// Component access
// ======================================

export {
    setupParentsEditor,
    setupFileEditor,
    setupCoverEditor,
    setupFieldCounters
};
