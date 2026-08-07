// ======================================
// Entity editor UI
// ======================================

export function setupEntityFieldsEditor(

    root,

    cfg

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

            data.title =

                titleInput.value.trim();

            data.description =

                descriptionInput.value.trim();

            cfg.fields.forEach(field=>{

                const input =

                    root.querySelector(
                        `#entity_${field}`
                    );

                if(input){

                    data[field] =

                        input.value.trim();

                }

            });

            return data;

        }

    };

}

export function setupParentsEditor(
    root,
    objects,
    entity,
    parents
){

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

    function renderParents(){

        parentsBox.innerHTML =

            parents.map(id=>{

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

        const index =
            parents.indexOf(id);

        if(index !== -1){

            parents.splice(
                index,
                1
            );

        }

        renderParents();

    };

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

            .filter(o=>

                o.id !== entity?.id &&

                !parents.includes(o.id) &&

                o.title

                .toLowerCase()

                .includes(text)

            )

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

        parents.push(
            item.dataset.id
        );

        renderParents();

        searchInput.value="";

        resultsBox.innerHTML="";

    };

    renderParents();

    return {

        getParents(){

            return parents;

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
