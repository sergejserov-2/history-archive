// ======================================
// Photo viewer
// ======================================

import{createModal}from"./modal.js";
import{createViewerControls}from"./viewerControls.js";

export function openPhotoViewer(photo,{photos=[],fromUrl=false}={}){
    if(!photo)return;
    const gallery=[...(photos??[])];
    let currentIndex=gallery.findIndex(item=>item.id===photo.id);
    if(currentIndex<0){
        gallery.unshift(photo);
        currentIndex=0;
    }
    if(!fromUrl&&photo.id)updatePhotoUrl(photo.id);
    const form=`
<div class="photo-viewer">
    <div class="photo-viewer__image-area">
        <div class="photo-viewer__image-bg"></div>
        <img id="photoViewerImage" src="" alt="" draggable="false">
    </div>
    <div class="photo-viewer__info">
        <div class="photo-viewer__title"></div>
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
    </div>
</div>`;
    const modal=createModal({title:"Фотография",content:form});
    const root=modal.root;
    root.querySelector(".modal")?.classList.add("modal--photo-viewer");
    const imageArea=root.querySelector(".photo-viewer__image-area");
    const image=root.querySelector("#photoViewerImage");
    const imageBackground=root.querySelector(".photo-viewer__image-bg");
    if(!imageArea||!image)return modal;
    let scale=1;
    let translateX=0;
    let translateY=0;
    let dragging=false;
    let startX=0;
    let startY=0;
    let startTranslateX=0;
    let startTranslateY=0;
    function updateTransform(){
        image.style.transform=`translate(${translateX}px,${translateY}px) scale(${scale})`;
    }
    function fitImage(){
        const areaWidth=imageArea.clientWidth;
        const areaHeight=imageArea.clientHeight;
        const imageWidth=image.naturalWidth;
        const imageHeight=image.naturalHeight;
        if(!imageWidth||!imageHeight)return;
        scale=Math.min(areaWidth/imageWidth,areaHeight/imageHeight,1);
        translateX=0;
        translateY=0;
        updateTransform();
    }
    function showPhoto(nextPhoto,nextIndex,{updateUrl=true}={}){
        if(!nextPhoto)return;
        currentIndex=nextIndex;
        scale=1;
        translateX=0;
        translateY=0;
        dragging=false;
        pinchStartDistance=null;
        imageArea.classList.remove("is-dragging");
        const previewPath=nextPhoto.previewPath??"";
        const originalPath=nextPhoto.storagePath??"";
        image.alt=nextPhoto.title??"";
        if(previewPath){
            imageBackground.style.backgroundImage=`url('${previewPath}')`;
            image.src=previewPath;
        }else{
            imageBackground.style.backgroundImage="";
            image.src=originalPath;
        }
        if(image.complete)fitImage();
        if(originalPath&&originalPath!==previewPath){
            const originalImage=new Image();
            originalImage.onload=()=>{
                image.src=originalPath;
            };
            originalImage.src=originalPath;
        }
        const title=root.querySelector(".photo-viewer__title");
        const description=root.querySelector(".photo-viewer__description");
        const author=root.querySelector(".photo-viewer__author");
        const authorValue=root.querySelector(".photo-viewer__author-value");
        const date=root.querySelector(".photo-viewer__date");
        const dateValue=root.querySelector(".photo-viewer__date-value");
        const download=root.querySelector(".photo-viewer__download");
        if(title)title.textContent=nextPhoto.title??"";
        if(description){
            description.textContent=nextPhoto.description??"";
            description.hidden=!nextPhoto.description;
        }
        if(author){
            if(nextPhoto.author){
                authorValue.textContent=nextPhoto.author;
                author.hidden=false;
            }else{
                authorValue.textContent="";
                author.hidden=true;
            }
        }
        if(date){
            if(nextPhoto.date){
                dateValue.textContent=nextPhoto.date;
                date.hidden=false;
            }else{
                dateValue.textContent="";
                date.hidden=true;
            }
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
        controls.update(currentIndex);
        if(updateUrl&&nextPhoto.id)updatePhotoUrl(nextPhoto.id);
    }
    image.onload=()=>{
        if(image.src===imageBackground.style.backgroundImage)return;
        if(scale===1&&translateX===0&&translateY===0)fitImage();
    };
    function showPrevious(){
        if(currentIndex<=0)return;
        const nextIndex=currentIndex-1;
        showPhoto(gallery[nextIndex],nextIndex);
    }
    function showNext(){
        if(currentIndex>=gallery.length-1)return;
        const nextIndex=currentIndex+1;
        showPhoto(gallery[nextIndex],nextIndex);
    }
    function handleMouseMove(event){
        if(!dragging)return;
        translateX=startTranslateX+(event.clientX-startX);
        translateY=startTranslateY+(event.clientY-startY);
        updateTransform();
    }
    function handleMouseUp(){
        dragging=false;
        imageArea.classList.remove("is-dragging");
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
    window.addEventListener("mousemove",handleMouseMove);
    window.addEventListener("mouseup",handleMouseUp);
    imageArea.addEventListener("wheel",event=>{
        event.preventDefault();
        const oldScale=scale;
        const direction=event.deltaY<0?1:-1;
        scale+=direction*.15;
        scale=Math.max(.1,Math.min(scale,5));
        const rect=imageArea.getBoundingClientRect();
        const mouseX=event.clientX-rect.left-rect.width/2;
        const mouseY=event.clientY-rect.top-rect.height/2;
        translateX-=mouseX*(scale-oldScale);
        translateY-=mouseY*(scale-oldScale);
        updateTransform();
    },{passive:false});
    let touchStartX=0;
    let touchStartY=0;
    let touchStartTranslateX=0;
    let touchStartTranslateY=0;
    let pinchStartDistance=null;
    let pinchStartScale=1;
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
            pinchStartScale=scale;
        }
    },{passive:true});
    imageArea.addEventListener("touchmove",event=>{
        event.preventDefault();
        if(event.touches.length===1&&dragging){
            const touch=event.touches[0];
            translateX=touchStartTranslateX+(touch.clientX-touchStartX);
            translateY=touchStartTranslateY+(touch.clientY-touchStartY);
            updateTransform();
        }
        if(event.touches.length===2){
            const distance=getTouchDistance(event.touches[0],event.touches[1]);
            if(!pinchStartDistance)return;
            scale=pinchStartScale*(distance/pinchStartDistance);
            scale=Math.max(.1,Math.min(scale,5));
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
    const controls=createViewerControls({
        currentIndex,
        total:gallery.length,
        onPrevious:showPrevious,
        onNext:showNext
    });
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
    const url=new URL(window.location.href);
    url.searchParams.set("modal","photo-preview");
    url.searchParams.set("entityId",photoId);
    window.history.pushState({},"",url);
}
