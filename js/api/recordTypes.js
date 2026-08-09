// ======================================
// Record Types API
// ======================================
//
// Отдельно от типов объектов.
//
// Коллекция Firestore:
// recordTypes
//
// Структура:
// {
//     title: "Перестройка",
//     levels: [1, 2]
// }
//
// levels — уровни объектов, для которых
// разрешён данный тип записи.
//
// ВАЖНО:
// Этот API никак не связан с types.js.
// Типы объектов остаются в коллекции "types".
// ======================================

import {

    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc

}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {

    db

}
from "../firebase.js";

// ======================================
// Get all record types
// ======================================

export async function getRecordTypes(){

    const snapshot =

        await getDocs(

            collection(
                db,
                "recordTypes"
            )

        );

    return snapshot.docs.map(

        doc => ({

            id:
                doc.id,

            ...doc.data()

        })

    );

}

// ======================================
// Get one record type
// ======================================

export async function getRecordType(

    typeId

){

    if(!typeId){

        return null;

    }

    const snapshot =

        await getDoc(

            doc(

                db,
                "recordTypes",

                typeId

            )

        );

    if(!snapshot.exists()){

        return null;

    }

    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}

// ======================================
// Create record type
// ======================================

export async function createRecordType(

    data

){

    const ref =

        await addDoc(

            collection(

                db,
                "recordTypes"

            ),

            data

        );

    return {

        id:
            ref.id,

        ...data

    };

}

// ======================================
// Update record type
// ======================================

export async function updateRecordType(

    id,

    data

){

    await updateDoc(

        doc(

            db,

            "recordTypes",

            id

        ),

        data

    );

}

// ======================================
// Delete record type
// ======================================

export async function deleteRecordType(

    id

){

    await deleteDoc(

        doc(

            db,

            "recordTypes",

            id

        )

    );

}
