// ==========================================
// Date mode editor
// ==========================================

export function setupDateModeEditor(root, cfg = {}, entity = {}) {

    const container = root.querySelector("#entityDateEditor");

    if(!container) {
        return null;
    }

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

    let mode = entity?.dateMode ?? cfg.dateMode ?? "date";

    mode = mode === "period"
        ? "period"
        : "date";

    function render() {

        const isPeriod = mode === "period";

        dateLabel.textContent =
            isPeriod
                ? "Период"
                : "Дата";

        switchButton.textContent =
            isPeriod
                ? "Сменить на дату"
                : "Сменить на период";

        if(singleField) {
            singleField.hidden = isPeriod;
        }

        if(periodFields) {
            periodFields.hidden = !isPeriod;
        }

        // Меняем пропорции строки
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

    switchButton.addEventListener(
        "click",
        () => {

            if(mode === "date") {

                const date =
                    dateInput?.value.trim() || "";

                if(dateStartInput) {
                    dateStartInput.value = date;
                }

                if(dateEndInput) {
                    dateEndInput.value = "";
                }

                mode = "period";
            }
            else {

                let date = "";

                if(dateStartInput) {
                    date = dateStartInput.value.trim();
                }

                if(!date && dateEndInput) {
                    date = dateEndInput.value.trim();
                }

                if(dateInput) {
                    dateInput.value = date;
                }

                mode = "date";
            }

            render();
        }
    );

    render();

    return {

        getMode() {
            return mode;
        },

        getData() {

            if(mode === "period") {

                return {
                    dateStart: dateStartInput?.value.trim() || "",
                    dateEnd: dateEndInput?.value.trim() || "",
                    dateMode: "period"
                };
            }

            return {
                date: dateInput?.value.trim() || "",
                dateMode: "date"
            };
        }
    };
}

export function renderDateModeEditorHTML(cfg = {}, entity = {}) {
    const mode = entity?.dateMode ?? cfg.dateMode ?? "date";
    const isPeriod = mode === "period";

    return `
        <div
            id="entityDateEditor"
            class="entity-date-editor"
        >
            <span
                id="entityDateLabel"
                class="entity-date-editor__label"
            >
                ${isPeriod ? "Период" : "Дата"}
            </span>

            <div
                id="entityDateSingle"
                class="entity-date-editor__single"
                ${isPeriod ? "hidden" : ""}

>
                <input
                    id="entity_date"
                    value="${entity.date ?? ""}"
                >
            </div>

            <div
                id="entityDatePeriod"
                class="entity-date-editor__period"
                ${isPeriod ? "" : "hidden"}
            >
                <input
                    id="entity_dateStart"
                    value="${entity.dateStart ?? ""}"
                >
                <input
                    id="entity_dateEnd"
                    value="${entity.dateEnd ?? ""}"
                >
            </div>

            <button
                type="button"
                id="entityDateModeSwitch"
                class="entity-date-editor__switch"
            >
                ${isPeriod ? "Сменить на дату" : "Сменить на период"}
            </button>
        </div>
    `;
}
