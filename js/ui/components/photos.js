import{openPhotoModal}from"./modalReload.js";
import{renderLoadingPlaceholder}from"./loadingPlaceholder.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";

function renderPhotoMedia(photo){
    const uploading=photo.isUploading===true;
    const hasPreview=Boolean(photo.previewPath);
    if(uploading&&!hasPreview)return renderLoadingPlaceholder();
    if(hasPreview)return`${uploading?renderLoadingPlaceholder():""}<img class="photo-card__image${uploading?" photo-card__image--loading":""}" src="${photo.previewPath}" alt="${photo.title??""}">`;
    return`<div class="photo-card__placeholder">Фото отсутствует</div>`;
}

export function renderPhoto(photo){
    const uploading=photo.isUploading===true;
    return`
        <div class="photo-card${uploading?" photo-card--uploading":""}" data-photo-id="${photo.id}">
            <div class="photo-card__media" data-photo-id="${photo.id}" data-loading="${uploading}">
                ${renderPhotoMedia(photo)}
            </div>
            <div class="photo-card__title">
                ${photo.title??""}
                ${adminEdit("photo",photo.id)}
                ${adminDelete("photo",photo.id)}
            </div>
            <div class="photo-card__author">
                ${photo.author??""}
                ${photo.dateMode==="period"
                    ?(photo.dateStart||photo.dateEnd?`, <span class="photo-card__date">${photo.dateStart&&photo.dateEnd?`${photo.dateStart} – ${photo.dateEnd}`:photo.dateStart?`с ${photo.dateStart}`:`до ${photo.dateEnd}`}</span>`:"")
                    :(photo.date?`, <span class="photo-card__date">${photo.date}</span>`:"")}
            </div>
        </div>
    `;
}

export function renderPhotos(photos,objectId=null){
    const cards=[adminAdd("add-photo","Добавить фото",{className:"photo-card photo-card--add"})];
    const sortedPhotos=[...(photos??[])].sort((a,b)=>{
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
    sortedPhotos.forEach(photo=>cards.push(renderPhoto(photo)));
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
            void openPhotoModal(photo,{id:objectId,photos:sortedPhotos});
        };
    },0);
    return html;
}
