import{openPhotoModal}from"./modalReload.js";
import{renderLoadingPlaceholder}from"./loadingPlaceholder.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";

function getPhotoPeriod(photo){
    if(photo.dateMode==="period"){
        if(photo.dateStart&&photo.dateEnd)return`${photo.dateStart} – ${photo.dateEnd}`;
        if(photo.dateStart)return`с ${photo.dateStart}`;
        if(photo.dateEnd)return`до ${photo.dateEnd}`;
        return"";
    }

    return photo.date??"";
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

function sortPhotos(photos=[]){
    return [...photos].sort((a,b)=>{
        const dateA=a.date??a.dateStart??"";
        const dateB=b.date??b.dateStart??"";

        if(!dateA&&!dateB){
            const author=(a.author??"").localeCompare(
                b.author??"",
                "ru"
            );

            return author!==0
                ?author
                :(a.title??"").localeCompare(
                    b.title??"",
                    "ru"
                );
        }

        if(!dateA)return 1;
        if(!dateB)return-1;

        const date=String(dateB).localeCompare(
            String(dateA)
        );

        if(date!==0)return date;

        const author=(a.author??"").localeCompare(
            b.author??"",
            "ru"
        );

        return author!==0
            ?author
            :(a.title??"").localeCompare(
                b.title??"",
                "ru"
            );
    });
}

export function renderPhotos(photos,objectId=null){
    const sortedPhotos=sortPhotos(photos??[]);

    const cards=[
        adminAdd(
            "add-photo",
            "Добавить фото",
            {
                className:"photo-card photo-card--add",
                attributes:{"data-photo-drag":""}
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

        photosList.onclick=event=>{
            if(photosList.dataset.photoDragMoved==="true"){
                return;
            }

            const media=event.target.closest(".photo-card__media");

            if(!media)return;

            if(media.dataset.loading==="true"){
                return;
            }

            const photo=sortedPhotos.find(
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
                    photos:sortedPhotos
                }
            );
        };
    },0);

    return html;
}
