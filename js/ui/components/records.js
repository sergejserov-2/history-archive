import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{
    renderEntityList,
    insertEntityListItem,
    showEntityListItem,
    removeEntityListItem
}from"./entityList.js";
import{sortEntities,insertSortedElement}from"./sort.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";
import{getPeriod}from"./date.js";

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
        author:"",
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
        author:"",
        title:row.querySelector(
            ".entity-list-row__title-text"
        )?.textContent.trim()??""
    };
}

function insertRecordElement(
    record,
    subjects=[],
    recordTypes=[]
){
    const element=createRecordElement(
        record,
        subjects
    );
    if(!element)return null;
    const groupId=getRecordGroupId(
        record,
        recordTypes
    );
    const groupTitle=getRecordGroupTitle(
        record,
        recordTypes
    );
    const result=insertEntityListItem({
        groupId,
        groupTitle,
        element,
        compare:null
    });
    if(!result?.element){
        return null;
    }
    const rowContainer=result.element.parentElement;
    if(!rowContainer){
        return result.element;
    }
    result.element.remove();
    insertSortedElement({
        container:rowContainer,
        element:result.element,
        item:getRecordSortData(record),
        selector:".entity-list-row",
        direction:"asc",
        getItem:getRecordElementData
    });
    return result.element;
}

export function insertRecord(
    record,
    subjects=[],
    recordTypes=[]
){
    return insertRecordElement(
        record,
        subjects,
        recordTypes
    );
}

export async function addRecordToList(
    record,
    subjects=[],
    recordTypes=[]
){
    const element=insertRecordElement(
        record,
        subjects,
        recordTypes
    );
    if(!element)return null;
    await showEntityListItem({
        element
    });
    return element;
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
    oldElement.remove();
    return insertRecordElement(
        record,
        subjects,
        recordTypes
    );
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
