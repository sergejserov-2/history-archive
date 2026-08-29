import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{
    renderEntityList,
    insertEntityListItem,
    showEntityListItem,
    removeEntityListItem
}from"./entityList.js";
import{compareEntities,sortEntities}from"./sort.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";

function formatBoundary(value,prefix){
    if(!value)return"";

    let result=value;

    if(result.endsWith("-е")){
        result=result.slice(0,-2)+"-х";
    }

    if(result.startsWith("вер., ")){
        return"вер., "+prefix+" "+result.slice(6);
    }

    return prefix+" "+result;
}

function getPeriod(record){
    if(record.dateMode==="date"){
        return record.date||"—";
    }

    if(record.dateStart&&record.dateEnd){
        return`${record.dateStart} – ${record.dateEnd}`;
    }

    if(record.dateStart){
        return formatBoundary(record.dateStart,"с");
    }

    if(record.dateEnd){
        return formatBoundary(record.dateEnd,"до");
    }

    return"—";
}

function getRecordData(record,subjects=[]){
    return{
        id:record.id,
        title:record.title??"",
        description:record.description?.trim()
            ?renderMentions(
                record.description.trim(),
                subjects,
                getSubjectHref
            )
            :"",
        meta:getPeriod(record),
        actions:
            `${adminEdit("record",record.id)}${adminDelete("record",record.id)}`
    };
}

function getRecordSortData(record){
    return{
        meta:getPeriod(record),
        title:record.title??""
    };
}

function getRecordGroupId(record,recordTypes=[]){
    if(!record.typeId){
        return"__without-type__";
    }

    return recordTypes.find(
        type=>type.id===record.typeId
    )?.id??"__without-type__";
}

function getRecordGroupTitle(record,recordTypes=[]){
    if(!record.typeId){
        return"Без типа";
    }

    return recordTypes.find(
        type=>type.id===record.typeId
    )?.title??"Без типа";
}

export function renderRecord(record,subjects=[]){
    const item=getRecordData(record,subjects);
    const hasDescription=Boolean(item.description?.trim());
    const hasMeta=Boolean(item.meta?.trim());

    const rowClass=[
        "entity-list-row",
        hasDescription
            ?"entity-list-row--description"
            :"entity-list-row--title-only",
        hasMeta
            ?"entity-list-row--meta"
            :""
    ].filter(Boolean).join(" ");

    return`
        <div
            class="${rowClass}"
            data-id="${record.id}"
        >
            <div class="entity-list-row__title">
                <span class="entity-list-row__title-text">
                    ${item.title}
                </span>

                ${item.actions}
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
        </div>
    `;
}

function createRecordElement(record,subjects=[]){
    const template=document.createElement("template");
    template.innerHTML=renderRecord(record,subjects).trim();
    return template.content.firstElementChild;
}

function getRecordElementData(row){
    return{
        meta:row.querySelector(
            ".entity-list-row__meta"
        )?.textContent.trim()??"",
        title:row.querySelector(
            ".entity-list-row__title-text"
        )?.textContent.trim()??""
    };
}

function getInsertResult(record,subjects=[],recordTypes=[]){
    const element=createRecordElement(record,subjects);
    if(!element)return null;

    const item=getRecordSortData(record);

    return insertEntityListItem({
        groupId:getRecordGroupId(record,recordTypes),
        groupTitle:getRecordGroupTitle(record,recordTypes),
        element,
        compare:(_,row)=>compareEntities(
            item,
            getRecordElementData(row)
        )
    });
}

export function insertRecord(record,subjects=[],recordTypes=[]){
    const result=getInsertResult(
        record,
        subjects,
        recordTypes
    );

    return result?.element??null;
}

export async function addRecordToList(
    record,
    subjects=[],
    recordTypes=[]
){
    const result=getInsertResult(
        record,
        subjects,
        recordTypes
    );

    if(!result)return null;

    await showEntityListItem(result);

    return result.element;
}

export async function removeRecordFromList(id){
    const element=document.querySelector(
        `.entity-list-row[data-id="${id}"]`
    );

    if(!element)return;

    await removeEntityListItem({
        element
    });
}

export async function updateRecordInList(
    record,
    subjects=[],
    recordTypes=[]
){
    const oldElement=document.querySelector(
        `.entity-list-row[data-id="${record.id}"]`
    );

    if(!oldElement){
        return await addRecordToList(
            record,
            subjects,
            recordTypes
        );
    }

    const oldGroup=oldElement.closest(".entity-list__group");
    const oldGroupId=oldGroup?.dataset.entityGroup??null;
    const newGroupId=getRecordGroupId(
        record,
        recordTypes
    );

    if(oldGroupId!==newGroupId){
        await removeRecordFromList(record.id);

        return await addRecordToList(
            record,
            subjects,
            recordTypes
        );
    }

    const element=createRecordElement(record,subjects);
    if(!element)return null;

    oldElement.remove();

    const item=getRecordSortData(record);

    return insertEntityListItem({
        groupId:newGroupId,
        groupTitle:getRecordGroupTitle(
            record,
            recordTypes
        ),
        element,
        compare:(_,row)=>compareEntities(
            item,
            getRecordElementData(row)
        )
    })?.element??null;
}

export function renderRecords(
    records,
    recordTypes=[],
    subjects=[]
){
    const groups=[];

    recordTypes.forEach(recordType=>{
        const typeRecords=(records??[]).filter(
            record=>record.typeId===recordType.id
        );

        if(!typeRecords.length)return;

        const items=sortEntities(
            typeRecords.map(record=>({
                record,
                ...getRecordSortData(record)
            }))
        ).map(item=>getRecordData(
            item.record,
            subjects
        ));

        groups.push({
            id:recordType.id,
            title:recordType.title??"",
            items
        });
    });

    const recordsWithoutType=(records??[]).filter(
        record=>
            !record.typeId||
            !recordTypes.some(
                type=>type.id===record.typeId
            )
    );

    if(recordsWithoutType.length){
        const items=sortEntities(
            recordsWithoutType.map(record=>({
                record,
                ...getRecordSortData(record)
            }))
        ).map(item=>getRecordData(
            item.record,
            subjects
        ));

        groups.push({
            id:"__without-type__",
            title:"Без типа",
            items
        });
    }

    return`
        <div class="records">
            ${renderEntityList({
                groups,
                addButton:adminAdd(
                    "add-record",
                    "Добавить запись"
                )
            })}
        </div>
    `;
}
