// ======================================
// Editor UI
// ======================================

import {setupStatusEditor} from "./editor/status.js";
import {setupParentsEditor} from "./editor/parents.js";
import {setupFileEditor} from "./editor/files.js";

// ======================================
// Render Editor
// ======================================

export function renderEntityEditor(

    cfg,

    entity

){

    entity =
        entity ?? {};

    const options =
        cfg.options ?? {};

    const limits = {

        title: 45,

        description: 350,

        author: 45,

        ...(cfg.limits ?? {})

    };

    // ==================================
    // Sort types
    // ==================================

    const sortedTypes =

        [...(options.types ?? [])]

        .sort((a, b)=>{

            const levelA =

                Array.isArray(a.levels)

                    ?

                    Math.max(
                        ...a.levels.map(Number)
                    )

                    :

                    Number(
                        a.level ?? Infinity
                    );

            const levelB =

                Array.isArray(b.levels)

                    ?

                    Math.max(
                        ...b.levels.map(Number)
                    )

                    :

                    Number(
                        b.level ?? Infinity
                    );

            if(levelA !== levelB){

                return levelB - levelA;

            }

            return (

                (a.title ?? "")
                    .localeCompare(
                        b.title ?? "",
                        "ru"
                    )

            );

        });

    // ==================================
    // Type selector
    // ==================================

    const typeSelector =

        options.typeSelector

        ?

        `

        <label class="entity-type">

            Тип

            <select id="entityType">

                ${
                    sortedTypes

                        .map(type=>`

                            <option

                                value="${type.id}"

                                ${
                                    type.id ===
                                    (
                                        entity.typeId ??
                                        options.defaultTypeId
                                    )

                                    ?

                                    "selected"

                                    :

                                    ""
                                }

                                ${
                                    options.disabledTypeIds
                                        ?.includes(type.id)

                                    ?

                                    "disabled"

                                    :

                                    ""
                                }

                            >

                                ${type.title}

                            </option>

                        `)

                        .join("")

                }

            </select>

        </label>

        `

        :

        "";

    // ==================================
    // Date editor
    // ==================================

    const hasSingleDate =
        cfg.fields?.includes("date");

    const hasDatePeriod =
        cfg.fields?.includes("dateStart") &&
        cfg.fields?.includes("dateEnd");

    const hasDateEditor =
        hasSingleDate ||
        hasDatePeriod;

    const dateEditor =

        hasDateEditor

        ?

        `

        <div
            id="entityDateEditor"
            class="entity-date-editor"
        >

            <span
                id="entityDateLabel"
                class="entity-date-editor__label"
            >

                ${
                    cfg.dateMode === "period"
                        ? "Период": "Дата"
                }

            </span>

            <!-- ==============================
                 Single date
            ============================== -->

            <div
                id="entityDateSingle"
                class="entity-date-editor__single"
                ${
                    cfg.dateMode === "period"
                        ? "hidden"
                        : ""
                }
            >

                <input
                    id="entity_date"
                    value="${entity.date ?? ""}"
                >

            </div>

            <!-- ==============================
                 Date period
            ============================== -->

            <div
                id="entityDatePeriod"
                class="entity-date-editor__period"
                ${
                    cfg.dateMode === "period"
                        ? ""
                        : "hidden"
                }
            >

                <input
                    id="entity_dateStart"
                    value="${entity.dateStart ?? ""}"
                >

                <input
                    id="entity_dateEnd"
                    value="${entity.dateEnd ?? ""}"
                >

            </div>

            <!-- ==============================
                 Switch
            ============================== -->

            <button
                type="button"
                id="entityDateModeSwitch"
                class="entity-date-editor__switch"
            >

                ${
                    cfg.dateMode === "period"
                        ? "Сменить на дату"
                        : "Сменить на период"
                }

            </button>

        </div>

        `

        :

        "";

    // ==================================
    // Author
    // ==================================

    const authorField =

        cfg.fields?.includes("author")

        ?

        `

        <label>

            Автор

            <input
                id="entity_author"
                value="${entity.author ?? ""}"
                maxlength="${limits.author}"
            >

            <div
                class="entity-field-counter"
                data-counter-for="entity_author"
            ></div>

        </label>

        `

        :

        "";

    // ==================================
    // File
    // ==================================

    const fileField =

        cfg.file

        ?

        `

        <label>

            Файл

            <div class="entity-file">

                <div
                    id="entityFileSelect"
                    class="entity-file__select admin-button"
                >

                    Выбрать файл

                </div>

                <div
                    id="entityFileCurrent"
                    class="entity-file__current"
                    hidden
                >

                    <span id="entityFileName"></span>

                    <span
                        id="entityFileRemove"
                        class="entity-file__remove"
                    >

                        ×

                    </span>

                </div>

            </div>

        </label>

        <input
            id="entityFile"
            type="file"
            hidden
        >

        `

        :

        "";

    // ==================================
    // Cover
    // ==================================

    const coverField =

        cfg.cover

        ?

        `

        <label>

            Обложка

            <select id="entityCover">

                <option value="">

                    Без фотографии

                </option>

                ${
                    (cfg.cover.photos ?? [])

                        .map(photo=>`

                            <option

                                value="${photo.id}"

                                ${
                                    photo.id ===
                                    entity.coverPhotoId

                                    ?

                                    "selected"

                                    :

                                    ""
                                }

                            >

                                ${photo.title ?? photo.id}

                            </option>

                        `)

                        .join("")

                }

            </select>

        </label>

        `

        :

        "";

    // ==================================
    // Status
    // ==================================

// ==================================
// Status
// ==================================

const statusContainer =

    cfg.status

    ?

    `

    <label>

        Статус

        <div
            id="entityStatus"
            class="entity-status"
        ></div>

    </label>

    `

    :

    "";

    // ==================================
    // Render
    // ==================================

    return `

    <div class="entity-editor">

        ${
            options.typeSelector

            ?

            `

            <div
                class="entity-row entity-row--title-type"
            >

                ${typeSelector}

                <label class="entity-title">

                    Название

                    <input
                        id="entityTitle"
                        value="${entity.title ?? ""}"
                        maxlength="${limits.title}"
                    >

                    <div
                        class="entity-field-counter"
                        data-counter-for="entityTitle"
                    ></div>

                </label>

            </div>

            `

            :

            `

            <label>

                Название

                <input
                    id="entityTitle"
                    value="${entity.title ?? ""}"
                    maxlength="${limits.title}"
                >

                <div
                    class="entity-field-counter"
                    data-counter-for="entityTitle"
                ></div>

            </label>

            `

        }

        <label>

            Описание

            <textarea
                id="entityDescription"
                maxlength="${limits.description}"
            >${entity.description ?? ""}</textarea>

            <div
                class="entity-field-counter"
                data-counter-for="entityDescription"
            ></div>

        </label>

        <label>

            Родители

            <div class="parents-group">

                <div id="entityParents"></div>

                <input
                    id="entityParentSearch"
                    placeholder="Начните вводить имя"
                >

                <div
                    id="entityParentResults"
                ></div>

            </div>

        </label>

        ${
            authorField

            ?

            `

            <div
                class="entity-row entity-row--author-date"
            >

                ${authorField}

                ${dateEditor}

            </div>

            `

            :

            dateEditor

        }

        ${fileField}

        ${coverField}

        ${statusContainer}

        <div class="entity-editor__buttons">

            <button id="entitySave">

                Сохранить

            </button>

            <button id="entityCancel">

                Отмена

            </button>

        </div>

    </div>

    `;

}
                

