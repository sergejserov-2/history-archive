import{renderMentions}from"./mentionLink.js";
import{setupMentionEditor}from"./editor/mentions.js";

export function renderSubject(subject,subjects=[]){
    if(!subject)return"";

    const years=
        subject.dateStart&&subject.dateEnd
            ?`${subject.dateStart} – ${subject.dateEnd}`
            :subject.dateStart
                ?`с ${subject.dateStart}`
                :subject.dateEnd
                    ?`до ${subject.dateEnd}`
                    :"";

    const cover=
        subject.previewPath
        ?
        `
        <div class="subject__cover">
            <div
                class="subject__cover-bg"
                style="background-image:url('${subject.previewPath}')"
            ></div>
            <img
                class="subject__cover-image"
                src="${subject.previewPath}"
                alt="${subject.title??""}"
            >
        </div>
        `
        :
        `
        <div class="subject__cover">
            <div class="subject__cover-placeholder">
                Фото отсутствует
            </div>
        </div>
        `;

    return`
        <div class="subject-modal">
            <div class="subject-modal__card">
                ${cover}
                <div class="subject-modal__info">
                    <h1 class="subject-modal__title">
                        ${subject.title??""}
                    </h1>
                    ${
                        years
                        ?
                        `
                        <div class="subject-modal__years">
                            ${years}
                        </div>
                        `
                        :""
                    }
                    ${
                        subject.description?.trim()
                        ?
                        `
                        <div class="subject-modal__description">
                            ${renderMentions(
    record.description.trim(),
    subjects,
    getSubjectHref
)}
                        </div>
                        `
                        :""
                    }
                </div>
            </div>
            <div class="subject-modal__mentions">
                <label>
                    Упоминание
                    <div class="subject-modal__mention-input">
                        <textarea
                            id="entityDescription"
                            hidden
                        ></textarea>
                    </div>
                </label>
            </div>
        </div>
    `;
}

export function setupSubjectMentions(root,subjects=[]){
    return setupMentionEditor(
        root,
        subjects
    );
}
