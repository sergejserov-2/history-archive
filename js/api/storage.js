// ======================================
// Storage API
// Yandex Object Storage uploader
// ======================================

// URL публичной Cloud Function

const STORAGE_API_URL =

    "https://functions.yandexcloud.net/d4elsso1sp6lbhui52l7";

// ======================================
// Upload file
// ======================================

export async function uploadFile(

    file,

    folder = "photos/originals"

){

    if(!file){

        throw new Error(
            "Файл не выбран"
        );

    }

    const formData =

        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "folder",
        folder
    );

    const response =

        await fetch(

            STORAGE_API_URL,

            {

                method:"POST",

                body:formData

            }

        );

    if(!response.ok){

        throw new Error(

            "Ошибка загрузки файла: "

            +

            response.status

        );

    }

    const result =

        await response.json();

    if(!result.success){

        throw new Error(

            result.error ||

            "Неизвестная ошибка хранения"

        );

    }

    return {

        storagePath:
            result.storagePath

    };

}

// ======================================
// Move file to deleted
// ======================================

export async function moveFileToDeleted(

    storagePath

){

    if(!storagePath){

        throw new Error(
            "Не указан storagePath"
        );

    }

    const formData =

        new FormData();

    formData.append(
        "action",
        "move-to-deleted"
    );

    formData.append(
        "storagePath",
        storagePath
    );

    const response =

        await fetch(

            STORAGE_API_URL,

            {

                method:"POST",

                body:formData

            }

        );

    if(!response.ok){

        throw new Error(

            "Ошибка переноса файла: "

            +

            response.status

        );

    }

    const result =

        await response.json();

    if(!result.success){

        throw new Error(

            result.error ||

            "Неизвестная ошибка переноса файла"

        );

    }

    return {

        storagePath:
            result.storagePath

    };

}

// ======================================
// Upload photo original
// ======================================

export async function uploadPhotoOriginal(

    file

){

    return uploadFile(

        file,

        "photos/originals"

    );

}

// ======================================
// Upload photo preview
// ======================================

export async function uploadPhotoPreview(

    file

){

    return uploadFile(

        file,

        "photos/preview"

    );

}

export async function uploadPhoto(

    file

){

    if(!file){

        throw new Error(
            "Файл не выбран"
        );

    }

    // ======================================
    // Original
    // ======================================

    const original =
        await uploadPhotoOriginal(
            file
        );

    // ======================================
    // Preview
    // ======================================

    const previewFile =
        await createPhotoPreview(
            file
        );

    const preview =
        await uploadPhotoPreview(
            previewFile
        );

    return {

        storagePath:
            original.storagePath,

        previewPath:
            preview.storagePath

    };

}

// ======================================
// Create photo preview
// ======================================

async function createPhotoPreview(

    file

){

    const image =
        await loadImage(file);

    const MAX_SIZE = 800;

    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;

    // ======================================
    // Resize
    // ======================================

    if(
        width > MAX_SIZE ||
        height > MAX_SIZE
    ){

        const ratio =
            Math.min(

                MAX_SIZE / width,

                MAX_SIZE / height

            );

        width =
            Math.round(
                width * ratio
            );

        height =
            Math.round(
                height * ratio
            );

    }

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        width;

    canvas.height =
        height;

    const context =
        canvas.getContext(
            "2d"
        );

    context.drawImage(

        image,

        0,
        0,

        width,
        height

    );

    const blob =
        await new Promise(

            resolve => {

                canvas.toBlob(

                    resolve,

                    "image/jpeg",

                    0.82

                );

            }

        );

    if(!blob){

        throw new Error(
            "Не удалось создать превью"
        );

    }

    return new File(

        [blob],

        "preview.jpg",

        {
            type:
                "image/jpeg"
        }

    );

}

// ======================================
// Load image
// ======================================

function loadImage(

    file

){

    return new Promise(

        (resolve, reject) => {

            const image =
                new Image();

            const url =
                URL.createObjectURL(
                    file
                );

            image.onload = ()=>{

                URL.revokeObjectURL(
                    url
                );

                resolve(
                    image
                );

            };

            image.onerror = ()=>{

                URL.revokeObjectURL(
                    url
                );

                reject(

                    new Error(
                        "Не удалось прочитать изображение"
                    )

                );

            };

            image.src =
                url;

        }

    );

}

// ======================================
// Upload source document
// ======================================

export async function uploadSourceDocument(

    file

){

    return uploadFile(

        file,

        "sources/documents"

    );

}
