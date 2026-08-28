import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";
import{renderMentions,getSubjectHref}from"./mentionLink.js";

export function renderSource(source,subjects=[]){
    return`
        <div class="source" data-source-id="${source.id}">
            <div class="source__header">
                <div class="source__title">
                    ${source.author?`<span class="source__author">${source.author},</span>`:""}
                    <strong class="source__title-text">${source.title??""}</strong>
                    ${adminEdit("source",source.id)}
                    ${adminDelete("source",source.id)}
                </div>
                ${source.dateMode==="period"
                    ?(source.dateStart||source.dateEnd?`<span class="source__date">${source.dateStart&&source.dateEnd?`${source.dateStart} – ${source.dateEnd}`:source.dateStart?`с ${source.dateStart}`:`до ${source.dateEnd}`}</span>`:"")
                    :(source.date?`<span class="source__date">${source.date}</span>`:"")}
            </div>
            ${source.description?.trim()?`<div class="source__description">${renderMentions(source.description.trim(),subjects,getSubjectHref)}</div>`:""}
            ${source.storagePath?`<div class="source__download"><a class="source__download-button" href="${source.storagePath}" target="_blank" rel="noopener">Скачать</a></div>`:""}
        </div>
    `;
}

export function renderSources(sources,subjects=[]){
    const rows=[adminAdd("add-source","Добавить источник")];
    const sortedSources=[...(sources??[])].sort((a,b)=>{
        const dateA=a.date||"",dateB=b.date||"";
        if(!dateA&&!dateB){
            const author=(a.author??"").localeCompare(b.author??"","ru");
            return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
        }
        if(!dateA)return 1;
        if(!dateB)return-1;
        const date=String(dateB).localeCompare(String(dateA));
        if(date!==0)return date;
        const author=(a.author??"").localeCompare(b.author??"","ru");
        return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
    });
    sortedSources.forEach(source=>rows.push(renderSource(source,subjects)));
    return`<div class="sources-list">${rows.join("")}</div>`;
}
