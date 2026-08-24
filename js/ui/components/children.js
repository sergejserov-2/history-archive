import {getParents} from "../../api/objects.js";
import {getPhotos} from "../../api/photos.js";
import {renderStatusBadgeHTML} from "./editor/status.js";
import {
    adminAdd
} from "./adminButtons.js";

export async function renderChildren(
    children,
    currentObject=null,
    objects=[],
    types=[]
){

    const typeMap=new Map(
        types.map(type=>[
            type.id,
            type
        ])
    );

    const currentType=
        typeMap.get(
            currentObject?.typeId
        );

    let levels=[];

    if(Array.isArray(currentType?.levels)){

        levels=currentType.levels;

    }
    else if(currentType?.level!==undefined){

        levels=[
            currentType.level
        ];

    }

    const canHaveChildren=
        !levels.includes(0);

    const preparedChildren=
        await Promise.all(
            (children??[]).map(
                async child=>{

                    const type=
                        typeMap.get(
                            child.typeId
                        );

                    const parents=
                        await getParents(
                            child,
                            objects,
                            types
                        );

                    const photos=
                        await getPhotos(
                            child.id
                        );

                    const coverPhoto=
                        photos.find(
                            photo=>
                                photo.id===child.coverPhotoId
                        );

                    const parentRelations=
                        Array.isArray(child.parents)
                        ?
                        child.parents
                        :
                        [];

                    const addressLines=
                        parentRelations
                            .map(parent=>{

                                const parentId=
                                    parent?.objectId;

                                if(!parentId)
                                    return null;

                                const parentObject=
                                    parents
                                        .flat()
                                        .find(
                                            item=>
                                                item.id===parentId
                                        );

                                if(!parentObject)
                                    return null;

                                return{
                                    parentId,
                                    parentAddress:
                                        parentObject.address?.trim()||"",
                                    childAddress:
                                        parent?.address?.trim()||""
                                };

                            })
                            .filter(Boolean);

                    if(currentObject){

                        addressLines.sort(
                            (a,b)=>{

                                const aCurrent=
                                    a.parentId===currentObject.id;

                                const bCurrent=
                                    b.parentId===currentObject.id;

                                if(aCurrent&&!bCurrent)
                                    return -1;

                                if(!aCurrent&&bCurrent)
                                    return 1;

                                return 0;

                            }
                        );

                    }

                    const addressHTML=
                        addressLines.length
                        ?
                        addressLines
                            .map(line=>`
                                <div class="child-card__address-line">${
                                        line.parentAddress
                                        ?
                                        `${line.parentAddress}, `
                                        :
                                        ""
                                    }
                                    ${line.childAddress}
                                </div>
                            `)
                            .join("")
                        :
                        "";

                    const image=
                        coverPhoto?.previewPath
                        ?
                        `
                        <img
                            class="child-card__image"
                            src="${coverPhoto.previewPath}"
                            alt="${child.title??""}"
                        >
                        `
                        :
                        `
                        <div class="child-card__placeholder">
                            Фото отсутствует
                        </div>
                        `;

                    return{
                        child,
                        type,
                        image,
                        addressHTML,
                        status:
                            renderStatusBadgeHTML(
                                child.status
                            ),
                        sortAddress:
                            addressLines
                                .map(line=>
                                    `${line.parentAddress}, ${line.childAddress}`
                                )
                                .join(" ")
                    };

                }
            )
        );

    preparedChildren.sort(
        (a,b)=>
            a.sortAddress.localeCompare(
                b.sortAddress,
                "ru",
                {
                    numeric:true,
                    sensitivity:"base"
                }
            )
    );

    const cards=
        preparedChildren.map(
            ({
                child,
                type,
                image,
                addressHTML,
                status
            })=>`
                <a
                    class="child-card"
                    href="object.html?id=${child.id}"
                >

                    <div class="child-card__media">
                        ${image}
                    </div>

                    <div class="child-card__body">

                        <div class="child-card__type">
                            ${type?.title??""}
                        </div>

                        <div class="child-card__name">

                            <span>
                                ${child.title??""}
                            </span>

                            ${status}

                        </div>

                        <div class="child-card__address">
                            ${addressHTML}
                        </div>

                    </div>

                </a>
            `
        );

    cards.unshift(
        adminAdd(
            "add-object",
            "Добавить объект",
            {
                className:
                    "child-card child-card--add",

                disabled:
                    !canHaveChildren,

                title:
                    canHaveChildren
                    ?
                    ""
                    :
                    "У объектов нижнего уровня не должно быть дочерних объектов"
            }
        )
    );

    return `
        <div class="children-list">
            ${cards.join("")}
        </div>
    `;

}
