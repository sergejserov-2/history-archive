import{getObject,deleteObject,createObject,updateObject}from"../api/objects.js";
import{getPhoto,deletePhoto,createPhoto,updatePhoto,getPhotos}from"../api/photos.js";
import{getSource,deleteSource,createSource,updateSource,getSources}from"../api/sources.js";
import{getRecord,deleteRecord,createRecord,updateRecord,getRecords}from"../api/records.js";
import{getSubject,deleteSubject,createSubject,updateSubject}from"../api/subjects.js";
import{getType,createType,updateType,deleteType}from"../api/types.js";
import{getRecordType,createRecordType,updateRecordType,deleteRecordType}from"../api/recordTypes.js";
import{getSubjectType,createSubjectType,updateSubjectType,deleteSubjectType}from"../api/subjectTypes.js";
import{moveFileToDeleted,uploadPhoto,uploadSourceDocument}from"../api/storage.js";
import{renderRecord,insertRecord}from"../ui/components/records.js";
import{renderPhoto}from"../ui/components/photos.js";
import{renderSource}from"../ui/components/sources.js";
import{updateSubjectModal,setSubjectUploading}from"../ui/components/subject.js";
import{show,hide}from"../ui/animations/controller.js";
import{getCurrentUser}from"./adminMode.js";
import{createActivity,getActivities,getRecentActivities}from"../api/activity.js";

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

export async function updateEntity(type,entity,data,context={},updates=[]){
    const api=API[type];
    if(!api)throw new Error(`Unknown entity type: ${type}`);
    if(type==="objectType"||type==="recordType"||type==="subjectType"){
        const oldId=entity?.id??null;
        const newId=data?.id?.trim()??"";
        const oldTarget=entity?.target??type;
        const newTarget=data?.target??oldTarget;
        if(!newId)throw new Error("ID типа не указан");
        const targetApi=API[newTarget];
        if(!targetApi?.create||!targetApi?.delete)throw new Error(`Unknown type target: ${newTarget}`);
        if(!oldId){
            const savedData={...data,id:newId,target:newTarget};
            await createActivity({action:"create",entityType:type,entityId:newId,title:data.title??newId,adminEmail:getAdminEmail(),createdAt:Date.now()});
            return await targetApi.create(newId,savedData);
        }
        if(oldId!==newId||oldTarget!==newTarget){
            const savedData={...data,id:newId,target:newTarget};
            await targetApi.create(newId,savedData);
            await API[oldTarget].delete(oldId);
            await createActivity({action:"update",entityType:type,entityId:newId,title:data.title??newId,adminEmail:getAdminEmail(),createdAt:Date.now()});
            return savedData;
        }
        const updateData={...data};
        delete updateData.id;
        await api.update(oldId,updateData);
        await createActivity({action:"update",entityType:type,entityId:newId,title:data.title??newId,adminEmail:getAdminEmail(),createdAt:Date.now()});
        return{id:oldId,...data};
    }
    let savedData;
    if(entity?.id){
        await api.update(entity.id,data);
        savedData={id:entity.id,...data};
        await createActivity({action:"update",entityType:type,entityId:entity.id,title:data.title??entity?.title??"",...(type==="object"||type==="record"||type==="photo"||type==="source"?{parentId:context.parentId??null}:{}),adminEmail:getAdminEmail(),createdAt:Date.now()});
    }else{
        savedData=await api.create(data);
        await createActivity({action:"create",entityType:type,entityId:savedData.id,title:savedData.title??"",...(type==="object"||type==="record"||type==="photo"||type==="source"?{parentId:context.parentId??null}:{}),adminEmail:getAdminEmail(),createdAt:Date.now()});
    }
    for(const update of updates){
        const callback=context.updates?.[update];
        if(typeof callback==="function")await callback(savedData);
    }
    return savedData;
}

