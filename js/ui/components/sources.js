import{
    renderMentions,
    getSubjectHref
}from"./mentionLink.js";
import{
    adminEdit,
    adminDelete,
    adminAdd
}from"./adminButtons.js";
import{
    sortEntities,
    insertSortedElement
}from"./sort.js";

function getSourcePeriod(source){
    if(source.dateMode==="period"){
        if(
            source.dateStart&&
            source.dateEnd
        ){
            return`${source.dateStart} – ${source.dateEnd}`;
        }

        if(source.dateStart){
            return`с ${source.dateStart}`;
        }

        if(source.dateEnd){
            return`до ${source.dateEnd}`;
        }

        return"";
    }

    return source.date??"";
}

function getSourceData(source){
    return{
        meta:getSourcePeriod(source),
        author:source.author??"",
        title:source.title??""
    };
}

export function renderSource(
    source,
    subjects=[]
){
    return`
        <div
            class="source"
            data-source-id="${source.id}"
        >
            <div class="source__header">
                <div class="source__title">
                    ${
                        source.author
                            ?`
                                <span class="source__author">
                                    ${source.author},
                                </span>
                            `
                            :""
                    }

                    <strong class="source__title-text">
                        ${source.title??""}
                    </strong>

                    ${adminEdit(
                        "source",
                        source.id
                    )}

                    ${adminDelete(
                        "source",
                        source.id
                    )}
                </div>

                ${
                    getSourcePeriod(source)
                        ?`
                            <span class="source__date">
                                ${getSourcePeriod(source)}
                            </span>
                        `
                        :""
                }
            </div>

            ${
                source.description?.trim()
                    ?`
                        <div class="source__description">
                            ${renderMentions(
                                source.description.trim(),
                                subjects,
                                getSubjectHref
                            )}
                        </div>
                    `
                    :""
            }

            ${
                source.storagePath
                    ?`
                        <div class="source__download">
                            <a
                                class="source__download-button"
                                href="${source.storagePath}"
                                target="_blank"
                                rel="noopener"
                            >
                                Скачать
                            </a>
                        </div>
                    `
                    :""
            }
        </div>
    `;
}

function createSourceElement(
    source,
    subjects=[]
){
    const template=
        document.createElement("template");

    template.innerHTML=
        renderSource(
            source,
            subjects
        ).trim();

    return template.content.firstElementChild;
}

export function insertSource(
    source,
    subjects=[]
){
    const list=document.querySelector(
        ".sources-list"
    );

    if(!list)return null;

    const element=createSourceElement(
        source,
        subjects
    );

    if(!element)return null;

    insertSortedElement({
        container:list,
        element,
        item:getSourceData(source),
        selector:".source",
        direction:"asc",
        getItem:existing=>({
            meta:
                existing.querySelector(
                    ".source__date"
                )?.textContent.trim()??"",
            author:
                existing.querySelector(
                    ".source__author"
                )?.textContent
                    .replace(/,\s*$/,"")
                    .trim()??"",
            title:
                existing.querySelector(
                    ".source__title-text"
                )?.textContent.trim()??""
        })
    });

    return element;
}

export function removeSourceFromList(id){
    const element=document.querySelector(
        `.source[data-source-id="${id}"]`
    );

    element?.remove();
}

export function renderSources(
    sources,
    subjects=[]
){
    const sortedSources=sortEntities(
        (sources??[]).map(source=>({
            source,
            ...getSourceData(source)
        }))
    );

    const rows=[
        adminAdd(
            "add-source",
            "Добавить источник"
        ),
        ...sortedSources.map(
            item=>
                renderSource(
                    item.source,
                    subjects
                )
        )
    ];

    return`
        <div class="sources-list">
            ${rows.join("")}
        </div>
    `;
}
