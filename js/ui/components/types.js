import{getTypes}from"../../api/types.js";
import{getRecordTypes}from"../../api/recordTypes.js";
import{getSubjectTypes}from"../../api/subjectTypes.js";
import{getAllObjects}from"../../api/objects.js";
import{getAllRecords}from"../../api/records.js";
import{getSubjects}from"../../api/subjects.js";
import{deleteEntity}from"../../admin/update.js";
import{createModal}from"./modal.js";
import{openModal}from"./modalReload.js";
import{renderEntityList}from"./entityList.js";
import{adminEdit,adminDelete,adminAdd}from"./adminButtons.js";

let currentTypesModal=null;

export async function openTypesModal(){
    const[objectTypes,recordTypes,subjectTypes,objects,records,subjects]=await Promise.all([
        getTypes(),
        getRecordTypes(),
        getSubjectTypes(),
        getAllObjects(),
        getAllRecords(),
        getSubjects()
    ]);

    const modal=createModal({
        title:"Типы",
        content:renderTypesList(
            objectTypes,
            recordTypes,
            subjectTypes,
            objects,
            records,
            subjects
        ),
        width:420,
        admin:true
    });

    currentTypesModal=modal;

    modal.objectTypes=objectTypes;
    modal.recordTypes=recordTypes;
    modal.subjectTypes=subjectTypes;
    modal.objects=objects;
    modal.records=records;
    modal.subjects=subjects;

    modal.root.addEventListener("click",async event=>{
        const adminButton=event.target.closest(".admin-button");

        if(adminButton?.classList.contains("admin-button--disabled"))return;

        if(adminButton){
            event.preventDefault();
            event.stopPropagation();

            const action=adminButton.dataset.action;
            const id=adminButton.dataset.id;

            if(
                action==="edit-objectType"||
                action==="edit-recordType"||
                action==="edit-subjectType"
            ){
                const type=action.replace("edit-","");
                const typeEntity=getTypeById(type,id,modal);

                if(!typeEntity)return;

                await openModal(
                    "editor",
                    {
                        entityId:id,
                        entityType:type
                    },
                    {
                        objects:modal.objects,
                        records:modal.records,
                        subjects:modal.subjects,
                        types:modal.objectTypes,
                        recordTypes:modal.recordTypes,
                        subjectTypes:modal.subjectTypes,
                        refreshTypesModal
                    }
                );

                return;
            }

            if(
                action==="delete-objectType"||
                action==="delete-recordType"||
                action==="delete-subjectType"
            ){
                const type=action.replace("delete-","");
                const typeEntity=getTypeById(type,id,modal);

                if(!typeEntity)return;

                if(isTypeUsed(type,id,modal))return;

                if(!confirm(`Удалить тип «${typeEntity.title??id}»?`))return;

                try{
                    await deleteEntity(type,id,{
                        objectTypes:modal.objectTypes,
                        recordTypes:modal.recordTypes,
                        subjectTypes:modal.subjectTypes,
                        objects:modal.objects,
                        records:modal.records,
                        subjects:modal.subjects
                    });

                    await refreshTypesModal();
                }catch(error){
                    console.error("Ошибка удаления типа:",error);
                    alert("Не удалось удалить тип");
                }

                return;
            }

            if(action==="add-type"){
                await openModal(
                    "editor",
                    {
                        entityType:"objectType"
                    },
                    {
                        objects:modal.objects,
                        records:modal.records,
                        subjects:modal.subjects,
                        types:modal.objectTypes,
                        recordTypes:modal.recordTypes,
                        subjectTypes:modal.subjectTypes,
                        refreshTypesModal
                    }
                );

                return;
            }

            return;
        }

        const row=event.target.closest(".entity-list-row");
        if(!row)return;

        const id=row.dataset.id;
        if(!id)return;

        event.preventDefault();
    });

    return modal;
}

export async function refreshTypesModal(){
    if(!currentTypesModal?.root?.isConnected){
        currentTypesModal=null;
        return;
    }

    const[objectTypes,recordTypes,subjectTypes,objects,records,subjects]=await Promise.all([
        getTypes(),
        getRecordTypes(),
        getSubjectTypes(),
        getAllObjects(),
        getAllRecords(),
        getSubjects()
    ]);

    currentTypesModal.objectTypes=objectTypes;
    currentTypesModal.recordTypes=recordTypes;
    currentTypesModal.subjectTypes=subjectTypes;
    currentTypesModal.objects=objects;
    currentTypesModal.records=records;
    currentTypesModal.subjects=subjects;

    currentTypesModal.setContent(
        renderTypesList(
            objectTypes,
            recordTypes,
            subjectTypes,
            objects,
            records,
            subjects
        )
    );
}

function renderTypesList(
    objectTypes=[],
    recordTypes=[],
    subjectTypes=[],
    objects=[],
    records=[],
    subjects=[]
){
    const groups=[];

    const objectItems=objectTypes
        .map(type=>createTypeItem(
            type,
            "objectType",
            objects,
            records,
            subjects
        ))
        .sort(sortItems);

    const recordItems=recordTypes
        .map(type=>createTypeItem(
            type,
            "recordType",
            objects,
            records,
            subjects
        ))
        .sort(sortItems);

    const subjectItems=subjectTypes
        .map(type=>createTypeItem(
            type,
            "subjectType",
            objects,
            records,
            subjects
        ))
        .sort(sortItems);

    if(objectItems.length){
        groups.push({
            title:"Типы объектов",
            items:objectItems
        });
    }

    if(recordItems.length){
        groups.push({
            title:"Типы записей",
            items:recordItems
        });
    }

    if(subjectItems.length){
        groups.push({
            title:"Типы субъектов",
            items:subjectItems
        });
    }

    return renderEntityList({
        groups,
        addButton:adminAdd("add-type","Добавить тип")
    });
}

function createTypeItem(
    type,
    typeName,
    objects,
    records,
    subjects
){
    const used=isTypeUsed(
        typeName,
        type.id,
        {
            objects,
            records,
            subjects
        }
    );

    return{
        id:type.id,
        clickable:false,
        title:escapeHTML(type.title??"Без названия"),
        meta:formatLevels(type.levels??type.level),
        actions:`
            ${adminEdit(
                typeName,
                escapeHTML(type.id)
            )}
            ${adminDelete(
                typeName,
                escapeHTML(type.id),
                {
                    className:used
                        ?"admin-button--disabled"
                        :"",
                    title:used
                        ?"Тип используется и не может быть удалён"
                        :"Удалить"
                }
            )}
        `
    };
}

function getTypeById(type,id,modal){
    if(type==="objectType"){
        return modal.objectTypes.find(
            item=>item.id===id
        );
    }

    if(type==="recordType"){
        return modal.recordTypes.find(
            item=>item.id===id
        );
    }

    if(type==="subjectType"){
        return modal.subjectTypes.find(
            item=>item.id===id
        );
    }

    return null;
}

function isTypeUsed(type,id,context={}){
    if(type==="objectType"){
        return(context.objects??[]).some(
            object=>object.typeId===id
        );
    }

    if(type==="recordType"){
        return(context.records??[]).some(
            record=>record.typeId===id
        );
    }

    if(type==="subjectType"){
        return(context.subjects??[]).some(
            subject=>subject.typeId===id
        );
    }

    return false;
}

function formatLevels(levels){
    if(
        levels===undefined||
        levels===null||
        levels===""
    )return"";

    if(Array.isArray(levels)){
        return levels.join(", ");
    }

    return String(levels);
}

function sortItems(a,b){
    return(a.title??"").localeCompare(
        b.title??"",
        "ru"
    );
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}
