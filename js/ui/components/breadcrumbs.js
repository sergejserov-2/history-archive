chain => {

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
