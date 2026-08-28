// ======================================
// Records API
// ======================================
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    addDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {db} from "../firebase.js";
export async function getRecord(id){
    if(!id)return null;
    const snapshot=await getDoc(doc(db,"records",id));
    if(!snapshot.exists())return null;
    return{...snapshot.data(),id:snapshot.id};
}

export async function getRecords(objectId){
    const q=query(collection(db,"records"),where("parents","array-contains",objectId));
    const snapshot=await getDocs(q);
    return snapshot.docs.map(doc=>({...doc.data(),id:doc.id}));
}

export async function getAllRecords(){
    const snapshot=await getDocs(collection(db,"records"));
    return snapshot.docs.map(doc=>({...doc.data(),id:doc.id}));
}
// ======================================
// Update record
// ======================================
export async function updateRecord(id, data) {
    await updateDoc(doc(db, "records", id), data);
}
// ======================================
// Create record
// ======================================
export async function createRecord(data) {
    const ref = await addDoc(collection(db, "records"), data);
    return {id: ref.id, ...data};
}
// ======================================
// Delete record
// ======================================
export async function deleteRecord(id) {
    await deleteDoc(doc(db, "records", id));
}
