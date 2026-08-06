// ======================================
// Object editor
// Part 1 — Render
// ======================================

export function renderObjectEditor(

    object,

    types,

    objects,

    photos

) {

    const currentType =

        types.find(

            t => t.id === object.typeId

        );

    return `

    <div class="object-editor">

        <!-- =========================
             Cover photo
        ========================== -->

        <label>

            Обложка

            <select id="objectCoverInput">

                <option value="">

                    Без фотографии

                </option>

                ${
                    photos.map(photo => `

                        <option

                            value="${photo.id}"

                            ${
                                photo.id === object.coverPhotoId

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

        <!-- =========================
             Title
        ========================== -->

        <label>

            Название

            <input

                id="objectTitleInput"

                value="${object.title ?? ""}"

            >

        </label>

        <!-- =========================
             Description
        ========================== -->

        <label>

            Описание

            <textarea

                id="objectDescriptionInput"

            >${object.description ?? ""}</textarea>

        </label>

        <!-- =========================
             Type
        ========================== -->

        <label>

            Тип

            <select

                id="objectTypeInput"

            >

            ${
                types.map(type => `

                    <option

                        value="${type.id}"

                        ${
                            type.id === object.typeId

                            ?

                            "selected"

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

        <!-- =========================
             Parents
        ========================== -->

        <label>

            Родители

            <div

                id="parentsContainer"

            >

                ${

                    renderParentList(

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

            ></div>

        </div>

        <!-- =========================
             Buttons
        ========================== -->

        <div class="object-editor__buttons">

            <button

                id="saveObjectButton"

            >

                Сохранить

            </button>

            <button

                id="cancelObjectButton"

            >

                Отмена

            </button>

        </div>

    </div>

    `;

}

// ======================================
// Parent list
// ======================================

function renderParentList(

    object,

    objects

) {

    if (

        !object.parents ||

        object.parents.length === 0

    ) {

        return `

            <div class="parents-empty">

                Нет родителей

            </div>

        `;

    }

    return object.parents.map(parent => {

        const obj =

            objects.find(

                o =>

                o.id === parent.objectId

            );

        return `

        <div class="parent-item">

            <div class="parent-item__title">

                ${obj?.title ?? parent.objectId}

            </div>

            <input

                class="parent-address-input"

                data-parent="${parent.objectId}"

                value="${parent.address ?? ""}"

            >

            <button

                data-remove-parent="${parent.objectId}"

            >

                ×

            </button>

        </div>

        `;

    }).join("");

}

// ======================================
// Object editor
// Part 2 — Interaction
// ======================================

export function initObjectEditor(

    object,

    types,

    objects,

    photos,

    onSave

) {

    let parents =

        JSON.parse(

            JSON.stringify(

                object.parents ?? []

            )

        );

    let coverPhotoId =

        object.coverPhotoId ?? null;

    const searchInput =

        document.getElementById(

            "parentSearchInput"

        );

    const searchResults =

        document.getElementById(

            "parentSearchResults"

        );

    const parentsContainer =

        document.getElementById(

            "parentsContainer"

        );

    // ==================================
    // Render parents from state
    // ==================================

    function updateParentsUI(){

        parentsContainer.innerHTML =

            parents.map(parent => {

                const obj =

                    objects.find(

                        o =>

                        o.id === parent.objectId

                    );

                return `

                <div class="parent-item">

                    <div>

                        ${

                            obj?.title ??

                            parent.objectId

                        }

                    </div>

                    <input

                        class="parent-address-input"

                        data-parent="${parent.objectId}"

                        value="${parent.address ?? ""}"

                    >

                    <button

                        data-remove-parent="${parent.objectId}"

                    >

                        ×

                    </button>

                </div>

                `;

            }).join("");

    }

    // ==================================
    // Remove parent
    // ==================================

    document.addEventListener(

        "click",

        event => {

            const id =

                event.target.dataset.removeParent;

            if(!id){

                return;

            }

            parents =

                parents.filter(

                    p =>

                    p.objectId !== id

                );

            updateParentsUI();

        }

    );

    // ==================================
    // Address change
    // ==================================

    document.addEventListener(

        "input",

        event => {

            if(

                !event.target.classList.contains(

                    "parent-address-input"

                )

            ){

                return;

            }

            const id =

                event.target.dataset.parent;

            const parent =

                parents.find(

                    p =>

                    p.objectId === id

                );

            if(parent){

                parent.address =

                    event.target.value;

            }

        }

    );

    // ==================================
    // Parent search
    // ==================================

    searchInput.oninput = () => {

        const text =

            searchInput.value

            .trim()

            .toLowerCase();

        if(!text){

            searchResults.innerHTML="";

            return;

        }

        const currentType =

            types.find(

                t =>

                t.id ===

                document

                .getElementById(

                    "objectTypeInput"

                )

                .value

            );

        const currentLevel =

            currentType?.level;

        let parentLevel = null;

        if(parents.length){

            const first =

                objects.find(

                    o =>

                    o.id ===

                    parents[0].objectId

                );

            const firstType =

                types.find(

                    t =>

                    t.id === first?.typeId

                );

            parentLevel =

                firstType?.level;

        }

        const candidates =

            objects.filter(o => {

                if(

                    o.id === object.id

                ){

                    return false;

                }

                if(

                    parents.some(

                        p =>

                        p.objectId === o.id

                    )

                ){

                    return false;

                }

                const type =

                    types.find(

                        t =>

                        t.id === o.typeId

                    );

                if(!type){

                    return false;

                }

                if(parentLevel){

                    if(

                        type.level !== parentLevel

                    ){

                        return false;

                    }

                }

                else{

                    if(

                        type.level <= currentLevel

                    ){

                        return false;

                    }

                }

                return o.title

                    .toLowerCase()

                    .includes(text);

            });

        searchResults.innerHTML =

            candidates.map(o => `

                <div

                    class="parent-search-item"

                    data-parent="${o.id}"

                >

                    ${o.title}

                </div>

            `)

            .join("");

    };

    // ==================================
    // Select parent
    // ==================================

    searchResults.onclick = event => {

        const item =

            event.target.closest(

                ".parent-search-item"

            );

        if(!item){

            return;

        }

        parents.push({

            objectId:

                item.dataset.parent,

            address:

                ""

        });

        updateParentsUI();

        searchInput.value="";

        searchResults.innerHTML="";

    };

// ==================================
    // Cover photo change
    // ==================================

    document.getElementById(

        "objectCoverInput"

    ).onchange = event => {

        coverPhotoId =

            event.target.value || null;

    };

    // ==================================
    // Save
    // ==================================

    document.getElementById(

        "saveObjectButton"

    ).onclick = async () => {

        // ------------------------------
        // Parents check
        // ------------------------------

        if(

            parents.length === 0

        ){

            alert(

                "Необходимо выбрать хотя бы одного родителя."

            );

            return;

        }

        // ------------------------------
        // Type check
        // ------------------------------

        const newTypeId =

            document.getElementById(

                "objectTypeInput"

            ).value;

        const oldType =

            types.find(

                t =>

                t.id === object.typeId

            );

        const newType =

            types.find(

                t =>

                t.id === newTypeId

            );

        let newParents =

            [...parents];

        // уровень изменился

        if(

            oldType?.level !== newType?.level

        ){

            newParents = [];

            alert(

                "Уровень объекта изменился. Родители сброшены. Выберите их заново."

            );

            updateParentsUI();

            return;

        }

        // ------------------------------
        // Children restriction
        // ------------------------------

        if(

            object.childrenCount &&

            newType.level < oldType.level

        ){

            alert(

                "Объект с дочерними элементами нельзя переместить ниже уровня."

            );

            return;

        }

        // ------------------------------
        // Save object
        // ------------------------------

        await updateDoc(

            doc(

                db,

                "objects",

                object.id

            ),

            {

                title:

                    document

                    .getElementById(

                        "objectTitleInput"

                    )

                    .value,

                description:

                    document

                    .getElementById(

                        "objectDescriptionInput"

                    )

                    .value,

                typeId:

                    newTypeId,

                coverPhotoId:

                    coverPhotoId,

                parents:

                    newParents

            }

        );

        onSave();

    };

    // ==================================
    // Cancel
    // ==================================

    document.getElementById(

        "cancelObjectButton"

    ).onclick = () => {

        onSave();

    };

    
}
