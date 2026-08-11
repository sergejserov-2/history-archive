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

    function getParentId(parent){

        return withAddress
            ? parent.objectId
            : parent;

    }

    function renderParents(){

        parentsBox.innerHTML =

            parents

                .map(parent=>{

                    const id =
                        getParentId(parent);

                    const obj =
                        objects.find(
                            o =>
                                o.id === id
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

                    p =>
                        p.objectId ===
                        e.target.dataset.id

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

            resultsBox.innerHTML =
                "";

            return;

        }

        resultsBox.innerHTML =

            objects

                .filter(o=>{

                    if(
                        o.id === entity?.id
                    ){

                        return false;

                    }

                    const exists =

                        parents.some(

                            parent =>
                                getParentId(parent) ===
                                o.id);

                    if(exists){

                        return false;

                    }

                    if(
                        options.filter &&
                        !options.filter(
                            o,
                            parents
                        )
                    ){

                        return false;

                    }

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
