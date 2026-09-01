import{openPhotoModal}from"./modalReload.js";
import{renderLoadingPlaceholder}from"./loadingPlaceholder.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";
import{sortEntities,insertSortedElement}from"./sort.js";
import{show,hide}from"../animations/controller.js";
import{getPeriod}from"./date.js";

function getPhotoPeriod(photo){
    return getPeriod(photo);
}

export function getPhotoData(photo){
    return{
        meta:getPhotoPeriod(photo),
        author:photo.author??"",
        title:photo.title??""
    };
}

function renderPhotoMedia(photo){
    const uploading=photo.isUploading===true;
    const hasPreview=Boolean(photo.previewPath);

    if(uploading&&!hasPreview){
        return renderLoadingPlaceholder();
    }

    if(hasPreview){
        return`
            ${uploading?renderLoadingPlaceholder():""}
            <img
                class="photo-card__image${uploading?" photo-card__image--loading":""}"
                src="${photo.previewPath}"
                alt="${photo.title??""}"
                draggable="false"
            >
        `;
    }

    return`
        <div class="photo-card__placeholder">
            Фото отсутствует
        </div>
    `;
}

function renderPhotoMeta(photo){
    const author=photo.author?.trim()??"";
    const date=getPhotoPeriod(photo);

    if(author&&date){
        return`
            <span class="photo-card__author-name">
                ${author}
            </span>,
            <span class="photo-card__date">
                ${date}
            </span>
        `;
    }

    if(author){
        return`
            <span class="photo-card__author-name">
                ${author}
            </span>
        `;
    }

    if(date){
        return`
            <span class="photo-card__date">
                ${date}
            </span>
        `;
    }

    return"";
}

export function renderPhoto(photo){
    const uploading=photo.isUploading===true;

    return`
        <div
            class="photo-card${uploading?" photo-card--uploading":""}"
            data-photo-id="${photo.id}"
            data-photo-drag
        >
            <div
                class="photo-card__media"
                data-photo-id="${photo.id}"
                data-loading="${uploading}"
            >
                ${renderPhotoMedia(photo)}
            </div>

            <div class="photo-card__content">
                <div class="photo-card__title">
                    <div class="photo-card__title-row">
                        <span
                            class="photo-card__title-line"
                        ></span>
                    </div>

                    <div
                        class="photo-card__title-row photo-card__title-row--second"
                    >
                        <span
                            class="photo-card__title-line"
                        ></span>
                    </div>

                    <span
                        class="photo-card__title-source"
                        data-full-title="${photo.title??""}"
                    >
                        ${photo.title??""}
                    </span>

                    <span class="photo-card__title-actions">
                        ${adminEdit("photo",photo.id)}
                        ${adminDelete("photo",photo.id)}
                    </span>
                </div>

                <div class="photo-card__author">
                    ${renderPhotoMeta(photo)}
                </div>
            </div>
        </div>
    `;
}

function createPhotoElement(photo){
    const template=document.createElement("template");

    template.innerHTML=renderPhoto(photo).trim();

    return template.content.firstElementChild;
}

function getPhotoElementData(element){
    return{
        meta:
            element.querySelector(
                ".photo-card__date"
            )?.textContent.trim()??"",

        author:
            element.querySelector(
                ".photo-card__author-name"
            )?.textContent.trim()??"",

        title:
            element.querySelector(
                ".photo-card__title-source"
            )?.dataset.fullTitle??
            ""
    };
}

function updateListPhotos(list,photo){
    if(!list)return;

    list.photos=[
        ...(list.photos??[]).filter(
            item=>item.id!==photo.id
        ),
        photo
    ];
}

function getTitleParts(card){
    const title=card.querySelector(
        ".photo-card__title"
    );

    const rows=[
        ...card.querySelectorAll(
            ".photo-card__title-row"
        )
    ];

    const lines=[
        ...card.querySelectorAll(
            ".photo-card__title-line"
        )
    ];

    const actions=card.querySelector(
        ".photo-card__title-actions"
    );

    const source=card.querySelector(
        ".photo-card__title-source"
    );

    return{
        title,
        rows,
        lines,
        actions,
        source
    };
}

function getAvailableWidth(row,actions=null){
    const rowWidth=row.getBoundingClientRect().width;

    if(!actions){
        return rowWidth;
    }

    const actionsWidth=
        actions.getBoundingClientRect().width;

    const style=getComputedStyle(row);

    const gap=parseFloat(
        style.columnGap
    )||0;

    return Math.max(
        0,
        rowWidth-actionsWidth-gap
    );
}

