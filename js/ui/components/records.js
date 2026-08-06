// ======================================
// Records component
// ======================================

export function renderRecords(

    records,

    ADMIN_MODE = false,

    context = {}

) {

    const rows =

        (records ?? [])

        .map(record => {

            let period = "";

            if (

                record.dateStart &&

                record.dateEnd

            ) {

                period =

                    `${record.dateStart}–${record.dateEnd}`;

            }

            else if (

                record.dateStart

            ) {

                period =

                    `с ${record.dateStart}`;

            }

            else if (

                record.dateEnd

            ) {

                period =

                    `до ${record.dateEnd}`;

            }

            else {

                period = "—";

            }

            return `

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

                            ✏

                        </button>

                        <button

                            class="admin-button"

                            data-action="delete-record"

                            data-id="${record.id}"

                        >

                            🗑

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

            `;

        });

    if(ADMIN_MODE){

        rows.push(`

            <div

                class="record record--add"

                data-action="add-record"

            >

                + Добавить запись

            </div>

        `);

    }

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
