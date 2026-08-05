// ======================================
// Breadcrumbs
// ======================================

export function renderBreadcrumbs(object, parents) {

    if (!object || !parents || parents.length === 0) {

        return "";

    }

    // Два уровня выше текущего объекта
    const level1 = object.level + 1;

    const level2 = object.level + 2;

    let upper = parents.filter(parent =>

        parent.level === level1 ||

        parent.level === level2

    );

    // Убираем дубли после нескольких веток (угловой объект)
    upper = upper.filter((item, index, array) => {

        return index === array.findIndex(obj =>

            obj.id === item.id

        );

    });

    // Группируем по уровням
    const farLevel = upper.filter(item =>
        item.level === level2
    );

    const nearLevel = upper.filter(item =>
        item.level === level1
    );

    const parts = [];

    // Более высокий уровень
    farLevel.forEach(item => {

        parts.push(item.title);

    });

    // Ближайший уровень с адресом
    nearLevel.forEach(item => {

        if (item.address) {

            parts.push(
                `${item.title}, ${item.address}`
            );

        } else {

            parts.push(item.title);

        }

    });

    return `
        <div class="breadcrumbs">
            ${parts.join(", ")}
        </div>
    `;

}
