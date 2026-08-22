import{createDropdown}from"../dropdown.js";
import{renderFieldCounterHTML,setupFieldCounters}from"./counters.js";

export function renderTypeEditorHTML(cfg={},entity={}){
    const limits=cfg.limits??{};
    const targets=cfg.targets??{};
    const target=entity.target??Object.keys(targets)[0]??"";
    const targetConfig=targets[target]??{};
    const levelsMode=targetConfig.levels??"none";
    const used=cfg.used===true;
    const disabledTitle=used?"Нельзя изменить: тип используется":"";
    return`<div class="type-editor">
        <div class="entity-row entity-row--title-type">
            <label class="entity-type">Тип
                <div class="entity-type__input-wrapper">
                    <input id="typeTarget" class="entity-type__input" type="text" value="${targetConfig.title??targetTitle(target)}" readonly autocomplete="off" ${used?"disabled":""} title="${disabledTitle}">
                </div>
            </label>
            <label class="entity-title">ID
                <input id="typeId" class="entity-title__input" value="${entity.id??""}" maxlength="${limits.id??45}" ${used?"disabled":""} title="${disabledTitle}">
                ${renderFieldCounterHTML("typeId",entity.id,limits.id??45)}
            </label>
        </div>
        <div class="entity-row entity-row--title-levels">
            <label class="entity-title">Название
                <input id="typeTitle" class="entity-title__input" value="${entity.title??""}" maxlength="${limits.title??45}">
                ${renderFieldCounterHTML("typeTitle",entity.title,limits.title??45)}
            </label>
            <label id="typeLevelsField" class="entity-title" ${levelsMode==="none"?'hidden':""}>Уровни
                <input id="typeLevels" class="entity-title__input" value="${formatLevels(entity.levels??entity.level)}" inputmode="numeric" autocomplete="off" ${used?"disabled":""} title="${disabledTitle}">
            </label>
        </div>
    </div>`;
}

export function setupTypeEditor(root,entity={},cfg={}){
    const targetInput=root.querySelector("#typeTarget");
    const idInput=root.querySelector("#typeId");
    const titleInput=root.querySelector("#typeTitle");
    const levelsField=root.querySelector("#typeLevelsField");
    const levelsInput=root.querySelector("#typeLevels");
    const targets=cfg.targets??{};
    let currentTarget=entity.target??cfg.typeCategory??Object.keys(targets)[0]??"";
    const targetItems=Object.entries(targets).map(([id,target])=>({id,title:target.title??targetTitle(id)}));
    const dropdown=createDropdown();
    const used=cfg.used===true;

    if(targetInput){
        targetInput.value=targets[currentTarget]?.title??targetTitle(currentTarget);
        targetInput.disabled=used;
        targetInput.title=used?"Нельзя изменить: тип используется":"";
        dropdown.setItems(targetItems,{onSelect(item){
            if(used)return;
            currentTarget=item.id;
            targetInput.value=item.title??"";
            dropdown.close();
            targetInput.blur();
            updateLevelsMode();
        }});
        targetInput.addEventListener("click",()=>{
            if(used)return;
            if(dropdown.isOpen()){
                dropdown.close();
                targetInput.blur();
            }else{
                dropdown.open(targetInput);
                targetInput.focus();
            }
        });
    }

    function updateLevelsMode(){
        const mode=targets[currentTarget]?.levels??"none";
        if(levelsField)levelsField.hidden=mode==="none";
        if(!levelsInput)return;
        levelsInput.disabled=used||mode==="none";
        levelsInput.title=used?"Нельзя изменить: тип используется":"";
        if(mode==="none")levelsInput.value="";
    }

    function showError(input,message){
        if(!input)return;
        input.setCustomValidity(message);
        input.reportValidity();
    }

    if(idInput){
        idInput.disabled=used;
        idInput.title=used?"Нельзя изменить: тип используется":"";
        idInput.addEventListener("input",()=>{
            idInput.value=idInput.value.replace(/[^A-Za-z0-9_-]/g,"");
            idInput.setCustomValidity("");
        });
    }

    if(titleInput){
        titleInput.addEventListener("input",()=>{
            titleInput.setCustomValidity("");
        });
    }

    if(levelsInput){
        levelsInput.addEventListener("input",()=>{
            if(used)return;
            const mode=targets[currentTarget]?.levels??"none";
            levelsInput.setCustomValidity("");
            if(mode==="single"){
                levelsInput.value=levelsInput.value.replace(/[^0-9]/g,"");
                return;
            }
            levelsInput.value=levelsInput.value.replace(/[^0-9, ]/g,"").replace(/,{2,}/g,",");
        });
    }

    setupFieldCounters(root);
    updateLevelsMode();

    return{
        getData(){
            const mode=targets[currentTarget]?.levels??"none";
            const id=idInput?.value.trim()??"";
            const title=titleInput?.value.trim()??"";
            const levels=levelsInput?.value.trim()??"";

            if(!id){
                showError(idInput,"Укажите ID");
                return null;
            }

            if(!title){
                showError(titleInput,"Укажите название");
                return null;
            }

            if(mode==="single"&&!levels){
                showError(levelsInput,"Укажите уровень");
                return null;
            }

            if(mode==="multiple"&&!levels){
                showError(levelsInput,"Укажите хотя бы один уровень");
                return null;
            }

            const data={target:currentTarget,id,title};

            if(mode==="single")data.level=levels;

            if(mode==="multiple"){
                data.levels=levels.split(",").map(value=>value.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
                if(!data.levels.length){
                    showError(levelsInput,"Укажите хотя бы один уровень");
                    return null;
                }
            }

            return data;
        },
        getTarget(){return currentTarget;}
    };
}

function targetTitle(target){
    if(target==="objectType"||target==="object")return"Объект";
    if(target==="recordType"||target==="record")return"Запись";
    if(target==="subjectType"||target==="subject")return"Субъект";
    return"";
}

function formatLevels(levels){
    if(levels===undefined||levels===null)return"";
    if(Array.isArray(levels))return levels.join(", ");
    return String(levels);
}
