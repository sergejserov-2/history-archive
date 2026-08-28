
import{createModal}from"./modal.js";
import{replaceModalUrl}from"./modalReload.js";
import{createViewerControls}from"./viewerControls.js";
import{adminEdit,adminDelete}from"./adminButtons.js";

export function openPhotoViewer(photo,{photos=[],fromUrl=false,showInfo=true}={}){
    if(!photo)return;

    const gallery=[...(photos??[])];
    let currentIndex=gallery.findIndex(item=>String(item.id)===String(photo.id));

    if(currentIndex<0){
        gallery.push(photo);
        currentIndex=gallery.length-1;
    }

    const form=`
<div class="photo-viewer">
    <div class="photo-viewer__image-area">
        <div class="photo-viewer__image-bg"></div>
        <div class="photo-viewer__original-loading">
            <span>Оригинал загружается, подождите...</span>
            <div class="photo-viewer__progress"><div></div></div>
        </div>
        <img id="photoViewerImage" src="" alt="" draggable="false">
    </div>
    <div class="photo-viewer__info">
        <button class="photo-viewer__info-toggle" type="button" aria-label="Свернуть информацию" title="Свернуть">›</button>
        <div class="photo-viewer__info-content">
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
        </div>
    </div>
</div>`;

    const modal=createModal({title:"Фотография",content:form,width:showInfo?840:640});
    const root=modal.root;
    root.querySelector(".modal")?.classList.add("modal--photo-viewer");

    const imageArea=root.querySelector(".photo-viewer__image-area");
    const image=root.querySelector("#photoViewerImage");
    const imageBackground=root.querySelector(".photo-viewer__image-bg");
    const loading=root.querySelector(".photo-viewer__original-loading");
    const progress=root.querySelector(".photo-viewer__progress div");
    const infoToggle=root.querySelector(".photo-viewer__info-toggle");
    const viewer=root.querySelector(".photo-viewer");

    if(!showInfo){
        viewer.classList.add("photo-viewer--info-collapsed");
        infoToggle?.remove();
    }

    if(infoToggle){
        infoToggle.onclick=()=>{
            viewer.classList.toggle("photo-viewer--info-collapsed");
            const collapsed=viewer.classList.contains("photo-viewer--info-collapsed");
            infoToggle.textContent=collapsed?"‹":"›";
            infoToggle.setAttribute("aria-label",collapsed?"Развернуть информацию":"Свернуть информацию");
            infoToggle.title=collapsed?"Развернуть":"Свернуть";
        };
    }

    root.addEventListener("click",event=>{
        const button=event.target.closest(".admin-button");
        if(!button)return;

        root.dispatchEvent(new CustomEvent("photo-admin-action",{
            bubbles:true,
            detail:{
                action:button.dataset.action,
                id:button.dataset.id,
                photo
            }
        }));
    });

    if(!imageArea||!image)return modal;

    image.style.visibility="hidden";

    let fitScale=1,zoom=1,scale=1,translateX=0,translateY=0;
    let dragging=false,startX=0,startY=0,startTranslateX=0,startTranslateY=0;
    let touchStartX=0,touchStartY=0,touchStartTranslateX=0,touchStartTranslateY=0;
    let pinchStartDistance=null,pinchStartZoom=1;
    let savedZoom=1,savedRelativeX=0,savedRelativeY=0;
    let originalObjectUrl=null;
    let loadingTimer=null;
    let loadToken=0;

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

    function saveViewPosition(){
        savedZoom=zoom;

        const displayedWidth=image.naturalWidth*scale;
        const displayedHeight=image.naturalHeight*scale;

        savedRelativeX=displayedWidth?translateX/displayedWidth:0;
        savedRelativeY=displayedHeight?translateY/displayedHeight:0;
    }

    function restoreViewPosition(){
        zoom=savedZoom;
        scale=fitScale*zoom;

        const displayedWidth=image.naturalWidth*scale;
        const displayedHeight=image.naturalHeight*scale;

        translateX=savedRelativeX*displayedWidth;
        translateY=savedRelativeY*displayedHeight;

        updateTransform();
    }

    function resetView(){
        fitScale=1;
        zoom=1;
        scale=1;
        translateX=0;
        translateY=0;
        savedZoom=1;
        savedRelativeX=0;
        savedRelativeY=0;
        dragging=false;
        pinchStartDistance=null;

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

        if(title)title.textContent=nextPhoto.title??"";

        if(titleActions){
            titleActions.innerHTML=`${adminEdit("photo",nextPhoto.id)}${adminDelete("photo",nextPhoto.id)}`;
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

    function showOriginalLoading(){
        if(!loading)return;

        loading.classList.add("photo-viewer__original-loading--visible");
        loading.classList.remove("photo-viewer__original-loading--indeterminate");

        if(progress)progress.style.width="0%";
    }

    function updateOriginalProgress(value){
        if(progress)progress.style.width=`${Math.max(0,Math.min(100,value))}%`;
    }

    function setIndeterminateProgress(){
        if(!loading)return;

        loading.classList.add("photo-viewer__original-loading--indeterminate");

        if(progress)progress.style.width="100%";
    }

    function hideOriginalLoading(){
        if(loadingTimer){
            clearTimeout(loadingTimer);
            loadingTimer=null;
        }

        if(!loading)return;

        loading.classList.remove("photo-viewer__original-loading--visible","photo-viewer__original-loading--indeterminate");

        if(progress)progress.style.width="0%";
    }

    function startDelayedLoading(){
        hideOriginalLoading();

        loadingTimer=setTimeout(()=>{
            loadingTimer=null;
            showOriginalLoading();
        },1000);
    }

    async function loadOriginal(src,token){
        const response=await fetch(src);

        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        if(token!==loadToken)throw new Error("Загрузка отменена");

        const contentLength=response.headers.get("Content-Length");
        const total=Number(contentLength);

        if(!response.body||!total){
            setIndeterminateProgress();

            const blob=await response.blob();

            if(token!==loadToken)throw new Error("Загрузка отменена");

            return URL.createObjectURL(blob);
        }

        const reader=response.body.getReader();
        const chunks=[];
        let loaded=0;

        while(true){
            const{done,value}=await reader.read();

            if(done)break;
            if(token!==loadToken)throw new Error("Загрузка отменена");

            chunks.push(value);
            loaded+=value.length;

            updateOriginalProgress(loaded/total*100);
        }

        return URL.createObjectURL(new Blob(chunks));
    }

    function loadBlobIntoImage(src){
        return new Promise((resolve,reject)=>{
            image.onload=resolve;
            image.onerror=reject;
            image.src=src;
        });
    }

    async function loadOriginalInBackground(nextPhoto,token){
        startDelayedLoading();

        try{
            const objectUrl=await loadOriginal(nextPhoto.storagePath,token);

            if(token!==loadToken){
                URL.revokeObjectURL(objectUrl);
                return;
            }

            originalObjectUrl=objectUrl;

            await loadBlobIntoImage(originalObjectUrl);

            if(token!==loadToken)return;

            const areaWidth=imageArea.clientWidth;
            const areaHeight=imageArea.clientHeight;
            const imageWidth=image.naturalWidth;
            const imageHeight=image.naturalHeight;

            if(!areaWidth||!areaHeight||!imageWidth||!imageHeight)return;

            fitScale=Math.min(areaWidth/imageWidth,areaHeight/imageHeight);
            restoreViewPosition();

            image.style.visibility="visible";
            updateOriginalProgress(100);
        }catch(error){
            if(token===loadToken&&!String(error.message).includes("Загрузка отменена")){
                console.error("Ошибка загрузки оригинала:",error);
            }
        }finally{
            if(token===loadToken)hideOriginalLoading();
        }
    }

    async function loadPhotoImage(nextPhoto){
        const token=++loadToken;

        resetView();
        hideOriginalLoading();

        if(originalObjectUrl){
            URL.revokeObjectURL(originalObjectUrl);
            originalObjectUrl=null;
        }

        imageBackground.style.backgroundImage=nextPhoto.previewPath?`url('${nextPhoto.previewPath}')`:"";

        if(!nextPhoto.previewPath){
            if(!nextPhoto.storagePath)return false;

            try{
                await loadImage(nextPhoto.storagePath);

                if(token!==loadToken)return false;

                image.src=nextPhoto.storagePath;

                if(calculateFitScale()){
                    image.style.visibility="visible";
                }

                return true;
            }catch(error){
                if(token===loadToken)console.error("Ошибка загрузки изображения:",error);
                return false;
            }
        }

        try{
            await loadImage(nextPhoto.previewPath);

            if(token!==loadToken)return false;

            image.src=nextPhoto.previewPath;
            calculateFitScale();
            image.style.visibility="visible";
        }catch(error){
            if(token===loadToken)console.error("Ошибка загрузки preview:",error);
            return false;
        }

        if(!nextPhoto.storagePath||nextPhoto.storagePath===nextPhoto.previewPath){
            return true;
        }

        saveViewPosition();
        void loadOriginalInBackground(nextPhoto,token);

        return true;
    }

    async function showPhoto(nextPhoto,nextIndex,{updateUrl=true,showControls=false}={}){
        if(!nextPhoto)return;

        currentIndex=nextIndex;
        controls.update(currentIndex);
        updateInfo(nextPhoto);

        if(updateUrl&&nextPhoto.id){
            replaceModalUrl({entityId:nextPhoto.id});
        }

        const loaded=await loadPhotoImage(nextPhoto);

        if(loaded&&showControls){
            controls.show();
        }
    }

    function showPrevious(){
        if(currentIndex<=0)return;

        controls.hide();
        void showPhoto(gallery[currentIndex-1],currentIndex-1,{showControls:true});
    }

    function showNext(){
        if(currentIndex>=gallery.length-1)return;

        controls.hide();
        void showPhoto(gallery[currentIndex+1],currentIndex+1,{showControls:true});
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

    const controls=createViewerControls({
        currentIndex,
        total:gallery.length,
        onPrevious:showPrevious,
        onNext:showNext
    });

    controls.hide();
    root.appendChild(controls.element);

    void showPhoto(gallery[currentIndex],currentIndex,{
        updateUrl:false,
        showControls:true
    });

    const originalClose=modal.close;

    modal.close=()=>{
        controls.hide();
        hideOriginalLoading();
        ++loadToken;

        window.removeEventListener("mousemove",handleMouseMove);
        window.removeEventListener("mouseup",handleMouseUp);

        controls.destroy();

        if(originalObjectUrl){
            URL.revokeObjectURL(originalObjectUrl);
            originalObjectUrl=null;
        }

        originalClose();
    };

    return modal;
}
