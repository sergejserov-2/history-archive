// ======================================
// Activity API
// ======================================

import {db} from "../firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    limit
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Get activity
// ======================================

export async function getActivity(limitCount=500){

    const q=query(
        collection(db,"activity"),
        orderBy("timestamp","desc"),
        limit(limitCount)
    );

    const snapshot=await getDocs(q);

    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Add activity
// ======================================

export async function addActivity(data={}){

    const activity={
        action:data.action??"",
        entityType:data.entityType??"",
        entityId:data.entityId??"",
        entityTitle:data.entityTitle??"",
        targetType:data.targetType??"",
        targetId:data.targetId??"",
        userEmail:data.userEmail??"",
        timestamp:Date.now()
    };

    const ref=await addDoc(
        collection(db,"activity"),
        activity
    );

    return{
        id:ref.id,
        ...activity
    };
}
