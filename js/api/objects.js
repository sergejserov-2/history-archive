// ======================================
// Objects API
// ======================================

import { db } from "../firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    arrayRemove
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Get object by id
// ======================================

export async function getObject(id) {

    if (!id) return null;

    const ref = doc(
        db,
        "objects",
        id
    );

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

    const ref = doc(
        db,
        "types",
        typeId
    );

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
// ======================================

export async function getAllObjects() {

    const snapshot = await getDocs(

        collection(
            db,
            "objects"
        )

    );

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

}
// ======================================
// Get parents
// ======================================

export async function getParents(object) {
    if(!object) return [];

    const validParents = Array.isArray(object.parents)
        ? object.parents.filter(parent => parent && typeof parent === "object" && parent.objectId)
        : [];

    const type = await getType(object.typeId);

    if(validParents.length === 0) {
        return [[{
            id: object.id,
            address: object.address ?? "",
            level: type?.level ?? null
        }]];
    }

    const chains = [];

    for(const parent of validParents) {
        const parentObject = await getObject(parent.objectId);
        if(!parentObject) continue;

        const parentChains = await getParents(parentObject);
        if(!Array.isArray(parentChains)) continue;

        for(const parentChain of parentChains) {
            if(!Array.isArray(parentChain)) continue;

            chains.push([
                ...parentChain,
                {
                    id: object.id,
                    address: parent.address ?? "",
                    level: type?.level ?? null
                }
            ]);
        }
    }

    return chains;
}

// ======================================
// Get children
// ======================================

export async function getChildren(parentId) {

    const objects = await getAllObjects();

    return objects.filter(object => {

        if (!object.parents) {

            return false;

        }

        return object.parents.some(parent =>

            parent.objectId === parentId

        );

    });

}


export async function updateObject(id, data) {
    if(!id) return null;

    await updateDoc(
        doc(db, "objects", id),
        data
    );

    return id;
}

// ======================================
// Create object
// ======================================

export async function createObject(data) {

    const ref =
        await addDoc(
            collection(
                db,
                "objects"
            ),
            data
        );

    return {
        id: ref.id,
        ...data
    };
}

// ======================================
// Delete object
// ======================================

export async function deleteObject(id){

    const objects = await getAllObjects();

    const children = objects.filter(object =>

        object.parents?.some(

            parent => parent.objectId === id

        )

    );

    // Удаляем детей или отвязываем родителя

    for(const child of children){

        const otherParents =

            child.parents.filter(

                parent =>

                parent.objectId !== id

            );

        if(otherParents.length === 0){

            await deleteObject(

                child.id

            );

        }

        else{

            await updateDoc(

                doc(

                    db,

                    "objects",

                    child.id

                ),

                {

                    parents: otherParents

                }

            );

        }

    }

    // Удаляем сам объект

    await deleteDoc(

        doc(

            db,

            "objects",

            id

        )

    );

}
