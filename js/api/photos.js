import {
    collection,
    query,
    where,
    getDocs
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
