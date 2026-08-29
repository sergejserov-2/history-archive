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
    limit,
    startAfter
}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function getActivity(id){
    if(!id)return null;
    const snapshot=await getDoc(doc(db,"activity",id));
    if(!snapshot.exists())return null;
    return{
        id:snapshot.id,
        ...snapshot.data()
    };
}

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

export async function getActivityPage(lastDoc=null,count=500){
    const constraints=[
        orderBy("createdAt","desc")
    ];

    if(lastDoc){
        constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(count));

    const snapshot=await getDocs(
        query(
            collection(db,"activity"),
            ...constraints
        )
    );

    return{
        activities:snapshot.docs.map(doc=>({
            id:doc.id,
            ...doc.data()
        })),
        lastDoc:snapshot.docs.at(-1)??null,
        hasMore:snapshot.docs.length===count
    };
}

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

export async function deleteActivity(id){
    if(!id)return;

    await deleteDoc(
        doc(db,"activity",id)
    );
}
