import{openModal}from"./modalReload.js";
import{hide}from"../animations/controller.js";

export function renderFeedbackPrompt(objectId){
    if(!objectId)return"";

    return`
        <section class="feedback-prompt" id="feedbackPrompt">
            <div class="feedback-prompt__content">
                <span class="feedback-prompt__text">
                    У вас есть информация об этом объекте?
                </span>
                <button
                    class="feedback-prompt__button"
                    data-feedback-object-id="${escapeHTML(objectId)}"
                >
                    Напишите нам!
                </button>
            </div>
            <button
                class="feedback-prompt__close"
                type="button"
                aria-label="Скрыть"
                title="Скрыть"
            >
                ×
            </button>
        </section>
    `;
}

export function initFeedbackPrompt(){
    const prompt=document.querySelector("#feedbackPrompt");
    if(!prompt)return;

    const button=prompt.querySelector(".feedback-prompt__button");
    const close=prompt.querySelector(".feedback-prompt__close");

    if(button){
        button.onclick=async()=>{
            const objectId=button.dataset.feedbackObjectId;
            if(!objectId)return;
            await openModal("feedback",{objectId});
        };
    }

    if(close){
        close.onclick=async()=>{
            await hide(prompt);
            prompt.remove();
        };
    }
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}
