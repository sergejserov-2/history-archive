import{createModal}from"./modal.js";
import{setModalUrl,replaceModalUrl}from"./modalReload.js";
import{createViewerControls}from"./viewerControls.js";
import {
    adminEdit,
    adminDelete
} from "../../admin/adminButtons.js";
import {
    isAdmin
} from "../../admin/adminMode.js";

export function openPhotoViewer(photo,{photos=[],fromUrl=false,showInfo=true,urlParams={}}={}){
    if(!photo)return;
    const gallery=[...(photos??[])];
    let currentIndex=gallery.findIndex(item=>item.id===photo.id);
    if(currentIndex<0){
        gallery.unshift(photo);
        currentIndex=0;
    }
    if(!fromUrl&&photo.id){
        const params={...urlParams,entityId:photo.id};
        const currentUrl=new URL(window.location.href);
        if(!params.id&&currentUrl.searchParams.get("id"))params.id=currentUrl.searchParams.get("id");
        setModalUrl("photo-preview",params);
    }
    const form=`
<div class="photo-viewer">
    <div class="photo-viewer__image-area">
        <div class="photo-viewer__image-bg"></div>
        <img id="photoViewerImage" src="" alt="" draggable="false">
    </div>
    ${showInfo?`
    <div class="photo-viewer__info">
        <div class="photo-viewer__title">
            <span class="photo-viewer__title-text"></span>
            <span class="photo-viewer__title-actions"></span>
        </div>
        <div class="photo-viewer__description" hidden></div>
        <div class="photo-viewer__field photo-viewer__author" hidden>
            <span class="photo-viewer__label">Автор</span>
            <span class="photo-viewer__author-value"></span>
        </div>
        <div class="photo-viewer__field photo-viewer__date" hidden>
            <span class="photo-viewer__label">Дата</span>
            <span class="photo-viewer__date-value"></span>
        </div>
        <a class="photo-viewer__download" hidden download target="_blank" rel="noopener">Скачать</a>
    </div>`:""}
</div>`;
    const modal=createModal({title:"Фотография",content:form,width:showInfo?840:640});
    const root=modal.root;
    root.querySelector(".modal")?.classList.add("modal--photo-viewer");
    const imageArea=root.querySelector(".photo-viewer__image-area");
    const image=root.querySelector("#photoViewerImage");
    const imageBackground=root.querySelector(".photo-viewer__image-bg");
    if(isAdmin()){

    root.addEventListener("click",event=>{

        const button=event.target.closest(".admin-button");

        if(!button)return;

        const action=button.dataset.action;
        const id=button.dataset.id;

        root.dispatchEvent(
            new CustomEvent(
                "photo-admin-action",
                {
                    bubbles:true,
                    detail:{
                        action,
                        id,
                        photo
                    }
                }
            )
        );

    });

}
    if(!imageArea||!image)return modal;
    image.style.visibility="hidden";
    let fitScale=1,zoom=1,scale=1,translateX=0,translateY=0;
    let dragging=false,startX=0,startY=0,startTranslateX=0,startTranslateY=0;
    let touchStartX=0,touchStartY=0,touchStartTranslateX=0,touchStartTranslateY=0;
    let pinchStartDistance=null,pinchStartZoom=1,relativeX=0,relativeY=0;
    function updateTransform(){
        scale=fitScale*zoom;
        image.style.transform=`translate3d(${translateX}px,${translateY}px,0) scale(${scale})`;
    }
    function calculateFitScale(){
        const areaWidth=imageArea.clientWidth,areaHeight=imageArea.clientHeight;
        const imageWidth=image.naturalWidth,imageHeight=image.naturalHeight;
        if(!areaWidth||!areaHeight||!imageWidth||!imageHeight)return false;
        fitScale=Math.min(areaWidth/imageWidth,areaHeight/imageHeight);
        updateTransform();
        return true;
    }
    function saveRelativePosition(){
        const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
        relativeX=width?translateX/width:0;
        relativeY=height?translateY/height:0;
    }
    function restoreRelativePosition(){
        const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
        translateX=relativeX*width;
        translateY=relativeY*height;
    }
    function resetView(){
        fitScale=1;zoom=1;scale=1;translateX=0;translateY=0;relativeX=0;relativeY=0;
        dragging=false;pinchStartDistance=null;
        imageArea.classList.remove("is-dragging");
        image.style.transform="";
        image.style.visibility="hidden";
    }
    function updateInfo(nextPhoto){
        if(!showInfo)return;
        const description=root.querySelector(".photo-viewer__description");
        const author=root.querySelector(".photo-viewer__author");
        const authorValue=root.querySelector(".photo-viewer__author-value");
        const date=root.querySelector(".photo-viewer__date");
        const dateValue=root.querySelector(".photo-viewer__date-value");
        const download=root.querySelector(".photo-viewer__download");
        const title=root.querySelector(".photo-viewer__title-text");
        const titleActions=root.querySelector(".photo-viewer__title-actions");
        if(title){
            title.textContent=nextPhoto.title??"";
        }        
        if(titleActions){
            titleActions.innerHTML=isAdmin()
                ?
                `
                ${adminEdit("photo",nextPhoto.id)}
                ${adminDelete("photo",nextPhoto.id)}
                `
                :
                "";
        }
        if(description){
            description.textContent=nextPhoto.description??"";
            description.hidden=!nextPhoto.description;
        }
        if(author){
            authorValue.textContent=nextPhoto.author??"";
            author.hidden=!nextPhoto.author;
        }
        if(date){
            dateValue.textContent=nextPhoto.date??"";
            date.hidden=!nextPhoto.date;
        }
        if(download){
            if(nextPhoto.storagePath){
                download.href=nextPhoto.storagePath;
                download.hidden=false;
            }else{
                download.removeAttribute("href");
                download.hidden=true;
            }
        }
    }
    function loadImage(src){
        return new Promise((resolve,reject)=>{
            const loader=new Image();
            loader.onload=()=>resolve(loader);
            loader.onerror=reject;
            loader.src=src;
        });
    }
    async function loadPhotoImage(nextPhoto){
        resetView();
        if(nextPhoto.previewPath)imageBackground.style.backgroundImage=`url('${nextPhoto.previewPath}')`;
        else imageBackground.style.backgroundImage="";
        if(!nextPhoto.previewPath){
            if(!nextPhoto.storagePath)return;
            try{
                await loadImage(nextPhoto.storagePath);
                image.src=nextPhoto.storagePath;
                if(calculateFitScale())image.style.visibility="visible";
            }catch(error){console.error("Ошибка загрузки изображения:",error);}
            return;
        }
        try{
            await loadImage(nextPhoto.previewPath);
            image.src=nextPhoto.previewPath;
            calculateFitScale();
            image.style.visibility="visible";
        }catch(error){
            console.error("Ошибка загрузки preview:",error);
            return;
        }
        if(!nextPhoto.storagePath||nextPhoto.storagePath===nextPhoto.previewPath)return;
        try{
            const original=await loadImage(nextPhoto.storagePath);
            saveRelativePosition();
            image.src=original.src;
            await new Promise(resolve=>{image.onload=resolve;});
            calculateFitScale();
            restoreRelativePosition();
            updateTransform();
        }catch(error){console.error("Ошибка загрузки оригинала:",error);}
    }
    async function showPhoto(nextPhoto,nextIndex,{updateUrl=true}={}){
        if(!nextPhoto)return;
        currentIndex=nextIndex;
        controls.update(currentIndex);
        updateInfo(nextPhoto);
        if(updateUrl&&nextPhoto.id)updatePhotoUrl(nextPhoto.id);
        await loadPhotoImage(nextPhoto);
    }
    function showPrevious(){
        if(currentIndex<=0)return;
        showPhoto(gallery[currentIndex-1],currentIndex-1);
    }
    function showNext(){
        if(currentIndex>=gallery.length-1)return;
        showPhoto(gallery[currentIndex+1],currentIndex+1);
    }
    imageArea.addEventListener("mousedown",event=>{
        event.preventDefault();
        dragging=true;
        startX=event.clientX;
        startY=event.clientY;
        startTranslateX=translateX;
        startTranslateY=translateY;
        imageArea.classList.add("is-dragging");
    });
    function handleMouseMove(event){
        if(!dragging)return;
        translateX=startTranslateX+event.clientX-startX;
        translateY=startTranslateY+event.clientY-startY;
        updateTransform();
    }
    function handleMouseUp(){
        dragging=false;
        imageArea.classList.remove("is-dragging");
    }
    window.addEventListener("mousemove",handleMouseMove);
    window.addEventListener("mouseup",handleMouseUp);
    imageArea.addEventListener("wheel",event=>{
        event.preventDefault();
        const oldScale=fitScale*zoom;
        const factor=Math.exp(-event.deltaY*0.001);
        zoom=Math.max(1,Math.min(zoom*factor,5));
        const newScale=fitScale*zoom;
        const rect=imageArea.getBoundingClientRect();
        const mouseX=event.clientX-rect.left-rect.width/2;
        const mouseY=event.clientY-rect.top-rect.height/2;
        const ratio=newScale/oldScale;
        translateX=mouseX-(mouseX-translateX)*ratio;
        translateY=mouseY-(mouseY-translateY)*ratio;
        updateTransform();
    },{passive:false});
    imageArea.addEventListener("touchstart",event=>{
        if(event.touches.length===1){
            const touch=event.touches[0];
            dragging=true;
            touchStartX=touch.clientX;
            touchStartY=touch.clientY;
            touchStartTranslateX=translateX;
            touchStartTranslateY=translateY;
        }
        if(event.touches.length===2){
            dragging=false;
            pinchStartDistance=getTouchDistance(event.touches[0],event.touches[1]);
            pinchStartZoom=zoom;
        }
    },{passive:true});
    imageArea.addEventListener("touchmove",event=>{
        event.preventDefault();
        if(event.touches.length===1&&dragging){
            const touch=event.touches[0];
            translateX=touchStartTranslateX+touch.clientX-touchStartX;
            translateY=touchStartTranslateY+touch.clientY-touchStartY;
            updateTransform();
        }
        if(event.touches.length===2){
            const distance=getTouchDistance(event.touches[0],event.touches[1]);
            if(!pinchStartDistance)return;
            zoom=pinchStartZoom*(distance/pinchStartDistance);
            zoom=Math.max(1,Math.min(zoom,5));
            updateTransform();
        }
    },{passive:false});
    imageArea.addEventListener("touchend",()=>{
        dragging=false;
        pinchStartDistance=null;
    });
    function getTouchDistance(first,second){
        const dx=first.clientX-second.clientX;
        const dy=first.clientY-second.clientY;
        return Math.sqrt(dx*dx+dy*dy);
    }
    const controls=createViewerControls({currentIndex,total:gallery.length,onPrevious:showPrevious,onNext:showNext});
    root.appendChild(controls.element);
    showPhoto(gallery[currentIndex],currentIndex,{updateUrl:false});
    const originalClose=modal.close;
    modal.close=()=>{
        controls.destroy();
        window.removeEventListener("mousemove",handleMouseMove);
        window.removeEventListener("mouseup",handleMouseUp);
        originalClose();
    };
    return modal;
}

function updatePhotoUrl(photoId){
    if(!photoId)return;
    replaceModalUrl({
        modal:"photo-preview",
        entityId:photoId
    });
}
