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

    let parents = [

        ...(entity?.parents ?? [])

    ];

    let file = null;

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

                    ${obj?.title ?? id}

                    <button

                        data-remove="${id}"

                    >

                        ×

                    </button>

                </div>

                `;

            })

            .join("");

    }

    parentsBox.onclick=e=>{

        const id =

            e.target.dataset.remove;

        if(!id)

            return;

        parents =

            parents.filter(

                p=>p!==id

            );

        renderParents();

    };

    searchInput.oninput=()=>{

        const text =

            searchInput.value

            .toLowerCase()

            .trim();

        if(!text){

            resultsBox.innerHTML="";

            return;

        }

        resultsBox.innerHTML =

            context.objects

            .filter(

                o=>

                    o.id!==entity?.id &&

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

                    ${o.title}</div>

            `)

            .join("");

    };

    resultsBox.onclick=e=>{

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

    if(fileInput){

        fileInput.onchange=e=>{

            file =

                e.target.files[0] || null;

        };

    }
  
// ======================================
// Save
// ======================================

const saveButton =

    root.querySelector(
        "#entitySave"
    );

const cancelButton =

    root.querySelector(
        "#entityCancel"
    );

saveButton.onclick = async()=>{

    try{

        const data = {

            title:

                titleInput.value.trim(),

            description:

                descriptionInput.value.trim(),

            parents

        };

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

        if(cfg.file && file){

            const result =

                await cfg.upload(

                    file

                );

            if(result?.storagePath){

                data.storagePath =

                    result.storagePath;

            }

        }

if(entity){

    await cfg.update(

        entity.id,

        data

    );

}

else{

    await cfg.create(

        data

    );

}

        modal.close();

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

<div id="entityParents">

</div>

</label>

<input

id="entityParentSearch"

placeholder="Добавить родителя"

>

<div

id="entityParentResults"

>

</div>

${

cfg.fields.map(field=>{

let label = field;

if(field==="author")

    label="Автор";

if(field==="date")

    label="Дата";

if(field==="dateStart")

    label="Дата начала";

if(field==="dateEnd")

    label="Дата окончания";

return `

<label>

${label}

<input

id="entity_${field}"

value="${entity[field] ?? ""}"

>

</label>

`;

}).join("")

}

${

cfg.file

?

`

<label>

Файл

<input

id="entityFile"

type="file"

>

</label>

`

:

""

}

<button

id="entitySave"

>

Сохранить

</button>

<button

id="entityCancel"

>

Отмена

</button>

</div>

`;

}
