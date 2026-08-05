// ======================================
// Types API
// ======================================

import {

    collection,

    getDocs,

    doc,

    getDoc

}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {

    db

}
from "../firebase.js";

// ======================================
// Get all types
// ======================================

export async function getTypes() {

    const snapshot = await getDocs(

        collection(
            db,
            "types"
        )

    );

    return snapshot.docs.map(

        doc => ({

            id: doc.id,

            ...doc.data()

        })

    );

}

// ======================================
// Get one type
// ======================================

export async function getType(

    typeId

) {

    if (!typeId) {

        return null;

    }

    const snapshot = await getDoc(

        doc(

            db,

            "types",

            typeId

        )

    );

    if (!snapshot.exists()) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}
