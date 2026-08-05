// ======================================
// Breadcrumbs / Address component
// ======================================

export function renderBreadcrumbs(parents) {

    if (!parents || parents.length === 0) {

        return "";

    }

    const parts = parents.map(parent => {

        if (parent.address) {

            return `${parent.title}, ${parent.address}`;

        }

        return parent.title;

    });

    return `

        <div class="object__address">

            ${parts.join(" → ")}

        </div>

    `;

}
