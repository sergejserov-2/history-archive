import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{renderEntityList,insertEntityListItem,showEntityListItem,removeEntityListItem}from"./entityList.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";

function formatBoundary(value,prefix){
    if(!value)return"";
    let result=value;
    if(result.endsWith("-е"))result=result.slice(0,-2)+"-х";
    if(result.startsWith("вер., "))return"вер., "+prefix+" "+result.slice(6);
    return prefix+" "+result;
}

function getPeriod(record){
    if(record.dateMode==="date")return record.date||"—";
    if(record.dateStart&&record.dateEnd)return`${record.dateStart} – ${record.dateEnd}`;
    if(record.dateStart)return formatBoundary(record.dateStart,"с");
    if(record.dateEnd)return formatBoundary(record.dateEnd,"до");
    return"—";
}

function getRecordData(record,subjects=[]){
    return{
        title:record.title??"",
        description:record.description?.trim()?renderMentions(record.description.trim(),subjects,getSubjectHref):"",
        meta:getPeriod(record),
        actions:`${adminEdit("record",record.id)}${adminDelete("record",record.id)}`
    };
}

function compareItems(a,b){
    const aMeta=String(a.meta??"").trim();
    const bMeta=String(b.meta??"").trim();
    const aNumber=getFirstNumber(aMeta);
    const bNumber=getFirstNumber(bMeta);
    if(aNumber!==null&&bNumber===null)return-1;
    if(aNumber===null&&bNumber!==null)return 1;
    if(aNumber!==null&&bNumber!==null&&aNumber!==bNumber)return aNumber-bNumber;
    const metaCompare=aMeta.localeCompare(bMeta,"ru",{numeric:true,sensitivity:"base"});
    if(metaCompare!==0)return metaCompare;
    return String(a.title??"").localeCompare(String(b.title??""),"ru",{sensitivity:"base"});
}

function getFirstNumber(value){
    if(!value)return null;
    const match=value.match(/\d+/);
    if(!match)return null;
    const number=Number(match[0]);
    return Number.isFinite(number)?number:null;
}

function getRecordGroupId(record,recordTypes=[]){
    if(!record.typeId)return"__without-type__";
    return recordTypes.find(type=>type.id===record.typeId)?.id??"__without-type__";
}

function getRecordGroupTitle(record,recordTypes=[]){
    if(!record.typeId)return"Без типа";
    const type=recordTypes.find(type=>type.id===record.typeId);
    return type?.title??"Без типа";
}

export function renderRecord(record,subjects=[]){
    const item=getRecordData(record,subjects);
    const hasDescription=Boolean(item.description?.trim());
    const hasMeta=Boolean(item.meta?.trim());
    const rowClass=[
        "entity-list-row",
        hasDescription?"entity-list-row--description":"entity-list-row--title-only",
        hasMeta?"entity-list-row--meta":""
    ].filter(Boolean).join(" ");
    return`
        <div class="${rowClass} record" data-record-id="${record.id}">
            <div class="entity-list-row__title">
                <span class="entity-list-row__title-text">${item.title}</span>
                ${item.actions}
            </div>
            ${hasDescription?`<div class="entity-list-row__description">${item.description}</div>`:""}
            ${hasMeta?`<div class="entity-list-row__meta">${item.meta}</div>`:""}
        </div>
    `;
}

export function insertRecord(record,subjects=[],recordTypes=[]){
    const html=renderRecord(record,subjects);
    const template=document.createElement("template");
    template.innerHTML=html.trim();
    const element=template.content.firstElementChild;
    if(!element)return null;
    const item=getRecordData(record,subjects);
    const groupId=getRecordGroupId(record,recordTypes);
    const groupTitle=getRecordGroupTitle(record,recordTypes);
    const result=insertEntityListItem({
        groupId,
        groupTitle,
        element,
        compare:(newElement,row)=>{
            const meta=row.querySelector(".entity-list-row__meta")?.textContent.trim()??"";
            const title=row.querySelector(".entity-list-row__title-text")?.textContent.trim()??"";
            return compareItems({meta,title},{meta:item.meta,title:item.title});
        }
    });
    return result?.element??null;
}

export async function addRecordToList(record,subjects=[],recordTypes=[]){
    const html=renderRecord(record,subjects);
    const template=document.createElement("template");
    template.innerHTML=html.trim();
    const element=template.content.firstElementChild;
    if(!element)return null;
    const item=getRecordData(record,subjects);
    const result=insertEntityListItem({
        groupId:getRecordGroupId(record,recordTypes),
        groupTitle:getRecordGroupTitle(record,recordTypes),
        element,
        compare:(newElement,row)=>{
            const meta=row.querySelector(".entity-list-row__meta")?.textContent.trim()??"";
            const title=row.querySelector(".entity-list-row__title-text")?.textContent.trim()??"";
            return compareItems({meta,title},{meta:item.meta,title:item.title});
        }
    });
    await showEntityListItem(result);
    return element;
}

export async function removeRecordFromList(id){
    const element=document.querySelector(`.record[data-record-id="${id}"]`);
    if(!element)return;
    await removeEntityListItem({element});
}

export function renderRecords(records,recordTypes=[],subjects=[]){
    const groups=[];
    const typedRecords=recordTypes.map(recordType=>({
        type:recordType,
        records:(records??[]).filter(record=>record.typeId===recordType.id)
    })).filter(group=>group.records.length>0);
    const recordsWithoutType=(records??[]).filter(record=>!record.typeId||!recordTypes.some(type=>type.id===record.typeId));
    typedRecords.forEach(group=>groups.push({
        id:group.type.id,
        title:group.type.title??"",
        items:group.records.map(record=>getRecordData(record,subjects))
    }));
    if(recordsWithoutType.length)groups.push({
        id:"__without-type__",
        title:"Без типа",
        items:recordsWithoutType.map(record=>getRecordData(record,subjects))
    });
    return`
        <div class="records">
            ${renderEntityList({
                groups,
                addButton:adminAdd("add-record","Добавить запись")
            })}
        </div>
    `;
}
