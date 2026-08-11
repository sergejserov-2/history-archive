utton.onclick = onSave;
    if(cancelButton) cancelButton.onclick = onCancel;
}

// ======================================
// Entity fields editor
// ======================================

export function setupEntityFieldsEditor(root, cfg = {}, extraFields = {}, entity = {}) {
    const dateModeEditor = setupDateModeEditor(root, {
        mode: entity?.dateMode ?? cfg.dateMode ?? "date"
    });
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
        getDateMode() {return dateModeEditor?.getMode();},
        getStatus() {return statusEditor.getStatus();}
    };
}

// ======================================
// Configured editor
// ======================================

export function renderConfiguredEntityEditor(cfg, entity, context) {
    const savedDateMode = entity?.dateMode ?? cfg.dateMode ?? "date";
    const options = {
        ...(cfg.options ?? {}),
        types: cfg.options?.typeSelector ? (context.recordTypes ?? []) : []
    };
    return renderEntityEditor({...cfg, dateMode: savedDateMode, options}, entity);
}

// ======================================
// Compatibility exports
// ======================================

export {
    setupParentsEditor,
    setupFileEditor,
    setupCoverEditor
};
