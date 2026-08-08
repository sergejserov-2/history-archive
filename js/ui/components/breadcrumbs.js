// ======================================
// Breadcrumbs
// ======================================

import {
    getObject,
    getParents
}
from "../../api/objects.js";

// ======================================
// Render
// ======================================

export async function renderBreadcrumbs(

    object

){

    if(!object){

        return "";

    }

    // ======================================
    // Корневой объект
    // ======================================

    if(
        !object.parents ||
        object.parents.length === 0
    ){

        return `

            <nav
                class="breadcrumbs"
                aria-label="Навигация по объектам"
            >

                <div class="breadcrumbs__chain">

                    <a
                        class="breadcrumbs__item"
                        href="object.html?id=${object.id}"
                    >

                        ${object.address || "Без адреса"}

                    </a>

                </div>

            </nav>

        `;

    }

    const chains = [];

    // ======================================
    // Для каждого родителя текущего объекта
    // строим отдельную цепочку
    // ======================================

    for(
        const parent
        of object.parents
    ){

        const parentObject =

            await getObject(
                parent.objectId
            );

        if(!parentObject){

            continue;

        }

        // ==================================
        // Получаем цепочку самого родителя.
        //
        // Новый getParents() уже возвращает
        // адреса объектов, включая корневой.
        // ==================================

        const parentChain =

            await getParents(
                parentObject
            );

        // ==================================
        // Добавляем текущий объект.
        //
        // Его адрес берём из связи
        // текущий объект → этот родитель.
        // ==================================

        const chain = [

            ...parentChain,

            {

                id:
                    object.id,

                address:
                    parent.address ?? ""

            }

        ];

        chains.push(
            chain
        );

    }

    if(
        chains.length === 0
    ){

        return "";

    }

    // ======================================
    // Убираем полностью одинаковые цепочки
    // ======================================

    const uniqueChains = [];

    chains.forEach(

        chain => {

            const key =

                chain

                    .map(

                        item =>

                            `${item.id}:${item.address ?? ""}`

                    )

                    .join("|");

            if(

                !uniqueChains.some(

                    existing =>

                        existing

                            .map(

                                item =>

                                    `${item.id}:${item.address ?? ""}`

                            )

                            .join("|") === key

                )

            ){

                uniqueChains.push(
                    chain
                );

            }

        }

    );

    // ======================================
    // Render
    // ======================================

    const renderedChains =

        uniqueChains

            .map(

                chain => {

                    const parts =

                        chain.map(

                            item => `

                                <a

                                    class="breadcrumbs__item"

                                    href="object.html?id=${item.id}"

                                >

                                    ${item.address || "Без адреса"}

                                </a>

                            `
                        );

                    return `

                        <div class="breadcrumbs__chain">

                            ${

                                parts.join(`

                                    <span
                                        class="breadcrumbs__separator"
                                    >
                                        →
                                    </span>

                                `)

                            }

                        </div>

                    `;

                }

            )

            .join("");

    if(
        !renderedChains
    ){

        return "";

    }

    return `

        <nav

            class="breadcrumbs"

            aria-label="Навигация по объектам"

        >

            ${renderedChains}

        </nav>

    `;

}
