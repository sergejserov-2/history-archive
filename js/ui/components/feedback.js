// ==========================================
// Feedback modal
// ==========================================

import{createModal}from"./modal.js";
import{renderDateTime}from"./date.js";
import{openPhotoViewer}from"./photoViewer.js";

let currentFeedbackModal=null;

// ==========================================
// Open feedback
// ==========================================

export function openFeedbackModal(feedback){

    if(!feedback)return null;

    const modal=createModal({
        title:"Обращение",
        content:renderFeedback(feedback),
        width:630
    });

    setupFeedbackPhotos(
        modal.root,
        feedback
    );

    currentFeedbackModal=modal;

    return modal;
}

// ==========================================
// Render feedback
// ==========================================

function renderFeedback(feedback){

    const title=
        escapeHTML(
            feedback.title??""
        );

    const message=
        escapeHTML(
            feedback.message??""
        );

    const name=
        escapeHTML(
            feedback.name??""
        );

    const email=
        String(
            feedback.email??""
        ).trim();

    const date=
        renderDateTime(
            feedback.createdAt
        );

    const photoIds=
        Array.isArray(
            feedback.photoIds
        )
            ?feedback.photoIds
            :[];

    return`
        <div class="feedback">

            <div class="feedback__title">
                ${title}
            </div>

            <div class="feedback__message">
                ${message}
            </div>

            <div class="feedback__author">

                <div class="feedback__name">
                    ${name}
                </div>

                <div class="feedback__date">
                    ${date}
                </div>

            </div>

            ${
                photoIds.length
                    ?renderFeedbackPhotos(
                        photoIds
                    )
                    :""
            }

            ${
                email
                    ?`
                        <div class="feedback__contact">

                            Для обратной связи:

                            <a
                                href="mailto:${escapeAttribute(email)}"
                            >
                                ${escapeHTML(email)}
                            </a>

                        </div>
                    `
                    :""
            }

        </div>
    `;
}

// ==========================================
// Photos
// ==========================================

function renderFeedbackPhotos(photoIds=[]){

    return`
        <div class="feedback__photos">

            ${photoIds.map(
                (photo,index)=>`

                    <div
                        class="feedback__photo"
                        data-photo-index="${index}"
                    >

                        <img
                            src="${escapeAttribute(
                                photo.previewPath||
                                photo.storagePath||
                                ""
                            )}"
                            alt=""
                            loading="lazy"
                        >

                    </div>

                `
            ).join("")}

        </div>
    `;
}

// ==========================================
// Setup photos
// ==========================================

function setupFeedbackPhotos(
    root,
    feedback
){

    const photoIds=
        Array.isArray(
            feedback.photoIds
        )
            ?feedback.photoIds
            :[];

    if(!photoIds.length){
        return;
    }

    const gallery=
        photoIds.map(
            (photo,index)=>({

                id:
                    String(index),

                title:
                    "",

                description:
                    "",
                previewPath:
                    photo.previewPath,

                storagePath:
                    photo.storagePath

            })
        );

    root.querySelector(
        ".feedback__photos"
    )?.addEventListener(
        "click",
        event=>{

            const photo=
                event.target.closest(
                    ".feedback__photo"
                );

            if(!photo){
                return;
            }

            const index=
                Number(
                    photo.dataset.photoIndex
                );

            if(
                !Number.isFinite(
                    index
                )
            ){
                return;
            }

            openPhotoViewer(
                gallery[index],
                {
                    photos:gallery,
                    showInfo:false
                }
            );
        }
    );
}

// ==========================================
// Close
// ==========================================

export function closeFeedbackModal(){

    if(!currentFeedbackModal){
        return;
    }

    currentFeedbackModal.close();

    currentFeedbackModal=
        null;
}

// ==========================================
// Escape
// ==========================================

function escapeHTML(value=""){

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "'"
        );
}

function escapeAttribute(value=""){

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        );
}
