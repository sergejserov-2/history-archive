// ======================================
// Breadcrumbs
// ======================================

// ======================================
// Render
// ======================================

export function renderBreadcrumbs(
    object,
    chains = []
){

    if(!object){
        return "";
    }

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
                    existing =>
                        existing
                            .map(
                                item =>
                                    `${item.id}:${item.address ?? ""}`
                            )
                            .join("|") === key
                );

            if(!exists){
                uniqueChains.push(chain);
            }

        }
    );

    if(uniqueChains.length === 0){
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
    chain.map(item => {

        const address =
            item.address ||
            "Без адреса";

        if(!item.id){

            return `
                <span
                    class="breadcrumbs__item"
                >
                    ${address}
                </span>
            `;

        }

        return `
            <a
                class="breadcrumbs__item"
                href="object.html?id=${item.id}"
            >
                ${address}
            </a>
        `;

    });

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
