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
    // getParents() уже возвращает
    // готовые полные цепочки:
    //
    // Краснохолмский район
    // → Красный Холм
    // → Улица Свободы
    // → д. 6
    //
    // Для нескольких родителей
    // возвращаются отдельные цепочки.
    // ======================================

    const chains =

        await getParents(
            object
        );

    if(
        !chains ||
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

            const key =

                chain

                    .map(

                        item =>

                            `${item.id}:${item.address ?? ""}`

                    )

                    .join("|");

            const exists =

                uniqueChains.some(

                    existing =>

                        existing

                            .map(

                                item =>

                                    `${item.id}:${item.address ?? ""}`

                            )

                            .join("|") === key

                );

            if(!exists){

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
