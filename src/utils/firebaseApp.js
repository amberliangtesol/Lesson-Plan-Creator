// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDN7Wsnq01CSkSuEG2PKrckZyiuYnmyn4g",
  authDomain: "lesson-plan-creator.firebaseapp.com",
  projectId: "lesson-plan-creator",
  storageBucket: "lesson-plan-creator.appspot.com",
  messagingSenderId: "582929675572",
  appId: "1:582929675572:web:025b81c7c14c32e1d22161",
  measurementId: "G-WGC6CGYYCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;