export async function deleteEntity(type,id,context={}){
    if(type==="object"){
        const object=(context.objects??[]).find(object=>object.id===id);
        const parentId=object?.parents?.[0]?.objectId??object?.parents?.[0]??null;
        await createActivity({action:"delete",entityType:"object",entityId:id,title:object?.title??"",parentId:parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteObject(id);
        await context.updates?.onObjectDeleted?.(id);
        return{parentId};
    }
    if(type==="photo"){
        const photo=(context.photos??[]).find(photo=>photo.id===id);
        if(photo?.storagePath)await moveFileToDeleted(photo.storagePath);
        if(photo?.previewPath)await moveFileToDeleted(photo.previewPath);
        await createActivity({action:"delete",entityType:"photo",entityId:id,title:photo?.title??"",parentId:context.parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deletePhoto(id);
        await context.updates?.removePhoto?.(id);
        return;
    }
    if(type==="source"){
        const source=(context.sources??[]).find(source=>source.id===id);
        if(source?.storagePath)await moveFileToDeleted(source.storagePath);
        await createActivity({action:"delete",entityType:"source",entityId:id,title:source?.title??"",parentId:context.parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteSource(id);
        await context.updates?.removeSource?.(id);
        return;
    }
    if(type==="record"){
        const record=(context.records??[]).find(record=>record.id===id);
        await createActivity({action:"delete",entityType:"record",entityId:id,title:record?.title??"",parentId:context.parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteRecord(id);
        await context.updates?.removeRecord?.(id);
        return;
    }
    if(type==="subject"){
        const subject=(context.subjects??[]).find(subject=>subject.id===id);
        if(subject?.storagePath)await moveFileToDeleted(subject.storagePath);
        await createActivity({action:"delete",entityType:"subject",entityId:id,title:subject?.title??"",adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteSubject(id);
        await context.updates?.onSubjectDeleted?.();
        return;
    }
    if(type==="objectType"){
        await createActivity({action:"delete",entityType:type,entityId:id,title:id,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteType(id);
        return;
    }
    if(type==="recordType"){
        await createActivity({action:"delete",entityType:type,entityId:id,title:id,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteRecordType(id);
        return;
    }
    if(type==="subjectType"){
        await createActivity({action:"delete",entityType:type,entityId:id,title:id,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteSubjectType(id);
        return;
    }
    throw new Error(`Unknown entity type: ${type}`);
}

export function createPageUpdates(state){
    return{
        async updateObjectBlock(data){
            if(data)state.object={...state.object,...data};
            state.object=await getObject(state.object.id);
            if(!state.object)return;
            const block=document.querySelector(".object");
            if(block){
                block.outerHTML=state.renderObjectBlock();
                const newBlock=document.querySelector(".object");
                if(newBlock){
                    const{initCoverDrag}=await import("../ui/components/coverDrag.js");
                    initCoverDrag(newBlock);
                }
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
            if(!savedRecord?.id)return;
            state.records=await getRecords(state.object.id);
            const element=insertRecord(savedRecord,state.subjects,state.recordTypes);
            if(element)await show(element);
        }
        async removeRecord(id){
            state.records=state.records.filter(record=>record.id!==id);
            const element=document.querySelector(`.record[data-record-id="${id}"]`);
            if(element){
                await hide(element);
                element.remove();
            }
        },
        async addPhoto(savedPhoto,uploading=false){
            if(!savedPhoto?.id)return;
            state.photos=await getPhotos(state.object.id);
            const photo={...savedPhoto,isUploading:Boolean(uploading)};
            const list=document.querySelector(".photos-list");
            if(!list)return;
            list.insertAdjacentHTML("beforeend",renderPhoto(photo));
            const element=list.querySelector(`[data-photo-id="${savedPhoto.id}"]`);
            if(element)await show(element);
        },
        async removePhoto(id){
            state.photos=state.photos.filter(photo=>photo.id!==id);
            const element=document.querySelector(`.photo-card[data-photo-id="${id}"]`);
            if(element){
                await hide(element);
                element.remove();
            }
        },
        async addSource(savedSource){
            if(!savedSource?.id)return;
            state.sources=await getSources(state.object.id);
            const list=document.querySelector(".sources-list");
            if(!list)return;
            list.insertAdjacentHTML("beforeend",renderSource(savedSource,state.subjects));
            const element=list.querySelector(`[data-source-id="${savedSource.id}"]`);
            if(element)await show(element);
        },
        async removeSource(id){
            state.sources=state.sources.filter(source=>source.id!==id);
            const element=document.querySelector(`.source[data-source-id="${id}"]`);
            if(element){
                await hide(element);
                element.remove();
            }
        },
        async updateRecord(savedRecord){
            if(!savedRecord?.id)return;
            state.records=await getRecords(state.object.id);
            const oldElement=document.querySelector(`.record[data-record-id="${savedRecord.id}"]`);
            if(oldElement)oldElement.outerHTML=renderRecord(savedRecord,state.subjects);
        },
        async updatePhoto(savedPhoto,uploading=false){
            if(!savedPhoto?.id)return;
            state.photos=await getPhotos(state.object.id);
            const element=document.querySelector(`.photo-card[data-photo-id="${savedPhoto.id}"]`);
            if(element)element.outerHTML=renderPhoto({...savedPhoto,isUploading:Boolean(uploading)});
        },
        async updateSource(savedSource){
            if(!savedSource?.id)return;
            state.sources=await getSources(state.object.id);
            const element=document.querySelector(`.source[data-source-id="${savedSource.id}"]`);
            if(element)element.outerHTML=renderSource(savedSource,state.subjects);
        },
        async updateChildrenBlock(){}
        ,
        async onObjectDeleted(){
            const parent=state.parents?.[0];
            window.location.href=parent?.id?`object.html?id=${parent.id}`:"index.html";
        },
        async onSubjectDeleted(){
            window.location.reload();
        }
    };
}
