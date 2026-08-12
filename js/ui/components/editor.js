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

// ======================================
// Render
// ======================================

export function renderEntityEditor(cfg, entity) {
    entity = entity ?? {};
    const options = cfg.options ?? {};
    const limits = cfg.limits ?? {};
    const dateEditor = cfg.dateMode ? renderDateModeEditorHTML(cfg, entity) : "";
    const typeEditor = options.typeSelector ? renderTypesEditorHTML(options.types ?? [], entity, options) : "";
    const fields = renderFieldsEditorHTML(cfg, entity, limits);
    const parents = cfg.parentsType ? renderParentsEditorHTML() : "";
    const file = cfg.file ? renderFileEditorHTML() : "";
    const cover = cfg.cover ? renderCoverEditorHTML(cfg, entity) : "";
    const status = cfg.status ? renderStatusEditorHTML() : "";
    return `<div class="entity-editor">
        ${options.typeSelector ? `
            <div class="entity-row entity-row--title-type">
                ${typeEditor}
                ${fields.titleField}
            </div>
        ` : fields.titleField}
        ${fields.descriptionField}
        ${cfg.parentsType ? `<label>Родители${parents}</label>` : ""}
        ${fields.authorField ? `
            <div class="entity-row entity-row--author-date">
                ${fields.authorField}
                ${dateEditor}
            </div>
        ` : dateEditor}
        ${file}
        ${cover}
        ${status}
        <div class="entity-editor__buttons">
            <button id="entitySave">Сохранить</button>
            <button id="entityCancel">Отмена</button>
        </div>
    </div>`;
}

// ======================================
// Components
// ======================================

export function setupEditorComponents(root, cfg, context = {}, entity = {}) {
    const fileEditor = setupFileEditor(root, entity, cfg.upload, {
        required: cfg.fileRequired === true,
        requiredMessage: cfg.fileRequiredMessage
    });
    const fieldsEditor = setupFieldsEditor(root, cfg, entity);
    const typeEditor = cfg.options?.typeSelector ? setupTypesEditor(root, entity, {
        types: context.types ?? [],
        objects: context.objects ?? [],
        children: context.children ?? [],
        parentId: context.parentId
    }) : null;
    const parents = entity.parents ? [...entity.parents] : context.parentId ? [context.parentId] : [];
    const parentsEditor = cfg.parentsType ? setupParentsEditor(root, context.objects ?? [], entity, parents, {
        address: cfg.parentsType === "objectsWithAddress",
        types: context.types ?? [],
        typeSelector: cfg.options?.typeSelector === true,
        children: context.children ?? [],
        getTypeId: () => typeEditor?.getTypeId(),
        requiredMessage: cfg.parentsRequiredMessage
    }) : null;
    const statusEditor = setupStatusEditor(root, entity, cfg.status === true);
    const dateModeEditor = cfg.dateMode ? setupDateModeEditor(root, {
        mode: entity?.dateMode ?? cfg.dateMode
    }) : null;
    const coverEditor = cfg.cover ? setupCoverEditor(root, cfg.cover.photos ?? [], entity) : null;
    return {
        fileEditor,
        parentsEditor,
        fieldsEditor,
        typeEditor,
        statusEditor,
        dateModeEditor,
        coverEditor,
        async getData() {
            if(fileEditor && !fileEditor.validate()) return null;
            if(parentsEditor && !parentsEditor.validate()) return null;
            const data = {};
            Object.assign(data, fieldsEditor.getData());
            if(typeEditor?.getTypeId()) data.typeId = typeEditor.getTypeId();
            if(cfg.status) data.status = statusEditor.getStatus();
            if(dateModeEditor) Object.assign(data, dateModeEditor.getData());
            if(parentsEditor) data.parents = parentsEditor.getParents();
            if(coverEditor) Object.assign(data, coverEditor.getData());
            if(fileEditor) {
                const fileData = await fileEditor.getData();
                if(fileData) Object.assign(data, fileData);
            }
            return data;
        }
    };
}

// ======================================
// Buttons
// ======================================

export function setupEditorButtons(root, onSave, onCancel) {
    const saveButton = root.querySelector("#entitySave");
    const cancelButton = root.querySelector("#entityCancel");
    if(saveButton) saveButton.onclick = onSave;
    if(cancelButton) cancelButton.onclick = onCancel;
}

// ======================================
// Configured editor
// ======================================

export function renderConfiguredEntityEditor(cfg, entity, context) {
    const options = {
        ...(cfg.options ?? {}),
        types: cfg.options?.typeSelector ? (context?.recordTypes ?? []) : []
    };
    return renderEntityEditor({...cfg, options}, entity);
}

// ======================================
// Compatibility
// ======================================

export {setupParentsEditor, setupFileEditor, setupCoverEditor};
