import{isAdmin}from"../../admin/adminMode.js";
import{renderMentions,getSubjectHref}from"./mentionLink.js";
import{renderMentionList}from"./mentionList.js";
import{createModal}from"./modal.js";
import{renderLoadingPlaceholder}from"./loadingPlaceholder.js";

let currentSubjectModal=null;
const uploadingSubjects=new Set();

export function setSubjectUploading(id,value){
    if(!id)return;
    if(value)uploadingSubjects.add(id);
    else uploadingSubjects.delete(id);
    if(currentSubjectModal?.root?.isConnected){
        const subject=currentSubjectModal.subject;
        if(subject?.id===id){
            currentSubjectModal.setContent(renderSubject({...subject,isUploading:value},currentSubjectModal.context.subjects,currentSubjectModal.context.objects,currentSubjectModal.context.photos,currentSubjectModal.context.sources,currentSubjectModal.context.records,currentSubjectModal.context.subjectTypes,isAdmin()));
        }
    }
}

export function renderSubject(subject,subjects=[],objects=[],photos=[],sources=[],records=[],subjectTypes=[],ADMIN_MODE=false){
    if(!subject)return"";
    const type=subjectTypes.find(item=>item.id===subject.typeId);
    const years=subject.dateStart&&subject.dateEnd?`${subject.dateStart} – ${subject.dateEnd}`:subject.dateStart?`с ${subject.dateStart}`:subject.dateEnd?`до ${subject.dateEnd}`:"";
    const uploading=subject.isUploading===true;
    const hasPreview=Boolean(subject.previewPath);
    const cover=uploading&&!hasPreview
        ?`<div class="subject-modal__cover">${renderLoadingPlaceholder()}</div>`
        :hasPreview
            ?`<div class="subject-modal__cover">${uploading?renderLoadingPlaceholder():""}<div class="subject-modal__cover-bg" style="background-image:url('${subject.previewPath}')"></div><img class="subject-modal__cover-image${uploading?" subject-modal__cover-image--loading":""}" src="${subject.previewPath}" alt="${escapeHTML(subject.title??"")}"></div>`
            :`<div class="subject-modal__cover"><div class="subject-modal__cover-placeholder">Фото отсутствует</div></div>`;
    return`<div class="subject-modal"><div class="subject-modal__card">${cover}<div class="subject-modal__info"><div class="object__type">${escapeHTML(type?.title??"")}</div><h1 class="object__title"><span class="object__title-text">${escapeHTML(subject.title??"")}</span>${ADMIN_MODE?`<button class="admin-button" data-action="edit-subject" data-id="${escapeHTML(subject.id??"")}"><img src="icons/edit.svg" class="admin-icon"></button><button class="admin-button" data-action="delete-subject" data-id="${escapeHTML(subject.id??"")}"><img src="icons/delete.svg" class="admin-icon"></button>`:""}</h1>${years?`<div class="subject-modal__years">${escapeHTML(years)}</div>`:""}${subject.description?.trim()?`<div class="object__description">${renderMentions(subject.description.trim(),subjects,getSubjectHref)}</div>`:""}${renderMentionList(subject,objects,photos,sources,records)}</div></div></div>`;
}

export function openSubjectModal(subject,{subjects=[],objects=[],photos=[],sources=[],records=[],subjectTypes=[],fromUrl=false}={}){
    if(!subject)return null;
    subject={...subject,isUploading:uploadingSubjects.has(subject.id)};
    const ADMIN_MODE=isAdmin();
    const context={subjects,objects,photos,sources,records,subjectTypes};
    const modal=createModal({
        title:"Сноска",
        content:renderSubject(subject,subjects,objects,photos,sources,records,subjectTypes,ADMIN_MODE),
        width:525
    });
    modal.subject=subject;
    modal.context=context;
    currentSubjectModal=modal;
    if(ADMIN_MODE){
        modal.root.addEventListener("click",event=>{
            const button=event.target.closest(".admin-button");
            if(!button)return;
            const action=button.dataset.action;
            const id=button.dataset.id;
            if(!id)return;
            modal.root.dispatchEvent(new CustomEvent("subject-admin-action",{bubbles:true,detail:{action,id,subject}}));
        });
    }
    return modal;
}

export function updateSubjectModal(subject,{subjects=[],objects=[],photos=[],sources=[],records=[],subjectTypes=[]}={}){
    if(!currentSubjectModal?.root?.isConnected){
        currentSubjectModal=null;
        return;
    }
    subject={...subject,isUploading:uploadingSubjects.has(subject?.id)};
    currentSubjectModal.subject=subject;
    currentSubjectModal.context={subjects,objects,photos,sources,records,subjectTypes};
    currentSubjectModal.setContent(renderSubject(subject,subjects,objects,photos,sources,records,subjectTypes,isAdmin()));
}

function escapeHTML(value=""){
    return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","'");
}
