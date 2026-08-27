
import{getPhotos,getAllPhotos}from"../../api/photos.js";
import{getSources,getAllSources}from"../../api/sources.js";
import{getRecords,getAllRecords}from"../../api/records.js";
import{getObject,getType,getChildren,getAllObjects}from"../../api/objects.js";
import{getTypes}from"../../api/types.js";
import{getRecordType,getRecordTypes}from"../../api/recordTypes.js";
import{getSubject,getSubjects}from"../../api/subjects.js";
import{getSubjectType,getSubjectTypes}from"../../api/subjectTypes.js";
import{getFeedback}from"../../api/feedback.js";
import{openPhotoViewer}from"./photoViewer.js";
import{openEditor}from"../../admin/editorConfig.js";
import{openLoginModal}from"./loginModal.js";
import{openSubjectModal}from"./subject.js";
import{openSubjectsModal}from"./subjects.js";
import{openTypesModal}from"./types.js";
import{openActivityModal}from"./activity.js";
import{openFeedbacksModal}from"./feedbacks.js";
import{openFeedbackModal}from"./feedback.js";
import{openFeedbackFormByObjectId}from"./feedbackForm.js";

export const photoPreviewModal={
    type:"photo-preview",
    params:["id","entityId","feedbackId"],
    load:async params=>{
        if(params.feedbackId){
            const feedback=await getFeedback(params.feedbackId);
            if(!feedback)return null;
            const photos=Array.isArray(feedback.photoIds)?feedback.photoIds:[];
            const gallery=photos.map((item,index)=>({id:String(index),title:"",description:"",previewPath:item.previewPath,storagePath:item.storagePath}));
            const photo=gallery.find(item=>item.id===String(params.entityId));
            if(!photo)return null;
            return{photo,photos:gallery,showInfo:false,urlParams:{feedbackId:params.feedbackId}};
        }

        if(!params.id||!params.entityId)return null;

        const photos=await getPhotos(params.id);

        const sortedPhotos=[...(photos??[])].sort((a,b)=>{
            const dateA=a.date||"",dateB=b.date||"";

            if(!dateA&&!dateB){
                const author=(a.author??"").localeCompare(b.author??"","ru");
                return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
            }

            if(!dateA)return 1;
            if(!dateB)return -1;

            const date=String(dateB).localeCompare(String(dateA));
            if(date!==0)return date;

            const author=(a.author??"").localeCompare(b.author??"","ru");
            return author!==0?author:(a.title??"").localeCompare(b.title??"","ru");
        });

        const photo=sortedPhotos.find(item=>item.id===params.entityId);

        if(!photo)return null;

        return{photo,photos:sortedPhotos,showInfo:true,urlParams:{id:params.id}};
    },
    open:async data=>{
        if(data)openPhotoViewer(data.photo,{fromUrl:true,photos:data.photos,showInfo:data.showInfo,urlParams:data.urlParams});
    }
};

export const editorModal={
    type:"editor",
    admin:true,
    params:["entityId","entityType"],
    load:async params=>{
        if(!params.entityId||!params.entityType)return null;

        const pageId=new URL(window.location.href).searchParams.get("id");
        const objects=await getAllObjects();

        if(["objectType","recordType","subjectType"].includes(params.entityType)){
            let entity=null,context={};

            if(params.entityType==="objectType"){
                entity=await getType(params.entityId);
                if(!entity)return null;
                context={objects,types:await getTypes()};
            }

            if(params.entityType==="recordType"){
                entity=await getRecordType(params.entityId);
                if(!entity)return null;
                context={objects,recordTypes:await getRecordTypes()};
            }

            if(params.entityType==="subjectType"){
                entity=await getSubjectType(params.entityId);
                if(!entity)return null;
                context={objects,subjectTypes:await getSubjectTypes()};
            }

            return{entity,type:params.entityType,objects,context};
        }

        if(params.entityType==="subject"){
            const[subject,subjects,subjectTypes]=await Promise.all([getSubject(params.entityId),getSubjects(),getSubjectTypes()]);
            if(!subject)return null;
            return{entity:subject,type:"subject",objects,subjects,subjectTypes,context:{objects,subjects,subjectTypes}};
        }

        if(!pageId)return null;

        if(params.entityType==="object"){
            const object=await getObject(params.entityId);
            if(!object)return null;
            const[type,types,children,photos]=await Promise.all([getType(object.typeId),getTypes(),getChildren(object.id),getPhotos(object.id)]);
            return{entity:object,type:"object",objects,children,photos,types,context:{objects,parentId:pageId}};
        }

        if(!["photo","source","record"].includes(params.entityType))return null;

        let entities=[];

        if(params.entityType==="photo")entities=await getPhotos(pageId);
        if(params.entityType==="source")entities=await getSources(pageId);
        if(params.entityType==="record")entities=await getRecords(pageId);

        const entity=entities.find(item=>item.id===params.entityId);

        if(!entity)return null;

        return{entity,type:params.entityType,objects,context:{parentId:pageId,objects}};
    },
    open:async data=>{
        if(!data)return;

        if(["objectType","recordType","subjectType"].includes(data.type))return openEditor(data.type,data.entity,data.context);

        if(data.type==="object")return openEditor("object",data.entity,{...data.context,types:data.types,objects:data.objects,children:data.children,photos:data.photos});

        if(data.type==="subject")return openEditor("subject",data.entity,{...data.context,objects:data.objects,subjects:data.subjects,subjectTypes:data.subjectTypes});

        return openEditor(data.type,data.entity,data.context);
    }
};

export const loginModal={type:"login",params:[],load:null,open:async()=>openLoginModal({fromUrl:true})};

export const subjectModal={
    type:"subject",
    params:["entityId"],
    load:async params=>{
        if(!params.entityId)return null;

        const[subject,subjects,objects,photos,sources,records,subjectTypes]=await Promise.all([getSubject(params.entityId),getSubjects(),getAllObjects(),getAllPhotos(),getAllSources(),getAllRecords(),getSubjectTypes()]);

        if(!subject)return null;

        return{subject,subjects,objects,photos,sources,records,subjectTypes};
    },
    open:async data=>{
        if(data)openSubjectModal(data.subject,{subjects:data.subjects,objects:data.objects,photos:data.photos,sources:data.sources,records:data.records,subjectTypes:data.subjectTypes,fromUrl:true});
    }
};

export const subjectsModal={type:"subjects",params:[],load:null,open:async()=>openSubjectsModal()};
export const typesModal={type:"types",admin:true,params:[],load:null,open:async()=>openTypesModal()};
export const activityModal={type:"activity",admin:true,params:[],load:null,open:async()=>openActivityModal()};
export const feedbacksModal={type:"feedbacks",admin:true,params:[],load:null,open:async()=>openFeedbacksModal({fromUrl:true})};

export const feedbackViewModal={
    type:"feedback-view",
    params:["entityId"],
    load:async params=>{
        if(!params.entityId)return null;
        const feedback=await getFeedback(params.entityId);
        return feedback?{feedback}:null;
    },
    open:async data=>{
        if(data)openFeedbackModal(data.feedback,{fromUrl:true});
    }
};

export const feedbackModal={
    type:"feedback",
    params:["objectId"],
    load:async params=>params.objectId?{objectId:params.objectId}:null,
    open:async data=>{
        if(data)openFeedbackFormByObjectId(data.objectId);
    }
};

export const modalRegistry=[photoPreviewModal,editorModal,loginModal,subjectModal,subjectsModal,typesModal,activityModal,feedbacksModal,feedbackViewModal,feedbackModal];
