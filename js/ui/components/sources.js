import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";
import{sortEntities,insertSortedElement}from"./sort.js";
import{show,hide}from"../animations/controller.js";
import{animateResize}from"../animations/resize.js";

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
        <div
            class="source"
            data-source-id="${source.id}"
        >
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

async function updateSourceElement(
    element,
    source,
    subjects=[]
){
    const description=source.description?.trim();
    const period=getSourcePeriod(source);

    await animateResize(element,()=>{
        const header=element.querySelector(
            ".source__header"
        );

        const title=element.querySelector(
            ".source__title"
        );

        const date=element.querySelector(
            ".source__date"
        );

        const descriptionElement=element.querySelector(
            ".source__description"
        );

        const download=element.querySelector(
            ".source__download"
        );

        if(title){
            const author=title.querySelector(
                ".source__author"
            );

            const titleText=title.querySelector(
                ".source__title-text"
            );

            if(source.author){
                if(author){
                    author.textContent=`${source.author},`;
                }else{
                    const newAuthor=document.createElement(
                        "span"
                    );

                    newAuthor.className="source__author";
                    newAuthor.textContent=`${source.author},`;

                    title.insertBefore(
                        newAuthor,
                        title.firstChild
                    );
                }
            }else{
                author?.remove();
            }

            if(titleText){
                titleText.textContent=source.title??"";
            }
        }

        if(period){
            if(date){
                date.textContent=period;
            }else if(header){
                const newDate=document.createElement(
                    "span"
                );

                newDate.className="source__date";
                newDate.textContent=period;

                header.append(newDate);
            }
        }else{
            date?.remove();
        }

        if(header){
            header.classList.toggle(
                "source__header--single",
                !description
            );
        }

        if(description){
            const html=renderMentions(
                description,
                subjects,
                getSubjectHref
            );

            if(descriptionElement){
                descriptionElement.innerHTML=html;
            }else{
                const newDescription=document.createElement(
                    "div"
                );

                newDescription.className=
                    "source__description";

                newDescription.innerHTML=html;

                if(download){
                    element.insertBefore(
                        newDescription,
                        download
                    );
                }else{
                    element.append(newDescription);
                }
            }
        }else{
            descriptionElement?.remove();
        }

        if(download){
            download.innerHTML=source.storagePath
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
                :"";
        }
    });
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

export async function updateSourceInList(
    source,
    subjects=[]
){
    const element=document.querySelector(
        `.source[data-source-id="${source.id}"]`
    );

    if(!element){
        return await addSourceToList(
            source,
            subjects
        );
    }

    await updateSourceElement(
        element,
        source,
        subjects
    );

    const list=element.parentElement;

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
            item=>renderSource(
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
