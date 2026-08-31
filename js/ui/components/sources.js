import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";
import{sortEntities,insertSortedElement}from"./sort.js";
import{show,hide}from"../animations/controller.js";

function getSourcePeriod(source){
    if(source.dateMode==="period"){
        if(source.dateStart&&source.dateEnd)return`${source.dateStart} – ${source.dateEnd}`;
        if(source.dateStart)return`с ${source.dateStart}`;
        if(source.dateEnd)return`до ${source.dateEnd}`;
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

export function renderSource(source,subjects=[]){
    const description=source.description?.trim();
    const period=getSourcePeriod(source);

    return`
        <div class="source" data-source-id="${source.id}">
            <div class="source__header${description?"":" source__header--single"}">
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

                    ${adminEdit("source",source.id)}
                    ${adminDelete("source",source.id)}
                </div>

                ${
                    period
                        ?`
                            <span class="source__date">
                                ${period}
                            </span>
                        `
                        :""
                }
            </div>

            ${
                description
                    ?`
                        <div class="source__description">
                            ${renderMentions(
                                description,
                                subjects,
                                getSubjectHref
                            )}
                        </div>
                    `
                    :""
            }

            <div class="source__download">
                ${
                    source.storagePath
                        ?`
                            <a
                                class="source__download-button"
                                href="${source.storagePath}"
                                target="_blank"
                                rel="noopener"
                            >
                                Скачать полный текст
                            </a>
                        `
                        :""
                }
            </div>
        </div>
    `;
}

function createSourceElement(source,subjects=[]){
    const template=document.createElement("template");

    template.innerHTML=renderSource(
        source,
        subjects
    ).trim();

    return template.content.firstElementChild;
}

function getSourceElementData(element){
    return{
        meta:element.querySelector(
            ".source__date"
        )?.textContent.trim()??"",
        author:element.querySelector(
            ".source__author"
        )?.textContent
            .replace(/,\s*$/,"")
            .trim()??"",
        title:element.querySelector(
            ".source__title-text"
        )?.textContent.trim()??""
    };
}

export function insertSource(source,subjects=[]){
    const list=document.querySelector(".sources-list");

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
        getItem:getSourceElementData
    });

    return element;
}

export async function addSourceToList(
    source,
    subjects=[]
){
    const element=insertSource(
        source,
        subjects
    );

    if(!element)return null;

    await show(element);

    return element;
}

export async function removeSourceFromList(id){
    const element=document.querySelector(
        `.source[data-source-id="${id}"]`
    );

    if(!element)return;

    await hide(element);
    element.remove();
}

export async function updateSource
