// ======================================
// Breadcrumbs
// ======================================

export function renderBreadcrumbs(type, parents) {

    if (!type || !parents || parents.length === 0) {

        return "";

    }

    const currentLevel = Number(
        type.level
    );

    // Два уровня выше текущего объекта
    const nearLevel = currentLevel + 1;

    const farLevel = currentLevel + 2;

    let upper = parents.filter(parent =>

        parent.level === nearLevel ||

        parent.level === farLevel

    );

    // Убираем дубли (актуально для угловых домов)
    upper = upper.filter((item, index, array) => {

        return index === array.findIndex(obj =>

            obj.id === item.id

        );

    });

    // Сначала дальний уровень (например Красный Холм),
    // потом ближний (улица)
    const far = upper.filter(item =>
        item.level === farLevel
    );

    const near = upper.filter(item =>
        item.level === nearLevel
    );

    const parts = [];

    far.forEach(item => {

        parts.push(
            item.title
        );

    });

    near.forEach(item => {

        if (item.address) {

            parts.push(
                `${item.title}, ${item.address}`
            );

        } else {

            parts.push(
                item.title
            );

        }

    });

    return `
        <div class="breadcrumbs">
            ${parts.join(", ")}
        </div>
    `;

}