// ======================================
// Cover editor
// ======================================

export function setupCoverEditor(

    root,

    photos,

    entity

){

    const select =
        root.querySelector(
            "#entityCover"
        );

    if(!select){

        return null;

    }

    let coverPhotoId =
    entity?.coverPhotoId ?? null;

    select.onchange = e=>{

        coverPhotoId =
            e.target.value || null;

    };

    return {

        getData(){

            return {

                coverPhotoId

            };

        }

    };

}

// ======================================
// Editor buttons
// ======================================

export function setupEditorButtons(

    root,

    onSave,

    onCancel

){

    const saveButton =
        root.querySelector(
            "#entitySave"
        );

    const cancelButton =
        root.querySelector(
            "#entityCancel"
        );

    if(saveButton){

        saveButton.onclick =
            onSave;

    }

    if(cancelButton){

        cancelButton.onclick =
            onCancel;

    }

}

// ======================================
// Field counters
// ======================================

export function setupFieldCounters(root){

    const fields = [

        {
            selector:
                "#entityTitle",

            counter:
                '[data-counter-for="entityTitle"]'
        },

        {
            selector:
                "#entityDescription",

            counter:
                '[data-counter-for="entityDescription"]'
        },

        {
            selector:
                "#entity_author",

            counter:
                '[data-counter-for="entity_author"]'
        }

    ];

    fields.forEach(field=>{

        const input =
            root.querySelector(
                field.selector
            );

        const counter =
            root.querySelector(
                field.counter
            );

        if(!input || !counter){

            return;

        }

        function updateCounter(){

            const remaining =
                input.maxLength -
                input.value.length;

            counter.textContent =
                `Осталось: ${remaining}`;

        }

        input.addEventListener(
            "input",
            updateCounter
        );

        updateCounter();

    });

}

// ======================================
// Date mode editor
// ======================================

