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
import {setupFieldCounters} from "./editor/counters.js";

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

    const dateEditor = renderDateModeEditorHTML(cfg, entity) : "";
    const typeEditorHTML = options.typeSelector ? renderTypesEditorHTML(options.types ?? [], entity, options) : "";
    const fieldsHTML = renderFieldsEditorHTML(cfg, entity, limits);
    const parentsHTML = cfg.parentsType ? renderParentsEditorHTML() : "";
    const fileField = cfg.file ? renderFileEditorHTML() : "";
    const coverField = cfg.cover ? renderCoverEditorHTML(cfg, entity) : "";
    const statusContainer = cfg.status ? renderStatusEditorHTML() : "";

    return `
    <div class="entity-editor">
        ${options.typeSelector ? `
        <div class="entity-row entity-row--title-type">
            ${typeEditorHTML}
            ${fieldsHTML.titleField}
        </div>
        ` : fieldsHTML.titleField}

        ${fieldsHTML.descriptionField}

        ${cfg.parentsType ? `
        <label>
            Родители
            ${parentsHTML}
        </label>
        ` : ""}

        ${fieldsHTML.authorField ? `
        <div class="entity-row entity-row--author-date">
            ${fieldsHTML.authorField}
            ${dateEditor}
        </div>
        ` : dateEditor}

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
// Editor components
// ======================================

export function setupEditorComponents(root, cfg, context, entity) {
    const fileEditor = setupFileEditor(root, entity, cfg.upload);

    const parents = entity.parents
        ? [...entity.parents]
        : context.parentId
            ? [context.parentId]
            : [];

    const parentsEditor = cfg.parentsType
        ? setupParentsEditor(
            root,
            context.objects,
            entity,
            parents,
            cfg.parentsType === "objectsWithAddress"
                ? {address: true}
                : {}
        )
        : null;

    const fieldsEditor = setupEntityFieldsEditor(
        root,
        cfg,
        cfg.options?.typeSelector
            ? {typeId: "#entityType"}
            : {},
        entity
    );

    const dateModeEditor =
    setupDateModeEditor(
        root,
        cfg,
        entity
    );
    
    const coverEditor = cfg.cover
        ? setupCoverEditor(root, cfg.cover.photos ?? [], entity)
        : null;

    return {
        fileEditor,
        parentsEditor,
        fieldsEditor,
        dateModeEditor,
        coverEditor,

        async getData() {
            if(cfg.fileRequired && !fileEditor?.hasFile()) {
                alert(
                    cfg.fileRequiredMessage ??
                    "Необходимо выбрать файл"
                );
                return null;
            }

            if(
                cfg.parentsType &&
                parentsEditor.getParents().length === 0
            ) {
                alert(
                    cfg.parentsRequiredMessage ??
                    "Нужен хотя бы один родитель"
                );
                return null;
            }

            const data = {};
            Object.assign(data, fieldsEditor.getData());

            if(parentsEditor) {
                data.parents =
                    parentsEditor.getParents();
            }

            if(fileEditor) {
                const fileData =
                    await fileEditor.getData();

                if(fileData) {
                    Object.assign(data, fileData);
                }
            }

            if(coverEditor) {
                Object.assign(
                    data,
                    coverEditor.getData()
                );
            }

            return data;
        }
    };
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

    const statusEditor = setupStatusEditor(root, entity, cfg.status === true);
    const typeEditor = setupTypesEditor(root, entity);
    const fieldsEditor = setupFieldsEditor(root, cfg, entity);

    return {
        getData() {
            const data = {};
            Object.assign(data, fieldsEditor.getData());

            if(typeEditor.getTypeId()) data.typeId = typeEditor.getTypeId();
            if(cfg.status) data.status = statusEditor.getStatus();
            if(dateModeEditor) {
                Object.assign(data, dateModeEditor.getData()); 
                data.dateMode = dateModeEditor.getMode();
            }
            Object.entries(extraFields).forEach(([field, selector]) => {
                const input = root.querySelector(selector);
                if(input) data[field] = input.value.trim();
            });

            return data;
        },
        
        getStatus() {return statusEditor.getStatus();}
    };
}

// ======================================
// Configured editor
// ======================================

export function renderConfiguredEntityEditor(cfg, entity, context) {
    const options = {
        ...(cfg.options ?? {}),
        types: cfg.options?.typeSelector
            ? (context.recordTypes ?? [])
            : []
    };
    return renderEntityEditor({ ...cfg, options}, entity);
}

// ======================================
// Compatibility exports
// ======================================

export {
    setupParentsEditor,
    setupFileEditor,
    setupCoverEditor,
    setupFieldCounters
};
