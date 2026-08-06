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

export async function getSources(objectId) {

    const q = query(

        collection(
            db,
            "sources"
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

export async function updateSource(

    id,

    data

){

    await updateDoc(

        doc(

            db,

            "sources",

            id

        ),

        data

    );

}

export async function createSource(

    data

){

    const ref =

        await addDoc(

            collection(

                db,

                "sources"

            ),

            data

        );

    return {

        id: ref.id,

        ...data

    };

}

export async function deleteSource(

    id

){

    await deleteDoc(

        doc(

            db,

            "sources",

            id

        )

    );

}