export function setupDateModeEditor(

    root,

    options = {}

){

    const container =
        root.querySelector(
            "#entityDateEditor"
        );

    if(!container){

        return null;

    }

    const dateInput =
        root.querySelector(
            "#entity_date"
        );

    const dateStartInput =
        root.querySelector(
            "#entity_dateStart"
        );

    const dateEndInput =
        root.querySelector(
            "#entity_dateEnd"
        );

    const switchButton =
        root.querySelector(
            "#entityDateModeSwitch"
        );

    const dateLabel =
        root.querySelector(
            "#entityDateLabel"
        );

    const periodFields =
        root.querySelector(
            "#entityDatePeriod"
        );

    const singleField =
        root.querySelector(
            "#entityDateSingle"
        );

    if(
        !switchButton ||
        !dateLabel
    ){

        console.error(
            "Date mode editor: switch or label not found"
        );

        return null;

    }

    let mode =

        options.mode === "period"

            ?

            "period"

            :

            "date";

    // ==================================
    // Render
    // ==================================

    function render(){

        const isPeriod =
            mode === "period";

        dateLabel.textContent =
            isPeriod
                ? "Период"
                : "Дата";

        switchButton.textContent =
            isPeriod
                ? "Сменить на дату"
                : "Сменить на период";

        if(singleField){

            singleField.hidden =
                isPeriod;

        }

        if(periodFields){

            periodFields.hidden =
                !isPeriod;

        }

    }

    // ==================================
    // Switch
    // ==================================

    switchButton.addEventListener(
        "click",
        ()=>{

            // ------------------------------
            // Date → Period
            // ------------------------------

            if(mode === "date"){

                const date =
                    dateInput
                        ?.value
                        .trim() || "";

                if(dateStartInput){

                    dateStartInput.value =
                        date;

                }

                if(dateEndInput){

                    dateEndInput.value =
                        "";

                }

                mode =
                    "period";

            }

            // ------------------------------
            // Period → Date
            // ------------------------------

            else{

                let date = "";

                if(dateStartInput){

                    date =
                        dateStartInput
                            .value
                            .trim();

                }

                if(
                    !date &&
                    dateEndInput
                ){

                    date =
                        dateEndInput
                            .value
                            .trim();

                }

                if(dateInput){

                    dateInput.value =
                        date;

                }

                mode =
                    "date";

            }

            render();

        }
    );

    // Initial state
    render();

    return {

        getMode(){

            return mode;

        },

        getData(){

            if(mode === "period"){

                return {

                    dateStart:
                        dateStartInput
                            ?.value
                            .trim() || "",

                    dateEnd:
                        dateEndInput
                            ?.value.trim() || "",

                    dateMode:
                        "period"

                };

            }

            return {

                date:
                    dateInput
                        ?.value
                        .trim() || "",

                dateMode:
                    "date"

            };

        }

    };

}

// ======================================
// Entity fields editor
// ======================================

export function setupEntityFieldsEditor(

    root,

    cfg = {},

    extraFields = {},

    entity = {}

){

    const dateModeEditor =
        setupDateModeEditor(

            root,

            {
                mode:
                    entity?.dateMode ??
                    cfg.dateMode ??
                    "date"
            }

        );

// ==================================
// Status editor
// ==================================

const statusEditor =
    setupStatusEditor(
        root,
        entity,
        cfg.status === true
    );

    // ==================================
    // Data
    // ==================================

    return {

        getData(){

            const data = {};

            const titleInput =
                root.querySelector(
                    "#entityTitle"
                );

            const descriptionInput =
                root.querySelector(
                    "#entityDescription"
                );

            if(titleInput){

                data.title =
                    titleInput.value.trim();

            }

            if(descriptionInput){

                data.description =
                    descriptionInput.value.trim();

            }

            // ==================================
            // Regular fields
            // ==================================

            (cfg.fields ?? [])
                .forEach(field=>{

                    if(
                        field === "date" ||
                        field === "dateStart" ||
                        field === "dateEnd"
                    ){

                        return;

                    }

                    const input =
                        root.querySelector(
                            `#entity_${field}`
                        );

                    if(input){

                        data[field] =
                            input.value.trim();

                    }

                });

            // ==================================
            // Status
            // ==================================

                if(cfg.status){
                
                    data.status =
                        statusEditor.getStatus();
                
                }

            // ==================================
            // Dates
            // ==================================

            if(dateModeEditor){

                Object.assign(
                    data,
                    dateModeEditor.getData()
                );

                data.dateMode =
                    dateModeEditor.getMode();

            }

            // ==================================
            // Extra fields
            // ==================================

            Object.entries(extraFields)
                .forEach(
                    ([field, selector])=>{

                        const input =
                            root.querySelector(
                                selector
                            );

                        if(input){

                            data[field] =
                                input.value.trim();

                        }

                    }
                );

            return data;

        },

        getDateMode(){

            return dateModeEditor
                ?.getMode();

        },

        getStatus(){

            return currentStatus;

        }

    };

}

export {
    setupParentsEditor
};

