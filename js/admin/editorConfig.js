import{createModal}from"../ui/components/modal.js";
import{renderEntityEditor,setupEditorComponents,setupEditorButtons}from"../ui/components/editor.js";
import{getEntity,updateEntity,uploadPhoto,uploadSourceDocument}from"./update.js";
import{getAllObjects}from"../api/objects.js";
import{getAllRecords}from"../api/records.js";
import{getSubjects}from"../api/subjects.js";

const ALL_TARGETS={
    objectType:{title:"Объект",levels:"single"},
    recordType:{title:"Запись",levels:"multiple"},
    subjectType:{title:"Субъект",levels:"none"}
};

const CONFIG={
    object:{title:"Объект",fields:[],status:true,parentsType:"objectsWithAddress",parentsRequiredMessage:"Нужен хотя бы один родитель",limits:{title:60,description:350},cover:{photos:[]},options:{typeSelector:true,types:[],defaultTypeId:"",disabledTypeIds:[]},updates:["updateObjectBlock"]},
    photo:{title:"Фото",upload:uploadPhoto,file:true,fileRequired:true,fileRequiredMessage:"Для фотографии необходимо выбрать файл",parentsType:"objects",dateMode:"date",limits:{title:45,description:350,author:45},fields:["author","date"],updates:["updatePhotosBlock"]},
    source:{title:"Источник",upload:uploadSourceDocument,file:true,fileRequired:true,fileRequiredMessage:"Для источника необходимо выбрать файл",parentsType:"objects",dateMode:"date",limits:{title:45,description:2000,author:45},fields:["author","date"],updates:["updateSourcesBlock"]},
    record:{title:"Запись",file:false,parentsType:"objects",dateMode:"period",limits:{title:45,description:75},fields:["dateStart","dateEnd"],options:{typeSelector:true},updates:["updateRecordsBlock"]},
    subject:{title:"Субъект",file:true,upload:uploadPhoto,fileRequired:false,dateMode:"period",limits:{title:60,description:350},fields:["dateStart","dateEnd"],options:{typeSelector:true,types:[]},updates:["updateSubjectBlock"]},
    objectType:{title:"Тип объекта",entityType:"type",typeEditor:true,limits:{title:45,id:45},typeCategory:"objectType",targets:ALL_TARGETS},
    recordType:{title:"Тип записи",entityType:"type",typeEditor:true,limits:{title:45,id:45},typeCategory:"recordType",targets:ALL_TARGETS},
    subjectType:{title:"Тип субъекта",entityType:"type",typeEditor:true,limits:{title:45,id:45},typeCategory:"subjectType",targets:ALL_TARGETS}
};

function getDefaultEntity(type){
    if(type==="object")return{title:"Новый объект"};
    if(type==="photo")return{title:"Новая фотография"};
    if(type==="source")return{title:"Новый источник"};
    if(type==="record")return{title:"Новая запись"};
    if(type==="subject")return{title:"Новый субъект"};
    return{};
}

async function getTypeUsage(type,entity,context={}){
    if(!entity?.id)return false;
    const[objects,records,subjects]=await Promise.all([
        context.objects??getAllObjects(),
        context.records??getAllRecords(),
        context.subjects??getSubjects()
    ]);
    return objects.some(item=>item.typeId===entity.id)||records.some(item=>item.typeId===entity.id)||subjects.some(item=>item.typeId===entity.id);
}

async function getConfig(type,entity,context={}){
    const base=CONFIG[type];
    if(!base){
        console.error("Unknown entity type",type);
        return null;
    }

    const cfg={...base,options:{...(base.options??{})}};
    cfg.subjects=context.subjects??[];

    if(cfg.typeEditor){
        cfg.targets=ALL_TARGETS;
        cfg.used=await getTypeUsage(type,entity,context);
        return cfg;
    }

    if(cfg.options.typeSelector){
        if(type==="subject")cfg.options.types=context.subjectTypes??[];
        else{
            cfg.options.types=context.recordTypes??context.types??[];
            cfg.options.objects=context.objects??[];
            cfg.options.children=context.children??[];
            cfg.options.parentId=context.parentId;
        }
    }

    if(type==="object"){
        cfg.options.types=context.types??[];
        cfg.options.objects=context.objects??[];
        cfg.options.children=context.children??[];
        cfg.options.parentId=context.parentId;
        cfg.cover={...cfg.cover,photos:context.photos??[]};
    }

    return cfg;
}

export async function openEditor(type,entity,context={}){

    if(entity?.id){
        entity=await getEntity(type,entity.id);
        if(!entity)return;
    }

    entity=entity??getDefaultEntity(type);

    const cfg=await getConfig(type,entity,context);

    if(!cfg)return;

    const form=renderEntityEditor(cfg,entity);
const modal=createModal({
    title:entity.id
        ?`Изменить ${cfg.title.toLowerCase()}`
        :`Добавить ${cfg.title.toLowerCase()}`,
    content:form,,
    admin: true
});

    const root=modal.root;
    const editor=setupEditorComponents(root,cfg,context,entity);

    setupEditorButtons(root,async()=>{

        try{

            const result=await editor.getData();

            if(!result)return;

            const{data,backgroundTask}=result;

            const hasBackgroundTask=
                typeof backgroundTask==="function" &&
                data.hasNewFile===true;

            delete data.hasNewFile;

            const isNewEntity=!entity?.id;

            const updates=
                type==="photo" ||
                type==="subject" ||
                cfg.typeEditor
                    ?[]
                    :(cfg.updates??[]);

            const savedEntity=await updateEntity(
                type,
                entity,
                data,
                context,
                updates
            );

            if(type==="photo"&&savedEntity?.id){
                await context.updates?.updatePhotosBlock?.(
                    savedEntity,
                    hasBackgroundTask
                );
            }

            if(type==="subject"&&savedEntity?.id){
                await context.updates?.updateSubjectBlock?.(
                    savedEntity,
                    hasBackgroundTask
                );
            }

            modal.close();

            if(
                type==="object" &&
                isNewEntity &&
                savedEntity?.id
            ){
                window.location.href=
                    `object.html?id=${savedEntity.id}`;
                return;
            }

            if(hasBackgroundTask){

                void backgroundTask(
                    savedEntity,
                    async(id,updateData)=>{

                        await updateEntity(
                            type,
                            savedEntity,
                            updateData,
                            context,
                            []
                        );

                        if(type==="photo"&&savedEntity?.id){
                            await context.updates?.updatePhotosBlock?.(
                                null,
                                false
                            );
                        }

                        if(type==="subject"&&savedEntity?.id){
                            await context.updates?.updateSubjectBlock?.(
                                null,
                                false
                            );
                        }
                    }
                ).catch(async error=>{

                    console.error(
                        "Ошибка фоновой загрузки файла:",
                        error
                    );

                    if(type==="photo"&&savedEntity?.id){
                        await context.updates?.updatePhotosBlock?.(
                            null,
                            false
                        );
                    }

                    if(type==="subject"&&savedEntity?.id){
                        await context.updates?.updateSubjectBlock?.(
                            null,
                            false
                        );
                    }
                });
            }

        }catch(error){

            console.error(
                "Ошибка сохранения:",
                error
            );

            alert("Ошибка сохранения");
        }

    },()=>modal.close());
}
