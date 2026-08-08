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

    // ======================================
    // Sort sources
    //
    // 1. date
    // 2. author
    // 3. title
    //
    // От нового к старому
    // ======================================

    const sortedSources =

        [...(sources ?? [])].sort(

            (a, b) => {

                const dateA =
                    a.date || "";

                const dateB =
                    b.date || "";

                // Источники без даты — в конец

                if(!dateA && !dateB){

                    const authorCompare =

                        (a.author ?? "").localeCompare(

                            b.author ?? "",

                            "ru"

                        );

                    if(authorCompare !== 0){

                        return authorCompare;

                    }

                    return (

                        a.title ?? ""

                    ).localeCompare(

                        b.title ?? "",

                        "ru"

                    );

                }

                if(!dateA){

                    return 1;

                }

                if(!dateB){

                    return -1;

                }

                // От нового к старому

                const dateCompare =

                    String(dateB)
                        .localeCompare(
                            String(dateA)
                        );

                if(dateCompare !== 0){

                    return dateCompare;

                }

                // Одинаковая дата →
                // автор A → Я

                const authorCompare =

                    (a.author ?? "").localeCompare(

                        b.author ?? "",

                        "ru"

                    );

                if(authorCompare !== 0){

                    return authorCompare;

                }

                // Затем название A → Я

                return (

                    a.title ?? ""

                ).localeCompare(

                    b.title ?? "",

                    "ru"

                );

            }

        );

    sortedSources.forEach(source=>{

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

                        <img
                            src="icons/edit.svg"
                            class="admin-icon"
                        >

                    </button>

                    <button

                        class="admin-button"

                        data-action="delete-source"

                        data-id="${source.id}"

                    >

                        <img
                            src="icons/delete.svg"
                            class="admin-icon"
                        >

                    </button>`

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

            ${
            source.storagePath

            ?

            `

            <div class="source__download">

                <a

                    class="source__download-button"

                    href="${source.storagePath}"

                    target="_blank"

                    rel="noopener"

                >

                    Скачать

                </a>

            </div>

            `

            :

            ""

            }

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
