

import{show,hide}from"../animations/controller.js";
import{sortEntities}from"./sort.js";

export function renderEntityList({groups=[],addButton=""}={}){
    return`
        <div class="entity-list">
            ${addButton}
            ${groups.map(renderGroup).join("")}
        </div>
    `;
}

function renderGroup(group){
    const direction=
        group.sortDirection==="desc"
            ?"desc"
            :"asc";

    const items=sortEntities(
        group.items??[],
        direction
    );

    return`
        <div
            class="entity-list__group"
            data-entity-group="${group.id??group.title??""}"
        >
            <div class="entity-list__group-title">
                ${group.title??""}
            </div>

            ${items.map(renderRow).join("")}
        </div>
    `;
}

function renderRow(item){
    const hasDescription=Boolean(
        item.description?.trim()
    );

    const hasMeta=Boolean(
        item.meta?.trim()
    );

    const rowClass=[
        "entity-list-row",
        item.clickable||item.href
            ?"entity-list-row--clickable"
            :"",
        hasDescription
            ?"entity-list-row--description"
            :"entity-list-row--title-only",
        hasMeta
            ?"entity-list-row--meta"
            :""
    ]
        .filter(Boolean)
        .join(" ");

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

    const attributes=item.id
        ?`data-id="${item.id}"`
        :"";

    if(item.href){
        return`
            <a
                class="${rowClass}"
                href="${item.href}"
                ${attributes}
            >
                ${content}
            </a>
        `;
    }

    return`
        <div
            class="${rowClass}"
            ${attributes}
        >
            ${content}
        </div>
    `;
}

function getGroup(list,groupId){
    return[
        ...list.querySelectorAll(
            ".entity-list__group"
        )
    ].find(
        group=>
            group.dataset.entityGroup===
            String(groupId)
    )??null;
}

export function insertEntityListItem({
    groupId,
    groupTitle,
    element,
    compare
}={}){
    const list=document.querySelector(
        ".entity-list"
    );

    if(!list||!element)return null;

    let group=getGroup(
        list,
        groupId
    );

    const created=!group;

    if(!group){
        group=document.createElement("div");

        group.className=
            "entity-list__group";

        group.dataset.entityGroup=
            groupId??groupTitle??"";

        group.innerHTML=`
            <div class="entity-list__group-title">
                ${groupTitle??""}
            </div>
        `;

        list.appendChild(group);
    }

    const rows=[
        ...group.querySelectorAll(
            ".entity-list-row"
        )
    ];

    const before=
        typeof compare==="function"
            ?rows.find(
                row=>compare(element,row)>0
            )
            :null;

    if(before){
        group.insertBefore(
            element,
            before
        );
    }else{
        group.appendChild(element);
    }

    return{
        element,
        group,
        created
    };
}

export async function showEntityListItem(result){
    if(!result)return;

    if(result.created){
        const title=result.group.querySelector(
            ".entity-list__group-title"
        );

        await Promise.all([
            show(title),
            show(result.element)
        ]);

        return;
    }

    await show(result.element);
}

export async function removeEntityListItem({element}={}){
    if(!element)return;

    const group=element.closest(
        ".entity-list__group"
    );

    if(!group)return;

    const title=group.querySelector(
        ".entity-list__group-title"
    );

    const rows=group.querySelectorAll(
        ".entity-list-row"
    );

    if(rows.length===1){
        await Promise.all([
            hide(element),
            hide(title)
        ]);

        element.remove();
        title?.remove();
        group.remove();

        return;
    }

    await hide(element);
    element.remove();
}
