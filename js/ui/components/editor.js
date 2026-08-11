// ======================================
// Editor UI
// ======================================

// ======================================
// Render Editor
// ======================================

import {
    getObjectStatus,
    renderStatusEditor
} from "./editor/status.js";

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

    const statusContainer =

        cfg.status

        ?

        `

        <div
            id="entityStatus"
            class="entity-status"
        ></div>

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

    let currentStatus =
        getObjectStatus(entity);

    const statusContainer =
        root.querySelector(
            "#entityStatus"
        );

    if(
        cfg.status &&
        statusContainer
    ){

        function renderStatus(){

            statusContainer.innerHTML =
                "";

            const editor =
                renderStatusEditor(

                    currentStatus,

                    status => {

                        currentStatus =
                            status;

                        renderStatus();

                    }

                );

            statusContainer.appendChild(
                editor
            );

        }

        renderStatus();

    }

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
                    currentStatus;

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

// ======================================
// Parents editor
// ======================================

export function setupParentsEditor(

    root,

    objects,

    entity,

    parents,

    options = {}

){

    const withAddress =
        options.address === true;

    const parentsBox =
        root.querySelector(
            "#entityParents"
        );

    const searchInput =
        root.querySelector(
            "#entityParentSearch"
        );

    const resultsBox =
        root.querySelector(
            "#entityParentResults"
        );

    if(
        !parentsBox ||
        !searchInput ||
        !resultsBox
    ){

        return {

            getParents(){

                return parents;

            },

            clearParents(){

                parents.splice(0);

            }

        };

    }

    function getParentId(parent){

        return withAddress

            ?

            parent.objectId

            :

            parent;

    }

    function renderParents(){

        parentsBox.innerHTML =

            parents

                .map(parent=>{

                    const id =
                        getParentId(parent);

                    const obj =
                        objects.find(
                            o =>
                                o.id === id
                        );

                    return `

                    <div class="parent-item">

                        <div class="parent-badge">

                            <span class="parent-title">

                                ${obj?.title ?? id}

                            </span>

                            <span
                                class="parent-remove"
                                data-remove="${id}"
                            >

                                ×

                            </span>

                        </div>

                        ${
                            withAddress

                            ?

                            `

                            <input
                                class="parent-address"
                                data-id="${id}"
                                value="${parent.address ?? ""}"
                                placeholder="Адрес"
                            >

                            `

                            :

                            ""

                        }

                    </div>

                    `;

                })

                .join("");

    }

    parentsBox.onclick = e=>{

        const id =
            e.target.dataset.remove;

        if(!id){

            return;

        }

        parents =

            parents.filter(parent=>{

                return (
                    getParentId(parent) !== id
                );

            });

        renderParents();

    };

    if(withAddress){

        parentsBox.oninput = e=>{

            if(
                !e.target.classList.contains(
                    "parent-address"
                )
            ){

                return;

            }

            const parent =

                parents.find(

                    p =>
                        p.objectId ===
                        e.target.dataset.id

                );

            if(parent){

                parent.address =
                    e.target.value;
}

        };

    }

    searchInput.oninput = ()=>{

        const text =

            searchInput.value
                .toLowerCase()
                .trim();

        if(!text){

            resultsBox.innerHTML =
                "";

            return;

        }

        resultsBox.innerHTML =

            objects

                .filter(o=>{

                    // Cannot select itself

                    if(
                        o.id === entity?.id
                    ){

                        return false;

                    }

                    // Cannot select duplicate parent

                    const exists =

                        parents.some(

                            parent =>

                                getParentId(parent) ===
                                o.id

                        );

                    if(exists){

                        return false;

                    }

                    // Additional filter

                    if(
                        options.filter &&
                        !options.filter(
                            o,
                            parents
                        )
                    ){

                        return false;

                    }

                    return (

                        o.title ?? ""

                    )

                        .toLowerCase()

                        .includes(text);

                })

                .slice(0,20)

                .map(o=>`

                    <div
                        class="parent-result"
                        data-id="${o.id}"
                    >

                        ${o.title}

                    </div>

                `)

                .join("");

    };

    resultsBox.onclick = e=>{

        const item =

            e.target.closest(
                ".parent-result"
            );

        if(!item){

            return;

        }

        if(withAddress){

            parents.push({

                objectId:
                    item.dataset.id,

                address:
                    ""

            });

        }

        else{

            parents.push(
                item.dataset.id
            );

        }

        renderParents();

        searchInput.value =
            "";

        resultsBox.innerHTML =
            "";

    };

    renderParents();

    return {

        getParents(){

            return parents;

        },

        clearParents(){

            parents.splice(0);

            renderParents();

            searchInput.value =
                "";

            resultsBox.innerHTML =
                "";

        }

    };

}

// ======================================
// File editor
// ======================================

export function setupFileEditor(

    root,

    entity,

    upload

){

    const fileInput =
        root.querySelector(
            "#entityFile"
        );

    if(!fileInput){

        return null;

    }

    let file = null;

    let removeOldFile = false;

    const oldStoragePath =
        entity?.storagePath ?? null;

    const oldPreviewPath =
        entity?.previewPath ?? null;

    const fileSelect =
        root.querySelector(
            "#entityFileSelect"
        );

    const fileCurrent =
        root.querySelector(
            "#entityFileCurrent"
        );

    const fileName =
        root.querySelector(
            "#entityFileName"
        );

    const fileRemove =
        root.querySelector(
            "#entityFileRemove"
        );

    function renderFileState(){

        if(file){

            fileSelect.hidden =
                true;

            fileCurrent.hidden =
                false;

            fileInput.disabled =
                true;

            fileName.textContent =
                file.name;

            return;

        }

        if(
            oldStoragePath &&
            !removeOldFile
        ){
fileSelect.hidden =
                true;

            fileCurrent.hidden =
                false;

            fileInput.disabled =
                true;

            fileName.textContent =

                oldStoragePath
                    .split("/")
                    .pop();

            return;

        }

        fileSelect.hidden =
            false;

        fileCurrent.hidden =
            true;

        fileInput.disabled =
            false;

        fileName.textContent =
            "";

    }

    fileSelect.onclick = ()=>{

        if(!fileInput.disabled){

            fileInput.click();

        }

    };

    fileInput.onchange = e=>{

        file =
            e.target.files[0] ||
            null;

        renderFileState();

    };

    fileRemove.onclick = e=>{

        e.stopPropagation();

        file =
            null;

        fileInput.value =
            "";

        removeOldFile =
            true;

        renderFileState();

    };

    renderFileState();

    return {

        hasFile(){

            return (

                !!file

                ||

                (
                    !!oldStoragePath &&
                    !removeOldFile
                )

            );

        },

        async getData(){

            const data = {};

            // ==================================
            // Removed original
            // ==================================

            if(
                removeOldFile &&
                oldStoragePath
            ){

                data.removedStoragePath =
                    oldStoragePath;

            }

            // ==================================
            // Removed preview
            // ==================================

            if(
                removeOldFile &&
                oldPreviewPath
            ){

                data.removedPreviewPath =
                    oldPreviewPath;

            }

            // ==================================
            // New file
            // ==================================

            if(file){

                const result =
                    await upload(file);

                if(
                    result?.storagePath
                ){

                    data.storagePath =
                        result.storagePath;

                }

                if(
                    result?.previewPath
                ){

                    data.previewPath =
                        result.previewPath;

                }

            }

            // ==================================
            // Nothing changed
            // ==================================

            if(
                !data.storagePath &&
                !data.previewPath &&
                !data.removedStoragePath &&
                !data.removedPreviewPath
            ){

                return null;

            }

            return data;

        }

    };

}
