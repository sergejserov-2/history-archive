// ======================================
// Entity editor UI
// ======================================

export function renderEntityEditor(

    cfg,

    entity

){

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

}
