import{getObject,deleteObject,createObject,updateObject}from"../api/objects.js";
import{getPhoto,deletePhoto,createPhoto,updatePhoto,getPhotos}from"../api/photos.js";
import{getSource,deleteSource,createSource,updateSource,getSources}from"../api/sources.js";
import{getRecord,deleteRecord,createRecord,updateRecord,getRecords}from"../api/records.js";
import{getSubject,deleteSubject,createSubject,updateSubject}from"../api/subjects.js";
import{getType,createType,updateType,deleteType}from"../api/types.js";
import{getRecordType,createRecordType,updateRecordType,deleteRecordType}from"../api/recordTypes.js";
import{getSubjectType,createSubjectType,updateSubjectType,deleteSubjectType}from"../api/subjectTypes.js";
import{moveFileToDeleted,uploadPhoto,uploadSourceDocument}from"../api/storage.js";
import{renderRecords}from"../ui/components/records.js";
import{renderPhotos}from"../ui/components/photos.js";
import{renderSources}from"../ui/components/sources.js";
import{renderChildren}from"../ui/components/children.js";
import{updateSubjectModal,setSubjectUploading}from"../ui/components/subject.js";

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
    let savedData;
if(entity?.id){

    await api.update(entity.id,data);

    savedData={
        id:entity.id,
        ...data
    };

}else{

    if(
        type==="objectType"||
        type==="recordType"||
        type==="subjectType"
    ){
        savedData=await api.create(
            data.id,
            data
        );
    }else{
        savedData=await api.create(data);
    }
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
        await deleteObject(id);
        await context.updates?.onObjectDeleted?.(id);
        return{parentId};
    }
    if(type==="photo"){
        const photo=(context.photos??[]).find(photo=>photo.id===id);
        if(photo?.storagePath)await moveFileToDeleted(photo.storagePath);
        if(photo?.previewPath)await moveFileToDeleted(photo.previewPath);
        await deletePhoto(id);
        await context.updates?.updatePhotosBlock?.();
        return;
    }
    if(type==="source"){
        const source=(context.sources??[]).find(source=>source.id===id);
        if(source?.storagePath)await moveFileToDeleted(source.storagePath);
        await deleteSource(id);
        await context.updates?.updateSourcesBlock?.();
        return;
    }
    if(type==="record"){
        await deleteRecord(id);
        await context.updates?.updateRecordsBlock?.();
        return;
    }
    if(type==="subject"){
        const subject=(context.subjects??[]).find(subject=>subject.id===id);
        if(subject?.storagePath)await moveFileToDeleted(subject.storagePath);
        await deleteSubject(id);
        await context.updates?.onSubjectDeleted?.();
        return;
    }
    if(type==="objectType"){
        await deleteType(id);
        return;
    }
    if(type==="recordType"){
        await deleteRecordType(id);
        return;
    }
    if(type==="subjectType"){
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
            if(block)block.outerHTML=state.renderObjectBlock();
        },
        async updateSubjectBlock(savedSubject=null,uploading=false){
            if(savedSubject?.id)state.subject={...state.subject,...savedSubject};
            if(!state.subject?.id)return;
            setSubjectUploading(state.subject.id,Boolean(uploading));
            state.subject=await getSubject(state.subject.id);
            if(!state.subject)return;
            updateSubjectModal(state.subject,{
                subjects:state.subjects,
                objects:state.objects,
                photos:state.photos,
                sources:state.sources,
                records:state.records,
                subjectTypes:state.subjectTypes
            });
            await state.renderSubjectBlock?.();
        },
        async updateRecordsBlock(savedRecord=null){
            if(!state.object)return;
            state.records=await getRecords(state.object.id);
            if(savedRecord?.id&&!state.records.some(record=>record.id===savedRecord.id))state.records.push(savedRecord);
            const block=document.querySelector(".records");
            if(block){
                block.outerHTML=renderRecords(state.records,state.recordTypes,state.admin,state.subjects);
                return;
            }
            if(state.admin||state.records.length)document.querySelector(".object__info")?.insertAdjacentHTML("beforeend",renderRecords(state.records,state.recordTypes,state.admin));
        },
        async updatePhotosBlock(savedPhoto=null,uploading=false){
            if(!state.object)return;
            state.photos=await getPhotos(state.object.id);
            if(savedPhoto?.id&&!state.photos.some(photo=>photo.id===savedPhoto.id))state.photos.push(savedPhoto);
            const photosForRender=state.photos.map(photo=>({...photo,isUploading:Boolean(uploading)&&photo.id===savedPhoto?.id}));
            const gallery=document.querySelector("#gallery");
            if(!gallery){
                if(state.admin||photosForRender.length){
                    const sources=document.querySelector("#sources");
                    const html=`<section id="gallery"><h2>Фотографии</h2>${renderPhotos(photosForRender,state.admin)}</section>`;
                    if(sources)sources.insertAdjacentHTML("beforebegin",html);
                    else document.querySelector(".page")?.insertAdjacentHTML("beforeend",html);
                }
            }else{
                gallery.innerHTML=`<h2>Фотографии</h2>${renderPhotos(photosForRender,state.admin)}`;
            }
            await state.renderCoverState?.();
        },
        async updateSourcesBlock(savedSource=null){
            if(!state.object)return;
            state.sources=await getSources(state.object.id);
            if(savedSource?.id&&!state.sources.some(source=>source.id===savedSource.id))state.sources.push(savedSource);
            const block=document.querySelector("#sources");
            if(!block){
                if(state.admin||state.sources.length){
                    const children=document.querySelector("#children");
                    const html=`<section id="sources"><h2>Источники</h2>${renderSources(state.sources,state.admin,state.subjects)}</section>`;
                    if(children)children.insertAdjacentHTML("beforebegin",html);
                    else document.querySelector(".page")?.insertAdjacentHTML("beforeend",html);
                }
                return;
            }
            block.innerHTML=`<h2>Источники</h2>${renderSources(state.sources,state.admin,state.subjects)}`;
        },
        async updateChildrenBlock(){
            if(!state.object)return;
            state.children=await state.getChildren();
            const block=document.querySelector("#children");
            const html=`<h2>Дочерние объекты</h2>${await renderChildren(state.children,state.admin,state.object,state.objects,state.types)}`;
            if(block)block.innerHTML=html;
            else if(state.admin||state.children.length)document.querySelector(".page")?.insertAdjacentHTML("beforeend",`<section id="children">${html}</section>`);
        },
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
