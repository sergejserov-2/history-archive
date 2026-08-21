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

    const content = `
        <div class="entity-row__title">

            <span class="entity-row__title-text">
                ${item.title ?? ""}
            </span>

            ${item.actions ?? ""}

        </div>

        <div class="entity-row__description">
            ${item.description ?? ""}
        </div>

        <div class="entity-row__meta">
            ${item.meta ?? ""}
        </div>
    `;

    if (item.href) {

        return `
            <a
                class="entity-row"
                href="${item.href}"
            >
                ${content}
            </a>
        `;
    }

    return `
        <div class="entity-row">
            ${content}
        </div>
    `;
}
