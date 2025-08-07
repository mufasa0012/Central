// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCj8eCI6flestqr1GUTTsBDZ9Z9qD_MueY",
  authDomain: "shop-center-c86d7.firebaseapp.com",
  projectId: "shop-center-c86d7",
  storageBucket: "shop-center-c86d7.appspot.com",
  messagingSenderId: "736744503489",
  appId: "1:736744503489:web:3c90c3e8c7cf196ceb7c40",
  measurementId: "G-KSM932YCSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
