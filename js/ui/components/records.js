// ======================================
// Records component
// ======================================

export function renderRecords(

    records,

    ADMIN_MODE = false

) {

    const rows = [];

    if(ADMIN_MODE){

        rows.push(`

            <div

                class="record record--add admin-button"

                data-action="add-record"

            >

                + Добавить запись

            </div>

        `);

    }

    (records ?? [])

    .forEach(record=>{

        let period = "";

        if(
            record.dateStart &&
            record.dateEnd
        ){

            period =
                `${record.dateStart} – ${record.dateEnd}`;

        }

        else if(record.dateStart){

            period =
                `с ${record.dateStart}`;

        }

        else if(record.dateEnd){

            period =
                `до ${record.dateEnd}`;

        }

        else {

            period = "—";

        }

        rows.push(`

        <div class="record">

            <div class="record__title">

                ${record.title ?? ""}

                ${
                ADMIN_MODE

                ?

                `

                <button

                    class="admin-button"

                    data-action="edit-record"

                    data-id="${record.id}"

                >

    <img src="icons/edit.svg" class="admin-icon">

                </button>

                <button

                    class="admin-button"

                    data-action="delete-record"

                    data-id="${record.id}"

                >

    <img src="icons/delete.svg" class="admin-icon">

                </button>

                `

                :

                ""

                }

            </div>

            <div class="record__description">

                ${record.description ?? ""}

            </div>

            <div class="record__date">

                ${period}

            </div>

        </div>

        `);

    });

    if(rows.length === 0){

        return `

        <p class="records-empty">

            Нет сведений

        </p>

        `;

    }

    return `

    <div class="records">

        ${rows.join("")}

    </div>

    `;

}
