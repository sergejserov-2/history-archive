// ======================================
// Activity API
// ======================================

import{db}from"../firebase.js";

import{
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    limit
}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Get activity
// ======================================

export async function getActivity(id){

    if(!id)return null;

    const snapshot=await getDoc(
        doc(db,"activity",id)
    );

    if(!snapshot.exists())return null;

    return{
        id:snapshot.id,
        ...snapshot.data()
    };
}

// ======================================
// Get activities
// ======================================

export async function getActivities(){

    const snapshot=await getDocs(
        query(
            collection(db,"activity"),
            orderBy("createdAt","desc")
        )
    );

    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Get recent activities
// ======================================

export async function getRecentActivities(count=100){

    const snapshot=await getDocs(
        query(
            collection(db,"activity"),
            orderBy("createdAt","desc"),
            limit(count)
        )
    );

    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Create activity
// ======================================

export async function createActivity(data){

    const ref=await addDoc(
        collection(db,"activity"),
        data
    );

    return{
        id:ref.id,
        ...data
    };
}

// ======================================
// Delete activity
// ======================================

export async function deleteActivity(id){

    if(!id)return;

    await deleteDoc(
        doc(db,"activity",id)
    );
}
