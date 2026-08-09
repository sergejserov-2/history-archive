// ======================================
// Breadcrumbs
// ======================================

import {
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
    // getParents() возвращает:
    //
    // [
    //     [
    //         { id, address, level },
    //         { id, address, level },
    //         ...
    //     ],
    //
    //     [
    //         { id, address, level },
    //         ...
    //     ]
    // ]
    //
    // То есть каждая цепочка уже полностью готова.
    // ======================================

    const chains =

        await getParents(
            object
        );

    if(
        !Array.isArray(chains) ||
        chains.length === 0
    ){

        return "";

    }

    // ======================================
    // Убираем одинаковые цепочки
    // ======================================

    const uniqueChains = [];

    chains.forEach(

        chain => {

            if(
                !Array.isArray(chain) ||
                chain.length === 0
            ){

                return;

            }

            const key =

                chain
                    .map(

                        item =>

                            `${item.id}:${item.address ?? ""}`

                    )
                    .join("|");

            const exists =

                uniqueChains.some(

                    existing => {

                        const existingKey =

                            existing
                                .map(

                                    item =>

                                        `${item.id}:${item.address ?? ""}`

                                )
                                .join("|");

                        return (
                            existingKey === key
                        );

                    }

                );

            if(!exists){

                uniqueChains.push(
                    chain
                );

            }

        }

    );

    if(
        uniqueChains.length === 0
    ){

        return "";

    }

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

                                    ${
                                        item.address ||
                                        "Без адреса"
                                    }

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

    // ======================================
    // Final
    // ======================================

    return `

        <nav

            class="breadcrumbs"

            aria-label="Навигация по объектам"

        >

            ${renderedChains}

        </nav>

    `;

}