function fitsWidth(line,text,width){
    line.textContent=text;

    return line.scrollWidth<=width+1;
}

function findBreakPosition(line,text,width){
    const words=text.split(/\s+/);

    if(words.length<2){
        return 0;
    }

    let result=0;
    let value="";

    for(let index=0;index<words.length;index++){
        const next=
            value
                ?`${value} ${words[index]}`
                :words[index];

        if(!fitsWidth(line,next,width)){
            break;
        }

        value=next;
        result=value.length;
    }

    return result;
}

function layoutPhotoTitle(card){
    const{
        rows,
        lines,
        actions,
        source
    }=getTitleParts(card);

    if(
        rows.length<2||
        lines.length<2||
        !actions||
        !source
    ){
        return;
    }

    const[
        firstRow,
        secondRow
    ]=rows;

    const[
        firstLine,
        secondLine
    ]=lines;

    const fullTitle=
        source.dataset.fullTitle??"";

    firstRow.classList.remove(
        "photo-card__title-row--single",
        "photo-card__title-row--multi"
    );

    secondRow.classList.remove(
        "photo-card__title-row--single",
        "photo-card__title-row--multi"
    );

    firstLine.classList.remove(
        "photo-card__title-line--ellipsis"
    );

    secondLine.classList.remove(
        "photo-card__title-line--ellipsis"
    );

    actions.remove();

    firstRow.hidden=false;
    secondRow.hidden=true;

    firstLine.textContent="";
    secondLine.textContent="";

    const fullWidth=getAvailableWidth(
        firstRow
    );

    if(
        fitsWidth(
            firstLine,
            fullTitle,
            fullWidth
        )
    ){
        firstRow.classList.add(
            "photo-card__title-row--single"
        );

        firstRow.append(actions);

        const firstWidth=getAvailableWidth(
            firstRow,
            actions
        );

        firstLine.textContent=fullTitle;

        firstLine.classList.toggle(
            "photo-card__title-line--ellipsis",
            !fitsWidth(
                firstLine,
                fullTitle,
                firstWidth
            )
        );

        return;
    }

    const breakPosition=findBreakPosition(
        firstLine,
        fullTitle,
        fullWidth
    );

    if(!breakPosition){
        firstRow.classList.add(
            "photo-card__title-row--single"
        );

        firstRow.append(actions);

        firstLine.textContent=fullTitle;

        firstLine.classList.add(
            "photo-card__title-line--ellipsis"
        );

        return;
    }

    firstRow.classList.add(
        "photo-card__title-row--multi"
    );

    secondRow.classList.add(
        "photo-card__title-row--multi"
    );

    const firstText=fullTitle
        .slice(0,breakPosition)
        .trim();

    const remaining=fullTitle
        .slice(breakPosition)
        .trim();

    firstLine.textContent=firstText;
    secondLine.textContent=remaining;

    secondRow.hidden=false;
    secondRow.append(actions);

    const secondWidth=getAvailableWidth(
        secondRow,
        actions
    );

    secondLine.classList.toggle(
        "photo-card__title-line--ellipsis",
        !fitsWidth(
            secondLine,
            remaining,
            secondWidth
        )
    );
}

function getLineHeight(element){
    const style=getComputedStyle(element);
    const value=parseFloat(style.lineHeight);

    if(Number.isFinite(value)){
        return value;
    }

    return parseFloat(
        style.fontSize
    )*1.5;
}

function getMetaHeight(meta){
    const range=document.createRange();

    range.selectNodeContents(meta);

    return range.getBoundingClientRect().height;
}

function layoutPhotoMeta(card){
    const meta=card.querySelector(
        ".photo-card__author"
    );

    const author=meta?.querySelector(
        ".photo-card__author-name"
    );

    const date=meta?.querySelector(
        ".photo-card__date"
    );

    if(!meta||!author||!date){
        return;
    }

    if(!author.dataset.fullAuthor){
        author.dataset.fullAuthor=
            author.textContent.trim();
    }

    author.textContent=
        author.dataset.fullAuthor;

    const lineHeight=getLineHeight(meta);
    const maxHeight=lineHeight*2;

    if(
        getMetaHeight(meta)<=
        maxHeight+1
    ){
        return;
    }

    const fullAuthor=
        author.dataset.fullAuthor;

    let start=1;
    let end=fullAuthor.length;
    let result="";

    while(start<=end){
        const middle=Math.floor(
            (start+end)/2
        );

        const value=
            `${fullAuthor
                .slice(0,middle)
                .trimEnd()}...`;

        author.textContent=value;

        if(
            getMetaHeight(meta)<=
            maxHeight+1
        ){
            result=value;
            start=middle+1;
        }else{
            end=middle-1;
        }
    }

    author.textContent=result;
}

