import{renderMentions}from"./mentionLink.js";

export function renderSources(sources,ADMIN_MODE=false,subjects=[]){
    const rows=[];
    if(ADMIN_MODE){
        rows.push(`
            <div class="source source--add admin-button" data-action="add-source">
                + Добавить источник
            </div>
        `);
    }
    const sortedSources=[...(sources??[])].sort((a,b)=>{
        const dateA=a.date||"";
        const dateB=b.date||"";
        if(!dateA&&!dateB){
            const authorCompare=(a.author??"").localeCompare(b.author??"","ru");
            if(authorCompare!==0)return authorCompare;
            return(a.title??"").localeCompare(b.title??"","ru");
        }
        if(!dateA)return 1;
        if(!dateB)return-1;
        const dateCompare=String(dateB).localeCompare(String(dateA));
        if(dateCompare!==0)return dateCompare;
        const authorCompare=(a.author??"").localeCompare(b.author??"","ru");
        if(authorCompare!==0)return authorCompare;
        return(a.title??"").localeCompare(b.title??"","ru");
    });
    sortedSources.forEach(source=>{
        rows.push(`
            <div class="source">
                <div class="source__header">
                    <div class="source__title">
                        ${
                            source.author
                            ?
                            `<span class="source__author">${source.author},</span>`
                            :
                            ""
                        }
                        <strong class="source__title-text">${source.title??""}</strong>
                        ${
                            ADMIN_MODE
                            ?
                            `
                            <button class="admin-button" data-action="edit-source" data-id="${source.id}">
                                <img src="icons/edit.svg" class="admin-icon">
                            </button>
                            <button class="admin-button" data-action="delete-source" data-id="${source.id}">
                                <img src="icons/delete.svg" class="admin-icon">
                            </button>
                            `
                            :
                            ""
                        }
                    </div>
                    ${
                        source.dateMode==="period"
                        ?
                        (
                            source.dateStart||source.dateEnd
                            ?
                            `
                            <span class="source__date">
                                ${
                                    source.dateStart&&source.dateEnd
                                    ?
                                    `${source.dateStart} – ${source.dateEnd}`
                                    :
                                    source.dateStart
                                    ?
                                    `с ${source.dateStart}`
                                    :
                                    `до ${source.dateEnd}`
                                }
                            </span>
                            `
                            :
                            ""
                        )
                        :
                        (
                            source.date
                            ?
                            `<span class="source__date">${source.date}</span>`
                            :
                            ""
                        )
                    }
                </div>
                ${
                    source.description?.trim()
                    ?
                    `<div class="source__description">${renderMentions(source.description.trim(),subjects,subject=>`subject.html?id=${subject.id}`)}</div>`
                    :
                    ""
                }
                ${
                    source.storagePath
                    ?
                    `
                    <div class="source__download">
                        <a class="source__download-button" href="${source.storagePath}" target="_blank" rel="noopener">
                            Скачать
                        </a>
                    </div>
                    `
                    :
                    ""
                }
            </div>
        `);
    });
    return`
        <div class="sources-list">
            ${rows.join("")}
        </div>
    `;
}
