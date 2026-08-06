import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "../firebase.js";

export async function getPhotos(objectId) {

    const q = query(

        collection(
            db,
            "photos"
        ),

        where(
            "parents",
            "array-contains",
            objectId
        )

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(
        doc => ({

            id: doc.id,

            ...doc.data()

        })
    );

}

export async function updatePhoto(

    id,

    data

){

    await updateDoc(

        doc(

            db,

            "photos",

            id

        ),

        data

    );

}

export async function createPhoto(

    data

){

    const ref =

        await addDoc(

            collection(

                db,

                "photos"

            ),

            data

        );

    return {

        id: ref.id,

        ...data

    };

}

export async function deletePhoto(

    id

){

    await deleteDoc(

        doc(

            db,

            "photos",

            id

        )

    );

}
