import {
    renderMentions,
    getSubjectHref
} from "./mentionLink.js";

import {
    renderEntityList
} from "./entityList.js";

import {
    adminEdit,
    adminDelete,
    adminAdd
} from "./adminButtons.js";

export function renderRecords(
    records,
    recordTypes=[],
    subjects=[]
){

    function formatBoundary(
        value,
        prefix
    ){

        if(!value)
            return "";

        let result=value;

        if(result.endsWith("-е"))
            result=result.slice(0,-2)+"-х";

        if(result.startsWith("вер., "))
            return "вер., "+prefix+" "+result.slice(6);

        return prefix+" "+result;

    }

    function buildRecordItem(record){

        let period="";

        if(record.dateMode==="date")

            period=
                record.date||"—";

        else if(
            record.dateStart &&
            record.dateEnd
        )

            period=
                `${record.dateStart} – ${record.dateEnd}`;

        else if(record.dateStart)

            period=
                formatBoundary(
                    record.dateStart,
                    "с"
                );

        else if(record.dateEnd)

            period=
                formatBoundary(
                    record.dateEnd,
                    "до"
                );

        else

            period="—";

        return {

            title:
                record.title??"",

            description:

                record.description?.trim()

                ?

                renderMentions(
                    record.description.trim(),
                    subjects,
                    getSubjectHref
                )

                :

                "",

            meta:
                period,

            actions:

                `
                ${adminEdit(
                    "record",
                    record.id
                )}

                ${adminDelete(
                    "record",
                    record.id
                )}
                `

        };

    }

    const groups=[];

    const typedRecords=

        recordTypes

            .map(recordType=>({

                type:
                    recordType,

                records:

                    (records??[])
                    .filter(

                        record=>

                            record.typeId ===
                            recordType.id

                    )

            }))

            .filter(

                group=>

                    group.records.length>0

            );

    const recordsWithoutType=

        (records??[])
        .filter(

            record=>

                !record.typeId ||

                !recordTypes.some(

                    type=>

                        type.id ===
                        record.typeId

                )

        );

    typedRecords.forEach(group=>{

        groups.push({

            title:
                group.type.title??"",

            items:

                group.records.map(
                    buildRecordItem
                )

        });

    });

    if(recordsWithoutType.length){

        groups.push({

            title:
                "Без типа",

            items:

                recordsWithoutType.map(
                    buildRecordItem
                )

        });

    }

    return `

    <div class="records">

        ${renderEntityList({

            groups,

            addButton:

                adminAdd(

                    "add-record",

                    "Добавить запись"

                )

        })}

    </div>

    `;

}
