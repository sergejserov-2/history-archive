// ======================================
// Admin authentication / mode
// ======================================

import {

    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut

}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    auth
}
from "../firebase.js";

// ======================================
// State
// ======================================

let ADMIN_MODE = false;

let authReady = false;

let currentUser = null;

const listeners = [];

// ======================================
// Auth state
// ======================================

onAuthStateChanged(

    auth,

    user => {

        currentUser = user;

ADMIN_MODE = !!user;

authReady = true;

listeners.forEach(

            callback => {

                callback(

                    ADMIN_MODE,

                    currentUser

                );

            }

        );

    }

);

// ======================================
// Get current state
// ======================================

export function isAdmin(){

    return ADMIN_MODE;

}

// ======================================
// Get current user
// ======================================

export function getCurrentUser(){

    return currentUser;

}

// ======================================
// Auth initialized
// ======================================

export function isAuthReady(){

    return authReady;

}

// ======================================
// Listen for auth changes
// ======================================

export function onAdminStateChanged(

    callback

){

    listeners.push(callback);

    // Если состояние уже известно —
    // сразу передаём его.

    if(authReady){

        callback(

            ADMIN_MODE,

            currentUser

        );

    }

    // Возвращаем функцию отписки

    return ()=>{

        const index =
            listeners.indexOf(callback);

        if(index !== -1){

            listeners.splice(index,1);

        }

    };

}

// ======================================
// Login
// ======================================

export async function login(

    email,

    password

){

    return await signInWithEmailAndPassword(

        auth,

        email,

        password

    );

}

// ======================================
// Logout
// ======================================

export async function logout(){

    await signOut(auth);

}
