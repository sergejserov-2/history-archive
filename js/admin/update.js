import{getObject,deleteObject,createObject,updateObject}from"../api/objects.js";
import{getPhoto,deletePhoto,createPhoto,updatePhoto,getPhotos}from"../api/photos.js";
import{getSource,deleteSource,createSource,updateSource,getSources}from"../api/sources.js";
import{getRecord,deleteRecord,createRecord,updateRecord,getRecords}from"../api/records.js";
import{getSubject,deleteSubject,createSubject,updateSubject}from"../api/subjects.js";
import{getType,createType,updateType,deleteType}from"../api/types.js";
import{getRecordType,createRecordType,updateRecordType,deleteRecordType}from"../api/recordTypes.js";
import{getSubjectType,createSubjectType,updateSubjectType,deleteSubjectType}from"../api/subjectTypes.js";
import{moveFileToDeleted,uploadPhoto,uploadSourceDocument}from"../api/storage.js";
import{addRecordToList,removeRecordFromList}from"../ui/components/records.js";
import{renderPhoto}from"../ui/components/photos.js";
import{renderSource}from"../ui/components/sources.js";
import{updateSubjectModal,setSubjectUploading}from"../ui/components/subject.js";
import{show,hide}from"../ui/animations/controller.js";
import{getCurrentUser}from"./adminMode.js";
import{createActivity}from"../api/activity.js";

function getAdminEmail(){return getCurrentUser()?.email??"";}

const API={
    object:{create:createObject,update:updateObject},
    photo:{create:createPhoto,update:updatePhoto},
    source:{create:createSource,update:updateSource},
    record:{create:createRecord,update:updateRecord},
    subject:{create:createSubject,update:updateSubject},
    objectType:{create:createType,update:updateType,delete:deleteType,get:getType},
    recordType:{create:createRecordType,update:updateRecordType,delete:deleteRecordType,get:getRecordType},
    subjectType:{create:createSubjectType,update:updateSubjectType,delete:deleteSubjectType,get:getSubjectType}
};

export async function getEntity(type,id){
    if(type==="object")return await getObject(id);
    if(type==="photo")return await getPhoto(id);
    if(type==="source")return await getSource(id);
    if(type==="record")return await getRecord(id);
    if(type==="subject")return await getSubject(id);
    if(type==="objectType")return await getType(id);
    if(type==="recordType")return await getRecordType(id);
    if(type==="subjectType")return await getSubjectType(id);
    throw new Error(`Unknown entity type: ${type}`);
}

