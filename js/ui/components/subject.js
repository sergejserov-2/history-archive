import{
    adminEdit,
    adminDelete
}from"./adminButtons.js";

import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{renderMentionList}from"./mentionList.js";
import{createModal}from"./modal.js";
import{renderLoadingPlaceholder}from"./loadingPlaceholder.js";
import{initCoverDrag}from"./coverDrag.js";

let currentSubjectModal=null;

const uploadingSubjects=new Set();

// ======================================
// Upload state
// ======================================

export function setSubjectUploading(id,value){

    if(!id)return;

    if(value)
        uploadingSubjects.add(id);
    else
        uploadingSubjects.delete(id);

    if(currentSubjectModal?.root?.isConnected){

        const subject=
            currentSubjectModal.subject;

        if(subject?.id===id){

            currentSubjectModal.setContent(

                renderSubject(
                    {
                        ...subject,
                        isUploading:value
                    },

                    currentSubjectModal.context.subjects,
                    currentSubjectModal.context.objects,
                    currentSubjectModal.context.photos,
                    currentSubjectModal.context.sources,
                    currentSubjectModal.context.records,
                    currentSubjectModal.context.subjectTypes
                )

            );

        }

    }

}

// ======================================
// Render subject
// ======================================

export function renderSubject(
    subject,
    subjects=[],
    objects=[],
    photos=[],
    sources=[],
    records=[],
    subjectTypes=[]
){

    if(!subject)
        return "";

    const type=
        subjectTypes.find(
            item=>item.id===subject.typeId
        );

    const years=
        subject.dateStart&&subject.dateEnd
        ?
        `${subject.dateStart} – ${subject.dateEnd}`
        :
        subject.dateStart
        ?
        `с ${subject.dateStart}`
        :
        subject.dateEnd
        ?
        `до ${subject.dateEnd}`
        :
        "";

    const uploading=
        subject.isUploading===true;

    const hasPreview=
        Boolean(subject.previewPath);

    const cover=

        uploading&&!hasPreview

        ?

        `
        <div class="subject-modal__cover">
            ${renderLoadingPlaceholder()}
        </div>
        `

        :

        hasPreview

        ?

        `
        <div
            class="subject-modal__cover"
            data-cover-drag
        >

            ${
                uploading
                ?
                renderLoadingPlaceholder()
                :
                ""
            }

            <div
                class="subject-modal__cover-bg"
                style="
                background-image:url('${subject.previewPath}')
                "
            ></div>

            <img
                class="
                    subject-modal__cover-image
                    ${uploading?" subject-modal__cover-image--loading":""}
                "
                data-cover-image
                src="${subject.previewPath}"
                alt="${escapeHTML(subject.title??"")}"
                draggable="false"
            >

        </div>
        `

        :

        `
        <div class="subject-modal__cover">

            <div class="subject-modal__cover-placeholder">
                Фото отсутствует
            </div>

        </div>
        `;

    return`

    <div class="subject-modal">

        <div class="subject-modal__card">

            ${cover}

            <div class="subject-modal__info">

                <div class="object__type">

                    ${escapeHTML(type?.title??"")}

                </div>

                <h1 class="object__title">

                    <span class="object__title-text">

                        ${escapeHTML(subject.title??"")}

                    </span>

                    ${adminEdit(
                        "subject",
                        escapeHTML(subject.id??"")
                    )}

                    ${adminDelete(
                        "subject",
                        escapeHTML(subject.id??"")
                    )}

                </h1>

                ${
                    years
                    ?
                    `
                    <div class="subject-modal__years">

                        ${escapeHTML(years)}

                    </div>
                    `
                    :
                    ""
                }

                ${subject.description?.trim()?`
                <div class="object__description">${renderMentions(
                            subject.description.trim(),
                            subjects,
                            getSubjectHref
                        )}</div>
                    `:""}

                ${renderMentionList(
                    subject,
                    objects,
                    photos,
                    sources,
                    records
                )}

            </div>

        </div>

    </div>

    `;

}

// ======================================
// Open modal
// ======================================

export function openSubjectModal(
    subject,
    {
        subjects=[],
        objects=[],
        photos=[],
        sources=[],
        records=[],
        subjectTypes=[],
        fromUrl=false
    }={}
){

    if(!subject)
        return null;

    subject={
        ...subject,
        isUploading:
            uploadingSubjects.has(subject.id)
    };

    const context={
        subjects,
        objects,
        photos,
        sources,
        records,
        subjectTypes
    };

    const modal=
        createModal({

            title:"Сноска",

            content:
                renderSubject(
                    subject,
                    subjects,
                    objects,
                    photos,
                    sources,
                    records,
                    subjectTypes
                ),

            width:525

        });

    initCoverDrag(
        modal.root
    );

    modal.subject=subject;

    modal.context=context;

    currentSubjectModal=modal;

    modal.root.addEventListener(
        "click",
        event=>{

            const button=
                event.target.closest(
                    ".admin-button"
                );

            if(!button)
                return;

            const action=
                button.dataset.action;

            const id=
                button.dataset.id;

            if(!id)
                return;

            modal.root.dispatchEvent(

                new CustomEvent(
                    "subject-admin-action",
                    {
                        bubbles:true,

                        detail:{
                            action,
                            id,
                            subject
                        }
                    }
                )

            );

        }
    );

    return modal;

}

// ======================================
// Update modal
// ======================================

export function updateSubjectModal(
    subject,
    {
        subjects=[],
        objects=[],
        photos=[],
        sources=[],
        records=[],
        subjectTypes=[]
    }={}
){

    if(!currentSubjectModal?.root?.isConnected){

        currentSubjectModal=null;

        return;

    }

    subject={
        ...subject,
        isUploading:
            uploadingSubjects.has(subject?.id)
    };

    currentSubjectModal.subject=subject;

    currentSubjectModal.context={
        subjects,
        objects,
        photos,
        sources,
        records,
        subjectTypes
    };

    currentSubjectModal.setContent(

        renderSubject(
            subject,
            subjects,
            objects,
            photos,
            sources,
            records,
            subjectTypes
        )

    );

    initCoverDrag(
        currentSubjectModal.root
    );

}

// ======================================
// Escape HTML
// ======================================

function escapeHTML(value=""){

    return String(value)

        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");

}
