import{createModal}from"./modal.js";
import{getObject}from"../../api/objects.js";
import{createFeedback}from"../../api/feedback.js";
import{
    renderFieldsEditorHTML,
    setupFieldsEditor
}from"./editor/fields.js";
import{
    renderFileEditorHTML,
    setupFileEditor
}from"./editor/file.js";

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}

export function openFeedbackForm(object){
    if(!object?.id)return null;

    const fields=renderFieldsEditorHTML({}, {}, {title:60,description:2000});

    const modal=createModal({
        title:"Обратная связь",
        content:`
            <div class="entity-editor feedback-form">
                <p>
                    Если вы хотите дополнить информацию
                    об этом объекте или сообщить нам
                    что-то важное, заполните форму.
                </p>
                <label>
                    Ваше имя *
                    <input id="feedbackName" maxlength="100" autocomplete="name">
                </label>
                <label>
                    E-mail
                    <input id="feedbackEmail" type="email" maxlength="150" autocomplete="email">
                </label>
                ${fields.titleField}
                ${fields.descriptionField}
                ${renderFileEditorHTML({multiple:true})}
                <div class="feedback-form__object">
                    <div class="feedback-form__label">Объект</div>
                    <strong>${escapeHTML(object.title??"")}</strong>
                    ${object.address?`
                        <div>${escapeHTML(object.address)}</div>
                    `:""}
                </div>
                <div class="entity-editor__buttons">
                    <button id="entitySave">Отправить</button>
                    <button id="entityCancel">Отмена</button>
                </div>
            </div>
        `
    });

    const root=modal.root;
    const fieldsEditor=setupFieldsEditor(root,{fields:[]},{});
    const fileEditor=setupFileEditor(root,{},null,{multiple:true});
    const nameInput=root.querySelector("#feedbackName");
    const emailInput=root.querySelector("#feedbackEmail");

    function showError(input,message){
        if(!input)return;
        input.setCustomValidity(message);
        input.reportValidity();
    }

    nameInput?.addEventListener("input",()=>nameInput.setCustomValidity(""));
    emailInput?.addEventListener("input",()=>emailInput.setCustomValidity(""));

    const saveButton=root.querySelector("#entitySave");
    const cancelButton=root.querySelector("#entityCancel");

    if(cancelButton)cancelButton.onclick=()=>modal.close();

    if(saveButton){
        saveButton.onclick=async()=>{
            const name=nameInput?.value.trim()??"";
            if(!name){
                showError(nameInput,"Укажите ваше имя");
                return;
            }

            const email=emailInput?.value.trim()??"";
            if(email&&!emailInput.checkValidity()){
                emailInput.reportValidity();
                return;
            }

            const fieldsData=fieldsEditor.getData();
            const title=fieldsData.title?.trim()??"";
            const message=fieldsData.description?.trim()??"";

            if(!title){
                showError(root.querySelector("#entityTitle"),"Укажите заголовок");
                return;
            }

            if(!message){
                showError(root.querySelector("#entityDescription"),"Напишите сообщение");
                return;
            }

            saveButton.disabled=true;
            saveButton.textContent="Отправляем...";

            try{
                const fileData=fileEditor?.getData();
                await createFeedback({
                    name,
                    email,
                    title,
                    message,
                    objectId:object.id,
                    objectTitle:object.title??"",
                    files:fileData?.files??[]
                });

                modal.setContent(`
                    <div class="entity-editor feedback-form">
                        <h3>Спасибо!</h3>
                        <p>
                            Ваше обращение отправлено.
                            Спасибо, что помогаете нам
                            дополнять архив.
                        </p>
                        <div class="entity-editor__buttons">
                            <button id="entityCancel">Закрыть</button>
                        </div>
                    </div>
                `);

                const closeButton=modal.root.querySelector("#entityCancel");
                if(closeButton)closeButton.onclick=()=>modal.close();
            }catch(error){
                console.error("Ошибка отправки обращения:",error);
                saveButton.disabled=false;
                saveButton.textContent="Отправить";
                alert("Не удалось отправить обращение");
            }
        };
    }

    return modal;
}

export async function openFeedbackFormByObjectId(objectId){
    if(!objectId)return null;
    const object=await getObject(objectId);
    if(!object)return null;
    return openFeedbackForm(object);
}
