// ======================================
// Entity editor UI
// ======================================

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
//
// Режим:
//     date
//     period
//
// Date:
//     #entityDateSingle
//     #entity_date
//
// Period:
//     #entityDatePeriod
//     #entity_dateStart
//     #entity_dateEnd
//
// Переключатель:
//     #entityDateModeSwitch
//
// Заголовок:
//     #entityDateLabel
//
// Дата → Период:
//     date → dateStart
//
// Период → Дата:
//     dateStart → date
//     если dateStart пустая,
//     используется dateEnd
//
// Даты хранятся обычными строками.
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

        return null;

    }

    let mode =
        options.mode === "period"
            ? "period"
            : "date";

    // ==================================
    // Render current mode
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
    // Switch mode
    // ==================================

    switchButton.onclick = ()=>{

        // ==================================
        // Дата → Период
        // ==================================

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

            mode = "period";

        }

        // ==================================
        // Период → Дата
        // ==================================

        else{

            let date =
                dateStartInput
                    ?.value
                    .trim() || "";

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

            mode = "date";

        }

        render();

    };

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
                            ?.value
                            .trim() || ""

                };

            }

            return {

                date:
                    dateInput
                        ?.value
                        .trim() || ""

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
    extraFields = {}
){

    const dateModeEditor =
        setupDateModeEditor(
            root,
            {
                mode:
                    cfg.dateMode ?? "date"
            }
        );

    return {

        // ==================================
        // Get data
        // ==================================

        getData(){

            const data = {};

            // ==================================
            // Title
            // ==================================

            const titleInput =
                root.querySelector(
                    "#entityTitle"
                );

            if(titleInput){

                data.title =
                    titleInput.value.trim();

            }

            // ==================================
            // Description
            // ==================================

            const descriptionInput =
                root.querySelector(
                    "#entityDescription"
                );

            if(descriptionInput){
                data.description =
                    descriptionInput.value.trim();

            }

            // ==================================
            // Ordinary fields
            // ==================================

            (cfg.fields ?? [])
            .forEach(field=>{

                // Даты собираются отдельно,
                // через dateModeEditor.

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
            // Dates
            // ==================================

            if(dateModeEditor){

                Object.assign(
                    data,
                    dateModeEditor.getData()
                );

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
                            input.value;

                    }

                }
            );

            return data;

        },

        // ==================================
        // Current date mode
        // ==================================

        getDateMode(){

            return dateModeEditor
                ?.getMode();

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

    // ==================================
    // Required UI is absent
    // ==================================

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

    // ==================================
    // Parent ID
    // ==================================

    function getParentId(parent){

        return withAddress
            ? parent.objectId
            : parent;

    }

    // ==================================
    // Render parents
    // ==================================

    function renderParents(){

        parentsBox.innerHTML =

            parents
                .map(parent=>{

                    const id =
                        getParentId(parent);

                    const obj =
                        objects.find(
                            object =>
                                object.id === id
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

    // ==================================
    // Remove parent
    // ==================================

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

    // ==================================
    // Parent address
    // ==================================

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
                    item =>
                        item.objectId ===
                        e.target.dataset.id
                );

            if(parent){

                parent.address =
                    e.target.value;

            }

        };

    }

    // ==================================
    // Search parents
    // ==================================

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

                .filter(object=>{

                    // Нельзя выбрать самого себя.

                    if(
                        object.id === entity?.id
                    ){

                        return false;

                    }

                    // Нельзя повторно добавить
                    // уже выбранного родителя.

                    const exists =
                        parents.some(
                            parent =>
                                getParentId(parent) ===
                                object.id
                        );

                    if(exists){

                        return false;

                    }

                    // Дополнительный фильтр.

                    if(
                        options.filter &&
                        !options.filter(
                            object,
                            parents
                        )
                    ){

                        return false;

                    }

                    // Поиск по названию.

                    return (
                        object.title ?? ""
                    )
                        .toLowerCase()
                        .includes(text);

                })

                .slice(0, 20)

                .map(object=>`

<div
    class="parent-result"
    data-id="${object.id}"
>

    ${object.title}

</div>

`)

                .join("");

    };

    // ==================================
    // Select parent
    // ==================================

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

    // ==================================
    // Existing file
    // ==================================

    const oldStoragePath =
        entity?.storagePath ?? null;

    const oldPreviewPath =
        entity?.previewPath ?? null;

    // ==================================
    // UI
    // ==================================

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

    // ==================================
    // Render file state
    // ==================================

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

    // ==================================
    // Select file
    // ==================================

    if(fileSelect){

        fileSelect.onclick = ()=>{

            if(!fileInput.disabled){

                fileInput.click();

            }

        };

    }

    // ==================================
    // File selected
    // ==================================

    fileInput.onchange = e=>{

        file =
            e.target.files[0] ||
            null;

        renderFileState();

    };

    // ==================================
    // Remove file
    // ==================================

    if(fileRemove){

        fileRemove.onclick = e=>{

            e.stopPropagation();

            file =
                null;

            fileInput.value =
                "";

            /*
             * ВАЖНО:
             *
             * removeOldFile специально
             * НЕ сбрасывается при выборе
             * нового файла.
             *
             * Если старый файл уже был
             * отмечен на удаление, он должен
             * попасть в deleted независимо
             * от нового файла.
             */

            removeOldFile =
                true;

            renderFileState();

        };

    }

    renderFileState();

    return {

        // ==================================
        // Has file
        // ==================================

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
        // ==================================
        // Get file data
        // ==================================

        async getData(){

            const data = {};

            // ==================================
            // Old original
            // ==================================

            if(
                removeOldFile &&
                oldStoragePath
            ){

                data.removedStoragePath =
                    oldStoragePath;

            }

            // ==================================
            // Old preview
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

                // ==================================
                // Original
                // ==================================

                if(
                    result?.storagePath
                ){

                    data.storagePath =
                        result.storagePath;

                }

                // ==================================
                // Preview
                // ==================================

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
