// ======================================
// Subjects API
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
// Get subject
// ======================================

export async function getSubject(id){
    if(!id)return null;
    const snapshot=await getDoc(doc(db,"subjects",id));
    if(!snapshot.exists())return null;
    return {id:snapshot.id,...snapshot.data()};
}

// ======================================
// Get subjects
// ======================================

export async function getSubjects(){
    const snapshot=await getDocs(collection(db,"subjects"));
    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Create subject
// ======================================

export async function createSubject(data){
    const ref=await addDoc(collection(db,"subjects"),data);
    return {id:ref.id,...data};
}

// ======================================
// Update subject
// ======================================

export async function updateSubject(id,data){
    if(!id)return null;
    await updateDoc(doc(db,"subjects",id),data);
    return id;
}

// ======================================
// Delete subject
// ======================================

export async function deleteSubject(id){
    if(!id)return;
    await deleteDoc(doc(db,"subjects",id));
}
