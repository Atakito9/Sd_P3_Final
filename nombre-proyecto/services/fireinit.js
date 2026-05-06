// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDZYsUdNDA6rHebx4YCw2Mb4YGWb4S0TTs",

  authDomain: "hosting-peli.firebaseapp.com",

  projectId: "hosting-peli",

  storageBucket: "hosting-peli.firebasestorage.app",

  messagingSenderId: "442605924134",

  appId: "1:442605924134:web:c693cd8693bcdf4dc2dbe7",

  measurementId: "G-YBD4T88JX9"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {db}