export async function updateEntity(type,entity,data,context={},updates={}){
    console.log("[updateEntity] start",{
        type,
        entityId:entity?.id??null,
        updates,
        data
    });

    const api=API[type];

    if(!api){
        console.error("[updateEntity] Unknown entity type",type);
        throw new Error(`Unknown entity type: ${type}`);
    }

    if(type==="objectType"||type==="recordType"||type==="subjectType"){
        console.log("[updateEntity] type editor save");

        const oldId=entity?.id??null;
        const newId=data?.id?.trim()??"";
        const oldTarget=entity?.target??type;
        const newTarget=data?.target??oldTarget;

        if(!newId){
            console.error("[updateEntity] Type ID is empty");
            throw new Error("ID типа не указан");
        }

        const targetApi=API[newTarget];

        if(!targetApi?.create||!targetApi?.delete){
            console.error("[updateEntity] Unknown type target",newTarget);
            throw new Error(`Unknown type target: ${newTarget}`);
        }

        if(!oldId){
            console.log("[updateEntity] create type",newId);

            const savedData={
                ...data,
                id:newId,
                target:newTarget
            };

            const saved=
                await targetApi.create(
                    newId,
                    savedData
                );

            await createActivity({
                action:"create",
                entityType:type,
                entityId:newId,
                title:data.title??newId,
                adminEmail:getAdminEmail(),
                createdAt:Date.now()
            });

            console.log("[updateEntity] type created",saved??savedData);

            return saved??savedData;
        }

        if(oldId!==newId||oldTarget!==newTarget){
            console.log("[updateEntity] move type",{
                oldId,
                newId,
                oldTarget,
                newTarget
            });

            const savedData={
                ...data,
                id:newId,
                target:newTarget
            };

            await targetApi.create(
                newId,
                savedData
            );

            await API[oldTarget].delete(oldId);

            await createActivity({
                action:"update",
                entityType:type,
                entityId:newId,
                title:data.title??newId,
                adminEmail:getAdminEmail(),
                createdAt:Date.now()
            });

            console.log("[updateEntity] type moved",savedData);

            return savedData;
        }

        console.log("[updateEntity] update type",oldId);

        const updateData={...data};

        delete updateData.id;

        await api.update(
            oldId,
            updateData
        );

        await createActivity({
            action:"update",
            entityType:type,
            entityId:newId,
            title:data.title??newId,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        const savedData={
            id:oldId,
            ...data
        };

        console.log("[updateEntity] type updated",savedData);

        return savedData;
    }

    let savedData;

    const isUpdate=
        Boolean(entity?.id);

    console.log("[updateEntity] operation",{
        type,
        isUpdate,
        entityId:entity?.id??null
    });

    if(isUpdate){
        console.log("[updateEntity] API update start",entity.id);

        await api.update(
            entity.id,
            data
        );

        console.log("[updateEntity] API update complete",entity.id);

        savedData={
            id:entity.id,
            ...data
        };

        await createActivity({
            action:"update",
            entityType:type,
            entityId:entity.id,
            title:data.title??entity.title??"",
            ...(
                type==="object"||
                type==="record"||
                type==="photo"||
                type==="source"
                    ?{
                        parentId:
                            context.parentId??null
                    }
                    :{}
            ),
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });
    }else{
        console.log("[updateEntity] API create start");

        savedData=
            await api.create(data);

        console.log("[updateEntity] API create complete",savedData);

        await createActivity({
            action:"create",
            entityType:type,
            entityId:savedData.id,
            title:savedData.title??"",
            ...(
                type==="object"||
                type==="record"||
                type==="photo"||
                type==="source"
                    ?{
                        parentId:
                            context.parentId??null
                    }
                    :{}
            ),
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });
    }

    let updateNames;

    if(Array.isArray(updates)){
        updateNames=updates;
    }else{
        updateNames=
            isUpdate
                ?updates.update??[]
                :updates.create??[];
    }

    console.log("[updateEntity] callbacks",{
        type,
        isUpdate,
        updateNames
    });

    for(const updateName of updateNames){
        const callback=
            context.updates?.[updateName];

        if(typeof callback!=="function"){
            console.warn(
                "[updateEntity] callback not found",
                updateName
            );

            continue;
        }

        console.log(
            "[updateEntity] callback start",
            updateName
        );

        await callback(savedData);

        console.log(
            "[updateEntity] callback complete",
            updateName
        );
    }

    console.log(
        "[updateEntity] complete",
        savedData
    );

    return savedData;
}



export async function deleteEntity(type,id,context={}){
    console.log("[deleteEntity] start",{
        type,
        id,
        parentId:context.parentId??null
    });

    if(type==="object"){
        console.log("[deleteEntity] object: find");
        const object=(context.objects??[]).find(item=>item.id===id);
        const parentId=object?.parents?.[0]?.objectId??object?.parents?.[0]??null;

        console.log("[deleteEntity] object: activity start",{id,parentId});
        await createActivity({
            action:"delete",
            entityType:"object",
            entityId:id,
            title:object?.title??"",
            parentId,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        console.log("[deleteEntity] object: activity complete");
        console.log("[deleteEntity] object: API delete start",{id});
        await deleteObject(id);
        console.log("[deleteEntity] object: API delete complete",{id});

        await context.updates?.onObjectDeleted?.(id);
        console.log("[deleteEntity] object: callback complete");

        return{parentId};
    }

    if(type==="photo"){
        console.log("[deleteEntity] photo: find");
        const photo=(context.photos??[]).find(item=>item.id===id);

        if(photo?.storagePath){
            console.log("[deleteEntity] photo: move storage file");
            await moveFileToDeleted(photo.storagePath);
        }

        if(photo?.previewPath){
            console.log("[deleteEntity] photo: move preview file");
            await moveFileToDeleted(photo.previewPath);
        }

        console.log("[deleteEntity] photo: activity start");
        await createActivity({
            action:"delete",
            entityType:"photo",
            entityId:id,
            title:photo?.title??"",
            parentId:context.parentId??null,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        console.log("[deleteEntity] photo: API delete start",{id});
        await deletePhoto(id);
        console.log("[deleteEntity] photo: API delete complete",{id});

        console.log("[deleteEntity] photo: callback start");
        await context.updates?.removePhoto?.(id);
        console.log("[deleteEntity] photo: callback complete");

        return;
    }

    if(type==="source"){
        console.log("[deleteEntity] source: find");
        const source=(context.sources??[]).find(item=>item.id===id);

        if(source?.storagePath){
            console.log("[deleteEntity] source: move storage file");
            await moveFileToDeleted(source.storagePath);
        }

        console.log("[deleteEntity] source: activity start");
        await createActivity({
            action:"delete",
            entityType:"source",
            entityId:id,
            title:source?.title??"",
            parentId:context.parentId??null,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        console.log("[deleteEntity] source: API delete start",{id});
        await deleteSource(id);
        console.log("[deleteEntity] source: API delete complete",{id});

        console.log("[deleteEntity] source: callback start");
        await context.updates?.removeSource?.(id);
        console.log("[deleteEntity] source: callback complete");

        return;
    }

    if(type==="record"){
        console.log("[deleteEntity] record: find");
        const record=(context.records??[]).find(item=>item.id===id);

        console.log("[deleteEntity] record: found",{
            id:record?.id??null,
            title:record?.title??null
        });

        console.log("[deleteEntity] record: activity start",{id});
        await createActivity({
            action:"delete",
            entityType:"record",
            entityId:id,
            title:record?.title??"",
            parentId:context.parentId??null,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });
        console.log("[deleteEntity] record: activity complete",{id});

        console.log("[deleteEntity] record: API delete start",{id});
        await deleteRecord(id);
        console.log("[deleteEntity] record: API delete complete",{id});

        console.log("[deleteEntity] record: callback start removeRecord",{id});
        await context.updates?.removeRecord?.(id);
        console.log("[deleteEntity] record: callback complete removeRecord",{id});

        console.log("[deleteEntity] record: complete",{id});

        return;
    }

    if(type==="subject"){
        console.log("[deleteEntity] subject: find");
        const subject=(context.subjects??[]).find(item=>item.id===id);

        if(subject?.storagePath){
            console.log("[deleteEntity] subject: move storage file");
            await moveFileToDeleted(subject.storagePath);
        }

        console.log("[deleteEntity] subject: activity start");
        await createActivity({
            action:"delete",
            entityType:"subject",
            entityId:id,
            title:subject?.title??"",
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        console.log("[deleteEntity] subject: API delete start",{id});
        await deleteSubject(id);
        console.log("[deleteEntity] subject: API delete complete",{id});

        console.log("[deleteEntity] subject: callback start");
        await context.updates?.onSubjectDeleted?.();
        console.log("[deleteEntity] subject: callback complete");

        return;
    }

    if(type==="objectType"||type==="recordType"||type==="subjectType"){
        console.log("[deleteEntity] type: activity start");

        await createActivity({
            action:"delete",
            entityType:type,
            entityId:id,
            title:id,
            adminEmail:getAdminEmail(),
            createdAt:Date.now()
        });

        console.log("[deleteEntity] type: API delete start",{type,id});
        await API[type].delete(id);
        console.log("[deleteEntity] type: API delete complete",{type,id});

        const callbackName=
            `remove${type[0].toUpperCase()}${type.slice(1)}`;

        console.log("[deleteEntity] type: callback start",{callbackName});

        await context.updates?.[callbackName]?.(id);

        console.log("[deleteEntity] type: callback complete",{callbackName});

        return;
    }

    console.error("[deleteEntity] unknown type",{type,id});

    throw new Error(`Unknown entity type: ${type}`);
}



export function createPageUpdates(state){
    function getRecordSortValue(record){
        const value=String(record?.date??record?.dateStart??record?.dateEnd??"").trim();
        const match=value.match(/\d+/);
        return match?Number(match[0]):null;
    }

    function compareRecords(a,b){
        const aMeta=String(a?.date??a?.dateStart??a?.dateEnd??"").trim();
        const bMeta=String(b?.date??b?.dateStart??b?.dateEnd??"").trim();
        const aNumber=getRecordSortValue(a);
        const bNumber=getRecordSortValue(b);
        if(aNumber!==null&&bNumber===null)return-1;
        if(aNumber===null&&bNumber!==null)return 1;
        if(aNumber!==null&&bNumber!==null&&aNumber!==bNumber)return aNumber-bNumber;
        const metaCompare=aMeta.localeCompare(bMeta,"ru",{numeric:true,sensitivity:"base"});
        if(metaCompare!==0)return metaCompare;
        return String(a?.title??"").localeCompare(String(b?.title??""),"ru",{sensitivity:"base"});
    }

    function insertSortedPhoto(list,element,photo){
        const cards=[...list.querySelectorAll(".photo-card")].filter(item=>item.dataset.photoId);
        const dateA=photo.date||"";
        let before=null;
        for(const card of cards){
            const other=state.photos.find(item=>item.id===card.dataset.photoId);
            if(!other)continue;
            const dateB=other.date||"";
            if(!dateA&&!dateB){
                const author=(photo.author??"").localeCompare(other.author??"","ru");
                if(author<0||(author===0&&(photo.title??"").localeCompare(other.title??"","ru")<0)){before=card;break;}
            }else if(!dateA){
                continue;
            }else if(!dateB||String(dateA).localeCompare(String(dateB))<0){
                before=card;
                break;
            }else if(String(dateA).localeCompare(String(dateB))===0){
                const author=(photo.author??"").localeCompare(other.author??"","ru");
                if(author<0||(author===0&&(photo.title??"").localeCompare(other.title??"","ru")<0)){before=card;break;}
            }
        }
        if(before)list.insertBefore(element,before);
        else list.appendChild(element);
    }

    function insertSortedSource(list,element,source){
        const items=[...list.querySelectorAll(".source")];
        let before=null;
        for(const item of items){
            const other=state.sources.find(sourceItem=>sourceItem.id===item.dataset.sourceId);
            if(!other)continue;
            const dateA=source.date||"";
            const dateB=other.date||"";
            if(!dateA&&!dateB){
                const author=(source.author??"").localeCompare(other.author??"","ru");
                if(author<0||(author===0&&(source.title??"").localeCompare(other.title??"","ru")<0)){before=item;break;}
            }else if(!dateA){
                continue;
            }else if(!dateB||String(dateA).localeCompare(String(dateB))<0){
                before=item;
                break;
            }else if(String(dateA).localeCompare(String(dateB))===0){
                const author=(source.author??"").localeCompare(other.author??"","ru");
                if(author<0||(author===0&&(source.title??"").localeCompare(other.title??"","ru")<0)){before=item;break;}
            }
        }
        if(before)list.insertBefore(element,before);
        else list.appendChild(element);
    }

    return{
        async updateObjectBlock(data){
            if(data)state.object={...state.object,...data};
            state.object=await getObject(state.object.id);
            if(!state.object)return;
            const title=document.querySelector(".object__title-text");
            if(title)title.textContent=state.object.title??"";
            const description=document.querySelector(".object__description");
            if(description){
                const{renderMentions,getSubjectHref}=await import("../ui/components/mentionLink.js");
                description.innerHTML=state.object.description?.trim()?renderMentions(state.object.description.trim(),state.subjects,getSubjectHref):"";
                description.hidden=!state.object.description?.trim();
            }
            const type=document.querySelector(".object__type");
            if(type){
                const objectType=state.types?.find(item=>item.id===state.object.typeId);
                type.textContent=objectType?.title??"";
            }
        },

        async updateSubjectBlock(savedSubject=null,uploading=false){
            if(savedSubject?.id)state.subject={...state.subject,...savedSubject};
            if(!state.subject?.id)return;
            setSubjectUploading(state.subject.id,Boolean(uploading));
            state.subject=await getSubject(state.subject.id);
            if(!state.subject)return;
            updateSubjectModal(state.subject,{subjects:state.subjects,objects:state.objects,photos:state.photos,sources:state.sources,records:state.records,subjectTypes:state.subjectTypes});
            await state.renderSubjectBlock?.();
        },

async addRecord(savedRecord){
    console.log(
        "[addRecord] start",
        savedRecord
    );

    if(!savedRecord?.id){
        console.warn(
            "[addRecord] no record id"
        );

        return;
    }

    console.log(
        "[addRecord] getRecord start",
        savedRecord.id
    );

    const fresh=
        await getRecord(
            savedRecord.id
        );

    console.log(
        "[addRecord] getRecord complete",
        fresh
    );

    if(!fresh){
        console.warn(
            "[addRecord] record not found"
        );

        return;
    }

    console.log(
        "[addRecord] state update start"
    );

    state.records=[
        ...state.records.filter(
            record=>record.id!==fresh.id
        ),
        fresh
    ];

    console.log(
        "[addRecord] state update complete",
        state.records
    );

    console.log(
        "[addRecord] addRecordToList start"
    );

    await addRecordToList(
        fresh,
        state.subjects,
        state.recordTypes
    );

    console.log(
        "[addRecord] addRecordToList complete"
    );
},


async removeRecord(id){
    console.log("[removeRecord] start",{
        id,
        recordsBefore:state.records.length
    });

    state.records=
        state.records.filter(
            record=>record.id!==id
        );

    console.log("[removeRecord] state updated",{
        id,
        recordsAfter:state.records.length
    });

    console.log(
        "[removeRecord] removeRecordFromList start",
        id
    );

    await removeRecordFromList(id);

    console.log(
        "[removeRecord] removeRecordFromList complete",
        id
    );
}






async updateRecord(savedRecord){
    if(!savedRecord?.id)return;
    const fresh=await getRecord(savedRecord.id);
    if(!fresh)return;
    state.records=state.records.map(record=>record.id===fresh.id?fresh:record);
    await removeRecordFromList(fresh.id);
    await addRecordToList(fresh,state.subjects,state.recordTypes);
},

        async addPhoto(savedPhoto,uploading=false){
            if(!savedPhoto?.id)return;
            const fresh=await getPhoto(savedPhoto.id);
            if(!fresh)return;
            state.photos=[...state.photos.filter(photo=>photo.id!==fresh.id),fresh];
            const photo={...fresh,isUploading:Boolean(uploading)};
            const list=document.querySelector(".photos-list");
            if(!list)return;
            const template=document.createElement("template");
            template.innerHTML=renderPhoto(photo).trim();
            const element=template.content.firstElementChild;
            if(!element)return;
            insertSortedPhoto(list,element,fresh);
            await show(element);
        },

        async removePhoto(id){
            state.photos=state.photos.filter(photo=>photo.id!==id);
            const element=document.querySelector(`.photo-card[data-photo-id="${id}"]`);
            if(element){
                await hide(element);
                element.remove();
            }
        },

        async updatePhoto(savedPhoto,uploading=false){
            if(!savedPhoto?.id)return;
            const fresh=await getPhoto(savedPhoto.id);
            if(!fresh)return;
            state.photos=state.photos.map(photo=>photo.id===fresh.id?fresh:photo);
            const oldElement=document.querySelector(`.photo-card[data-photo-id="${fresh.id}"]`);
            if(!oldElement)return;
            const template=document.createElement("template");
            template.innerHTML=renderPhoto({...fresh,isUploading:Boolean(uploading)}).trim();
            const newElement=template.content.firstElementChild;
            if(!newElement)return;
            oldElement.replaceWith(newElement);
        },

        async addSource(savedSource){
            if(!savedSource?.id)return;
            const fresh=await getSource(savedSource.id);
            if(!fresh)return;
            state.sources=[...state.sources.filter(source=>source.id!==fresh.id),fresh];
            const list=document.querySelector(".sources-list");
            if(!list)return;
            const template=document.createElement("template");
            template.innerHTML=renderSource(fresh,state.subjects).trim();
            const element=template.content.firstElementChild;
            if(!element)return;
            insertSortedSource(list,element,fresh);
            await show(element);
        },

        async removeSource(id){
            state.sources=state.sources.filter(source=>source.id!==id);
            const element=document.querySelector(`.source[data-source-id="${id}"]`);
            if(element){
                await hide(element);
                element.remove();
            }
        },

        async updateSource(savedSource){
            if(!savedSource?.id)return;
            const fresh=await getSource(savedSource.id);
            if(!fresh)return;
            state.sources=state.sources.map(source=>source.id===fresh.id?fresh:source);
            const oldElement=document.querySelector(`.source[data-source-id="${fresh.id}"]`);
            if(!oldElement)return;
            const template=document.createElement("template");
            template.innerHTML=renderSource(fresh,state.subjects).trim();
            const newElement=template.content.firstElementChild;
            if(!newElement)return;
            oldElement.replaceWith(newElement);
        },

        async updateChildrenBlock(){},

        async onObjectDeleted(){
            const parent=state.parents?.[0];
            window.location.href=parent?.id?`object.html?id=${parent.id}`:"index.html";
        },

        async onSubjectDeleted(){
            window.location.reload();
        }
    };
}

export{uploadPhoto,uploadSourceDocument};
