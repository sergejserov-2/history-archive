// ======================================
// Object editor
// ======================================

import {
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    db
}
from "../../firebase.js";

// ======================================
// Render
// ======================================

export function renderObjectEditor(

    object,

    types,

    objects

) {

    return `

    <div class="object-editor">

        <label>

            Название

            <input

                id="objectTitleInput"

                value="${object.title ?? ""}"

            >

        </label>

        <label>

            Описание

            <textarea

                id="objectDescriptionInput"

            >${object.description ?? ""}</textarea>

        </label>

        <label>

            Тип

            <select id="objectTypeInput">

            ${
                types.map(t => `

                    <option

                        value="${t.id}"

                        ${

                            t.id === object.typeId

                            ?

                            "selected"

                            :

                            ""

                        }

                    >

                        ${t.title}

                    </option>

                `).join("")
            }

            </select>

        </label>

        <label>

            Родители

            <div id="parentsContainer">

            ${
                renderParents(

                    object,

                    objects

                )
            }

            </div>

        </label>

<div class="parent-search">

    <input

        id="parentSearchInput"

        placeholder="Добавить родителя..."

        autocomplete="off"

    >

    <div

        id="parentSearchResults"

        class="parent-search-results"

    ></div>

</div>

        <div class="object-editor__buttons">

            <button id="saveObjectButton">

                Сохранить

            </button>

            <button id="cancelObjectButton">

                Отмена

            </button>

        </div>

    </div>

    `;

}

// ======================================
// Parents render
// ======================================

function renderParents(

    object,

    objects

){

    return (object.parents ?? [])

        .map(id => {

            const parent =
                objects.find(
                    o=>o.id===id
                );

            return `

            <div class="parent-item">

                ${parent?.title ?? id}

                <button

                    data-remove-parent="${id}"

                >

                    ×

                </button>

            </div>

            `;

        })

        .join("");

}

// ======================================
// Init
// ======================================

export function initObjectEditor(

    object,

    types,

    objects,

    onSave

){

let parents =
    [...(object.parents ?? [])];

document.addEventListener(

"click",

event=>{

const remove =
event.target.dataset.removeParent;

if(remove){

parents =
parents.filter(
id=>id!==remove
);

renderParentBlock();

}

}

);

function renderParentBlock(){

document.getElementById(

"parentsContainer"

).innerHTML =

parents.map(id=>{

const p =
objects.find(
o=>o.id===id
);

return `

<div class="parent-item">

${p.title}

<button

data-remove-parent="${id}"

>

×

</button>

</div>

`;

}).join("");

}

const searchInput =

document.getElementById(

"parentSearchInput"

);

const results =

document.getElementById(

"parentSearchResults"

);

searchInput.oninput = ()=>{

const text =
searchInput.value
.trim()
.toLowerCase();

if(!text){

results.style.display="none";

return;

}

const currentType =

types.find(

t=>

t.id===

document.getElementById(

"objectTypeInput"

).value

);

const currentLevel =
currentType.level;

let parentLevel=null;

if(parents.length){

const first=
objects.find(
o=>o.id===parents[0]
);

const firstType=
types.find(
t=>t.id===first.typeId
);

parentLevel=
firstType.level;

}

const candidates=

objects.filter(o=>{

if(o.id===object.id)

return false;

if(parents.includes(o.id))

return false;

const type=
types.find(
t=>t.id===o.typeId
);

if(!type)

return false;

if(parentLevel){

if(type.level!==parentLevel)

return false;

}

else{

if(type.level<=currentLevel)

return false;

}

return (

o.title

.toLowerCase()

.includes(text)

);

});

    
results.innerHTML=

candidates.map(o=>`

<div

class="parent-result"

data-parent="${o.id}"

>

${o.title}

</div>

`).join("");

results.style.display=

candidates.length

?

"block"

:

"none";

};

results.onclick = event=>{

const item=

event.target.closest(

".parent-result"

);

if(!item)

return;

parents.push(

item.dataset.parent

);

renderParentBlock();

searchInput.value="";

results.innerHTML="";

results.style.display="none";

};

const currentLevel =
currentType.level;

let parentLevel = null;

if(parents.length){

const first =
objects.find(

o=>

o.id===parents[0]

);

const firstType =
types.find(

t=>

t.id===first.typeId

);

parentLevel =
firstType.level;

}

const candidates =

objects.filter(o=>{

if(
o.id===object.id
)

return false;
    
    const t =
types.find(

x=>

x.id===o.typeId

);

if(!t)

return false;

if(parentLevel)

return t.level===parentLevel;

return t.level > currentLevel;

});

const id =
prompt(

"Введите ID родителя:\n\n"

+

candidates

.map(
x=>`${x.id} — ${x.title}`
)

.join("\n")

);

if(

id &&

candidates.some(
x=>x.id===id
)

){

parents.push(id);

renderParentBlock();

}

document.getElementById(

"saveObjectButton"

).onclick = async ()=>{

const newTypeId =

document.getElementById(

"objectTypeInput"

).value;

const oldType =

types.find(

t=>t.id===object.typeId

);

const newType =

types.find(

t=>t.id===newTypeId

);

let newParents =
parents;

// если уровень изменился

if(

oldType.level !== newType.level

){

const valid =

parents.every(id=>{

const p =
objects.find(
o=>o.id===id
);

const pt =
types.find(

t=>

t.id===p.typeId

);

return pt.level > newType.level;

});

if(!valid){

newParents=[];

alert(

"Уровень изменился. Родители сброшены."

);

}

}

await updateDoc(

doc(

db,

"objects",

object.id

),

{

title:

document.getElementById(

"objectTitleInput"

).value,

description:

document.getElementById(

"objectDescriptionInput"

).value,

typeId:newTypeId,

parents:newParents

}

);

onSave();

};

document.getElementById(

"cancelObjectButton"

).onclick = onSave;

};
