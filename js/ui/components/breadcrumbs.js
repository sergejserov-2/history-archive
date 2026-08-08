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
    // показываем адрес текущего объекта
    // ======================================

    if(
        !parents ||
        parents.length === 0
    ){

        if(!object.address){

            return "";

        }

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

                        ${object.address}

                    </a>

                </div>

            </nav>

        `;

    }

    // ======================================
    // Определяем ближайший уровень родителей
    // ======================================

    const nearestLevel =

        Math.min(

            ...parents

                .filter(
                    parent =>
                        parent.level !== null
                )

                .map(
                    parent =>
                        Number(parent.level)
                )

        );

    const nearestParents =

        parents.filter(

            parent =>

                Number(parent.level) ===
                nearestLevel

        );

    const chains = [];

    // ======================================
    // Для каждого ближайшего родителя
    // формируем отдельную цепочку
    // ======================================

    nearestParents.forEach(

        nearestParent => {

            const chain =

                parents.filter(

                    parent =>

                        Number(parent.level) >
                        Number(nearestParent.level)

                        ||

                        parent.id ===
                        nearestParent.id

                );

            // ==================================
            // Убираем дубли
            // ==================================

            const unique = [];

            chain.forEach(item => {

                if(
                    !unique.some(
                        existing =>
                            existing.id === item.id
                    )
                ){

                    unique.push(item);

                }

            });

            // ==================================
            // Добавляем текущий объект
            //
            // Его адрес берём из связи
            // с ближайшим родителем.
            // ==================================

            unique.push({

                id:
                    object.id,

                title:
                    object.title ?? "",

                address:
                    nearestParent.address ?? "",

                level:
                    null

            });

            chains.push(
                unique
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

    chains.forEach(chain => {

        const key =

            chain.map(
                    item =>
                        `${item.id}:${item.address ?? ""}`
                )
                .join("|");

        if(
            !uniqueChains.some(

                existing => {

                    const existingKey =

                        existing
                            .map(
                                item =>
                                    `${item.id}:${item.address ?? ""}`
                            )
                            .join("|");

                    return existingKey === key;

                }

            )
        ){

            uniqueChains.push(
                chain
            );

        }

    });

    // ======================================
    // Render
    // ======================================

    const renderedChains =

        uniqueChains.map(

            chain => {

                const parts =

                    chain

                        .filter(
                            item =>
                                item.address
                        )

                        .map(

                            item => `

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

        .filter(Boolean)

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
