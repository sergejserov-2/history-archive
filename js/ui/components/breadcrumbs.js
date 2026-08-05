export function renderBreadcrumbs(parents) {

    if (!parents || parents.length === 0) {
        return "";
    }

    const city = parents[0];

    const addresses = parents.map(parent => {

        return `${parent.title}, ${parent.address}`;

    });

    let text = city.title;

    if (addresses.length > 0) {

        text += ", " + addresses.join("/");

    }

    return `
        <div class="breadcrumbs">
            ${text}
        </div>
    `;

}
