// ======================================
// Sources component
// ======================================

export function renderSources(

    sources,

    ADMIN_MODE = false

) {

    const rows = [];

    if(ADMIN_MODE){

        rows.push(`

        <div

            class="source source--add admin-button"

            data-action="add-source"

        >

            + Добавить источник

        </div>

        `);

    }

    (sources ?? [])

    .forEach(source=>{

        rows.push(`

        <div class="source">

            <div class="source__header">

                <div class="source__title">

                    ${
                    source.author

                    ?

                    `<span class="source__author">

                        ${source.author},

                    </span>`

                    :

                    ""

                    }

                    <strong>

                        ${source.title ?? ""}

                    </strong>

                    ${
                    ADMIN_MODE

                    ?

                    `

                    <button

                        class="admin-button"

                        data-action="edit-source"

                        data-id="${source.id}"

                    >

    <img src="icons/edit.svg" class="admin-icon">

                    </button>

                    <button

                        class="admin-button"

                        data-action="delete-source"

                        data-id="${source.id}"

                    >

    <img src="icons/delete.svg" class="admin-icon">

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

        `);

    });

    if(rows.length===0){

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
