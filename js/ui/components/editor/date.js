// ======================================
// Date mode editor
// ======================================

export function setupDateModeEditor(root, options = {}){
    const container =
        root.querySelector("#entityDateEditor");
    if(!container){return null;}
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
    if(!switchButton || !dateLabel){
        console.error("Date mode editor: switch or label not found");
        return null;
    }

    let mode =
        options.mode === "period" ? "period" : "date";

    function render(){
        const isPeriod = mode === "period";
        dateLabel.textContent = isPeriod ? "Период" : "Дата";
        switchButton.textContent = isPeriod ? "Сменить на дату" : "Сменить на период";
        if(singleField){singleField.hidden = isPeriod;}
        if(periodFields){periodFields.hidden = !isPeriod;}
    }

    switchButton.addEventListener(
        "click",
        ()=>{
            if(mode === "date"){
                const date = dateInput ?.value.trim() || "";
                if(dateStartInput){dateStartInput.value = date;}
                if(dateEndInput){dateEndInput.value = "";}
                mode = "period";
            }
            else{
                let date = "";
                if(dateStartInput){date = dateStartInput.value.trim();}
                if(!date && dateEndInput){date = dateEndInput.value.trim();}
                if(dateInput){dateInput.value = date;}
                mode = "date";
            }
            render();
        }
    );
    render();
    return {
        getMode(){return mode;},
        getData(){
            if(mode === "period"){
                return {
                    dateStart: dateStartInput ?.value.trim() || "",
                    dateEnd: dateEndInput ?.value.trim() || "",
                    dateMode: "period"
                };
            }
            return {
                date: dateInput ?.value.trim() || "",
                dateMode: "date"
            };
        }
    };
}


export function renderDateModeEditorHTML(cfg, entity) {
    return `
        <div
            id="entityDateEditor"
            class="entity-date-editor"
        >
            <span
                id="entityDateLabel"
                class="entity-date-editor__label"
            >
                ${cfg.dateMode === "period" ? "Период" : "Дата"}
            </span>
            <div
                id="entityDateSingle"
                class="entity-date-editor__single"
                ${cfg.dateMode === "period" ? "hidden" : ""}
            >
                <input
                    id="entity_date"
                    value="${entity.date ?? ""}"
                >
            </div>
            <div
                id="entityDatePeriod"
                class="entity-date-editor__period"
                ${cfg.dateMode === "period" ? "" : "hidden"}
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
                ${cfg.dateMode === "period" ? "Сменить на дату" : "Сменить на период"}
            </button>
        </div>
    `;
}
