import{setModalUrl,restoreModalFromUrl}from"./modal.js";

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
                    data-feedback-object-id="${objectId}"
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

    const button=prompt.querySelector(
        ".feedback-prompt__button"
    );

    const close=prompt.querySelector(
        ".feedback-prompt__close"
    );

    if(button){
        button.onclick=async()=>{
            const objectId=
                button.dataset.feedbackObjectId;

            if(!objectId)return;

            setModalUrl(
                "feedback",
                {objectId}
            );

            await restoreModalFromUrl();
        };
    }

    if(close){
        close.onclick=()=>{
            prompt.remove();
        };
    }
}
