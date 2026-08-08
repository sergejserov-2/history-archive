// ======================================
// Entity editor UI
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

    saveButton.onclick = onSave;

    cancelButton.onclick = onCancel;

}

export function setupEntityFieldsEditor(

    root,

    cfg = {},

    extraFields = {}

){

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

            (cfg.fields ?? [])
            .forEach(field=>{

                const input =

                    root.querySelector(
                        `#entity_${field}`
                    );

                if(input){

                    data[field] =
                        input.value.trim();

                }

            });

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

        }

    };

}

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

    function getParentId(parent){

        return withAddress
            ? parent.objectId
            : parent;

    }

    function renderParents(){

        parentsBox.innerHTML =

            parents.map(parent=>{

                const id =
                    getParentId(parent);

                const obj =

                    objects.find(

                        o=>o.id===id

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

        if(!id)

            return;

        parents =

            parents.filter(parent=>{

                return getParentId(parent)!==id;

            });

        renderParents();

    };

    if(withAddress){

        parentsBox.oninput = e=>{

            if(
                !e.target.classList.contains(
                    "parent-address"
                )
            )

                return;

            const parent =

                parents.find(

                    p=>

                    p.objectId === e.target.dataset.id

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

        resultsBox.innerHTML="";

        return;

    }

    resultsBox.innerHTML =

        objects

        .filter(o=>{

            // Нельзя выбрать самого себя

            if(
                o.id === entity?.id
            ){

                return false;

            }

            // Нельзя повторно добавить уже выбранного родителя

            const exists =

                parents.some(parent=>{

                    return getParentId(parent) === o.id;

                });

            if(exists){

                return false;

            }

            // ======================================
            // Проверка допустимости родителя
            // ======================================

if(
    options.filter &&
    !options.filter(
        o,
        parents
    )
){

    return false;

}

            // ======================================
            // Поиск по названию
            // ======================================

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

        if(!item)

            return;

        if(withAddress){

            parents.push({

                objectId:
                    item.dataset.id,

                address:""

            });

        }
        else{

            parents.push(
                item.dataset.id
            );

        }

        renderParents();

        searchInput.value="";

        resultsBox.innerHTML="";

    };

    renderParents();

return {

    getParents(){

        return parents;

    },

    clearParents(){

        parents.splice(0);

        renderParents();

        searchInput.value = "";

        resultsBox.innerHTML = "";

    }

};

}

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

            fileSelect.hidden = true;

            fileCurrent.hidden = false;

            fileInput.disabled = true;

            fileName.textContent =
                file.name;

            return;

        }

        if(
            entity?.storagePath &&
            !removeOldFile
        ){

            fileSelect.hidden = true;

            fileCurrent.hidden = false;

            fileInput.disabled = true;

            fileName.textContent =
                entity.storagePath
                .split("/")
                .pop();

            return;

        }

        fileSelect.hidden = false;

        fileCurrent.hidden = true;

        fileInput.disabled = false;

        fileName.textContent = "";

    }

    fileSelect.onclick = ()=>{

        if(!fileInput.disabled){

            fileInput.click();

        }

    };

    fileInput.onchange = e=>{

        file =
            e.target.files[0] || null;

        if(file){

            removeOldFile = false;

        }

        renderFileState();

    };

    fileRemove.onclick = e=>{

        e.stopPropagation();

        file = null;

        fileInput.value = "";

        removeOldFile = true;

        renderFileState();

    };

    renderFileState();

    return {

        async getData(){

            if(removeOldFile){

                return {

                    storagePath:null

                };

            }

            if(file){
            
                const result = await upload(
                    file
                );
            
                if(result?.storagePath){
            
                    return {
            
                        storagePath: result.storagePath
            
                    };
            
                }
            
            }

            return null;

        }

    };

}



export function renderEntityEditor(

    cfg,

    entity

){

    entity = entity ?? {};

    const options = cfg.options ?? {};

    return `

<div class="entity-editor">

${
options.typeSelector

?

`

<div class="entity-row entity-row--title-type">

<label class="entity-type">

Тип

<select id="entityType">

${

options.types.map(type=>`

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
options.disabledTypeIds?.includes(type.id)
?
"disabled"
:
""
}

>

${type.title}

</option>

`).join("")

}

</select>

</label>

<label class="entity-title">

Название

<input

id="entityTitle"

value="${entity.title ?? ""}"

>

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

>

</label>

`

}

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

${
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
cfg.cover.photos.map(photo=>`

<option

value="${photo.id}"

${
photo.id === entity.coverPhotoId
?
"selected"
:
""
}

>

${photo.title ?? photo.id}

</option>

`).join("")
}

</select>

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

</div>

`;

}
