
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyBclOs62x3CezjlKmWbFyYhiQqhnQKZ_vA",
    authDomain: "accounting-line.firebaseapp.com",
    projectId: "accounting-line",
    storageBucket: "accounting-line.appspot.com",
    messagingSenderId: "1070509230524",
    appId: "1:1070509230524:web:81b32057d4d8a7c2c183b9",
    measurementId: "G-CELL822QX1"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}