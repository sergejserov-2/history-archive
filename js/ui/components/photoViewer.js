// ======================================
// Photo viewer
// ======================================

import {
    createModal
}
from "./modal.js";

import {
    createViewerControls
}
from "./viewerControls.js";

// ======================================
// Open photo viewer
// ======================================
//
// Обычное открытие:
//
// openPhotoViewer(
//     photo,
//     {
//         photos
//     }
// );
//
// URL:
//
// object.html
// ?id=OBJECT_ID
// &modal=photo-preview
// &entityId=PHOTO_ID
//
// id — родительский объект.
// entityId — открываемая фотография.
//
// Если модалка восстанавливается из URL:
//
// openPhotoViewer(
//     photo,
//     {
//         photos,
//         fromUrl:true
//     }
// );
//
// ======================================

export function openPhotoViewer(

    photo,

    {
        photos = [],
        fromUrl = false
    } = {}

){

    if(!photo){

        return;

    }

    // ======================================
    // Gallery
    // ======================================

    const gallery =
        [...(photos ?? [])];

    // ======================================
    // Current index
    // ======================================

    let currentIndex =
        gallery.findIndex(

            item =>
                item.id ===
                photo.id

        );

    // ======================================
    // Если текущей фотографии нет
    // в массиве — считаем её единственной.
    // ======================================

    if(
        currentIndex < 0
    ){

        gallery.unshift(
            photo
        );

        currentIndex = 0;

    }

    // ======================================
    // URL modal state
    // ======================================

    if(
        !fromUrl &&
        photo.id
    ){

        updatePhotoUrl(
            photo.id
        );

    }

    // ======================================
    // Viewer HTML
    // ======================================

    const form = `

<div class="photo-viewer">

    <div class="photo-viewer__image-area">

        <div
            class="photo-viewer__image-bg"
        ></div>

        <img
            id="photoViewerImage"
            src=""
            alt=""
            draggable="false"
        >

    </div>

    <div class="photo-viewer__info">

        <div class="photo-viewer__title"></div>

        <div
            class="photo-viewer__description"
            hidden
        ></div>

        <div
            class="photo-viewer__field photo-viewer__author"
            hidden
        >

            <span class="photo-viewer__label">
                Автор
            </span>

            <span
                class="photo-viewer__author-value"
            ></span>

        </div>

        <div
            class="photo-viewer__field photo-viewer__date"
            hidden
        >

            <span class="photo-viewer__label">
                Дата
            </span>

            <span
                class="photo-viewer__date-value"
            ></span>

        </div>

        <a
            class="photo-viewer__download"
            hidden
            download
            target="_blank"
            rel="noopener"
        >

            Скачать

        </a>

    </div>

</div>

    `;

    // ======================================
    // Create modal
    // ======================================

    const modal =
        createModal({

            title:
                "Фотография",

            content:
                form

        });

    const root =
        modal.root;

    root.querySelector(
        ".modal"
    )
    ?.classList.add(
        "modal--photo-viewer"
    );

    const imageArea =
        root.querySelector(
            ".photo-viewer__image-area"
        );

    const image =
        root.querySelector(
            "#photoViewerImage"
        );

    const imageBackground =
        root.querySelector(
            ".photo-viewer__image-bg"
        );

    if(
        !imageArea ||
        !image
    ){

        return modal;

    }

    // ======================================
    // Image transform
    // ======================================

    let scale = 1;

    let translateX = 0;

    let translateY = 0;

    let dragging = false;

    let startX = 0;

    let startY = 0;

    let startTranslateX = 0;

    let startTranslateY = 0;

    function updateTransform(){

        image.style.transform =

            `translate(
                ${translateX}px,
                ${translateY}px
            )
            scale(${scale})`;

    }

    // ======================================
    // Fit image
    // ======================================

    function fitImage(){

        const areaWidth =
            imageArea.clientWidth;

        const areaHeight =
            imageArea.clientHeight;

        const imageWidth =
            image.naturalWidth;

        const imageHeight =
            image.naturalHeight;

        if(
            !imageWidth ||
            !imageHeight
        ){

            return;

        }

        const scaleX =
            areaWidth /
            imageWidth;

        const scaleY =
            areaHeight /
            imageHeight;

        scale =
            Math.min(
                scaleX,
                scaleY,
                1
            );

        translateX = 0;

        translateY = 0;

        updateTransform();

    }

    // ======================================
    // Mouse drag
    // ======================================

    imageArea.addEventListener(

        "mousedown",

        event=>{

            event.preventDefault();

            dragging = true;

            startX =
                event.clientX;

            startY =
                event.clientY;

            startTranslateX =
                translateX;

            startTranslateY =
                translateY;

            imageArea.classList.add(
                "is-dragging"
            );

        }

    );

    function handleMouseMove(event){

        if(!dragging){

            return;

        }

        translateX =

            startTranslateX +
            (
                event.clientX -
                startX
            );

        translateY =

            startTranslateY +
            (
                event.clientY -
                startY
            );

        updateTransform();

    }

    function handleMouseUp(){

        dragging = false;

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

            const oldScale =
                scale;

            const direction =
                event.deltaY < 0
                ?
                1
                :
                -1;

            scale +=
                direction * 0.15;

            scale =
                Math.max(
                    0.1,
                    Math.min(
                        scale,
                        5
                    )
                );

            // Сохраняем точку,
            // над которой находится курсор.

            const rect =
                imageArea.getBoundingClientRect();

            const mouseX =
                event.clientX -
                rect.left -
                rect.width / 2;

            const mouseY =
                event.clientY -
                rect.top -
                rect.height / 2;

            translateX -=
                mouseX *
                (
                    scale -
                    oldScale
                );

            translateY -=
                mouseY *
                (scale -
                    oldScale
                );

            updateTransform();

        },

        {
            passive:false
        }

    );

    // ======================================
    // Touch
    // ======================================

    let touchStartX = 0;

    let touchStartY = 0;

    let touchStartTranslateX = 0;

    let touchStartTranslateY = 0;

    let pinchStartDistance = null;

    let pinchStartScale = 1;

    imageArea.addEventListener(

        "touchstart",

        event=>{

            if(
                event.touches.length === 1
            ){

                const touch =
                    event.touches[0];

                dragging = true;

                touchStartX =
                    touch.clientX;

                touchStartY =
                    touch.clientY;

                touchStartTranslateX =
                    translateX;

                touchStartTranslateY =
                    translateY;

            }

            if(
                event.touches.length === 2
            ){

                dragging = false;

                pinchStartDistance =
                    getTouchDistance(

                        event.touches[0],

                        event.touches[1]

                    );

                pinchStartScale =
                    scale;

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
                event.touches.length === 1 &&
                dragging
            ){

                const touch =
                    event.touches[0];

                translateX =

                    touchStartTranslateX +
                    (
                        touch.clientX -
                        touchStartX
                    );

                translateY =

                    touchStartTranslateY +
                    (
                        touch.clientY -
                        touchStartY
                    );

                updateTransform();

            }

            if(
                event.touches.length === 2
            ){

                const distance =
                    getTouchDistance(

                        event.touches[0],

                        event.touches[1]

                    );

                if(!pinchStartDistance){

                    return;

                }

                scale =

                    pinchStartScale *
                    (
                        distance /
                        pinchStartDistance
                    );

                scale =

                    Math.max(
                        0.1,
                        Math.min(
                            scale,
                            5
                        )
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

            dragging = false;

            pinchStartDistance = null;

        }

    );

    // ======================================
    // Helpers
    // ======================================

    function getTouchDistance(

        first,

        second

    ){

        const dx =
            first.clientX -
            second.clientX;

        const dy =
            first.clientY -
            second.clientY;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }

    // ======================================
    // Viewer controls
    // ======================================

    const controls =
        createViewerControls({

            currentIndex,

            total:
                gallery.length,

            onPrevious:
                showPrevious,

            onNext:
                showNext

        });

    root.appendChild(
        controls.element
    );

    // ======================================
    // Show photo
    // ======================================

    function showPhoto(

        nextPhoto,

        nextIndex,

        {
            updateUrl = true
        } = {}

    ){

        if(!nextPhoto){

            return;

        }

        currentIndex =
            nextIndex;

        // ==================================
        // Reset image transform
        // ==================================

        scale = 1;

        translateX = 0;

        translateY = 0;

        dragging = false;

        pinchStartDistance = null;

        imageArea.classList.remove(
            "is-dragging"
        );

        // ==================================
        // Image
        // ==================================

        image.src =
            nextPhoto.storagePath ?? "";

        image.alt =
            nextPhoto.title ?? "";

        if(
            nextPhoto.storagePath
        ){

            imageBackground.style.backgroundImage =

                `url('${nextPhoto.storagePath}')`;

        }
        else{

            imageBackground.style.backgroundImage =
                "";

        }

        // ==================================
        // Info
        // ==================================

        const title =
            root.querySelector(
                ".photo-viewer__title"
            );

        const description =
            root.querySelector(
                ".photo-viewer__description"
            );

        const author =
            root.querySelector(
                ".photo-viewer__author"
            );

        const authorValue =
            root.querySelector(
                ".photo-viewer__author-value"
            );

        const date =
            root.querySelector(
                ".photo-viewer__date"
            );

        const dateValue =
            root.querySelector(
                ".photo-viewer__date-value"
            );

        const download =
            root.querySelector(
                ".photo-viewer__download"
            );

        if(title){

            title.textContent =
                nextPhoto.title ?? "";

        }

        if(description){

            if(
                nextPhoto.description
            ){

                description.textContent =
                    nextPhoto.description;

                description.hidden =
                    false;

            }
            else{

                description.textContent =
                    "";

                description.hidden =
                    true;

            }

        }

        if(author){

            if(
                nextPhoto.author
            ){

                authorValue.textContent =
                    nextPhoto.author;

                author.hidden =
                    false;

            }
            else{

                authorValue.textContent =
                    "";

                author.hidden =
                    true;

            }

        }

        if(date){

            if(
                nextPhoto.date
            ){

                dateValue.textContent =
                    nextPhoto.date;

                date.hidden =
                    false;

            }
            else{

                dateValue.textContent =
                    "";

                date.hidden =
                    true;

            }

        }

        if(download){

            if(
                nextPhoto.storagePath
            ){

                download.href =
                    nextPhoto.storagePath;

                download.hidden =
                    false;

            }
            else{

                download.removeAttribute(
                    "href"
                );

                download.hidden =
                    true;

            }

        }

        // ==================================
        // Controls
        // ==================================

        controls.update(
            currentIndex
        );

        // ==================================
        // URL
        // ==================================

        if(
            updateUrl &&
            nextPhoto.id
        ){

            updatePhotoUrl(
                nextPhoto.id
            );

        }

        // ==================================
        // Fit after image load
        // ==================================

        if(image.complete){

            fitImage();

        }

    }

    image.onload =
        fitImage;

    // ======================================
    // Previous
    // ======================================

    function showPrevious(){

        if(
            currentIndex <= 0
        ){

            return;

        }

        const nextIndex =
            currentIndex - 1;

        const nextPhoto =
            gallery[nextIndex];

        showPhoto(
            nextPhoto,
            nextIndex
        );

    }

    // ======================================
    // Next
    // ======================================

    function showNext(){

        if(
            currentIndex >=
            gallery.length - 1
        ){

            return;

        }

        const nextIndex =
            currentIndex + 1;

        const nextPhoto =
            gallery[nextIndex];

        showPhoto(
            nextPhoto,
            nextIndex
        );

    }

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

    const originalClose =
        modal.close;

    modal.close = ()=>{

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
// Update photo URL
// ======================================

function updatePhotoUrl(

    photoId

){

    if(!photoId){

        return;

    }

    const url =
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
