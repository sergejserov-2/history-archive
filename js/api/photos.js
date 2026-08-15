// ======================================
// Photos API
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
// Get photo
// ======================================
export async function getPhoto(id) {
    if(!id) return null;
    const snapshot = await getDoc(doc(db, "photos", id));
    if(!snapshot.exists()) return null;
    return {id: snapshot.id, ...snapshot.data()};
}
// ======================================
// Get photos
// ======================================
export async function getPhotos(objectId) {
    const q = query(collection(db, "photos"), where("parents", "array-contains", objectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}
// ======================================
// Update photo
// ======================================
export async function updatePhoto(id, data) {
    await updateDoc(doc(db, "photos", id), data);
}
// ======================================
// Create photo
// ======================================
export async function createPhoto(data) {
    const ref = await addDoc(collection(db, "photos"), data);
    return {id: ref.id, ...data};
}
// ======================================
// Delete photo
// ======================================
export async function deletePhoto(id) {
    await deleteDoc(doc(db, "photos", id));
}



export async function getAllPhotos(){
    const snapshot=await getDocs(collection(db,"photos"));
    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}
