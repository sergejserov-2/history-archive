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
