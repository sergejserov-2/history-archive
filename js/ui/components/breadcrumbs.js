// ======================================
// Breadcrumbs
// ======================================

export function renderBreadcrumbs(parents) {

    if (!parents || parents.length === 0) {

        return "";

    }

    // Населённый пункт
    const place = parents.find(parent =>

        parent.level === 3

    );

    if (!place) {

        return "";

    }

    // Адресные уровни
    const addresses = parents.filter(parent =>

        parent.level === 2

    );

    let text = place.title;

    if (addresses.length > 0) {

        text += ", " +

            addresses.map(address => {

                return `${address.title}, ${address.address}`;

            }).join("/");

    }

    return `
        <div class="breadcrumbs">
            ${text}
        </div>
    `;

}
