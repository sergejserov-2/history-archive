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
            <span class="photo-card__author-name">${author}</span>,
            <span class="photo-card__date">${date}</span>
        `;
    }
    if(author){
        return`
            <span class="photo-card__author-name">${author}</span>
        `;
    }
    if(date){
        return`
            <span class="photo-card__date">${date}</span>
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
                    <span class="photo-card__title-text">
                        ${photo.title??""}
                    </span>
                    <span class="photo-card__actions">
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
        meta:element.querySelector(".photo-card__date")?.textContent.trim()??"",
        author:element.querySelector(".photo-card__author-name")?.textContent.trim()??"",
        title:element.querySelector(".photo-card__title-text")?.textContent.trim()??""
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

export function insertPhoto(photo){
    const list=document.querySelector(".photos-list");
    if(!list)return null;
    const element=createPhotoElement(photo);
    if(!element)return null;
    insertSortedElement({
        container:list,
        element,
        item:getPhotoData(photo),
        selector:".photo-card:not(.photo-card--add)",
        direction:"asc",
        getItem:getPhotoElementData
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
        list.photos=(list.photos??[]).filter(
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
        return await addPhotoToList(photo);
    }
    const list=oldElement.parentElement;
    oldElement.remove();
    const element=createPhotoElement(photo);
    if(!element)return null;
    insertSortedElement({
        container:list,
        element,
        item:getPhotoData(photo),
        selector:".photo-card:not(.photo-card--add)",
        direction:"asc",
        getItem:getPhotoElementData
    });
    updateListPhotos(
        list,
        photo
    );
    return element;
}

export function renderPhotos(photos,objectId=null){
    const sortedPhotos=sortEntities(
        (photos??[]).map(photo=>({
            photo,
            ...getPhotoData(photo)
        }))
    ).map(item=>item.photo);
    const cards=[
        adminAdd(
            "add-photo",
            "Добавить фото",
            {
                className:"photo-card photo-card--add",
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
        const photosList=document.querySelector(".photos-list");
        if(!photosList)return;
        photosList.photos=sortedPhotos;
        photosList.onclick=event=>{
            if(photosList.dataset.photoDragMoved==="true"){
                return;
            }
            const media=event.target.closest(".photo-card__media");
            if(!media||!photosList.contains(media)){
                return;
            }
            if(media.dataset.loading==="true"){
                return;
            }
            const photo=photosList.photos?.find(
                item=>item.id===media.dataset.photoId
            );
            if(!photo?.storagePath){
                return;
            }
            const image=media.querySelector(".photo-card__image");
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
                    photos:photosList.photos
                }
            );
        };
    },0);
    return html;
}
