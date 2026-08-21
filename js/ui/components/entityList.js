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
    const aMeta=String(a.meta??"").trim();
    const bMeta=String(b.meta??"").trim();

    const aNumber=getFirstNumber(aMeta);
    const bNumber=getFirstNumber(bMeta);

    if(aNumber!==null&&bNumber===null)return-1;
    if(aNumber===null&&bNumber!==null)return 1;

    if(aNumber!==null&&bNumber!==null&&aNumber!==bNumber){
        return aNumber-bNumber;
    }

    const metaCompare=aMeta.localeCompare(
        bMeta,
        "ru",
        {
            numeric:true,
            sensitivity:"base"
        }
    );

    if(metaCompare!==0)return metaCompare;

    return String(a.title??"").localeCompare(
        String(b.title??""),
        "ru",
        {
            sensitivity:"base"
        }
    );
}

function getFirstNumber(value){
    if(!value)return null;

    const match=value.match(/\d+/);

    if(!match)return null;

    const number=Number(match[0]);

    return Number.isFinite(number)
        ?number
        :null;
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
