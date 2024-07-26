import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection ,addDoc,where,query,getDocs, Timestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage,ref,uploadBytes,getDownloadURL,uploadBytesResumable} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDi66NS1JH0Rix9mM27849icOg22ujBybo",
    authDomain: "car-rental-d40c4.firebaseapp.com",
    projectId: "car-rental-d40c4",
    storageBucket: "car-rental-d40c4.appspot.com",
    messagingSenderId: "1000337116626",
    appId: "1:1000337116626:web:ba79634bf16412408fcc0b",
    measurementId: "G-327DY8LB4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase functionalities
export {
    auth,
    getDocs,
    Timestamp,
    db,
    storage,
    getAuth,
    uploadBytesResumable,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    doc,
    query,
    where,
    addDoc,
    getDoc,
    uploadBytes,
    getDownloadURL,
    setDoc,
    updateDoc,
    collection,
    ref,
    onAuthStateChanged, 

};

// Get current user
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                reject('No user logged in');
            }
        });
    });
};

// Get ID token
export const getIdToken = () => {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        if (user) {
            user.getIdToken().then((idToken) => {
                resolve(idToken);
            }).catch((error) => {
                reject(error);
            });
        } else {
            reject('No user logged in');
        }
    });
};

// Sign out
export const signOut = () => {
    firebaseSignOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Sign out error', error);
    });
};
