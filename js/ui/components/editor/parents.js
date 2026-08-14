// ======================================
// Parents editor
// ======================================

import {createDropdown} from "../dropdown.js";

export function setupParentsEditor(
    root,
    objects,
    entity,
    parents,
    options = {}
){

    const withAddress = options.address === true;
    const types = options.types ?? [];

    const parentsBox =
        root.querySelector("#entityParents");

    const searchInput =
        root.querySelector("#entityParentSearch");

    if(!parentsBox || !searchInput){

        return {

            getParents(){
                return parents;
            },

            clearParents(){
                parents.splice(0);
            },

            validate(){
                return true;
            }

        };

    }

    const parentDropdown =
        createDropdown({
            maxHeight: 256
        });

    // ======================================
    // Helpers
    // ======================================

    function getParentId(parent){

        return withAddress
            ? parent.objectId
            : parent;

    }

    function getType(id){

        return types.find(
            type => type.id === id
        );

    }

    function getParentType(parent){

        const id =
            getParentId(parent);

        const object =
            objects.find(
                object => object.id === id
            );

        return getType(
            object?.typeId
        );

    }

    function getObjectType(){

        if(options.getTypeId){

            return getType(
                options.getTypeId()
            );

        }

        return null;

    }

    function getMaxChildLevel(){

        if(!options.children?.length){

            return -Infinity;

        }

        return Math.max(
            ...options.children.map(child => {

                const type =
                    getType(child.typeId);

                return type?.level ?? -Infinity;

            })
        );

    }

    // ======================================
    // Parent validation
    // ======================================

    function isObjectParentAllowed(parent){

        if(parent.id === entity?.id){

            return false;

        }

        const parentType =
            getType(parent.typeId);

        if(!parentType){

            return false;

        }

        const objectType =
            getObjectType();

        if(!objectType){

            return false;

        }

        // Если родитель уже выбран,
        // новый родитель должен быть
        // того же уровня.

        if(parents.length > 0){

            const firstParentType =
                getParentType(
                    parents[0]
                );

            if(!firstParentType){

                return false;

            }

            return (
                Number(parentType.level) ===
                Number(firstParentType.level)
            );

        }

        // Первый родитель должен быть
        // уровнем выше объекта.

        return (
            Number(parentType.level) >
            Number(objectType.level)
        );

    }

    function isParentAllowed(parent){

        if(parent.id === entity?.id){

            return false;

        }

        if(withAddress){

            return isObjectParentAllowed(
                parent
            );

        }

        return true;

    }

    function validateObjectLevels(){

        if(!withAddress){

            return true;

        }

        const objectType =
            getObjectType();

        if(!objectType){

            return true;

        }

        const maxChildLevel =
            getMaxChildLevel();

        if(maxChildLevel === -Infinity){

            return true;

        }

        if(
            Number(objectType.level) <=
            Number(maxChildLevel)
        ){

            alert(
                "Тип объекта должен быть выше уровня всех его детей."
            );
            return false;

        }

        return true;

    }

    function validateParents(){

        if(parents.length > 0){

            return true;

        }

        alert(
            options.requiredMessage ??
            "Нужен хотя бы один родитель"
        );

        return false;

    }

    // ======================================
    // Render selected parents
    // ======================================

    function renderParents(){

        parentsBox.innerHTML =
            parents
                .map(parent => {

                    const id =
                        getParentId(parent);

                    const object =
                        objects.find(
                            object => object.id === id
                        );

                    return renderParentItemHTML(
                        parent,
                        object,
                        withAddress
                    );

                })
                .join("");

    }

    // ======================================
    // Search
    // ======================================

    function clearSearch(){

        searchInput.value = "";

        parentDropdown.close();

    }

    function renderResults(text){

        if(!text){

            parentDropdown.close();

            return;

        }

        const candidates =
    objects
        .filter(object => {

            if(object.id === entity?.id){
                return false;
            }

            if(
                parents.some(
                    parent =>
                        getParentId(parent) === object.id
                )
            ){
                return false;
            }

            if(!isParentAllowed(object)){
                return false;
            }

            if(
                options.filter &&
                !options.filter(object, parents)
            ){
                return false;
            }

            return (
                object.title ?? ""
            )
                .toLowerCase()
                .includes(text);

        });

        // Нет результатов.

        if(candidates.length === 0){

            parentDropdown.close();

            return;

        }

        parentDropdown.setItems(

            candidates.map(object => ({
                id: object.id,
                title: object.title ?? ""
            })),

            {

                onSelect(item){

                    const id =
                        item.id;

                    if(withAddress){

                        parents.push({
                            objectId: id,
                            address: ""
                        });

                    }
                    else{

                        parents.push(id);

                    }

                    renderParents();

                    clearSearch();

                }

            }

        );

        parentDropdown.open(
            searchInput
        );

    }

    // ======================================
    // Events
    // ======================================

    parentsBox.onclick =
        event => {

            const id =
                event.target.dataset.remove;

            if(!id){

                return;

            }

            parents =
                parents.filter(
                    parent =>
                        getParentId(parent) !== id
                );

            renderParents();

        };

    if(withAddress){

        parentsBox.oninput =
            event => {

                if(
                    !event.target.classList.contains(
                        "parent-address"
                    )
                ){

                    return;

                }

                const parent =
                    parents.find(
                        parent =>
                            parent.objectId ===
                            event.target.dataset.id
                    );

                if(parent){

                    parent.address =
                        event.target.value;

                }

            };

    }

    searchInput.oninput =
        () => {

            renderResults(
                searchInput.value
                    .toLowerCase()
                    .trim()
            );

        };

    // ======================================
    // Type warning
    // ======================================

    if(
        withAddress &&
        options.typeSelector
    ){

        const typeSelect =
            root.querySelector(
                "#entityType"
            );

        if(typeSelect){

            typeSelect.addEventListener(
                "typewarning",
                () => {

                    parents.splice(0);

                    renderParents();

                    clearSearch();

                }
            );

        }

    }

    // ======================================
    // Initial render
    // ======================================

    renderParents();

    // ======================================
    // Public API
    // ======================================

    return {

        getParents(){

            return parents;

        },

        clearParents(){

            parents.splice(0);

            renderParents();

            clearSearch();

        },

        validate(){

            if(
                !validateObjectLevels()
            ){

                return false;

            }

            return validateParents();

        }

    };

}

// ======================================
// Render
// ======================================

export function renderParentsEditorHTML(){

    return `
        <div class="parents-group">

            <div id="entityParents"></div>

            <input
                id="entityParentSearch"
                placeholder="Начните вводить имя"
            >

        </div>
    `;

}

export function renderParentItemHTML(
    parent,
    object,
    withAddress
){

    const id =
        withAddress
            ? parent.objectId
            : parent;

    const title =
        object?.title ?? id;

    return `
        <div class="parent-item">

            <div class="parent-badge">

                <span class="parent-title">
                    ${title}
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
                    ? `
                        <input
                            class="parent-address"
                            data-id="${id}"
                            value="${parent.address ?? ""}"
                            placeholder="Адрес"
                        >
                    `
                    : ""
            }

        </div>
    `;

}
