// ======================================
// Sources component
// ======================================

export function renderSources(

    sources,

    ADMIN_MODE = false,

    context = {}

) {

    const rows =

        (sources ?? [])

        .map(source => {

            return `

            <div class="source">

                <div class="source__header">

                    <div class="source__title">

                        ${
                            source.author

                            ?

                            source.author + ", "

                            :

                            ""

                        }

                        ${source.title ?? ""}

                        ${
                            ADMIN_MODE

                            ?

                            `

                            <button

                                class="admin-button"

                                data-action="edit-source"

                                data-id="${source.id}"

                            >

                                ✏

                            </button>

                            <button

                                class="admin-button"

                                data-action="delete-source"

                                data-id="${source.id}"

                            >

                                🗑

                            </button>

                            `

                            :

                            ""

                        }

                    </div>

                    <div class="source__date">

                        ${source.date ?? ""}

                    </div>

                </div>

                <div class="source__description">

                    ${source.description ?? ""}

                </div>

            </div>

            `;

        });

    if(ADMIN_MODE){

        rows.push(`

            <div

                class="source source--add"

                data-action="add-source"

            >

                + Добавить источник

            </div>

        `);

    }

    if(rows.length === 0){

        return `

            <p class="sources-empty">

                Нет источников

            </p>

        `;

    }

    return `

        <div class="sources-list">

            ${rows.join("")}

        </div>

    `;

}
