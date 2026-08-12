// ======================================
// Parents editor
// ======================================

export function setupParentsEditor(root, objects, entity, parents, options = {}){
    const withAddress = options.address === true;
    const types = options.types ?? [];
    const parentsBox = root.querySelector("#entityParents");
    const searchInput = root.querySelector("#entityParentSearch");
    const resultsBox = root.querySelector("#entityParentResults");

    if(!parentsBox || !searchInput || !resultsBox) {
        return {
            getParents() {return parents;},
            clearParents() {parents.splice(0);},
            validate() {return true;}
        };
    }

    function getParentId(parent) {
        return withAddress ? parent.objectId : parent;
    }

    function getType(id) {
        return types.find(type => type.id === id);
    }

    function getParentType(parent) {
        const id = getParentId(parent);
        const object = objects.find(object => object.id === id);
        return getType(object?.typeId);
    }

    function getObjectType() {
        if(options.getTypeId) {
            return getType(options.getTypeId());
        }
        const typeId = root.querySelector("#entityType")?.value;
        return getType(typeId);
    }

    function getMaxChildLevel() {
        if(!options.children?.length) {return -Infinity;}
        
        return Math.max(
            ...options.children.map(child => {
                const type = getType(child.typeId);
                return type?.level ?? -Infinity;
            })
        );
    }

    function isObjectParentAllowed(parent) {
        if(parent.id === entity?.id) {return false;}
        const parentType = getType(parent.typeId);
        if(!parentType) {return false;}
        const objectType = getObjectType();
        if(!objectType) {return false;}
        if(parents.length > 0) {
            const firstParentType = getParentType(parents[0]);
            if(!firstParentType) {return false;}
            return (
                Number(parentType.level) === Number(firstParentType.level)
            );
        }

        return (
            Number(parentType.level) > Number(objectType.level)
        );
    }

    function isParentAllowed(parent) {
        if(parent.id === entity?.id) {return false;}
        if(withAddress) {return isObjectParentAllowed(parent);}
        return true;
    }

    function validateObjectLevels() {
        if(!withAddress) {return true;}
        const objectType = getObjectType();
        if(!objectType) {return true;}
        const maxChildLevel = getMaxChildLevel();
        if(maxChildLevel === -Infinity) {return true;}
        if(Number(objectType.level) <= Number(maxChildLevel)
        ) {
            alert("Тип объекта должен быть выше уровня всех его детей.");
            return false;
        }
        return true;
    }

    function validateParents() {
        if(parents.length > 0) {return true;}
        alert(
            options.requiredMessage ?? "Нужен хотя бы один родитель"
        );
        return false;
    }

    function renderParents() {
        parentsBox.innerHTML =
            parents.map(parent => {
                const id = getParentId(parent);
                const object = objects.find(object => object.id === id);
                return renderParentItemHTML(parent, object, withAddress);
            }).join("");
    }

    function clearSearch() {
        searchInput.value = "";
        resultsBox.innerHTML = "";
    }

    function renderResults(text) {
        if(!text) {
            resultsBox.innerHTML = "";
            return;
        }

        resultsBox.innerHTML =
            objects
                .filter(object => {
                    if(object.id === entity?.id) {return false;}
                    if(
                        parents.some(parent => getParentId(parent) === object.id)
                    ) {return false;}
                    if(!isParentAllowed(object)) {return false;}
                    if(
                        options.filter && !options.filter(object, parents)
                    ) {return false;}

                    return (object.title ?? "").toLowerCase().includes(text);
                }).slice(0, 20).map(object => `
                    <div
                        class="parent-result"
                        data-id="${object.id}"
                    >
                        ${object.title}
                    </div>
                `).join("");
    }

    parentsBox.onclick = event => {
        const id = event.target.dataset.remove;
        if(!id) {return;}
        parents =
            parents.filter(parent => getParentId(parent) !== id);
        renderParents();
    };

    if(withAddress) {
        parentsBox.oninput = event => {
            if(
                !event.target.classList.contains("parent-address")
            ) {return;}
            const parent =
                parents.find(
                    parent => parent.objectId === event.target.dataset.id
                );
            if(parent) {parent.address = event.target.value;}
        };
    }

    searchInput.oninput = () => {
        renderResults(searchInput.value.toLowerCase().trim());
    };

    resultsBox.onclick = event => {
        const item = event.target.closest(".parent-result");
        if(!item) {return;}
        const id = item.dataset.id;
        if(withAddress) {parents.push({objectId: id, address: ""});
        } else {parents.push(id);}

        renderParents();
        clearSearch();
    };

    if(
        withAddress && options.typeSelector
    ) {
        const typeSelect = root.querySelector("#entityType");
        if(typeSelect) {
            typeSelect.onchange = () => {
                const newType = getObjectType();
                if(!newType) {return;}
                const firstParent = parents[0];
                if(!firstParent) {return;}
                const parentType = getParentType(firstParent);
                if(
                    parentType && Number(newType.level) >= Number(parentType.level)
                ) {
                    alert(
                        "Выбранный тип выше или равен уровню родителя. Родители будут сброшены."
                    );

                    parents.splice(0);

                    renderParents();
                    clearSearch();
                }
            };
        }
    }

    renderParents();

    return {
        getParents() {return parents;},
        clearParents() {
            parents.splice(0);
            renderParents();
            clearSearch();
        },
        validate() {
            if(!validateObjectLevels()) {return false;}
            return validateParents();
        }
    };
}

// ======================================
// Render
// ======================================

export function renderParentsEditorHTML() {
    return `
        <div class="parents-group">
            <div id="entityParents"></div>
            <input
                id="entityParentSearch"
                placeholder="Начните вводить имя"
            >
            <div id="entityParentResults"></div>
        </div>
    `;
}

export function renderParentItemHTML(parent, object, withAddress) {
    const id = withAddress ? parent.objectId : parent;
    const title = object?.title ?? id;

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
            ${withAddress ? `
                <input
                    class="parent-address"
                    data-id="${id}"
                    value="${parent.address ?? ""}"
                    placeholder="Адрес"
                >
            ` : ""}
        </div>
    `;
}
