// ======================================
// Photo viewer
// ======================================

import {
    createModal
}
from "./modal.js";

// ======================================
// Open photo viewer
// ======================================
//
// Обычное открытие:
//
// openPhotoViewer(photo);
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
// openPhotoViewer(photo, {
//     fromUrl: true
// });
//
// В этом случае URL повторно не изменяется.
//
// ======================================

export function openPhotoViewer(

    photo,

    {
        fromUrl = false
    } = {}

){

    if(!photo){

        return;

    }

    // ==================================
    // URL modal state
    // ==================================

    if(
        !fromUrl &&
        photo.id
    ){

        const url =
            new URL(
                window.location.href
            );

        // ==================================
        // Modal type
        // ==================================

        url.searchParams.set(
            "modal",
            "photo-preview"
        );

        // ==================================
        // Entity ID
        // ==================================
        //
        // Используем общий параметр
        // для всех сущностей.
        //
        // Родитель уже находится
        // в стандартном ?id=...
        //
        // ==================================

        url.searchParams.set(
            "entityId",
            photo.id
        );

        // ==================================
        // Обновляем URL
        // ==================================

        window.history.pushState(

            {},

            "",

            url

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
            style="background-image:url('${photo.storagePath ?? ""}')"
        ></div>

        <img
            id="photoViewerImage"
            src="${photo.storagePath ?? ""}"
            alt="${photo.title ?? ""}"
            draggable="false"
        >

    </div>

    <div class="photo-viewer__info">

        <div class="photo-viewer__title">

            ${photo.title ?? ""}

        </div>

        ${
            photo.description
            ?
            `
            <div class="photo-viewer__description">

                ${photo.description}

            </div>
            `
            :
            ""
        }

        ${
            photo.author
            ?
            `
            <div class="photo-viewer__field">

                <span class="photo-viewer__label">
                    Автор
                </span>

                <span>
                    ${photo.author}
                </span>

            </div>
            `
            :
            ""
        }

        ${
            photo.date
            ?
            `
            <div class="photo-viewer__field">

                <span class="photo-viewer__label">
                    Дата
                </span>

                <span>
                    ${photo.date}
                </span>

            </div>
            `
            :
            ""
        }

        ${
            photo.storagePath
            ?
            `
            <a

                class="photo-viewer__download"

                href="${photo.storagePath}"

                download

                target="_blank"

                rel="noopener"

            >

                Скачать

            </a>
            `
            :
            ""
        }

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

    if(
        !imageArea ||
        !image
    ){

        return;

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

    image.onload =
        fitImage;

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

    window.addEventListener(

        "mousemove",

        event=>{

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

    );

    window.addEventListener(

        "mouseup",

        ()=>{

            dragging = false;

            imageArea.classList.remove(
                "is-dragging"
            );

        }

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

            // Сохраняем точку,// над которой находится курсор.

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
                (
                    scale -
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
    // Initial state
    // ======================================

    if(image.complete){

        fitImage();

    }

    return modal;

}
