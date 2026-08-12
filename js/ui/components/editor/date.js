// ==========================================
// Date mode editor
// ==========================================

import {
    setupHistoricalDateInput
} from "./historicalDate.js";

// ==========================================
// Setup
// ==========================================

export function setupDateModeEditor(root, cfg = {}, entity = {}) {

    const container =
        root.querySelector("#entityDateEditor");

    if(!container) {
        return null;
    }

    const row =
        container.closest(".entity-row");

    const dateInput =
        root.querySelector("#entity_date");

    const dateStartInput =
        root.querySelector("#entity_dateStart");

    const dateEndInput =
        root.querySelector("#entity_dateEnd");

    const switchButton =
        root.querySelector("#entityDateModeSwitch");

    const dateLabel =
        root.querySelector("#entityDateLabel");

    const periodFields =
        root.querySelector("#entityDatePeriod");

    const singleField =
        root.querySelector("#entityDateSingle");
    if(!switchButton || !dateLabel) {

        console.error(
            "Date mode editor: switch or label not found"
        );

        return null;
    }


// ==========================================
// Historical date inputs
// ==========================================

    const dateEditor =
        dateInput
            ? setupHistoricalDateInput(dateInput)
            : null;

    const dateStartEditor =
        dateStartInput
            ? setupHistoricalDateInput(dateStartInput)
            : null;

    const dateEndEditor =
        dateEndInput
            ? setupHistoricalDateInput(dateEndInput)
            : null;


// ==========================================
// Mode
// ==========================================

    let mode =
        entity?.dateMode ??
        cfg.dateMode ??
        "date";

    mode =
        mode === "period"
            ? "period"
            : "date";


// ==========================================
// Render
// ==========================================

    function render() {

        const isPeriod =
            mode === "period";


        // --------------------------------------
        // Label
        // --------------------------------------

        dateLabel.textContent =
            isPeriod
                ? "Период"
                : "Дата";


        // --------------------------------------
        // Switch button
        // --------------------------------------

        switchButton.textContent =
            isPeriod
                ? "Сменить на дату"
                : "Сменить на период";


        // --------------------------------------
        // Fields visibility
        // --------------------------------------

        if(singleField) {

            singleField.hidden =
                isPeriod;
        }

        if(periodFields) {

            periodFields.hidden =
                !isPeriod;
        }


        // --------------------------------------
        // Row proportions
        // --------------------------------------

        if(row) {

            row.classList.remove(
                "entity-row--author-date",
                "entity-row--author-date-period"
            );

            row.classList.add(
                isPeriod
                    ? "entity-row--author-date-period"
                    : "entity-row--author-date"
            );
        }

// ==========================================
// Switch date / period
// ==========================================

    switchButton.addEventListener(
        "click",
        () => {

            // ----------------------------------
            // Date → Period
            // ----------------------------------

            if(mode === "date") {

                const date =
                    dateInput?.value.trim() || "";


                if(dateStartInput) {

                    dateStartInput.value =
                        date;
                }


                if(dateEndInput) {

                    dateEndInput.value =
                        "";
                }


                /*
                 * После переноса значения
                 * обновляем состояние редакторов.
                 */
                if(dateStartEditor) {

                    dateStartEditor.setValue(
                        date
                    );
                }

                if(dateEndEditor) {

                    dateEndEditor.setValue(
                        ""
                    );
                }


                mode = "period";
            }


            // ----------------------------------
            // Period → Date
            // ----------------------------------

            else {

                let date = "";


                if(dateStartInput) {

                    date =
                        dateStartInput.value.trim();
                }


                if(!date && dateEndInput) {

                    date =
                        dateEndInput.value.trim();
                }


                if(dateInput) {

                    dateInput.value =
                        date;
                }


                /*
                 * Синхронизируем historical-date
                 * editor обычной даты.
                 */
                if(dateEditor) {

                    dateEditor.setValue(
                        date
                    );
                }


                mode = "date";
            }


            render();
        }
    );


// ==========================================
// Initial render
// ==========================================

    render();


// ==========================================
// Public API
// ==========================================

    return {

        // --------------------------------------
        // Mode
        // --------------------------------------

        getMode() {

            return mode;
        },


        // --------------------------------------
        // Data
        // --------------------------------------

        getData() {

            // ----------------------------------
            // Period
            // ----------------------------------

            if(mode === "period") {

                return {

                    dateStart:
                        dateStartInput?.value.trim() || "",

                    dateEnd:
                        dateEndInput?.value.trim() || "",

                    dateMode:
                        "period"
                };
            }


            // ----------------------------------
            // Single date
            // ----------------------------------

            return {

                date:
                    dateInput?.value.trim() || "",

                dateMode:
                    "date"
            };
        },


        // --------------------------------------
        // Validation
        // --------------------------------------

        validate() {

            // ----------------------------------
            // Period
            // ----------------------------------

            if(mode === "period") {

                const start =
                    dateStartInput?.value.trim() || "";

                const end =
                    dateEndInput?.value.trim() || "";


                /*
                 * Пустая граница допустима.
                 * Если значение есть — оно должно
                 * соответствовать историческому шаблону.
                 */

                if(start) {

                    if(
                        !dateStartEditor ||
                        !dateStartEditor.validate()
                    ) {
                        return false;
                    }
                }


                if(end) {

                    if(
                        !dateEndEditor ||
                        !dateEndEditor.validate()
                    ) {
                        return false;
                    }
                }


                return true;
            }


            // ----------------------------------
            // Single date
            // ----------------------------------

            if(!dateInput) {

                return true;
            }


            const value =
                dateInput.value.trim();


            if(!value) {

                return false;
            }


            if(!dateEditor) {

                return true;
            }


            return dateEditor.validate();
        }
    };
}


// ==========================================
// Render HTML
// ==========================================

export function renderDateModeEditorHTML(
    cfg = {},
    entity = {}
) {

    const mode =
        entity?.dateMode ??
        cfg.dateMode ??
        "date";

    const isPeriod =
        mode === "period";


    return `
        <div
            id="entityDateEditor"
            class="entity-date-editor"
        >

            <!-- ==================================
                 DATE
            ================================== -->

            <div
                id="entityDateSingle"
                class="entity-date-editor__single"
                ${isPeriod ? "hidden" : ""}
            >

                <div class="entity-date-editor__input-row">

                    <input
                        id="entity_date"
                        value="${entity.date ?? ""}"
                        autocomplete="off"
                    >
                </div>

            </div>


            <!-- ==================================
                 PERIOD
            ================================== -->

            <div
                id="entityDatePeriod"
                class="entity-date-editor__period"
                ${isPeriod ? "" : "hidden"}
            >

                <div class="entity-date-editor__period-input">

                    <input
                        id="entity_dateStart"
                        value="${entity.dateStart ?? ""}"
                        autocomplete="off"
                    >

                </div>


                <div class="entity-date-editor__period-input">

                    <div class="entity-date-editor__input-row">

                        <input
                            id="entity_dateEnd"
                            value="${entity.dateEnd ?? ""}"
                            autocomplete="off"
                        >
                    </div>

                </div>

            </div>


            <!-- ==================================
                 LABEL + SWITCH
            ================================== -->

            <span
                id="entityDateLabel"
                class="entity-date-editor__label"
            >
                ${isPeriod ? "Период" : "Дата"}
            </span>


            <button
                type="button"
                id="entityDateModeSwitch"
                class="entity-date-editor__switch"
            >
                ${
                    isPeriod
                        ? "Сменить на дату"
                        : "Сменить на период"
                }
            </button>

        </div>
    `;
}
