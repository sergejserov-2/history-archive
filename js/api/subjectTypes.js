// ======================================
// Subject Types API
// ======================================

import {db} from "../firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Get subject type
// ======================================

export async function getSubjectType(id){
    if(!id)return null;
    const snapshot=await getDoc(doc(db,"subjectTypes",id));
    if(!snapshot.exists())return null;
    return {id:snapshot.id,...snapshot.data()};
}

// ======================================
// Get subject types
// ======================================

export async function getSubjectTypes(){
    const snapshot=await getDocs(collection(db,"subjectTypes"));
    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Create subject type
// ======================================

export async function createSubjectType(data){
    const ref=await addDoc(collection(db,"subjectTypes"),data);
    return {id:ref.id,...data};
}

// ======================================
// Update subject type
// ======================================

export async function updateSubjectType(id,data){
    if(!id)return null;
    await updateDoc(doc(db,"subjectTypes",id),data);
    return id;
}

// ======================================
// Delete subject type
// ======================================

export async function deleteSubjectType(id){
    if(!id)return;
    await deleteDoc(doc(db,"subjectTypes",id));
}
