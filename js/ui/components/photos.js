// ======================================
// Photos component
// ======================================

import {openPhotoViewer} from "./photoViewer.js";

export function renderPhotos(photos, ADMIN_MODE=false){
    const cards=[];
    if(ADMIN_MODE) cards.push(`<div class="photo-card photo-card--add admin-button" data-action="add-photo">+ Добавить фото</div>`);

    const sortedPhotos=[...(photos??[])].sort((a,b)=>{
        const dateA=a.date||"",dateB=b.date||"";
        if(!dateA&&!dateB){
            const author=(a.author??"").localeCompare(b.author??"","ru");
            return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
        }
        if(!dateA)return 1;
        if(!dateB)return -1;
        const date=String(dateB).localeCompare(String(dateA));
        if(date!==0)return date;
        const author=(a.author??"").localeCompare(b.author??"","ru");
        return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
    });

    sortedPhotos.forEach(photo=>{
        const uploading=photo.isUploading===true;
        const hasPreview=Boolean(photo.previewPath);
        let mediaHTML;

        if(uploading&&!hasPreview){
            mediaHTML=`<div class="photo-card__loading"><div class="photo-card__loading-bg"></div><div class="photo-card__loading-spinner"></div></div>`;
        }else if(hasPreview){
            mediaHTML=`<div class="photo-card__loading photo-card__loading--preview"><div class="photo-card__loading-bg"></div><div class="photo-card__loading-spinner"></div><img class="photo-card__image${uploading?" photo-card__image--loading":""}" src="${photo.previewPath}" alt="${photo.title??""}"></div>`;
        }else{
            mediaHTML=`<div class="photo-card__placeholder">Фото отсутствует</div>`;
        }

        cards.push(`<div class="photo-card${uploading?" photo-card--uploading":""}" data-photo-id="${photo.id}"><div class="photo-card__media" data-photo-id="${photo.id}" data-loading="${uploading}">${mediaHTML}</div><div class="photo-card__title">${photo.title??""}${ADMIN_MODE?`<button class="admin-button" data-action="edit-photo" data-id="${photo.id}"><img src="icons/edit.svg" class="admin-icon"></button><button class="admin-button" data-action="delete-photo" data-id="${photo.id}"><img src="icons/delete.svg" class="admin-icon"></button>`:""}</div><div class="photo-card__author">${photo.author??""}${photo.dateMode==="period"?(photo.dateStart||photo.dateEnd)?`, <span class="photo-card__date">${photo.dateStart&&photo.dateEnd?`${photo.dateStart} – ${photo.dateEnd}`:photo.dateStart?`с ${photo.dateStart}`:`до ${photo.dateEnd}`}</span>`:"":photo.date?`, <span class="photo-card__date">${photo.date}</span>`:""}</div></div>`);
    });

    const html=`<div class="photos-list">${cards.join("")}</div>`;

    setTimeout(()=>{
        const photosList=document.querySelector(".photos-list");
        if(!photosList)return;
        photosList.onclick=event=>{
            const media=event.target.closest(".photo-card__media");
            if(!media||media.dataset.loading==="true")return;
            const photo=sortedPhotos.find(item=>item.id===media.dataset.photoId);
            if(!photo||!photo.storagePath)return;
            const image=media.querySelector(".photo-card__image");
            if(!image||!image.complete||image.naturalWidth===0)return;
            openPhotoViewer(photo,{photos:sortedPhotos});
        };
    },0);

    return html;
}
