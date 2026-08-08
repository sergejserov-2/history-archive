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
    // Получаем всех родителей
    // ======================================

    const parents =

        await getParents(
            object
        );

    // ======================================
    // Если родителей нет —
    // показываем сам объект
    // ======================================

    if(
        !parents ||
        parents.length === 0
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

    // ======================================
    // Находим ближайший уровень родителей
    // ======================================

    const levels =

        parents

            .filter(

                parent =>

                    parent.level !== null &&
                    parent.level !== undefined

            )

            .map(

                parent =>

                    Number(parent.level)

            );

    if(
        levels.length === 0
    ){

        return "";

    }

    const nearestLevel =

        Math.min(
            ...levels
        );

    const nearestParents =

        parents.filter(

            parent =>

                Number(parent.level) ===
                nearestLevel

        );

    const chains = [];

    // ======================================
    // Строим цепочку для каждого ближайшего
    // родителя
    // ======================================

    nearestParents.forEach(

        nearestParent => {

            const chain =

                parents.filter(

                    parent =>

                        Number(parent.level) >=
                        Number(nearestParent.level)

                );

            // ==================================
            // Добавляем текущий объект
            //
            // Его адрес берём из связи
            // с ближайшим родителем.
            // ==================================

            chain.push({

                id:
                    object.id,

                address:
                    nearestParent.address || "",

                level:
                    null

            });

            // ==================================
            // Оставляем все элементы цепочки.
            // Пустой адрес будет отображён
            // как "Без адреса".
            // ==================================

            chains.push(
                chain
            );

        }

    );

    // ======================================
    // Если цепочки не построились
    // ======================================

    if(
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

            if(

                !uniqueChains.some(

                    existing =>

                        existing

                            .map(item =>

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

        uniqueChains.map(

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

        ).join("");

    return `

        <nav

            class="breadcrumbs"

            aria-label="Навигация по объектам"

        >

            ${renderedChains}

        </nav>

    `;

}
