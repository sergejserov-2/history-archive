// ======================================
// Children component
// ======================================

export function renderChildren(children) {

    if (!children || children.length === 0) {

        return "";

    }

    return `

        <div class="children-list">

            ${children.map(child => `

                <article class="child-card">

                    <div class="child-card__image">

                        Фото

                    </div>

                    <div class="child-card__info">

                        <h3>

                            ${child.title}

                        </h3>

                        <p>

                            ${child.description ?? ""}

                        </p>

                    </div>

                </article>

            `).join("")}

        </div>

    `;

}
