// ======================================
// Sources component
// ======================================

export function renderSources(sources) {

    if (!sources || sources.length === 0) {

        return `

            <p class="sources-empty">

                Нет источников

            </p>

        `;

    }

    const rows = sources.map(source => {

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

    return `

        <div class="sources-list">

            ${rows.join("")}

        </div>

    `;

}
