// ======================================
// Firebase initialization
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// --------------------------------------
// Firebase configuration
// --------------------------------------

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT.appspot.com",

    messagingSenderId: "YOUR_SENDER_ID",

    appId: "YOUR_APP_ID"

};

// --------------------------------------
// Initialization
// --------------------------------------

const app = initializeApp(firebaseConfig);

// --------------------------------------
// Services
// --------------------------------------

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);
