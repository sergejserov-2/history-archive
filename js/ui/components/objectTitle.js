// ======================================
// Object title component
// ======================================

export function renderObjectTitle(
    type,
    title,
    address
) {

    return `

        <div class="object-title-block">

            <div class="object-title-block__type">

                ${type?.title ?? ""}

            </div>

            <div class="object-title-block__line">

                <span class="object-title-block__name">

                    ${title}

                </span>

                <span class="object-title-block__address">

                    ${address}

                </span>

            </div>

        </div>

    `;

}
