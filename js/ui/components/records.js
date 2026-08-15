import{renderMentions, getSubjectHref}from"./mentionLink.js";

export function renderRecords(records,recordTypes=[],ADMIN_MODE=false,subjects=[]){
    const groups=[];
    const sortRecords=records=>[...(records??[])].sort((a,b)=>{
        const dateA=a.dateStart||a.dateEnd||"";
        const dateB=b.dateStart||b.dateEnd||"";
        if(!dateA&&!dateB)return(a.title??"").localeCompare(b.title??"","ru");
        if(!dateA)return 1;
        if(!dateB)return-1;
        const dateCompare=String(dateA).localeCompare(String(dateB));
        if(dateCompare!==0)return dateCompare;
        return(a.title??"").localeCompare(b.title??"","ru");
    });
    function formatBoundary(value,prefix){
        if(!value)return"";
        let result=value;
        if(result.endsWith("-е"))result=result.slice(0,-2)+"-х";
        if(result.startsWith("вер., "))return"вер., "+prefix+" "+result.slice(6);
        return prefix+" "+result;
    }
    function renderRecord(record){
        let period="";
        if(record.dateMode==="date")period=record.date||"—";
        else if(record.dateStart&&record.dateEnd)period=`${record.dateStart} – ${record.dateEnd}`;
        else if(record.dateStart)period=formatBoundary(record.dateStart,"с");
        else if(record.dateEnd)period=formatBoundary(record.dateEnd,"до");
        else period="—";
        return`
            <div class="record">
                <div class="record__title">
                    <span class="record__title-text">${record.title??""}</span>
                    ${
                        ADMIN_MODE
                        ?
                        `
                        <button class="admin-button" data-action="edit-record" data-id="${record.id}">
                            <img src="icons/edit.svg" class="admin-icon">
                        </button>
                        <button class="admin-button" data-action="delete-record" data-id="${record.id}">
                            <img src="icons/delete.svg" class="admin-icon">
                        </button>
                        `
                        :
                        ""
                    }
                </div>
                ${
                    record.description?.trim()
                    ?
                    `<div class="record__description">${renderMentions(
    record.description.trim(),
    subjects,
    getSubjectHref
)}</div>`
                    :
                    ""
                }
                <div class="record__date">${period}</div>
            </div>
        `;
    }
    const typedRecords=recordTypes.map(recordType=>({
        type:recordType,
        records:sortRecords((records??[]).filter(record=>record.typeId===recordType.id))
    })).filter(group=>group.records.length>0);
    const recordsWithoutType=sortRecords((records??[]).filter(record=>!record.typeId||!recordTypes.some(type=>type.id===record.typeId)));
    typedRecords.forEach(group=>{
        groups.push(`
            <div class="records__group">
                <div class="records__group-title">${group.type.title??""}</div>
                ${group.records.map(renderRecord).join("")}
            </div>
        `);
    });
    if(recordsWithoutType.length){
        groups.push(`
            <div class="records__group records__group--untitled">
                <div class="records__group-title">Без типа</div>
                ${recordsWithoutType.map(renderRecord).join("")}
            </div>
        `);
    }
    const addButton=ADMIN_MODE?`
        <div class="record record--add admin-button" data-action="add-record">
            + Добавить запись
        </div>
    `:"";
    return`
        <div class="records">
            ${addButton}
            ${groups.join("")}
        </div>
    `;
}
