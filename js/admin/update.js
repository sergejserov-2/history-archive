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
import{change,show,hide,getAnimationSize}from"../ui/animations/controller.js";
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
        await context.updates?.updatePhotosBlock?.();
        return;
    }
    if(type==="source"){
        const source=(context.sources??[]).find(source=>source.id===id);
        if(source?.storagePath)await moveFileToDeleted(source.storagePath);
        await createActivity({action:"delete",entityType:"source",entityId:id,title:source?.title??"",parentId:context.parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteSource(id);
        await context.updates?.updateSourcesBlock?.();
        return;
    }
    if(type==="record"){
        const record=(context.records??[]).find(record=>record.id===id);
        await createActivity({action:"delete",entityType:"record",entityId:id,title:record?.title??"",parentId:context.parentId??null,adminEmail:getAdminEmail(),createdAt:Date.now()});
        await deleteRecord(id);
        await context.updates?.updateRecordsBlock?.();
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

function nextFrame(){
    return new Promise(resolve=>requestAnimationFrame(()=>resolve()));
}

async function waitForLayout(){
    await nextFrame();
    await nextFrame();
}

async function changeBlock(block,render){
    if(!block)return false;
    const parent=block.parentElement;
    const oldSize=getAnimationSize(block);
    const parentHeight=parent?.getBoundingClientRect()?.height;
    if(parent&&Number.isFinite(parentHeight))parent.style.setProperty("height",`${parentHeight}px`,"important");
    block.innerHTML=render();
    await waitForLayout();
    let released=false;
    const release=()=>{
        if(released)return;
        released=true;
        if(parent)parent.style.removeProperty("height");
    };
    try{
        await change(block,oldSize,release);
    }finally{
        release();
    }
    return true;
}

export function createPageUpdates(state){
    return{
        async updateObjectBlock(data){
            if(data)state.object={...state.object,...data};
            state.object=await getObject(state.object.id);
            if(!state.object)return;
            const block=document.querySelector(".object");
            if(block){
                const oldSize=getAnimationSize(block);
                block.outerHTML=state.renderObjectBlock();
                const newBlock=document.querySelector(".object");
                if(newBlock){
                    const{initCoverDrag}=await import("../ui/components/coverDrag.js");
                    initCoverDrag(newBlock);
                    await change(newBlock,oldSize);
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
        async updateRecordsBlock(savedRecord=null){
            if(!state.object)return;
            state.records=await getRecords(state.object.id);
            if(savedRecord?.id&&!state.records.some(record=>record.id===savedRecord.id))state.records.push(savedRecord);
            const block=document.querySelector(".records");
            if(block){
                await changeBlock(block,()=>renderRecords(state.records,state.recordTypes,state.subjects));
                return;
            }
            if(state.records.length){
                document.querySelector(".object__info")?.insertAdjacentHTML("beforeend",renderRecords(state.records,state.recordTypes,state.subjects));
                const newBlock=document.querySelector(".records");
                if(newBlock)await show(newBlock);
            }
        },
        async updatePhotosBlock(savedPhoto=null,uploading=false){
            if(!state.object)return;
            state.photos=await getPhotos(state.object.id);
            if(savedPhoto?.id&&!state.photos.some(photo=>photo.id===savedPhoto.id))state.photos.push(savedPhoto);
            const photosForRender=state.photos.map(photo=>({...photo,isUploading:Boolean(uploading)&&photo.id===savedPhoto?.id}));
            const gallery=document.querySelector("#gallery");
            if(!gallery){
                if(photosForRender.length){
                    const sources=document.querySelector("#sources");
                    const html=`<section id="gallery"><h2>Фотографии</h2>${renderPhotos(photosForRender)}</section>`;
                    if(sources)sources.insertAdjacentHTML("beforebegin",html);
                    else document.querySelector(".page")?.insertAdjacentHTML("beforeend",html);
                    const newGallery=document.querySelector("#gallery");
                    if(newGallery)await show(newGallery);
                }
                return;
            }
            if(!photosForRender.length){
                await hide(gallery);
                gallery.remove();
                return;
            }
            await changeBlock(gallery,()=>`<h2>Фотографии</h2>${renderPhotos(photosForRender)}`);
        },
        async updateSourcesBlock(savedSource=null){
            if(!state.object)return;
            state.sources=await getSources(state.object.id);
            if(savedSource?.id&&!state.sources.some(source=>source.id===savedSource.id))state.sources.push(savedSource);
            const block=document.querySelector("#sources");
            if(!block){
                if(state.sources.length){
                    const children=document.querySelector("#children");
                    const html=`<section id="sources"><h2>Источники</h2>${renderSources(state.sources,state.subjects)}</section>`;
                    if(children)children.insertAdjacentHTML("beforebegin",html);
                    else document.querySelector(".page")?.insertAdjacentHTML("beforeend",html);
                    const newBlock=document.querySelector("#sources");
                    if(newBlock)await show(newBlock);
                }
                return;
            }
            if(!state.sources.length){
                await hide(block);
                block.remove();
                return;
            }
            await changeBlock(block,()=>`<h2>Источники</h2>${renderSources(state.sources,state.subjects)}`);
        },
        async updateChildrenBlock(){
            if(!state.object)return;
            state.children=await state.getChildren();
            const block=document.querySelector("#children");
            const html=`<h2>Дочерние объекты</h2>${await renderChildren(state.children,state.object,state.objects,state.types)}`;
            if(block){
                await changeBlock(block,()=>html);
                return;
            }
            if(state.children.length){
                document.querySelector(".page")?.insertAdjacentHTML("beforeend",`<section id="children">${html}</section>`);
                const newBlock=document.querySelector("#children");
                if(newBlock)await show(newBlock);
            }
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
