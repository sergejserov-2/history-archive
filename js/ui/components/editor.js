// ======================================
// Editor UI
// ======================================
import {setupTypesEditor, renderTypesEditorHTML} from "./editor/types.js";
import {setupStatusEditor, renderStatusEditorHTML} from "./editor/status.js";
import {setupParentsEditor, renderParentsEditorHTML} from "./editor/parents.js";
import {setupFileEditor, renderFileEditorHTML} from "./editor/file.js";
import {setupCoverEditor, renderCoverEditorHTML} from "./editor/cover.js";
import {setupDateModeEditor, renderDateModeEditorHTML} from "./editor/date.js";
import {setupFieldCounters, renderFieldCounterHTML} from "./editor/counters.js";

export function renderEntityEditor(cfg, entity){
    
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
    const dateEditor = hasDateEditor ? renderDateModeEditorHTML(cfg, entity) : "";
    const typeEditorHTML = options.typeSelector ? renderTypesEditorHTML(options.types ?? [], entity, options) : "";
    const fileField = cfg.file ? renderFileEditorHTML() : "";
    const coverField = cfg.cover ? renderCoverEditorHTML(cfg, entity) : "";
    const statusContainer = cfg.status ? renderStatusEditorHTML() : "";
    const authorField = cfg.fields?.includes("author") ?
        `<label>
            Автор
            <input
                id="entity_author"
                value="${entity.author ?? ""}"
                maxlength="${limits.author}"
            >
            ${renderFieldCounterHTML("entity_author", entity.author, limits.author)}
        </label>` : "";
    
    
    // ==================================
    // Render
    // ==================================

    return `

    <div class="entity-editor">
        ${options.typeSelector ?
          `<div class="entity-row entity-row--title-type">
                ${typeEditorHTML}
                <label class="entity-title">
                    Название
                    <input
                        id="entityTitle"
                        value="${entity.title ?? ""}"
                        maxlength="${limits.title}"
                    >
                ${renderFieldCounterHTML("entityTitle", entity.title, limits.title)}
                </label>
            </div>` :
            `<label>
                Название
                <input
                    id="entityTitle"
                    value="${entity.title ?? ""}"
                    maxlength="${limits.title}"
                >
                ${renderFieldCounterHTML("entityTitle", entity.title, limits.title)}
            </label>`
        }

        <label>
            Описание
            <textarea
                id="entityDescription"
                maxlength="${limits.description}"
            >
            ${entity.description ?? ""}
            </textarea>
            ${renderFieldCounterHTML("entityDescription", entity.description, limits.description)}
        </label>
        <label>
            Родители
            ${renderParentsEditorHTML()}
        </label>

        ${authorField ?
          `<div class="entity-row entity-row--author-date" >
                ${authorField}
                ${dateEditor}
            </div>` :  dateEditor}
        ${fileField}
        ${coverField}
        ${statusContainer}

        <div class="entity-editor__buttons">
            <button id="entitySave">
                Сохранить
            </button>
            <button id="entityCancel">
                Отмена
            </button>
        </div>
    </div>
    `;
}

// ======================================
// Editor buttons
// ======================================

export function setupEditorButtons(

    root,

    onSave,

    onCancel

){

    const saveButton =
        root.querySelector(
            "#entitySave"
        );

    const cancelButton =
        root.querySelector(
            "#entityCancel"
        );

    if(saveButton){

        saveButton.onclick =
            onSave;

    }

    if(cancelButton){

        cancelButton.onclick =
            onCancel;

    }

}

// ======================================
// Entity fields editor
// ======================================

export function setupEntityFieldsEditor(

    root,

    cfg = {},

    extraFields = {},

    entity = {}

){

    const dateModeEditor =
        setupDateModeEditor(

            root,

            {
                mode:
                    entity?.dateMode ??
                    cfg.dateMode ??
                    "date"
            }

        );

// ==================================
// Status editor
// ==================================

const statusEditor =
    setupStatusEditor(
        root,
        entity,
        cfg.status === true
    );

    // ==================================
    // Data
    // ==================================

    return {

        getData(){

            const data = {};

            const titleInput =
                root.querySelector(
                    "#entityTitle"
                );

            const descriptionInput =
                root.querySelector(
                    "#entityDescription"
                );

            if(titleInput){

                data.title =
                    titleInput.value.trim();

            }

            if(descriptionInput){

                data.description =
                    descriptionInput.value.trim();

            }
const typeEditor =
    setupTypesEditor(root, entity);
if(typeEditor.getTypeId()){
    data.typeId = typeEditor.getTypeId();
}
            // ==================================
            // Regular fields
            // ==================================

            (cfg.fields ?? [])
                .forEach(field=>{

                    if(
                        field === "date" ||
                        field === "dateStart" ||
                        field === "dateEnd"
                    ){

                        return;

                    }

                    const input =
                        root.querySelector(
                            `#entity_${field}`
                        );

                    if(input){

                        data[field] =
                            input.value.trim();

                    }

                });

            if(cfg.status){data.status = statusEditor.getStatus();}
            if(dateModeEditor){
                Object.assign(data, dateModeEditor.getData());
                data.dateMode = dateModeEditor.getMode();
            }

            Object.entries(extraFields)
                .forEach(
                    ([field, selector])=>{
                        const input = root.querySelector(selector);
                        if(input){data[field] = input.value.trim();}
                    }
                );
            return data;
        },
        getDateMode(){return dateModeEditor ?.getMode();},
        getStatus(){return currentStatus;}
    };
}

export {setupParentsEditor};
export {setupFileEditor};
export {setupCoverEditor};
export {setupFieldCounters};
