// ======================================
// Records component
// ======================================

export function renderRecords(records) {

    if (!records || records.length === 0) {

        return `

            <p class="records-empty">

                Нет сведений

            </p>

        `;

    }

    const rows = records.map(record => {

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

    return `

        <div class="records">

            ${rows.join("")}

        </div>

    `;

}
