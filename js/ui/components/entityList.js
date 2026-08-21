// ======================================
// Entity List
// ======================================

export function renderEntityList({
    groups = [],
    adminMode = false,
    addButton = ""
} = {}) {

    return `
        <div class="entity-list">

            ${addButton}

            ${groups.map(renderGroup).join("")}

        </div>
    `;
}

function renderGroup(group) {

    return `
        <div class="entity-list__group">

            <div class="entity-list__group-title">
                ${group.title ?? ""}
            </div>

            ${group.items.map(renderRow).join("")}

        </div>
    `;
}

function renderRow(item) {

    const hasDescription =
        Boolean(item.description?.trim());

    const hasMeta =
        Boolean(item.meta?.trim());

    let rowClass = "entity-row";

    if (hasDescription && hasMeta)
        rowClass += " entity-row--full";

    else if (hasDescription)
        rowClass += " entity-row--description";

    else if (hasMeta)
        rowClass += " entity-row--meta";

    else
        rowClass += " entity-row--title";

    const content = `

        <div class="entity-row__title">

            <span class="entity-row__title-text">
                ${item.title ?? ""}
            </span>

            ${item.actions ?? ""}

        </div>

        ${
            hasDescription
            ?
            `
            <div class="entity-row__description">
                ${item.description}
            </div>
            `
            :
            ""
        }

        ${
            hasMeta
            ?
            `
            <div class="entity-row__meta">
                ${item.meta}
            </div>
            `
            :
            ""
        }
    `;

    if (item.href) {

        return `
            <a
                class="${rowClass}"
                href="${item.href}"
            >
                ${content}
            </a>
        `;
    }

    return `
        <div class="${rowClass}">
            ${content}
        </div>
    `;
}
