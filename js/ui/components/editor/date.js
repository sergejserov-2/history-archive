// ==========================================
// Date mode editor
// ==========================================

import {
    setupHistoricalDateInput
} from "./historicalDate.js";


// ==========================================
// Setup
// ==========================================

export function setupDateModeEditor(
    root,
    cfg = {},
    entity = {}
) {

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

    /*
     * Обычная дата:
     * исторический формат + ?
     */

    const dateEditor =
        dateInput
            ? setupHistoricalDateInput(
                dateInput,
                {
                    showHelp: true
                }
            )
            : null;


    /*
     * Начало периода:
     * только historical dropdown,
     * без вопросика.
     */

    const dateStartEditor =
        dateStartInput
            ? setupHistoricalDateInput(
                dateStartInput,
                {
                    showHelp: false
                }
            )
            : null;


    /*
     * Конец периода:
     * historical dropdown + ?
     */

    const dateEndEditor =
        dateEndInput
            ? setupHistoricalDateInput(
                dateEndInput,
                {
                    showHelp: true
                }
            )
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


                /*
                 * Переносим дату
                 * в начало периода.
                 */

                if(dateStartEditor) {

                    dateStartEditor.setValue(
                        date
                    );

                }
                else if(dateStartInput) {

                    dateStartInput.value =
                        date;
                }


                /*
                 * Конец периода
                 * при переключении пустой.
                 */

                if(dateEndEditor) {

                    dateEndEditor.setValue(
                        ""
                    );

                }
                else if(dateEndInput) {

                    dateEndInput.value =
                        "";
                }


                mode = "period";
            }


            // ----------------------------------
            // Period → Date
            // ----------------------------------

            else {

                let date = "";


                /*
                 * При возврате к дате
                 * сначала берём начало периода.
                 */

                if(dateStartEditor) {

                    date =
                        dateStartEditor
                            .getValue();

                }
                else if(dateStartInput) {

                    date =
                        dateStartInput
                            .value
                            .trim();
                }


                /*
                 * Если начало пустое,
                 * используем конец.
                 */

                if(!date) {

                    if(dateEndEditor) {

                        date =
                            dateEndEditor
                                .getValue();

                    }
                    else if(dateEndInput) {

                        date =
                            dateEndInput
                                .value
                                .trim();
                    }
                }


                /*
                 * Передаём значение
                 * в обычный historical input.
                 */

                if(dateEditor) {

                    dateEditor.setValue(
                        date
                    );

                }
                else if(dateInput) {

                    dateInput.value =
                        date;
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
                        dateStartEditor
                            ? dateStartEditor.getValue()
                            : (
                                dateStartInput
                                    ?.value
                                    .trim() || ""
                            ),


                    dateEnd:
                        dateEndEditor
                            ? dateEndEditor.getValue()
                            : (
                                dateEndInput
                                    ?.value
                                    .trim() || ""
                            ),


                    dateMode:
                        "period"
                };
            }


            // ----------------------------------
            // Single date
            // ----------------------------------

            return {

                date:
                    dateEditor
                        ? dateEditor.getValue()
                        : (
                            dateInput
                                ?.value
                                .trim() || ""
                        ),


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
                    dateStartEditor
                        ? dateStartEditor.getValue()
                        : (
                            dateStartInput
                                ?.value
                                .trim() || ""
                        );


                const end =
                    dateEndEditor
                        ? dateEndEditor.getValue()
                        : (
                            dateEndInput
                                ?.value
                                .trim() || ""
                        );


                /*
                 * Обе границы могут быть пустыми.
                 *
                 * Если значение есть —
                 * оно обязано соответствовать
                 * историческому шаблону.
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
                dateEditor
                    ? dateEditor.getValue()
                    : dateInput.value.trim();


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

            <span
                id="entityDateLabel"
                class="entity-date-editor__label"
            >
                ${
                    isPeriod
                        ? "Период"
                        : "Дата"
                }
            </span>


            <!-- ==============================
                 SINGLE DATE
            =============================== -->

            <div
                id="entityDateSingle"
                class="entity-date-editor__single"
                ${isPeriod ? "hidden" : ""}
            >

                <input
                    id="entity_date"
                    value="${entity.date ?? ""}"
                    autocomplete="off"
                >

            </div>


            <!-- ==============================
                 PERIOD
            =============================== -->

            <div
                id="entityDatePeriod"
                class="entity-date-editor__period"
                ${isPeriod ? "" : "hidden"}
            >

                <input
                    id="entity_dateStart"
                    class="entity-date-editor__period-input"
                    value="${entity.dateStart ?? ""}"
                    autocomplete="off"
                >


                <input
                    id="entity_dateEnd"
                    class="entity-date-editor__period-input"
                    value="${entity.dateEnd ?? ""}"
                    autocomplete="off"
                >

            </div>


            <!-- ==============================
                 SWITCH
            =============================== -->

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
