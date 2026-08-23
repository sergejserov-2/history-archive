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
import{openSubjectModal}from"./subject.js";
import{openSubjectsModal}from"./subjects.js";
import{openTypesModal}from"./types.js";
import{openActivityModal}from"./activity.js";
import{openFeedbacksModal}from"./feedbacks.js";
import{openFeedbackFormByObjectId}from"./feedbackForm.js";
import{openFeedbackModal}from"./feedback.js";

export const photoPreviewModal={
    type:"photo-preview",
    params:["id","entityId"],
    load:async params=>{
        if(!params.id||!params.entityId)return null;
        const photos=await getPhotos(params.id);
        const photo=photos.find(item=>item.id===params.entityId);
        if(!photo)return null;
        return{photo,photos};
    },
    open:async data=>{
        if(!data)return;
        openPhotoViewer(data.photo,{fromUrl:true,photos:data.photos});
    }
};

export const editorModal={
    type:"editor",
    admin:true,
    params:["id","entityId","entityType"],
    load:async params=>{
        if(!params.entityId||!params.entityType)return null;
        const objects=await getAllObjects();

        if(["objectType","recordType","subjectType"].includes(params.entityType)){
            let entity=null;
            let context={};

            if(params.entityType==="objectType"){
                entity=await getType(params.entityId);
                if(!entity)return null;
                const types=await getTypes();
                context={objects,types};
            }

            if(params.entityType==="recordType"){
                entity=await getRecordType(params.entityId);
                if(!entity)return null;
                const recordTypes=await getRecordTypes();
                context={objects,recordTypes};
            }

            if(params.entityType==="subjectType"){
                entity=await getSubjectType(params.entityId);
                if(!entity)return null;
                const subjectTypes=await getSubjectTypes();
                context={objects,subjectTypes};
            }

            return{entity,type:params.entityType,objects,context};
        }

        if(params.entityType==="subject"){
            const[subject,subjects,subjectTypes]=await Promise.all([
                getSubject(params.entityId),
                getSubjects(),
                getSubjectTypes()
            ]);
            if(!subject)return null;
            return{
                entity:subject,
                type:"subject",
                objects,
                subjects,
                subjectTypes,
                context:{objects,subjects,subjectTypes}
            };
        }

        if(!params.id)return null;

if(params.entityType==="object"){

    const object=await getObject(params.entityId);

    if(!object)return null;

    const[type,types,children,photos]=await Promise.all([
        getType(object.typeId),
        getTypes(),
        getChildren(object.id),
        getPhotos(object.id)
    ]);

    return{
        entity:object,
        type:"object",
        objects,
        children,
        photos,
        types,
        context:{
            objects
        }
    };
}

        if(!["photo","source","record"].includes(params.entityType)){
            console.error("Unknown entity type:",params.entityType);
            return null;
        }

        let entities=[];

        if(params.entityType==="photo")entities=await getPhotos(params.id);
        if(params.entityType==="source")entities=await getSources(params.id);
        if(params.entityType==="record")entities=await getRecords(params.id);

        const entity=entities.find(item=>item.id===params.entityId);
        if(!entity)return null;

        return{
            entity,
            type:params.entityType,
            objects,
            context:{
                parentId:params.id,
                objects
            }
        };
    },
    open:async data=>{
        if(!data)return;

        if(["objectType","recordType","subjectType"].includes(data.type)){
            await openEditor(data.type,data.entity,data.context);
            return;
        }

        if(data.type==="object"){
            await openEditor("object",data.entity,{
                ...data.context,
                types:data.types,
                objects:data.objects,
                children:data.children,
                photos:data.photos
            });
            return;
        }

        if(data.type==="subject"){
            await openEditor("subject",data.entity,{
                ...data.context,
                objects:data.objects,
                subjects:data.subjects,
                subjectTypes:data.subjectTypes
            });
            return;
        }

        await openEditor(data.type,data.entity,data.context);
    }
};

export const loginModal={
    type:"login",
    params:[],
    load:null,
    open:null
};

export const subjectModal={
    type:"subject",
    params:["entityId"],
    load:async params=>{
        if(!params.entityId)return null;

        const[
            subject,
            subjects,
            objects,
            photos,
            sources,
            records,
            subjectTypes
        ]=await Promise.all([
            getSubject(params.entityId),
            getSubjects(),
            getAllObjects(),
            getAllPhotos(),
            getAllSources(),
            getAllRecords(),
            getSubjectTypes()
        ]);

        if(!subject)return null;

        return{
            subject,
            subjects,
            objects,
            photos,
            sources,
            records,
            subjectTypes
        };
    },
    open:async data=>{
        if(!data)return;

        openSubjectModal(data.subject,{
            subjects:data.subjects,
            objects:data.objects,
            photos:data.photos,
            sources:data.sources,
            records:data.records,
            subjectTypes:data.subjectTypes,
            fromUrl:true
        });
    }
};

export const subjectsModal={
    type:"subjects",
    params:[],
    load:null,
    open:async()=>{
        await openSubjectsModal();
    }
};

export const typesModal={
    type:"types",
    admin:true,
    params:[],
    load:null,
    open:async()=>{
        await openTypesModal();
    }
};

export const activityModal={
    type:"activity",
    admin:true,
    params:[],
    load:null,
    open:async()=>{
        await openActivityModal();
    }
};

export const feedbacksModal={
    type:"feedbacks",
    admin:true,
    params:[],
    load:null,
    open:async()=>{
        await openFeedbacksModal();
    }
};

export const feedbackModal={
    type:"feedback",
    params:["objectId"],
    load:async params=>{
        if(!params.objectId)return null;

        return{
            objectId:params.objectId
        };
    },
    open:async data=>{
        if(!data)return;

        await openFeedbackFormByObjectId(
            data.objectId
        );
    }
};

export const feedbackViewModal={
    type:"feedback-view",
    admin:true,
    params:["entityId"],

    load:async params=>{

        if(!params.entityId){
            return null;
        }

        const feedback=
            await getFeedback(
                params.entityId
            );

        if(!feedback){
            return null;
        }

        return{
            feedback
        };
    },

    open:async data=>{

        if(!data){
            return;
        }

        openFeedbackModal(
            data.feedback
        );
    }
};

export const modalRegistry=[
    photoPreviewModal,
    editorModal,
    loginModal,
    subjectModal,
    subjectsModal,
    typesModal,
    activityModal,
    feedbacksModal,
    feedbackModal,
    feedbackViewModal
];
