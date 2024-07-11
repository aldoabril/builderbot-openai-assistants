import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyAprSBZYIYG_Qpr4reb12lt8DcCasp3i4E",
    authDomain: "sysdent-devs.firebaseapp.com",
    databaseURL: "https://sysdent-devs-default-rtdb.firebaseio.com",
    projectId: "sysdent-devs",
    storageBucket: "sysdent-devs.appspot.com",
    messagingSenderId: "688456294615",
    appId: "1:688456294615:web:91b1dcdae96ca88048d092"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db;
