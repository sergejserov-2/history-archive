// ======================================
// Date mode editor
// ======================================

export function setupDateModeEditor(

    root,

    options = {}

){

    const container =
        root.querySelector(
            "#entityDateEditor"
        );

    if(!container){

        return null;

    }

    const dateInput =
        root.querySelector(
            "#entity_date"
        );

    const dateStartInput =
        root.querySelector(
            "#entity_dateStart"
        );

    const dateEndInput =
        root.querySelector(
            "#entity_dateEnd"
        );

    const switchButton =
        root.querySelector(
            "#entityDateModeSwitch"
        );

    const dateLabel =
        root.querySelector(
            "#entityDateLabel"
        );

    const periodFields =
        root.querySelector(
            "#entityDatePeriod"
        );

    const singleField =
        root.querySelector(
            "#entityDateSingle"
        );

    if(
        !switchButton ||
        !dateLabel
    ){

        console.error(
            "Date mode editor: switch or label not found"
        );

        return null;

    }

    let mode =

        options.mode === "period"

            ?

            "period"

            :

            "date";

    // ==================================
    // Render
    // ==================================

    function render(){

        const isPeriod =
            mode === "period";

        dateLabel.textContent =
            isPeriod
                ? "Период"
                : "Дата";

        switchButton.textContent =
            isPeriod
                ? "Сменить на дату"
                : "Сменить на период";

        if(singleField){

            singleField.hidden =
                isPeriod;

        }

        if(periodFields){

            periodFields.hidden =
                !isPeriod;

        }

    }

    // ==================================
    // Switch
    // ==================================

    switchButton.addEventListener(
        "click",
        ()=>{

            // ------------------------------
            // Date → Period
            // ------------------------------

            if(mode === "date"){

                const date =
                    dateInput
                        ?.value
                        .trim() || "";

                if(dateStartInput){

                    dateStartInput.value =
                        date;

                }

                if(dateEndInput){

                    dateEndInput.value =
                        "";

                }

                mode =
                    "period";

            }

            // ------------------------------
            // Period → Date
            // ------------------------------

            else{

                let date = "";

                if(dateStartInput){

                    date =
                        dateStartInput
                            .value
                            .trim();

                }

                if(
                    !date &&
                    dateEndInput
                ){

                    date =
                        dateEndInput
                            .value
                            .trim();

                }

                if(dateInput){

                    dateInput.value =
                        date;

                }

                mode =
                    "date";

            }

            render();

        }
    );

    // ==================================
    // Initial state
    // ==================================

    render();

    return {

        getMode(){

            return mode;

        },

        getData(){

            if(mode === "period"){

                return {

                    dateStart:
                        dateStartInput
                            ?.value
                            .trim() || "",

                    dateEnd:
                        dateEndInput
                            ?.value
                            .trim() || "",

                    dateMode:
                        "period"

                };

            }

            return {

                date:
                    dateInput
                        ?.value
                        .trim() || "",

                dateMode:
                    "date"

            };

        }

    };

}
