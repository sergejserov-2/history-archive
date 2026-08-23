import{
    setupTypesEditor,
    renderTypesEditorHTML
}from"./editor/types.js";

import{
    setupTypeEditor,
    renderTypeEditorHTML
}from"./editor/type.js";

import{
    setupStatusEditor,
    renderStatusEditorHTML
}from"./editor/status.js";

import{
    setupParentsEditor,
    renderParentsEditorHTML
}from"./editor/parents.js";

import{
    setupFileEditor,
    renderFileEditorHTML
}from"./editor/file.js";

import{
    setupCoverEditor,
    renderCoverEditorHTML
}from"./editor/cover.js";

import{
    setupDateModeEditor,
    renderDateModeEditorHTML
}from"./editor/date.js";

import{
    setupFieldsEditor,
    renderFieldsEditorHTML
}from"./editor/fields.js";


export function renderEntityEditor(
    cfg,
    entity
){

    entity=
        entity??{};

    if(cfg.entityType==="type"){

        const typeEditor=
            renderTypeEditorHTML(
                cfg,
                entity
            );

        return`
            <div class="entity-editor">
                ${typeEditor}

                <div class="entity-editor__buttons">
                    <button id="entitySave">
                        Сохранить
                    </button>

                    <button id="entityCancel">
                        Отмена
                    </button>
                </div>
            </div>
        `;

    }

    const options=
        cfg.options??{};

    const limits=
        cfg.limits??{};

    const dateEditor=
        cfg.dateMode
            ?
            renderDateModeEditorHTML(
                cfg,
                entity
            )
            :
            "";

    const typeEditor=
        options.typeSelector
            ?
            renderTypesEditorHTML(
                options.types??[],
                entity,
                options
            )
            :
            "";

    const fields=
        renderFieldsEditorHTML(
            cfg,
            entity,
            limits
        );

    const parents=
        cfg.parentsType
            ?
            renderParentsEditorHTML()
            :
            "";

    const file=
        cfg.file
            ?
            renderFileEditorHTML()
            :
            "";

    const cover=
        cfg.cover&&entity?.id
            ?
            renderCoverEditorHTML(
                cfg,
                entity
            )
            :
            "";

    const status=
        cfg.status
            ?
            renderStatusEditorHTML()
            :
            "";

    return`
        <div class="entity-editor">

            ${
                options.typeSelector
                    ?
                    `
                    <div class="entity-row entity-row--title-type">
                        ${typeEditor}
                        ${fields.titleField}
                    </div>
                    `
                    :
                    fields.titleField
            }

            ${fields.descriptionField}

            ${
                cfg.parentsType
                    ?
                    `
                    <label>
                        Родители
                        ${parents}
                    </label>
                    `
                    :
                    ""
            }

            ${
                fields.authorField
                    ?
                    `
                    <div class="entity-row entity-row--author-date">
                        ${fields.authorField}
                        ${dateEditor}
                    </div>
                    `
                    :
                    dateEditor
            }

            ${file}

            ${cover}

            ${status}

            <div class="entity-editor__buttons">

                <button id="entitySave">
                    Сохранить
                </button>

                <button id="entityCancel">
                    Отмена
                </button>

            </div>

        </div>
    `;

}


