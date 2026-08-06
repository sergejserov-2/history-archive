import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { db } from "../firebase.js";

export async function getRecords(objectId) {

    const q = query(

        collection(
            db,
            "records"
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

export async function updateRecord(

    id,

    data

){

    await updateDoc(

        doc(

            db,

            "records",

            id

        ),

        data

    );

}
