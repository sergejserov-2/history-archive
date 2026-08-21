import{createDropdown}from"../dropdown.js";
import{renderFieldCounterHTML,setupFieldCounters}from"./counters.js";

export function renderTypeEditorHTML(cfg={},entity={}){
    const limits=cfg.limits??{};
    const targets=cfg.targets??{};

    const target=entity.target??"";
    const targetConfig=targets[target]??{};
    const levelsMode=targetConfig.levels??"none";

    return`
        <div class="type-editor">

            <div class="entity-row entity-row--title-type">

                <label class="entity-type">
                    Тип

                    <div class="entity-type__input-wrapper">

                        <input
                            id="typeTarget"
                            class="entity-type__input"
                            type="text"
                            value="${targetConfig.title??targetTitle(target)}"
                            readonly
                            autocomplete="off"
                        >

                    </div>
                </label>

                <label class="entity-title">
                    ID

                    <input
                        id="typeId"
                        class="entity-title__input"
                        value="${entity.id??""}"
                        maxlength="${limits.id??45}"
                        ${entity.id?"readonly":""}
                    >

                    ${renderFieldCounterHTML(
                        "typeId",
                        entity.id,
                        limits.id??45
                    )}
                </label>

            </div>

            <div class="entity-row entity-row--title-type">

                <label class="entity-title">
                    Название

                    <input
                        id="typeTitle"
                        class="entity-title__input"
                        value="${entity.title??""}"
                        maxlength="${limits.title??45}"
                    >

                    ${renderFieldCounterHTML(
                        "typeTitle",
                        entity.title,
                        limits.title??45
                    )}
                </label>

                ${
                    levelsMode==="none"
                    ?
                    ""
                    :
                    `
                    <label class="entity-title">
                        Уровни

                        <input
                            id="typeLevels"
                            class="entity-title__input"
                            value="${formatLevels(
                                entity.levels??entity.level
                            )}"
                            inputmode="numeric"
                            autocomplete="off"
                        >
                    </label>
                    `
                }

            </div>

        </div>
    `;
}

export function setupTypeEditor(root,entity={},cfg={}){

    const targetInput=
        root.querySelector("#typeTarget");

    const idInput=
        root.querySelector("#typeId");

    const titleInput=
        root.querySelector("#typeTitle");

    const levelsInput=
        root.querySelector("#typeLevels");

    const targets=
        cfg.targets??{};

    /*
     * ВАЖНО:
     *
     * target хранится как ID:
     *
     * objectType
     * recordType
     * subjectType
     *
     * Поэтому target никогда не восстанавливаем
     * из отображаемого title.
     */

    let currentTarget=
        entity.target??
        Object.keys(targets)[0]??
        "";

    const targetItems=
        Object.entries(targets).map(
            ([id,target])=>({

                id,

                title:
                    target.title??
                    targetTitle(id)

            })
        );

    const dropdown=
        createDropdown();

    if(targetInput){

        targetInput.value=
            targets[currentTarget]?.title??
            targetTitle(currentTarget);

        dropdown.setItems(
            targetItems,
            {
                onSelect(item){

                    currentTarget=item.id;

                    targetInput.value=
                        item.title??"";

                    dropdown.close();

                    targetInput.blur();

                    updateLevelsMode();

                }
            }
        );

        targetInput.addEventListener(
            "click",
            ()=>{

                if(dropdown.isOpen()){

                    dropdown.close();

                    targetInput.blur();

                }else{

                    dropdown.open(targetInput);

                    targetInput.focus();

                }

            }
        );

    }

    function updateLevelsMode(){

        const mode=
            targets[currentTarget]?.levels??
            "none";

        if(!levelsInput)return;

        levelsInput.disabled=
            mode==="none";

    }

    if(idInput){

        idInput.addEventListener(
            "input",
            ()=>{

                idInput.value=
                    idInput.value
                        .replace(
                            /[^A-Za-z0-9_-]/g,
                            ""
                        );

            }
        );

    }

    if(levelsInput){

        levelsInput.addEventListener(
            "input",
            ()=>{

                const mode=
                    targets[currentTarget]?.levels??
                    "none";

                if(mode==="single"){

                    levelsInput.value=
                        levelsInput.value
                            .replace(
                                /[^0-9]/g,
                                ""
                            )
                            .slice(0,1);

                    return;

                }

                levelsInput.value=
                    levelsInput.value
                        .replace(
                            /[^0-9, ]/g,
                            ""
                        )
                        .replace(
                            /,{2,}/g,
                            ","
                        );

            }
        );

    }

    setupFieldCounters(root);

    updateLevelsMode();

    return{

        getData(){

            const mode=
                targets[currentTarget]?.levels??
                "none";

            const data={

                target:
                    currentTarget,

                id:
                    idInput?.value.trim()??
                    "",

                title:
                    titleInput?.value.trim()??
                    ""

            };

            if(mode==="single"){

                data.level=
                    levelsInput?.value.trim()??
                    "";

            }

            if(mode==="multiple"){

                data.levels=
                    (levelsInput?.value??"")
                        .split(",")

                        .map(
                            value=>
                                value.trim()
                        )

                        .filter(Boolean)

                        .map(Number)

                        .filter(
                            Number.isFinite
                        );

            }

            return data;

        },

        getTarget(){

            return currentTarget;

        }

    };

}

function targetTitle(target){

    if(target==="objectType")
        return"Объект";

    if(target==="recordType")
        return"Запись";

    if(target==="subjectType")
        return"Субъект";

    /*
     * Старые значения оставляем
     * для совместимости.
     */

    if(target==="object")
        return"Объект";

    if(target==="record")
        return"Запись";

    if(target==="subject")
        return"Субъект";

    return"";

}

function formatLevels(levels){

    if(
        levels===undefined||
        levels===null
    ){

        return"";

    }

    if(Array.isArray(levels)){

        return levels.join(", ");

    }

    return String(levels);

}
