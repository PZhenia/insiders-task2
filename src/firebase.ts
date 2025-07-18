import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAoFF5mNKsSanJ_kHzAaaY9rHIYxixnctM",
    authDomain: "insiders-task2.firebaseapp.com",
    projectId: "insiders-task2",
    storageBucket: "insiders-task2.firebasestorage.app",
    messagingSenderId: "291162001837",
    appId: "1:291162001837:web:338def608f8cea91bf9124",
    measurementId: "G-L7SC0TE3GM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);