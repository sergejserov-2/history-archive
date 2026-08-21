import{getTypes}from"../../api/types.js";
import{getRecordTypes}from"../../api/recordTypes.js";
import{getSubjectTypes}from"../../api/subjectTypes.js";
import{getAllObjects}from"../../api/objects.js";
import{getAllRecords}from"../../api/records.js";
import{getSubjects}from"../../api/subjects.js";
import{isAdmin}from"../../admin/adminMode.js";
import{openEditor}from"./editorConfig.js";
import{deleteEntity}from"./update.js";
import{createModal,setModalUrl}from"./modal.js";
import{renderEntityList}from"./entityList.js";

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
        content:renderTypesList(objectTypes,recordTypes,subjectTypes,objects,records,subjects,isAdmin()),
        width:420
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
        if(adminButton){
            event.preventDefault();
            event.stopPropagation();
            const action=adminButton.dataset.action;
            const id=adminButton.dataset.id;
            const type=adminButton.dataset.type;
            if(action==="edit-type"){
                const typeEntity=getTypeById(type,id,modal);
                if(!typeEntity)return;
                setModalUrl("editor",{
                    entityId:id,
                    entityType:type
                });
                await openEditor(type,typeEntity,{
                    objectTypes:modal.objectTypes,
                    recordTypes:modal.recordTypes,
                    subjectTypes:modal.subjectTypes,
                    objects:modal.objects,
                    records:modal.records,
                    subjects:modal.subjects,
                    types:modal.objectTypes
                });
                await refreshTypesModal();
            }
            if(action==="delete-type"){
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
            }
            if(action==="add-type"){
                setModalUrl("editor",{
                    entityId:null,
                    entityType:type
                });
                await openEditor(type,null,{
                    objectTypes:modal.objectTypes,
                    recordTypes:modal.recordTypes,
                    subjectTypes:modal.subjectTypes,
                    objects:modal.objects,
                    records:modal.records,
                    subjects:modal.subjects,
                    types:modal.objectTypes
                });
                await refreshTypesModal();
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
            subjects,
            isAdmin()
        )
    );
}

function renderTypesList(objectTypes=[],recordTypes=[],subjectTypes=[],objects=[],records=[],subjects=[],ADMIN_MODE=false){
    const groups=[];
    const objectItems=objectTypes
        .map(type=>createTypeItem(type,"objectType",objects,records,subjects,ADMIN_MODE))
        .sort(sortItems);
    const recordItems=recordTypes
        .map(type=>createTypeItem(type,"recordType",objects,records,subjects,ADMIN_MODE))
        .sort(sortItems);
    const subjectItems=subjectTypes
        .map(type=>createTypeItem(type,"subjectType",objects,records,subjects,ADMIN_MODE))
        .sort(sortItems);
    if(objectItems.length)groups.push({title:"Типы объектов",items:objectItems});
    if(recordItems.length)groups.push({title:"Типы записей",items:recordItems});
    if(subjectItems.length)groups.push({title:"Типы субъектов",items:subjectItems});
    const addButton=ADMIN_MODE?`
        <div class="entity-list__add admin-button" data-action="add-type" data-type="objectType">
            + Добавить тип объекта
        </div>
        <div class="entity-list__add admin-button" data-action="add-type" data-type="recordType">
            + Добавить тип записи
        </div>
        <div class="entity-list__add admin-button" data-action="add-type" data-type="subjectType">
            + Добавить тип субъекта
        </div>
    `:"";
    return renderEntityList({groups,addButton});
}

function createTypeItem(type,typeName,objects,records,subjects,ADMIN_MODE){
    const used=isTypeUsed(typeName,type.id,{objects,records,subjects});
    return{
        id:type.id,
        clickable:false,
        title:escapeHTML(type.title??"Без названия"),
        meta:formatLevels(type.levels??type.level),
        actions:ADMIN_MODE?`
            <button class="admin-button" data-action="edit-type" data-type="${typeName}" data-id="${escapeHTML(type.id)}" title="Редактировать">
                <img src="icons/edit.svg" class="admin-icon">
            </button>
            <button class="admin-button" data-action="delete-type" data-type="${typeName}" data-id="${escapeHTML(type.id)}" title="${used?"Тип используется":"Удалить"}" ${used?"disabled":""}>
                <img src="icons/delete.svg" class="admin-icon">
            </button>
        `:""
    };
}

function getTypeById(type,id,modal){
    if(type==="objectType")return modal.objectTypes.find(item=>item.id===id);
    if(type==="recordType")return modal.recordTypes.find(item=>item.id===id);
    if(type==="subjectType")return modal.subjectTypes.find(item=>item.id===id);
    return null;
}

function isTypeUsed(type,id,context={}){
    if(type==="objectType")return(context.objects??[]).some(object=>object.typeId===id);
    if(type==="recordType")return(context.records??[]).some(record=>record.typeId===id);
    if(type==="subjectType")return(context.subjects??[]).some(subject=>subject.typeId===id);
    return false;
}

function formatLevels(levels){
    if(levels===undefined||levels===null||levels==="")return"";
    if(Array.isArray(levels))return levels.join(", ");
    return String(levels);
}

function sortItems(a,b){
    return(a.title??"").localeCompare(b.title??"","ru");
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}
