// ==========================================
// Feedback API
// ==========================================
import{
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    serverTimestamp
}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import{db}from"../firebase.js";

// ==========================================
// Create feedback
// ==========================================
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
        name:data.name.trim(),
        email:data.email?.trim()??"",
        title:data.title.trim(),
        message:data.message.trim(),
        objectId:data.objectId??null,
        objectTitle:data.objectTitle??"",
        file:data.file
            ?{
                name:data.file.name,
                type:data.file.type,
                size:data.file.size
            }
            :null,
        status:"new",
        createdAt:serverTimestamp()
    };

    const ref=
        await addDoc(
            collection(db,"feedback"),
            feedback
        );

    return{
        id:ref.id,
        ...feedback
    };
}

// ==========================================
// Get feedback
// ==========================================
export async function getFeedback(id){

    if(!id)return null;

    const snapshot=
        await getDoc(
            doc(db,"feedback",id)
        );

    if(!snapshot.exists())return null;

    return{
        id:snapshot.id,
        ...snapshot.data()
    };
}

// ==========================================
// Get all feedback
// ==========================================
export async function getAllFeedback(){

    const snapshot=
        await getDocs(
            collection(db,"feedback")
        );

    return snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));
}
