// ======================================
// Records API
// ======================================

import { db } from "../firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ======================================
// Get object records
// ======================================

export async function getRecords(objectId) {

    const recordsRef = collection(
        db,
        "records"
    );

    const q = query(

        recordsRef,

        where(
            "objectId",
            "==",
            objectId
        ),

        orderBy(
            "dateStart",
            "asc"
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
