// ======================================
// Sources API
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
// ======================================
// Get source
// ======================================
export async function getSource(id) {
    if(!id) return null;
    const snapshot = await getDoc(doc(db, "sources", id));
    if(!snapshot.exists()) return null;
    return {id: snapshot.id, ...snapshot.data()};
}
// ======================================
// Get sources
// ======================================
export async function getSources(objectId) {
    const q = query(collection(db, "sources"), where("parents", "array-contains", objectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}
// ======================================
// Update source
// ======================================
export async function updateSource(id, data) {
    await updateDoc(doc(db, "sources", id), data);
}
// ======================================
// Create source
// ======================================
export async function createSource(data) {
    const ref = await addDoc(collection(db, "sources"), data);
    return {id: ref.id, ...data};
}
// ======================================
// Delete source
// ======================================
export async function deleteSource(id) {
    await deleteDoc(doc(db, "sources", id));
}


export async function getAllSources(){
    const snapshot=await getDocs(collection(db,"sources"));
    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}
