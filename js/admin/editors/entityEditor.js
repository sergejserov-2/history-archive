// ======================================
// Entity editor
// ======================================

import {
    createModal
}
from "../../ui/components/modal.js";

import {
    uploadPhotoOriginal,
    uploadSourceDocument
}
from "../../api/storage.js";

import {
    updatePhoto,
    createPhoto
}
from "../../api/photos.js";

import {
    updateSource,
    createSource
}
from "../../api/sources.js";

import {
    updateRecord,
    createRecord
}
from "../../api/records.js";

// ======================================
// Config
// ======================================

const CONFIG = {

    photo: {

        title: "Фото",

        update: updatePhoto,
        create: createPhoto,

        upload: uploadPhotoOriginal,

        file: true,

        fields: [

            "author",

            "date"

        ]

    },

    source: {

        title: "Источник",

        update: updateSource,
        create: createSource,

        upload: uploadSourceDocument,

        file: true,

        fields: [

            "author",

            "date"

        ]

    },

    record: {

        title: "Запись",

        update: updateRecord,
        create: createRecord,

        file: false,

        fields: [

            "dateStart",

            "dateEnd"

        ]

    }

};

// ======================================
// Open
// ======================================

export function openEntityEditor(

    type,

    entity,

    context,

    onSave

){

    const cfg = CONFIG[type];

    if(!cfg){

        console.error(
            "Unknown entity type",
            type
        );

        return;

    }

    let parents =
    
        entity
    
        ?
    
        [...(entity.parents ?? [])]
    
        :
    
        [context.parentId];

let file = null;
let removeOldFile = false;

    const form = renderForm(

        type,

        entity,

        context.objects

    );

    const modal = createModal({

        title: cfg.title,

        content: form

    });

    const root = modal.root;

    const titleInput =

        root.querySelector(
            "#entityTitle"
        );

    const descriptionInput =

        root.querySelector(
            "#entityDescription"
        );

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

    const fileInput =

        root.querySelector(
            "#entityFile"
        );

const fileName =
    root.querySelector(".entity-file__name");

fileName.onclick = ()=>{

    if(!entity?.storagePath && !file){

        fileInput.click();

    }

};
    
    const fileClear =
    root.querySelector(
        "#entityFileClear"
    );

if(
    entity &&
    entity.storagePath &&
    fileButton
){

    const name =
        entity.storagePath
            .split("/")
            .pop();

    const text =
        fileButton.querySelector(
            ".entity-file__text"
        );

    if(text){

        text.remove();

    }

    const filename =
        document.createElement("div");

    filename.className =
        "entity-file__name";

    filename.textContent =
        name;

    fileButton.prepend(filename);

    fileClear.hidden = false;

}

const fileOpen =
    root.querySelector("#entityFileOpen");

if(fileOpen){

    fileOpen.onclick = ()=>{

        if(
            !entity?.storagePath ||
            removeOldFile
        ){

            fileInput.click();

        }

    };

}

    
    renderParents();

    function renderParents(){

        parentsBox.innerHTML =

            parents.map(id=>{

                const obj =

                    context.objects.find(

                        o=>o.id===id

                    );

                return `

<div class="parent-item">

    <div class="parent-badge">

        <span class="parent-title">
            ${obj?.title ?? id}
        </span>

        <spanmodal.close();

        onSave?.();

    }

    catch(error){

        console.error(

            error

        );

        alert(

            "Ошибка сохранения"

        );

    }

};

cancelButton.onclick = ()=>{

    modal.close();

};

}

// ======================================
// Render form
// ======================================

function renderForm(

    type,

    entity,

    objects

){

    const cfg =

        CONFIG[type];

    entity = entity ?? {};

    return `

<div class="entity-editor">

<label>

Название

<input

id="entityTitle"

value="${entity.title ?? ""}"

>

</label>

<label>

Описание

<textarea

id="entityDescription"

>${entity.description ?? ""}</textarea>

</label>

<label>

Родители

<div class="parents-group">

    <div id="entityParents">

    </div>

    <input

        id="entityParentSearch"

        placeholder="Добавить родителя"

    >

    <div

        id="entityParentResults"

    >

    </div>

</div>

</label>

${
cfg.fields.includes("author") && cfg.fields.includes("date")

?

`

<div class="entity-row entity-row--author-date">

<label>

Автор

<input

id="entity_author"

value="${entity.author ?? ""}"

>

</label>

<label>

Дата

<input

id="entity_date"

value="${entity.date ?? ""}"

>

</label>

</div>

`

:

""

}

${
cfg.fields.includes("dateStart") && cfg.fields.includes("dateEnd")

?

`

<div class="entity-row entity-row--dates">

<label>

Дата начала

<input

id="entity_dateStart"

value="${entity.dateStart ?? ""}"

>

</label>

<label>

Дата окончания

<input

id="entity_dateEnd"

value="${entity.dateEnd ?? ""}"

>

</label>

</div>

`

:

""

}

${

cfg.file

?

`

<label>

Файл

<div class="entity-file">

    <div
        class="entity-file__button admin-button"
    >

        <div
            class="entity-file__name"
        >
            Выбрать файл
        </div>

        <input
            id="entityFile"
            type="file"
            hidden
        >

        <div
            id="entityFileClear"
            class="entity-file__remove"
            hidden
        >
            ×
        </div>

    </div>

</div>

</label>

`

:

""

}

<div class="entity-editor__buttons">

    <button id="entitySave">
        Сохранить
    </button>

    <button id="entityCancel">
        Отмена
    </button>

</div>

`;

}<div class="entity-file">

    <!-- Состояние: выбрать файл -->

    <div
        id="entityFileSelect"
        class="entity-file__select admin-button"
    >
        Выбрать файл
    </div>

    <!-- Состояние: файл выбран -->

    <div
        id="entityFileCurrent"
        class="entity-file__current"
        hidden
    >

        <span
            id="entityFileName"
        >
        </span>

        <span
            id="entityFileRemove"
            class="entity-file__remove"
        >
            ×
        </span>

    </div>

    <input
        id="entityFile"
        type="file"
        hidden
    >

</div>
