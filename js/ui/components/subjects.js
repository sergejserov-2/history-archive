import{getSubjects}from"../../api/subjects.js";
import{getSubjectTypes}from"../../api/subjectTypes.js";
import{getAllObjects}from"../../api/objects.js";
import{getAllPhotos}from"../../api/photos.js";
import{getAllSources}from"../../api/sources.js";
import{getAllRecords}from"../../api/records.js";
import{isAdmin}from"../../admin/adminMode.js";
import{openSubjectModal}from"./subject.js";
import{createModal}from"./modal.js";
import{setModalUrl}from"./modalReload.js";
import{renderEntityList}from"./entityList.js";
import{
    adminEdit,
    adminDelete,
    adminAdd
}from"./adminButtons.js";

let currentSubjectsModal=null;
export async function openSubjectsModal({page=null,updates=null}={}){
    const[
        subjects,
        subjectTypes,
        objects,
        photos,
        sources,
        records
    ]=await Promise.all([
        getSubjects(),
        getSubjectTypes(),
        getAllObjects(),
        getAllPhotos(),
        getAllSources(),
        getAllRecords()
    ]);
    const modal=createModal({
        title:"Субъекты",
        content:renderSubjectsList(
            subjects,
            subjectTypes,
            isAdmin()
        ),
        width:525
    });
    currentSubjectsModal=modal;
    modal.subjects=subjects;
    modal.subjectTypes=subjectTypes;
    modal.objects=objects;
    modal.photos=photos;
    modal.sources=sources;
    modal.records=records;
    modal.page=page;
    modal.updates=updates;
    modal.root.addEventListener("click",event=>{
        const adminButton=event.target.closest(".admin-button");
        if(adminButton){
            event.preventDefault();
            return;
        }
        const addButton=event.target.closest(".entity-list__add");
        if(addButton){
            event.preventDefault();
            return;
        }
        const row=event.target.closest(".entity-list-row");
        if(!row)return;
        const id=row.dataset.id;
        if(!id)return;
        const subject=subjects.find(item=>item.id===id);
        if(!subject)return;
        event.preventDefault();
        setModalUrl("subject",{
            entityId:id
        });
        openSubjectModal(
            subject,
            {
                subjects,
                objects,
                photos,
                sources,
                records,
                subjectTypes,
                fromUrl:true
            }
        );
    });
    return modal;
}
export async function refreshSubjectsModal(){
    if(!currentSubjectsModal?.root?.isConnected){
        currentSubjectsModal=null;
        return;
    }
    const[
        subjects,
        subjectTypes,
        objects,
        photos,
        sources,
        records
    ]=await Promise.all([
        getSubjects(),
        getSubjectTypes(),
        getAllObjects(),
        getAllPhotos(),
        getAllSources(),
        getAllRecords()
    ]);
    currentSubjectsModal.subjects=subjects;
    currentSubjectsModal.subjectTypes=subjectTypes;
    currentSubjectsModal.objects=objects;
    currentSubjectsModal.photos=photos;
    currentSubjectsModal.sources=sources;
    currentSubjectsModal.records=records;
    currentSubjectsModal.setContent(
        renderSubjectsList(
            subjects,
            subjectTypes,
            isAdmin()
        )
    );
}
function renderSubjectsList(
    subjects=[],
    subjectTypes=[],
    ADMIN_MODE=false
){
    const groups=subjectTypes.map(type=>{
        const items=subjects
            .filter(subject=>subject.typeId===type.id)
            .sort((a,b)=>
                (a.title??"").localeCompare(
                    b.title??"",
                    "ru"
                )
            )
            .map(subject=>({
                id:subject.id,
                clickable:true,
                title:escapeHTML(
                    subject.title??"Без названия"
                ),
                meta:formatSubjectYears(subject),
               actions:ADMIN_MODE
                    ?
                    `
                    ${adminEdit(
                        "subject",
                        escapeHTML(subject.id)
                    )}
                
                    ${adminDelete(
                        "subject",
                        escapeHTML(subject.id)
                    )}
                    `
                    :""
            }));

        return{
            title:escapeHTML(type.title??""),
            items
        };
    }).filter(group=>group.items.length);

    const untypedItems=subjects
        .filter(subject=>
            !subject.typeId||
            !subjectTypes.some(
                type=>type.id===subject.typeId
            )
        )
        .sort((a,b)=>
            (a.title??"").localeCompare(
                b.title??"",
                "ru"
            )
        )
        .map(subject=>({
            id:subject.id,
            clickable:true,
            title:escapeHTML(
                subject.title??"Без названия"
            ),
            meta:formatSubjectYears(subject),
            actions:ADMIN_MODE
                ?
                `
                ${adminEdit(
                    "subject",
                    escapeHTML(subject.id)
                )}
            
                ${adminDelete(
                    "subject",
                    escapeHTML(subject.id)
                )}
                `
                :""
        }));

    if(untypedItems.length){
        groups.push({
            title:"Без типа",
            items:untypedItems
        });
    }
    
    const addButton=ADMIN_MODE
        ?
        adminAdd(
            "add-subject",
            "Добавить субъект"
        )
        :"";

    return renderEntityList({
        groups,
        addButton
    });
}
function formatSubjectYears(subject){
    if(subject.dateStart&&subject.dateEnd){
        return`${escapeHTML(subject.dateStart)} – ${escapeHTML(subject.dateEnd)}`;
    }
    if(subject.dateStart){
        return`с ${escapeHTML(subject.dateStart)}`;
    }
    if(subject.dateEnd){
        return`до ${escapeHTML(subject.dateEnd)}`;
    }
    return"";
}
function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}
