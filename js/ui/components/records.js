// ======================================
// Records component
// ======================================

export function renderRecords(

    records,

    recordTypes = [],

    ADMIN_MODE = false

) {

    const groups = [];

    // ======================================
    // Sort records
    //
    // 1. dateStart
    // 2. dateEnd
    // 3. title
    //
    // От старого к новому
    // ======================================

    const sortRecords = records =>

        [...(records ?? [])].sort(

            (a, b) => {

                const dateA =
                    a.dateStart ||
                    a.dateEnd ||
                    "";

                const dateB =
                    b.dateStart ||
                    b.dateEnd ||
                    "";

                // Записи без даты — в конец

                if(!dateA && !dateB){

                    return (
                        a.title ?? ""
                    ).localeCompare(

                        b.title ?? "",

                        "ru"

                    );

                }

                if(!dateA){

                    return 1;

                }

                if(!dateB){

                    return -1;

                }

                // От старого к новому

                const dateCompare =

                    String(dateA)
                        .localeCompare(
                            String(dateB)
                        );

                if(dateCompare !== 0){

                    return dateCompare;

                }

                // Если дата одинаковая —
                // сортируем по названию

                return (

                    a.title ?? ""

                ).localeCompare(

                    b.title ?? "",

                    "ru"

                );

            }

        );

    // ======================================
    // Render one record
    // ======================================

    function renderRecord(record){

function formatBoundary(value, prefix){

    if(!value) return "";

    let result = value;

    if(result.endsWith("-е")){

        result =
            result.slice(0, -2) +
            "-х";

    }

    if(result.startsWith("вер., ")){

        return (
            "вер., " +
            prefix +
            " " +
            result.slice(6)
        );

    }

    return prefix + " " + result;

}

        let period = "";

if(record.dateMode === "date"){

    period =
        record.date ||
        "—";

}
else{

    if(
        record.dateStart &&
        record.dateEnd
    ){

        period =
            `${record.dateStart} – ${record.dateEnd}`;

    }

    else if(record.dateStart){

        period =
            formatBoundary(
                record.dateStart,
                "с"
            );

    }

    else if(record.dateEnd){

        period =
            formatBoundary(
                record.dateEnd,
                "до"
            );

    }

    else{

        period = "—";

    }

}

        return `

        <div class="record">

            <div class="record__title">
            
               <span class="record__title-text">
                   ${record.title ?? ""}
               </span>

                ${
                ADMIN_MODE

                ?

                `

                <button

                    class="admin-button"

                    data-action="edit-record"

                    data-id="${record.id}"

                >

                    <img
                        src="icons/edit.svg"
                        class="admin-icon"
                    >

                </button>

                <button

                    class="admin-button"

                    data-action="delete-record"

                    data-id="${record.id}"

                >

                    <img
                        src="icons/delete.svg"
                        class="admin-icon"
                    >

                </button>

                `

                :

                ""

                }

            </div>

            <div class="record__description">

                ${record.description ?? ""}

            </div>

            <div class="record__date">

                ${period}

            </div>

        </div>

        `;

    }

    // ======================================
    // Group records by type
    // ======================================

    const typedRecords =

        recordTypes.map(recordType => {

            const typeRecords =

                (records ?? []).filter(

                    record => record.typeId ===
                        recordType.id

                );

            return {

                type: recordType,

                records:
                    sortRecords(typeRecords)

            };

        })

        // Показываем только типы,
        // в которых есть записи

        .filter(

            group =>
                group.records.length > 0

        );

    // ======================================
    // Records without type
    //
    // Старые записи, созданные до появления
    // recordTypes, не должны исчезнуть.
    // ======================================

    const recordsWithoutType =

        sortRecords(

            (records ?? []).filter(

                record => {

                    return !record.typeId ||

                        !recordTypes.some(

                            type =>
                                type.id ===
                                record.typeId

                        );

                }

            )

        );

    // ======================================
    // Render typed groups
    // ======================================

    typedRecords.forEach(group => {

        groups.push(`

            <div class="records__group">

                <div class="records__group-title">

                    ${group.type.title ?? ""}

                </div>

                ${

                    group.records
                        .map(renderRecord)
                        .join("")

                }

            </div>

        `);

    });

    // ======================================
    // Render records without valid type
    // ======================================

    if(recordsWithoutType.length){

        groups.push(`

            <div class="records__group records__group--untitled">

                <div class="records__group-title">

                    Без типа

                </div>

                ${

                    recordsWithoutType
                        .map(renderRecord)
                        .join("")

                }

            </div>

        `);

    }

    // ======================================
    // Add record button
    //
    // Оставляем один раз перед группами.
    // ======================================

    const addButton =

        ADMIN_MODE

        ?

        `

        <div

            class="record record--add admin-button"

            data-action="add-record"

        >

            + Добавить запись

        </div>

        `

        :

        "";

    return `

    <div class="records">

        ${addButton}

        ${groups.join("")}

    </div>

    `;

}
