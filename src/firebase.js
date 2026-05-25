// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC6wWLvU7vzvRANwyFslm6aQlEXL5_4MM",
  authDomain: "fixnear-af5f0.firebaseapp.com",
  projectId: "fixnear-af5f0",
  storageBucket: "fixnear-af5f0.firebasestorage.app",
  messagingSenderId: "960550306965",
  appId: "1:960550306965:web:567d2caf4c5a66d6b0879c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);