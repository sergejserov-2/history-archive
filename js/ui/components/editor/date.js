// ==========================================
// Date mode editor
// ==========================================
import {setupHistoricalDateInput} from "./historicalDate.js";

// ==========================================
// Setup
// ==========================================
export function setupDateModeEditor(root, cfg = {}, entity = {}) {
    const container = root.querySelector("#entityDateEditor");
    if(!container) return null;

    const row = container.closest(".entity-row");
    const dateInput = root.querySelector("#entity_date");
    const dateStartInput = root.querySelector("#entity_dateStart");
    const dateEndInput = root.querySelector("#entity_dateEnd");
    const switchButton = root.querySelector("#entityDateModeSwitch");
    const dateLabel = root.querySelector("#entityDateLabel");
    const periodFields = root.querySelector("#entityDatePeriod");
    const singleField = root.querySelector("#entityDateSingle");

    if(!switchButton || !dateLabel) {
        console.error("Date mode editor: switch or label not found");
        return null;
    }

    // ==========================================
    // Historical date inputs
    // ==========================================
    const dateEditor = dateInput
        ? setupHistoricalDateInput(dateInput, {showHelp: true})
        : null;

    const dateStartEditor = dateStartInput
        ? setupHistoricalDateInput(dateStartInput, {showHelp: false})
        : null;

    const dateEndEditor = dateEndInput
        ? setupHistoricalDateInput(dateEndInput, {showHelp: true})
        : null;

    // ==========================================
    // Mode
    // ==========================================
    let mode;
    if(entity?.dateMode) {
        mode = entity.dateMode;
    }
    else if(entity?.dateStart || entity?.dateEnd) {
        mode = "period";
    }
    else {
        mode = cfg.dateMode ?? "date";
    }
    mode = mode === "period" ? "period" : "date";

    // ==========================================
    // Render
    // ==========================================
    function render() {
        const isPeriod = mode === "period";

        dateLabel.textContent = isPeriod ? "Период" : "Дата";
        switchButton.textContent = isPeriod ? "Сменить на дату" : "Сменить на период";

        if(singleField) singleField.hidden = isPeriod;
        if(periodFields) periodFields.hidden = !isPeriod;

        if(row) {
            row.classList.remove("entity-row--author-date", "entity-row--author-date-period");
            row.classList.add(
                isPeriod
                    ? "entity-row--author-date-period"
                    : "entity-row--author-date"
            );
        }
    }

    // ==========================================
    // Switch date / period
    // ==========================================
    switchButton.addEventListener("click", () => {
        if(mode === "date") {
            const date = dateInput?.value.trim() || "";

            if(dateStartEditor) dateStartEditor.setValue(date);
            else if(dateStartInput) dateStartInput.value = date;

            if(dateEndEditor) dateEndEditor.setValue("");
            else if(dateEndInput) dateEndInput.value = "";

            mode = "period";
        }
        else {
            let date = "";

            if(dateStartEditor) date = dateStartEditor.getValue();
            else if(dateStartInput) date = dateStartInput.value.trim();

            if(!date) {
                if(dateEndEditor) date = dateEndEditor.getValue();
                else if(dateEndInput) date = dateEndInput.value.trim();
            }

            if(dateEditor) dateEditor.setValue(date);
            else if(dateInput) dateInput.value = date;

            mode = "date";
        }

        render();
    });

    // ==========================================
    // Initial render
    // ==========================================
    render();

    // ==========================================
    // Public API
    // ==========================================
    return {
        getMode() {
            return mode;
        },

        getData() {
            if(mode === "period") {
                return {
                    dateStart: dateStartEditor
                        ? dateStartEditor.getValue()
                        : dateStartInput?.value.trim() || "",
                    dateEnd: dateEndEditor
                        ? dateEndEditor.getValue()
                        : dateEndInput?.value.trim() || "",
                    dateMode: "period"
                };
            }

            return {
                date: dateEditor
                    ? dateEditor.getValue()
                    : dateInput?.value.trim() || "",
                dateMode: "date"
            };
        },

        validate() {
            if(mode === "period") {
                const start = dateStartEditor
                    ? dateStartEditor.getValue()
                    : dateStartInput?.value.trim() || "";

                const end = dateEndEditor
                    ? dateEndEditor.getValue()
                    : dateEndInput?.value.trim() || "";

                if(start && (!dateStartEditor || !dateStartEditor.validate())) {
                    return false;
                }

                if(end && (!dateEndEditor || !dateEndEditor.validate())) {
                    return false;
                }

                return true;
            }

            const value = dateEditor
                ? dateEditor.getValue()
                : dateInput?.value.trim() || "";

            if(!value) return true;

            if(!dateEditor) return true;

            return dateEditor.validate();
        }
    };
}

// ==========================================
// Render HTML
// ==========================================
export function renderDateModeEditorHTML(cfg = {}, entity = {}) {
    let mode;

    if(entity?.dateMode) {
        mode = entity.dateMode;
    }
    else if(entity?.dateStart || entity?.dateEnd) {
        mode = "period";
    }
    else {
        mode = cfg.dateMode ?? "date";
    }

    const isPeriod = mode === "period";

    return `
        <div id="entityDateEditor" class="entity-date-editor">
            <span id="entityDateLabel" class="entity-date-editor__label">
                ${isPeriod ? "Период" : "Дата"}
            </span>
            <div id="entityDateSingle" class="entity-date-editor__single" ${isPeriod ? "hidden" : ""}>
                <input id="entity_date" value="${entity.date ?? ""}" autocomplete="off">
            </div>
            <div id="entityDatePeriod" class="entity-date-editor__period" ${isPeriod ? "" : "hidden"}>
                <input id="entity_dateStart" class="entity-date-editor__period-input" value="${entity.dateStart ?? ""}" autocomplete="off">
                <input id="entity_dateEnd" class="entity-date-editor__period-input" value="${entity.dateEnd ?? ""}" autocomplete="off">
            </div>
            <button type="button" id="entityDateModeSwitch" class="entity-date-editor__switch">
                ${isPeriod ? "Сменить на дату" : "Сменить на период"}
            </button>
        </div>
    `;
}
