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
    const items=[...(group.items??[])].sort(sortItems);

    return`
        <div class="entity-list__group">
            <div class="entity-list__group-title">
                ${group.title??""}
            </div>
            ${items.map(renderRow).join("")}
        </div>
    `;
}

function sortItems(a,b){
    const aValue=getFirstNumber(a.meta);
    const bValue=getFirstNumber(b.meta);

    if(aValue===null&&bValue===null)return 0;
    if(aValue===null)return 1;
    if(bValue===null)return-1;

    return aValue-bValue;
}

function getFirstNumber(value){
    if(value===undefined||value===null)return null;

    const match=String(value).match(/\d+/);

    if(!match)return null;

    const number=Number(match[0]);

    return Number.isFinite(number)?number:null;
}

function renderRow(item){
    const hasDescription=Boolean(item.description?.trim());
    const hasMeta=Boolean(item.meta?.trim());

    const rowClass=[
        "entity-list-row",
        item.clickable
            ?"entity-list-row--clickable"
            :"",
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
