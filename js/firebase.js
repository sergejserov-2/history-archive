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

  apiKey: "AIzaSyD3hUrEJpbrKl84fZkEZ3fKA-igKKvoWUw",

  authDomain: "history-archive-84fe7.firebaseapp.com",

  projectId: "history-archive-84fe7",

  storageBucket: "history-archive-84fe7.firebasestorage.app",

  messagingSenderId: "416658660084",

  appId: "1:416658660084:web:2745b77fce5836b646dca1"

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
