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
    // показываем только текущий объект
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

                        ${object.title ?? ""}

                    </a>

                </div>

            </nav>

        `;

    }

    // ======================================
    // Группируем родителей по цепочкам
    //
    // getParents() возвращает родителей
    // от дальнего к ближнему.
    //
    // Для нескольких родителей текущего
    // объекта строим отдельные цепочки.
    // ======================================

    const chains = [];

    const uniqueParentIds = [];

    parents.forEach(parent => {

        if(
            !uniqueParentIds.includes(
                parent.id
            )
        ){

            uniqueParentIds.push(
                parent.id
            );

        }

    });

    // ======================================
    // Если у текущего объекта несколько
    // родителей одного уровня —
    // строим цепочку для каждого.
    //
    // На этом этапе используем родителей,
    // которые уже подготовлены getParents().
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

    // ======================================
    // Для каждого ближайшего родителя
    // формируем путь.
    // ======================================

    nearestParents.forEach(
        nearestParent => {

            const chain =

                parents.filter(

                    parent =>

                        parent.level >
                        nearestParent.level

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
    // Если почему-то цепочки не построились
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

            chain
                .map(
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

                    chain.map(

                        item => {

                            /*
                             * Для корневого объекта
                             * адрес пустой — показываем title.
                             *
                             * Для остальных:
                             * показываем именно address.
                             *
                             * Если это текущий объект,
                             * у него тоже используем address
                             * связи с ближайшим родителем.
                             */

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