export function setupEditorComponents(
    root,
    cfg,
    context={},
    entity={}
){

    if(cfg.entityType==="type"){

        return{
            typeEditor:
                setupTypeEditor(
                    root,
                    entity,
                    cfg
                ),

            async getData(){

                const typeEditor=
                    this.typeEditor;

                if(!typeEditor){
                    return null;
                }

                return{
                    data:
                        typeEditor.getData(),

                    backgroundTask:null
                };

            }
        };

    }

    const options=
        cfg.options??{};

    const fileEditor=
        cfg.file
            ?
            setupFileEditor(
                root,
                entity,
                cfg.upload,
                {
                    required:
                        cfg.fileRequired===true,

                    requiredMessage:
                        cfg.fileRequiredMessage
                }
            )
            :
            null;

    const fieldsEditor=
        setupFieldsEditor(
            root,
            cfg,
            entity
        );

    const typeEditor=
        options.typeSelector
            ?
            setupTypesEditor(
                root,
                entity,
                {
                    types:
                        options.types??[],

                    objects:
                        options.objects??
                        context.objects??
                        [],

                    children:
                        options.children??
                        context.children??
                        [],

                    parentId:
                        options.parentId??
                        context.parentId,

                    parents:
                        entity.parents??[]
                }
            )
            :
            null;

    const parents=
        entity.parents
            ?
            [...entity.parents]
            :
            context.parentId
                ?
                cfg.parentsType==="objectsWithAddress"
                    ?
                    [
                        {
                            objectId:
                                context.parentId,

                            address:""
                        }
                    ]
                    :
                    [
                        context.parentId
                    ]
                :
                [];

    const parentsEditor=
        cfg.parentsType
            ?
            setupParentsEditor(
                root,
                context.objects??[],
                entity,
                parents,
                {
                    address:
                        cfg.parentsType==="objectsWithAddress",

                    types:
                        options.types??
                        context.types??
                        [],

                    typeSelector:
                        options.typeSelector===true,

                    children:
                        options.children??
                        context.children??
                        [],

                    getTypeId:
                        ()=>typeEditor?.getTypeId(),

                    requiredMessage:
                        cfg.parentsRequiredMessage
                }
            )
            :
            null;

    const statusEditor=
        setupStatusEditor(
            root,
            entity,
            cfg.status===true
        );

    const dateModeEditor=
        cfg.dateMode
            ?
            setupDateModeEditor(
                root,
                cfg,
                entity
            )
            :
            null;

    const coverEditor=
        cfg.cover
            ?
            setupCoverEditor(
                root,
                cfg.cover.photos??[],
                entity
            )
            :
            null;

    return{

        fileEditor,

        parentsEditor,

        fieldsEditor,

        typeEditor,

        statusEditor,

        dateModeEditor,

        coverEditor,

        async getData(){

            if(
                fileEditor&&
                !fileEditor.validate()
            ){
                return null;
            }

            if(
                parentsEditor&&
                !parentsEditor.validate()
            ){
                return null;
            }

            if(
                dateModeEditor&&
                !dateModeEditor.validate()
            ){
                return null;
            }

            const data={};

            Object.assign(
                data,
                fieldsEditor.getData()
            );

            if(typeEditor?.getTypeId()){
                data.typeId=
                    typeEditor.getTypeId();
            }

            if(cfg.status){
                data.status=
                    statusEditor.getStatus();
            }

            if(dateModeEditor){

                Object.assign(
                    data,
                    dateModeEditor.getData()
                );

            }

            if(parentsEditor){

                data.parents=
                    parentsEditor.getParents();

            }

            if(coverEditor){

                Object.assign(
                    data,
                    coverEditor.getData()
                );

            }

            let backgroundTask=null;

            if(fileEditor){

                const fileData=
                    fileEditor.getData();

                if(fileData){

                    if(fileData.backgroundTask){

                        backgroundTask=
                            fileData.backgroundTask;

                    }

                    delete fileData.backgroundTask;

                    Object.assign(
                        data,
                        fileData
                    );

                }

            }

            return{
                data,
                backgroundTask
            };

        }

    };

}


export function setupEditorButtons(
    root,
    onSave,
    onCancel
){

    const saveButton=
        root.querySelector(
            "#entitySave"
        );

    const cancelButton=
        root.querySelector(
            "#entityCancel"
        );

    if(saveButton){
        saveButton.onclick=
            onSave;
    }

    if(cancelButton){
        cancelButton.onclick=
            onCancel;
    }

}

export{
    setupParentsEditor,
    setupFileEditor,
    setupCoverEditor
};
