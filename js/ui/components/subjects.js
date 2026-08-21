import{getSubjects,getSubject}from"../../api/subjects.js";
import{getSubjectTypes}from"../../api/subjectTypes.js";
import{getAllObjects}from"../../api/objects.js";
import{getAllPhotos}from"../../api/photos.js";
import{getAllSources}from"../../api/sources.js";
import{getAllRecords}from"../../api/records.js";
import{isAdmin}from"../../admin/adminMode.js";
import{openEditor}from"../../admin/editorConfig.js";
import{deleteEntity}from"../../admin/update.js";
import{renderEntityList}from"./entityList.js";
import{setModalUrl}from"./modal.js";
import{openSubjectModal}from"./subject.js";
import{createModal}from"./modal.js";

let currentModal=null;

export async function openSubjectsModal(){
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
        content:renderSubjects(subjects,subjectTypes),
        width:900
    });

    currentModal=modal;

    modal.root.addEventListener("click",async event=>{
        const button=event.target.closest(".admin-button");
        if(button){
            const action=button.dataset.action;
            const id=button.dataset.id;

            if(action==="edit-subject"){
                const subject=subjects.find(item=>item.id===id);
                if(!subject)return;

                setModalUrl("editor",{
                    entityId:subject.id,
                    entityType:"subject"
                });

                await openEditor(
                    "subject",
                    subject,
                    {
                        subjects,
                        subjectTypes,
                        objects,
                        photos,
                        sources,
                        records
                    },
                    async()=>{
                        await refreshSubjectsModal();
                    }
                );

                return;
            }

            if(action==="delete-subject"){
                if(!id)return;

                if(!confirm("Удалить субъект?"))return;

                try{
                    await deleteEntity(
                        "subject",
                        id,
                        {
                            subjects,
                            subjectTypes,
                            objects,
                            photos,
                            sources,
                            records
                        }
                    );

                    await refreshSubjectsModal();
                }catch(error){
                    console.error(
                        "Ошибка удаления субъекта:",
                        error
                    );

                    alert(
                        "Не удалось удалить субъект"
                    );
                }

                return;
            }
        }

        const link=event.target.closest(".subject-list__link");
        if(!link)return;

        event.preventDefault();

        const id=link.dataset.id;
        if(!id)return;

        const subject=subjects.find(item=>item.id===id);
        if(!subject)return;

        setModalUrl("subject",{
            entityId:subject.id
        });

        openSubjectModal(
            subject,
            {
                subjects,
                objects,
                photos,
                sources,
                records,
                subjectTypes
            }
        );
    });

    return modal;
}

export async function refreshSubjectsModal(){
    if(!currentModal?.root?.isConnected){
        currentModal=null;
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

    currentModal.setContent(
        renderSubjects(subjects,subjectTypes)
    );
}

function renderSubjects(subjects=[],subjectTypes=[]){
    const groups=subjectTypes.map(type=>({
        title:type.title??"",
        items:subjects
            .filter(subject=>subject.typeId===type.id)
            .sort((a,b)=>
                (a.title??"").localeCompare(
                    b.title??"",
                    "ru"
                )
            )
            .map(subject=>({
                title:escapeHTML(subject.title??"Без названия"),
                description:subject.description??"",
                meta:formatYears(subject),
                href:`#`,
                id:subject.id,
                actions:isAdmin()
                    ?`
                        <button
                            class="admin-button"
                            data-action="edit-subject"
                            data-id="${escapeHTML(subject.id)}"
                        >
                            <img src="icons/edit.svg" class="admin-icon">
                        </button>
                        <button
                            class="admin-button"
                            data-action="delete-subject"
                            data-id="${escapeHTML(subject.id)}"
                        >
                            <img src="icons/delete.svg" class="admin-icon">
                        </button>
                    `
                    :""
            }))
    })).filter(group=>group.items.length);

    const untyped=subjects
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
            title:escapeHTML(subject.title??"Без названия"),
            description:subject.description??"",
            meta:formatYears(subject),
            href:"#",
            id:subject.id,
            actions:isAdmin()
                ?`
                    <button
                        class="admin-button"
                        data-action="edit-subject"
                        data-id="${escapeHTML(subject.id)}"
                    >
                        <img src="icons/edit.svg" class="admin-icon">
                    </button>
                    <button
                        class="admin-button"
                        data-action="delete-subject"
                        data-id="${escapeHTML(subject.id)}"
                    >
                        <img src="icons/delete.svg" class="admin-icon">
                    </button>
                `
                :""
        }));

    if(untyped.length){
        groups.push({
            title:"Без типа",
            items:untyped
        });
    }

    const addButton=isAdmin()
        ?`
            <div
                class="entity-list__add subject-list__add"
                data-action="add-subject"
            >
                + Добавить субъект
            </div>
        `
        :"";

    return renderEntityList({
        groups,
        addButton
    }).replace(
        /<a\s+class="([^"]*entity-list-row[^"]*)" href="#"([^>]*)>/g,
        `<a class="$1 subject-list__link" href="#" data-id="$2">`
    );
}

function formatYears(subject){
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