function layoutPhotoText(card){
    layoutPhotoTitle(card);
    layoutPhotoMeta(card);
}

export function insertPhoto(photo){
    const list=document.querySelector(
        ".photos-list"
    );

    if(!list)return null;

    const element=createPhotoElement(photo);

    if(!element)return null;

    insertSortedElement({
        container:list,
        element,
        item:getPhotoData(photo),
        selector:
            ".photo-card:not(.photo-card--add)",
        direction:"asc",
        getItem:getPhotoElementData
    });

    requestAnimationFrame(()=>{
        layoutPhotoText(element);
    });

    return element;
}

export async function addPhotoToList(photo){
    const element=insertPhoto(photo);

    if(!element)return null;

    const list=element.parentElement;

    updateListPhotos(
        list,
        photo
    );

    await new Promise(
        requestAnimationFrame
    );

    await show(element);

    requestAnimationFrame(()=>{
        layoutPhotoText(element);
    });

    return element;
}

export async function removePhotoFromList(id){
    const element=document.querySelector(
        `.photo-card[data-photo-id="${id}"]`
    );

    if(!element)return;

    const list=element.parentElement;

    await hide(element);

    if(list){
        list.photos=
            (list.photos??[]).filter(
                photo=>photo.id!==id
            );
    }

    element.remove();
}

export async function updatePhotoInList(photo){
    const oldElement=document.querySelector(
        `.photo-card[data-photo-id="${photo.id}"]`
    );

    if(!oldElement){
        return await addPhotoToList(
            photo
        );
    }

    const list=oldElement.parentElement;

    oldElement.remove();

    const element=createPhotoElement(photo);

    if(!element)return null;

    insertSortedElement({
        container:list,
        element,
        item:getPhotoData(photo),
        selector:
            ".photo-card:not(.photo-card--add)",
        direction:"asc",
        getItem:getPhotoElementData
    });

    updateListPhotos(
        list,
        photo
    );

    requestAnimationFrame(()=>{
        layoutPhotoText(element);
    });

    return element;
}

export function renderPhotos(
    photos,
    objectId=null
){
    const sortedPhotos=sortEntities(
        (photos??[]).map(photo=>({
            photo,
            ...getPhotoData(photo)
        }))
    ).map(
        item=>item.photo
    );

    const cards=[
        adminAdd(
            "add-photo",
            "Добавить фото",
            {
                className:
                    "photo-card photo-card--add",
                attributes:{
                    "data-photo-drag":""
                }
            }
        ),
        ...sortedPhotos.map(renderPhoto)
    ];

    const html=`
        <div class="photos-list">
            ${cards.join("")}
        </div>
    `;

    setTimeout(()=>{
        const photosList=document.querySelector(
            ".photos-list"
        );

        if(!photosList)return;

        photosList.photos=sortedPhotos;

        photosList.querySelectorAll(
            ".photo-card:not(.photo-card--add)"
        ).forEach(
            layoutPhotoText
        );

        photosList.onclick=event=>{
            if(
                photosList.dataset
                    .photoDragMoved==="true"
            ){
                return;
            }

            const media=event.target.closest(
                ".photo-card__media"
            );

            if(
                !media||
                !photosList.contains(media)
            ){
                return;
            }

            if(
                media.dataset.loading==="true"
            ){
                return;
            }

            const photo=
                photosList.photos?.find(
                    item=>
                        item.id===
                        media.dataset.photoId
                );

            if(!photo?.storagePath){
                return;
            }

            const image=media.querySelector(
                ".photo-card__image"
            );

            if(
                !image||
                !image.complete||
                image.naturalWidth===0
            ){
                return;
            }

            void openPhotoModal(
                photo,
                {
                    id:objectId,
                    photos:
                        photosList.photos
                }
            );
        };
    },0);

    return html;
}
