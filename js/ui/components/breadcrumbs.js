// ======================================
// Breadcrumbs
// ======================================

import {
    getObject,
    getType
}
from "../../api/objects.js";

// ======================================
// Build chain
// ======================================

async function buildChain(objectId){

    const object =
        await getObject(
            objectId
        );

    if(!object){

        return [];

    }

    const current = {

        id:
            object.id,

        address:
            object.address ?? ""

    };

    // ======================================
    // Root object
    // ======================================

    if(
        !object.parents ||
        object.parents.length === 0
    ){

        return [
            current
        ];

    }

    const chains = [];

    for(
        const parent
        of object.parents
    ){

        const parentChain =
            await buildChain(
                parent.objectId
            );

        chains.push(

            [
                ...parentChain,

                {

                    id:
                        object.id,

                    address:
                        parent.address ?? ""

                }

            ]

        );

    }

    // Берём первую цепочку.
    // Для нескольких родителей отдельные цепочки
    // будут обработаны renderBreadcrumbs().

    return chains[0] ?? [];

}

// ======================================
// Build all chains
// ======================================

async function buildAllChains(object){

    if(!object){

        return [];

    }

    if(
        !object.parents ||
        object.parents.length === 0
    ){

        return [[

            {

                id:
                    object.id,

                address:
                    object.address ?? ""

            }

        ]];

    }

    const result = [];

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
    // Render
    // ======================================

    const renderedChains =

        uniqueChains.map(chain => {

                const parts =

                    chain
                        .filter(
                            item =>
                                item.address
                        )
                        .map(

                            (item, index) => `

                                <a
                                    class="breadcrumbs__item"
                                    href="object.html?id=${item.id}"
                                >
                                    ${item.address}
                                </a>

                            `

                        );

                if(
                    parts.length === 0
                ){

                    return "";

                }

                return `

                    <div class="breadcrumbs__chain">

                        ${parts.join(`

                            <span class="breadcrumbs__separator">
                                →
                            </span>

                        `)}

                    </div>

                `;

            }

        )
        .filter(Boolean)
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
