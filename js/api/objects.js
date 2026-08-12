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
    // Получаем только валидных родителей
    // ======================================

    const validParents =

        Array.isArray(object.parents)

            ?

            object.parents.filter(parent => {

                return (

                    parent &&
                    typeof parent === "object" &&
                    parent.objectId

                );

            })

            :

            [];

    // ======================================
    // Корневой объект
    //
    // В базе может быть:
    //
    // parents: []
    //
    // или старое:
    //
    // parents: [""]
    //
    // В обоих случаях это корень.
    // ======================================

    if (
        validParents.length === 0
    ) {

        const type =
            await getType(
                object.typeId
            );

        return [[

            {

                id:
                    object.id,

                address:
                    object.address ?? "",

                level:
                    type?.level ?? null

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
        of validParents
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
        // Получаем тип текущего объекта
        // ==================================

        const type =
            await getType(
                object.typeId
            );

        // ==================================
        // Добавляем текущий объект
        //
        // Адрес берём именно из связи
        // текущий объект → родитель.
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
                            type?.level ?? null

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
