// ======================================
// Photo viewer
// ======================================

import {createModal} from "./modal.js";
import {createViewerControls} from "./viewerControls.js";

export function openPhotoViewer(photo,{photos=[],fromUrl=false}={}){

    if(!photo)return;

    const gallery=[...(photos??[])];

    let currentIndex=gallery.findIndex(
        item=>item.id===photo.id
    );

    if(currentIndex<0){
        gallery.unshift(photo);
        currentIndex=0;
    }

    if(!fromUrl&&photo.id){
        updatePhotoUrl(photo.id);
    }

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

    const modal=createModal({
        title:"Фотография",
        content:form
    });

    const root=modal.root;

    root.querySelector(".modal")
        ?.classList.add("modal--photo-viewer");

    const imageArea=root.querySelector(
        ".photo-viewer__image-area"
    );

    const image=root.querySelector(
        "#photoViewerImage"
    );

    const imageBackground=root.querySelector(
        ".photo-viewer__image-bg"
    );

    if(!imageArea||!image)return modal;

    // ======================================
    // Image state
    // ======================================

    let fitScale=1;
    let zoom=1;
    let scale=1;
    let translateX=0;
    let translateY=0;

    let dragging=false;
    let startX=0;
    let startY=0;
    let startTranslateX=0;
    let startTranslateY=0;

    let touchStartX=0;
    let touchStartY=0;
    let touchStartTranslateX=0;
    let touchStartTranslateY=0;
    let pinchStartDistance=null;
    let pinchStartZoom=1;

    function updateTransform(){
        scale=fitScale*zoom;
        image.style.transform=
            `translate(${translateX}px,${translateY}px) scale(${scale})`;
    }

    function calculateFitScale(){
        const areaWidth=imageArea.clientWidth;
        const areaHeight=imageArea.clientHeight;
        const imageWidth=image.naturalWidth;
        const imageHeight=image.naturalHeight;

        if(!areaWidth||!areaHeight||!imageWidth||!imageHeight){
            return;
        }

        fitScale=Math.min(
            areaWidth/imageWidth,
            areaHeight/imageHeight
        );

        updateTransform();
    }

    function resetView(){
        fitScale=1;
        zoom=1;
        scale=1;
        translateX=0;
        translateY=0;
        dragging=false;
        pinchStartDistance=null;
        imageArea.classList.remove("is-dragging");
        image.style.transform="";
    }

    function setInitialImage(photo){
        resetView();

        if(photo.previewPath){
            imageBackground.style.backgroundImage=
                `url('${photo.previewPath}')`;
        }else{
            imageBackground.style.backgroundImage="";
        }

        image.src=photo.storagePath??"";

        image.onload=()=>{
            calculateFitScale();
        };
    }

    // ======================================
    // Show photo
    // ======================================

    function showPhoto(nextPhoto,nextIndex,{updateUrl=true}={}){

        if(!nextPhoto)return;

        currentIndex=nextIndex;

        resetView();

    if(nextPhoto.previewPath){
            imageBackground.style.backgroundImage=
                `url('${nextPhoto.previewPath}')`;
        }else{
            imageBackground.style.backgroundImage="";
        }

        const title=root.querySelector(
            ".photo-viewer__title"
        );

        const description=root.querySelector(
            ".photo-viewer__description"
        );

        const author=root.querySelector(
            ".photo-viewer__author"
        );

        const authorValue=root.querySelector(
            ".photo-viewer__author-value"
        );

        const date=root.querySelector(
            ".photo-viewer__date"
        );

        const dateValue=root.querySelector(
            ".photo-viewer__date-value"
        );

        const download=root.querySelector(
            ".photo-viewer__download"
        );

        if(title){
            title.textContent=nextPhoto.title??"";
        }

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

        if(updateUrl&&nextPhoto.id){
            updatePhotoUrl(nextPhoto.id);
        }

        // ==================================
        // Preview → original
        // ==================================

        if(nextPhoto.previewPath){
            image.src=nextPhoto.previewPath;

            image.onload=()=>{
                calculateFitScale();

                if(
                    nextPhoto.storagePath&&
                    nextPhoto.storagePath!==nextPhoto.previewPath
                ){
                    const original=new Image();

                    original.onload=()=>{
                        image.src=nextPhoto.storagePath;
                    };

                    original.src=nextPhoto.storagePath;
                }
            };
        }else{
            image.src=nextPhoto.storagePath??"";

            image.onload=()=>{
                calculateFitScale();
            };
        }
    }

    // ======================================
    // Previous
    // ======================================

    function showPrevious(){
        if(currentIndex<=0)return;

        const nextIndex=currentIndex-1;

        showPhoto(
            gallery[nextIndex],
            nextIndex
        );
    }

    // ======================================
    // Next
    // ======================================

    function showNext(){
        if(currentIndex>=gallery.length-1)return;

        const nextIndex=currentIndex+1;

        showPhoto(
            gallery[nextIndex],
            nextIndex
        );
    }

    // ======================================
    // Image load
    // ======================================

    image.onload=()=>{
        calculateFitScale();
    };

    // ======================================
    // Mouse drag
    // ======================================

    imageArea.addEventListener(
        "mousedown",
        event=>{
            event.preventDefault();

            dragging=true;

            startX=event.clientX;
            startY=event.clientY;

            startTranslateX=translateX;
            startTranslateY=translateY;

            imageArea.classList.add(
                "is-dragging"
            );
        }
    );

    function handleMouseMove(event){
        if(!dragging)return;

        translateX=
            startTranslateX+
            (event.clientX-startX);

        translateY=
            startTranslateY+
            (event.clientY-startY);

        updateTransform();
    }

    function handleMouseUp(){
        dragging=false;

        imageArea.classList.remove(
            "is-dragging"
        );
    }

    window.addEventListener(
        "mousemove",
        handleMouseMove
    );

    window.addEventListener(
        "mouseup",
        handleMouseUp
    );

    // ======================================
    // Zoom
    // ======================================

    imageArea.addEventListener(
        "wheel",
        event=>{
            event.preventDefault();

            const oldZoom=zoom;

            const direction=
                event.deltaY<0
                ?1
                :-1;

            zoom+=direction*0.15;

            zoom=Math.max(
                1,
                Math.min(zoom,5)
            );

            const rect=
                imageArea.getBoundingClientRect();

            const mouseX=
                event.clientX-
                rect.left-
                rect.width/2;

            const mouseY=
                event.clientY-
                rect.top-
                rect.height/2;

            const oldScale=
                fitScale*oldZoom;

            const newScale=
                fitScale*zoom;

            const ratio=
                newScale/oldScale;

            translateX=
                mouseX-
                (mouseX-translateX)*ratio;

            translateY=
                mouseY-
                (mouseY-translateY)*ratio;

            updateTransform();
        },
        {
            passive:false
        }
    );

    // ======================================
    // Touch
    // ======================================

    imageArea.addEventListener(
        "touchstart",
        event=>{
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

                pinchStartDistance=
                    getTouchDistance(
                        event.touches[0],
                        event.touches[1]
                    );

                pinchStartZoom=zoom;
            }
        },
        {
            passive:true
        }
    );

    imageArea.addEventListener(
        "touchmove",
        event=>{
            event.preventDefault();

            if(
                event.touches.length===1&&
                dragging
            ){
                const touch=event.touches[0];

                translateX=
                    touchStartTranslateX+
                    (
                        touch.clientX-
                        touchStartX
                    );

                translateY=
                    touchStartTranslateY+
                    (
                        touch.clientY-
                        touchStartY
                    );

                updateTransform();
            }

            if(event.touches.length===2){
                const distance=
                    getTouchDistance(
                        event.touches[0],
                        event.touches[1]
                    );

                if(!pinchStartDistance)return;

                zoom=
                    pinchStartZoom*
                    (
                        distance/
                        pinchStartDistance
                    );

                zoom=Math.max(
                    1,

                    Math.min(zoom,5)
                );

                updateTransform();
            }
        },
        {
            passive:false
        }
    );

    imageArea.addEventListener(
        "touchend",
        ()=>{
            dragging=false;
            pinchStartDistance=null;
        }
    );

    // ======================================
    // Touch distance
    // ======================================

    function getTouchDistance(first,second){
        const dx=
            first.clientX-
            second.clientX;

        const dy=
            first.clientY-
            second.clientY;

        return Math.sqrt(
            dx*dx+dy*dy
        );
    }

    // ======================================
    // Viewer controls
    // ======================================

    const controls=createViewerControls({
        currentIndex,
        total:gallery.length,
        onPrevious:showPrevious,
        onNext:showNext
    });

    root.appendChild(
        controls.element
    );

    // ======================================
    // Initial photo
    // ======================================

    showPhoto(
        gallery[currentIndex],
        currentIndex,
        {
            updateUrl:false
        }
    );

    // ======================================
    // Cleanup
    // ======================================

    const originalClose=modal.close;

    modal.close=()=>{
        controls.destroy();

        window.removeEventListener(
            "mousemove",
            handleMouseMove
        );

        window.removeEventListener(
            "mouseup",
            handleMouseUp
        );

        originalClose();
    };

    return modal;
}

// ======================================
// Update URL
// ======================================

function updatePhotoUrl(photoId){
    if(!photoId)return;

    const url=
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "modal",
        "photo-preview"
    );

    url.searchParams.set(
        "entityId",
        photoId
    );

    window.history.pushState(
        {},
        "",
        url
    );
}
