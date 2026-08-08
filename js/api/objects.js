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

// ======================================
// Get parents
// ======================================

export async function getParents(object) {

    if (!object) {

        return [];

    }

    // ======================================
    // Корневой объект
    // ======================================

    if (
        !object.parents ||
        object.parents.length === 0
    ) {

        return [[

            {
                id:
                    object.id,

                address:
                    object.address ?? "",

                level:
                    (
                        await getType(
                            object.typeId
                        )
                    )?.level ?? null

            }

        ]];

    }

    const chains = [];

    // ======================================
    // Строим отдельную цепочку
    // для каждого родителя
    // ======================================

    for (
        const parent
        of object.parents
    ) {

        const parentObject =
            await getObject(
                parent.objectId
            );

        if (!parentObject) {

            continue;

        }

        // ==================================
        // Получаем цепочки родителя
        // ==================================

        const parentChains =
            await getParents(
                parentObject
            );

        // ==================================
        // Добавляем текущий объект
        //
        // ВАЖНО:
        // address берём именно из связи
        // текущий объект → этот родитель
        // ==================================

        for (
            const parentChain
            of parentChains
        ) {

            chains.push(

                [

                    ...parentChain,

                    {

                        id:
                            object.id,

                        address:
                            parent.address ?? "",

                        level:
                            (
                                await getType(
                                    object.typeId
                                )
                            )?.level ?? null

                    }

                ]

            );

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

// ======================================
// Create object
// ======================================

export async function createObject(data){

    const ref = await addDoc(

        collection(
            db,
            "objects"
        ),

        data

    );

    return ref.id;

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
