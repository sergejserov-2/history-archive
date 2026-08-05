// ======================================
// Objects API
// ======================================

import { db } from "../firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Get object by id
// ======================================

export async function getObject(id) {

    if (!id) return null;

    const ref = doc(db, "objects", id);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}

// ======================================
// Get object type
// ======================================

export async function getType(typeId) {

    if (!typeId) return null;

    const ref = doc(db, "types", typeId);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}

// ======================================
// Get all objects
// (temporary, will be optimized later)
// ======================================

export async function getAllObjects() {

    const snapshot = await getDocs(
        collection(db, "objects")
    );

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

// ======================================
// Get children
// ======================================

export async function getChildren(parentId) {

    const objects = await getAllObjects();

    return objects.filter(object => {

        if (!object.parents)
            return false;

        return object.parents.some(parent =>
            parent.objectId === parentId
        );

    });

}
