
// ======================================
// File picker editor
// ======================================

//1. SETUP
export function setupFileEditor(
    root, entity,upload
){
    const fileInput =
        root.querySelector("#entityFile");

    if(!fileInput){return null;}
    
    let file = null;
    let removeOldFile = false;

    const oldStoragePath = entity?.storagePath ?? null;
    const oldPreviewPath = entity?.previewPath ?? null;

    const fileSelect = root.querySelector("#entityFileSelect");
    const fileCurrent = root.querySelector("#entityFileCurrent");
    const fileName = root.querySelector("#entityFileName");
    const fileRemove = root.querySelector("#entityFileRemove");

    function renderFileState(){
        if(file){
            fileSelect.hidden = true;
            fileCurrent.hidden = false;
            fileInput.disabled = true;
            fileName.textContent = file.name;
            return;
        }
        if(oldStoragePath && !removeOldFile){
            fileSelect.hidden = true;
            fileCurrent.hidden = false;
            fileInput.disabled = true;
            fileName.textContent = oldStoragePath.split("/").pop();
            return;
        }
        fileSelect.hidden =false;
        fileCurrent.hidden = true;
        fileInput.disabled = false;
        fileName.textContent = "";
    }

    fileSelect.onclick = ()=>{
        if(!fileInput.disabled){fileInput.click();}
    };

    fileInput.onchange = e=>{
        file = e.target.files[0] || null;
        renderFileState();
    };

    fileRemove.onclick = e=>{
        e.stopPropagation();
        file = null;
        fileInput.value = "";
        removeOldFile = true;
        renderFileState();
    };

    renderFileState();
    return {
        hasFile(){
            return (
                !!file || (!!oldStoragePath && !removeOldFile)
            );
        },

        async getData(){
            const data = {};
            if(removeOldFile && oldStoragePath){
                data.removedStoragePath = oldStoragePath;
            }
            if(removeOldFile && oldPreviewPath){
                data.removedPreviewPath = oldPreviewPath;
            }
            if(file){
                const result = await upload(file);
                if(result?.storagePath){
                    data.storagePath = result.storagePath;
                }
                if(result?.previewPath){
                    data.previewPath = result.previewPath;
                }
            }
            if(!data.storagePath &&
                !data.previewPath &&
                !data.removedStoragePath &&
                !data.removedPreviewPath
            ){return null;}
            
            return data;
        }

    };

}


export function renderFileEditorHTML(){
    return `
        <label>
            Файл
            <div class="entity-file">
                <div
                    id="entityFileSelect"
                    class="entity-file__select admin-button"
                >
                    Выбрать файл
                </div>
                <div
                    id="entityFileCurrent"
                    class="entity-file__current"
                    hidden
                >
                    <span id="entityFileName"></span>
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
