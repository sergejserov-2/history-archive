export function renderEntityList({
    groups=[],
    addButton=""
}={}){
    return`
        <div class="entity-list">
            ${addButton}
            ${groups.map(renderGroup).join("")}
        </div>
    `;
}
function renderGroup(group){
    return`
        <div class="entity-list__group">
            <div class="entity-list__group-title">
                ${group.title??""}
            </div>
            ${group.items.map(renderRow).join("")}
        </div>
    `;
}
function renderRow(item){
    const hasDescription=Boolean(item.description?.trim());
    const hasMeta=Boolean(item.meta?.trim());
    const rowClass = [
        "entity-list-row",
        item.clickable
            ? "entity-list-row--clickable"
            : "",
        "entity-list-row",
        item.href
            ?"entity-list-row--clickable"
            :"",
        hasDescription
            ?"entity-list-row--description"
            :"entity-list-row--title-only",
        hasMeta
            ?"entity-list-row--meta"
            :""
    ].filter(Boolean).join(" ");
    const content=`
        <div class="entity-list-row__title">
            <span class="entity-list-row__title-text">
                ${item.title??""}
            </span>
            ${item.actions??""}
        </div>
        ${
            hasDescription
                ?`
                    <div class="entity-list-row__description">
                        ${item.description}
                    </div>
                `
                :""
        }
        ${
            hasMeta
                ?`
                    <div class="entity-list-row__meta">
                        ${item.meta}
                    </div>
                `
                :""
        }
    `;
    if(item.href){
        return`
            <a
                class="${rowClass}"
                href="${item.href}"
                ${item.id?`data-id="${item.id}"`:""}
            >
                ${content}
            </a>
        `;
    }
    return`
        <div
            class="${rowClass}"
            ${item.id?`data-id="${item.id}"`:""}
        >
            ${content}
        </div>
    `;
}
