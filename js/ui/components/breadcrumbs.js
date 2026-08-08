// ======================================
// Breadcrumbs
// ======================================

import {
    getObject
}
from "../../api/objects.js";

// ======================================
// Build all chains
// ======================================

async function buildAllChains(object){

    if(!object){

        return [];

    }

    // ======================================
    // Root object
    // ======================================

    if(
        !object.parents ||
        object.parents.length === 0
    ){

        return [[

            {
                id:
                    object.id,

                title:
                    object.title ?? "",

                // У корневого объекта
                // адреса нет
                address:""
            }

        ]];

    }

    const result = [];

    // ======================================
    // Для каждого родителя строим
    // отдельную цепочку
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

        const parentChains =
            await buildAllChains(
                parentObject
            );

        for(
            const chain
            of parentChains
        ){

            result.push(

                [

                    ...chain,

                    {

                        id:
                            object.id,

                        title:
                            object.title ?? "",

                        // Адрес берём именно
                        // из связи с этим родителем
                        address:
                            parent.address ?? ""
                    }

                ]

            );

        }

    }

    return result;

}

// ======================================
// Render
// ======================================

export async function renderBreadcrumbs(

    object

){

    if(!object){

        return "";

    }

    const chains =
        await buildAllChains(
            object
        );

    if(
        chains.length === 0
    ){

        return "";

    }

    // ======================================
    // Убираем одинаковые цепочки
    // ======================================

    const uniqueChains = [];

    for(
        const chain
        of chains
    ){

        const key =

            chain
                .map(

                    item =>

                        `${item.id}:${item.address}`

                )
                .join("|");

        if(
            !uniqueChains.some(

                existing =>

                    existing
                        .map(

                            item =>

                                `${item.id}:${item.address}`

                        )
                        .join("|") === key

            )
        ){

            uniqueChains.push(
                chain
            );

        }

    }

    // ======================================
    // Render chains
    // ======================================

    const renderedChains =

        uniqueChains

            .map(

                chain => {

                    const parts =

                        chain.map(

                            item => {

                                // У корневого объекта
                                // нет адреса — используем название.
                                // У остальных используем адрес
                                // связи с родителем.

                                const label =

                                    item.address ||
                                    item.title ||
                                    "";

                                return `

                                    <a

                                        class="breadcrumbs__item"

                                        href="object.html?id=${item.id}"

                                    >

                                        ${label}

                                    </a>

                                `;

                            }

                        );

                    return `

                        <div class="breadcrumbs__chain">

                            ${
                                parts.join(`

                                    <span class="breadcrumbs__separator">

                                        →

                                    </span>

                                `)
                            }

                        </div>

                    `;

                }

            )

            .join("");

    if(!renderedChains){

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
