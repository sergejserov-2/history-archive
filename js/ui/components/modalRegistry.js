import{getPhotos}from"../../api/photos.js";
import{getSources}from"../../api/sources.js";
import{getRecords}from"../../api/records.js";
import{getObject,getType,getChildren,getAllObjects}from"../../api/objects.js";
import{getTypes}from"../../api/types.js";
import{getSubject,getSubjects}from"../../api/subjects.js";
import{openPhotoViewer}from"./photoViewer.js";
import{openEditor}from"../../admin/editorConfig.js";
import{openSubjectModal}from"./subject.js";

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
        if(!params.id||!params.entityType)return null;

        const objects=await getAllObjects();

        if(params.entityType==="object"){
            if(!params.entityId)return null;

            const object=await getObject(params.entityId);
            if(!object)return null;

            const hasParent=(object.parents??[]).some(parent=>
                typeof parent==="string"
                    ?parent===params.id
                    :parent?.objectId===params.id
            );

            if(!hasParent)return null;

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
                    parentId:params.id,
                    objects
                }
            };
        }

        if(!["photo","source","record"].includes(params.entityType)){
            console.error("Unknown entity type:",params.entityType);
            return null;
        }

        let entities=[];

        if(params.entityType==="photo")
            entities=await getPhotos(params.id);

        if(params.entityType==="source")
            entities=await getSources(params.id);

        if(params.entityType==="record")
            entities=await getRecords(params.id);

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

        if(data.type==="object"){
            openEditor(
                "object",
                data.entity,
                {
                    ...data.context,
                    types:data.types,
                    objects:data.objects,
                    children:data.children,
                    photos:data.photos
                },
                ()=>location.reload()
            );
            return;
        }

        openEditor(
            data.type,
            data.entity,
            data.context,
            ()=>location.reload()
        );
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
    params:["id","entityId"],
    load:async params=>{
        if(!params.id||!params.entityId)return null;

        const subject=await getSubject(params.entityId);
        if(!subject)return null;

        const subjects=await getSubjects();

        return{subject,subjects};
    },
    open:async data=>{
        if(!data)return;

        openSubjectModal(
            data.subject,
            {
                subjects:data.subjects,
                fromUrl:true
            }
        );
    }
};

export const modalRegistry=[
    photoPreviewModal,
    editorModal,
    loginModal,
    subjectModal
];
