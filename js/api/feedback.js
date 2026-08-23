// ======================================
// Feedback API
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
// Get feedback
// ======================================

export async function getFeedback(id){

    if(!id)return null;

    const snapshot=await getDoc(
        doc(db,"feedback",id)
    );

    if(!snapshot.exists())return null;

    return{
        id:snapshot.id,
        ...snapshot.data()
    };
}

// ======================================
// Get feedbacks
// ======================================

export async function getFeedbacks(){

    const snapshot=await getDocs(
        query(
            collection(db,"feedback"),
            orderBy("createdAt","desc")
        )
    );

    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}

// ======================================
// Get recent feedbacks
// ======================================

export async function getRecentFeedbacks(count=100){

    const snapshot=await getDocs(
        query(
            collection(db,"feedback"),
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
// Create feedback
// ======================================

export async function createFeedback(data){

    if(!data?.name?.trim()){
        throw new Error("Укажите имя");
    }

    if(!data?.title?.trim()){
        throw new Error("Укажите заголовок");
    }

    if(!data?.message?.trim()){
        throw new Error("Напишите сообщение");
    }

    const feedback={

        name:
            data.name.trim(),

        email:
            data.email?.trim()??"",

        title:
            data.title.trim(),

        message:
            data.message.trim(),

        objectId:
            data.objectId??null,

        objectTitle:
            data.objectTitle??"",

        file:
            data.file
                ?{
                    name:data.file.name,
                    type:data.file.type,
                    size:data.file.size
                }
                :null,

        status:
            "new",

        createdAt:
            Date.now()
    };

    const ref=await addDoc(
        collection(db,"feedback"),
        feedback
    );

    return{
        id:ref.id,
        ...feedback
    };
}

// ======================================
// Delete feedback
// ======================================

export async function deleteFeedback(id){

    if(!id)return;

    await deleteDoc(
        doc(db,"feedback",id)
    );
}
