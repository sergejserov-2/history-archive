// ======================================
// Entity editors
// ======================================

import {createModal} from "../ui/components/modal.js";
import {renderEntityEditor,setupEditorComponents,setupEditorButtons} from "../ui/components/editor.js";
import {getEntity,updateEntity,uploadPhoto,uploadSourceDocument} from "./update.js";

const CONFIG={
    object:{title:"Объект",fields:[],status:true,parentsType:"objectsWithAddress",parentsRequiredMessage:"Нужен хотя бы один родитель",limits:{title:60,description:350},cover:{photos:[]},options:{typeSelector:true,types:[],defaultTypeId:"",disabledTypeIds:[]},updates:["updateObjectBlock","updateRecordsBlock"]},
    photo:{title:"Фото",upload:uploadPhoto,file:true,fileRequired:true,fileRequiredMessage:"Для фотографии необходимо выбрать файл",parentsType:"objects",dateMode:"date",limits:{title:45,description:350,author:45},fields:["author","date"],updates:["updatePhotosBlock"]},
    source:{title:"Источник",upload:uploadSourceDocument,file:true,fileRequired:true,fileRequiredMessage:"Для источника необходимо выбрать файл",parentsType:"objects",dateMode:"date",limits:{title:45,description:2000,author:45},fields:["author","date"],updates:["updateSourcesBlock"]},
    record:{title:"Запись",file:false,parentsType:"objects",dateMode:"period",limits:{title:45,description:75},fields:["dateStart","dateEnd"],options:{typeSelector:true},updates:["updateRecordsBlock"]}
};

function getDefaultEntity(type){
    if(type==="object")return {title:"Новый объект"};
    if(type==="photo")return {title:"Новая фотография"};
    if(type==="source")return {title:"Новый источник"};
    if(type==="record")return {title:"Новая запись"};
    return {};
}

function getConfig(type,entity,context={}){
    const base=CONFIG[type];
    if(!base){
        console.error("Unknown entity type",type);
        return null;
    }

    const cfg={...base,options:{...(base.options??{})}};

    if(cfg.options.typeSelector){
        cfg.options.types=context.recordTypes??context.types??[];
        cfg.options.objects=context.objects??[];
        cfg.options.children=context.children??[];
        cfg.options.parentId=context.parentId;
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

    const cfg=getConfig(type,entity,context);
    if(!cfg)return;

    const form=renderEntityEditor(cfg,entity);
    const modal=createModal({title:entity.id?`Изменить ${cfg.title.toLowerCase()}`:`Добавить ${cfg.title.toLowerCase()}`,content:form});
    const root=modal.root;
    const editor=setupEditorComponents(root,cfg,context,entity);

    setupEditorButtons(root,async()=>{
        try{
            const result=await editor.getData();
            if(!result)return;

            const {data,backgroundTask}=result;

            // Фото сначала создаём в Firestore без previewPath.
            // Никаких updatePhotosBlock здесь.
            const updates=type==="photo"?[]:(cfg.updates??[]);

            const savedEntity=await updateEntity(type,entity,data,context,updates);

            // Карточка появляется сразу и получает анимацию.
if(type==="photo"&&savedEntity?.id){
    await context.updates?.updatePhotosBlock?.(
        savedEntity,
        Boolean(backgroundTask)
    );
}

            modal.close();

            // Реальная загрузка файла идёт здесь.
            if(backgroundTask){
                void backgroundTask(savedEntity,async(id,updateData)=>{
                    await updateEntity(type,savedEntity,updateData,context,[]);

                    // Только теперь снимаем состояние загрузки.
                    if(type==="photo"&&savedEntity?.id){
                        await context.updates?.updatePhotosBlock?.(null,false);
                    }
                }).catch(async error=>{
                    console.error("Ошибка фоновой загрузки файла:",error);

                    if(type==="photo"&&savedEntity?.id){
                        await context.updates?.updatePhotosBlock?.(null,false);
                    }
                });
            }
        }catch(error){
            console.error("Ошибка сохранения:",error);
            alert("Ошибка сохранения");
        }
    },()=>modal.close());
}
