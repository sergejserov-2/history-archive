import{moveFileToDeleted}from"../../../api/storage.js";

export function setupFileEditor(root,entity,upload,options={}){

    const fileInput=
        root.querySelector(
            "#entityFile"
        );

    if(!fileInput)return null;

    const multiple=
        options.multiple===true;

    const MAX_FILES=10;

    let file=null;
    let files=[];

    let removeOldFile=false;

    const oldStoragePath=
        entity?.storagePath??null;

    const oldPreviewPath=
        entity?.previewPath??null;

    const fileSelect=
        root.querySelector(
            "#entityFileSelect"
        );

    const fileCurrent=
        root.querySelector(
            "#entityFileCurrent"
        );

    const fileName=
        root.querySelector(
            "#entityFileName"
        );

    const fileRemove=
        root.querySelector(
            "#entityFileRemove"
        );

    const filesList=
        root.querySelector(
            "#entityFilesList"
        );

    fileInput.multiple=
        multiple;

    function renderFileState(){

        if(multiple){

            if(filesList){

                filesList.innerHTML=
                    files.map(
                        (item,index)=>`
                            <div
                                class="entity-file__current"
                                data-index="${index}"
                            >
                                <span>
                                    ${escapeHTML(item.name)}
                                </span>

                                <span
                                    class="entity-file__remove"
                                    data-index="${index}"
                                >
                                    ×
                                </span>
                            </div>
                        `
                    ).join("");
            }

            fileSelect.hidden=
                files.length>=MAX_FILES;

            return;
        }

        if(file){

            fileSelect.hidden=true;
            fileCurrent.hidden=false;
            fileInput.disabled=true;

            fileName.textContent=
                file.name;

            return;
        }

        if(
            oldStoragePath&&
            !removeOldFile
        ){

            fileSelect.hidden=true;
            fileCurrent.hidden=false;
            fileInput.disabled=true;

            fileName.textContent=
                oldStoragePath
                    .split("/")
                    .pop();

            return;
        }

        fileSelect.hidden=false;
        fileCurrent.hidden=true;
        fileInput.disabled=false;

        fileName.textContent="";
    }

    fileSelect.onclick=()=>{

        if(!fileInput.disabled){
            fileInput.click();
        }
    };

    fileInput.onchange=event=>{

        if(multiple){

            const selectedFiles=
                Array.from(
                    event.target.files??[]
                );

            for(
                const selectedFile
                of selectedFiles
            ){

                if(
                    files.length>=
                    MAX_FILES
                ){
                    break;
                }

                files.push(
                    selectedFile
                );
            }

            fileInput.value="";

            renderFileState();

            return;
        }

        file=
            event.target.files[0]
            ??null;

        removeOldFile=false;

        renderFileState();
    };

    if(multiple&&filesList){

        filesList.onclick=event=>{

            const removeButton=
                event.target.closest(
                    ".entity-file__remove"
                );

            if(!removeButton)return;

            const index=
                Number(
                    removeButton.dataset.index
                );

            if(
                !Number.isFinite(index)
            ){
                return;
            }

            files.splice(
                index,
                1
            );

            renderFileState();
        };
    }

    if(
        !multiple&&
        fileRemove
    ){

        fileRemove.onclick=event=>{

            event.stopPropagation();

            file=null;

            fileInput.value="";

            removeOldFile=true;

            renderFileState();
        };
    }

    renderFileState();

    return{

        hasFile(){

            if(multiple){
                return files.length>0;
            }

            return(
                !!file||
                (
                    !!oldStoragePath&&
                    !removeOldFile
                )
            );
        },

        validate(){

            if(
                !options.required||
                this.hasFile()
            ){
                return true;
            }

            alert(
                options.requiredMessage||
                "Необходимо выбрать файл"
            );

            return false;
        },

        getData(){

            if(
                !multiple&&
                removeOldFile
            ){

                return{

                    storagePath:null,
                    previewPath:null,
                    hasNewFile:false,

                    backgroundTask:async()=>{

                        if(oldStoragePath){
                            await moveFileToDeleted(
                                oldStoragePath
                            );
                        }

                        if(oldPreviewPath){
                            await moveFileToDeleted(
                                oldPreviewPath
                            );
                        }
                    }
                };
            }

            if(multiple){

                if(!files.length){
                    return null;
                }

                return{
                    files:[...files]
                };
            }

            if(!file)return null;

            const selectedFile=
                file;

            if(
                typeof upload!==
                "function"
            ){
                throw new Error(
                    "Для загрузки файла не задан upload"
                );
            }

            return{

                storagePath:null,
                previewPath:null,

                hasNewFile:true,

                backgroundTask:async(
                    savedEntity,
                    update
                )=>{

                    const result=
                        await upload(
                            selectedFile
                        );

                    if(!result)return;

                    await update(
                        savedEntity.id,
                        {
                            storagePath:
                                result.storagePath
                                ??null,

                            previewPath:
                                result.previewPath
                                ??null
                        }
                    );
                }
            };
        }
    };
}

export function renderFileEditorHTML(
    options={}
){

    const multiple=
        options.multiple===true;

    if(multiple){

        return`
            <label>
                Файлы

                <div class="entity-file">

                    <div
                        id="entityFilesList"
                    ></div>

                    <div
                        id="entityFileSelect"
                        class="entity-file__select"
                    >
                        Выбрать файл
                    </div>

                </div>
            </label>

            <input
                id="entityFile"
                type="file"
                multiple
                hidden>
        `;
    }

    return`
        <label>
            Файл

            <div class="entity-file">

                <div
                    id="entityFileSelect"
                    class="entity-file__select"
                >
                    Выбрать файл
                </div>

                <div
                    id="entityFileCurrent"
                    class="entity-file__current"
                    hidden
                >
                    <span
                        id="entityFileName"
                    ></span>

                    <span
                        id="entityFileRemove"
                        class="entity-file__remove"
                    >
                        ×
                    </span>
                </div>

            </div>
        </label>

        <input
            id="entityFile"
            type="file"
            hidden
        >
    `;
}

function escapeHTML(value=""){

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
