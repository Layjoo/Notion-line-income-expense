const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require ("./firebase-config.js");
const {getFirestore, doc, setDoc, Timestamp} = require("firebase/firestore")

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Save current state of data before push to database

const settingCurrentData = (type="", detail="", amout=0) =>{
    const currentData = {
        "type": type,
        "detail": detail,
        "amount": amout,
        "time_stamp": Timestamp.now()
    }
    return currentData;
}

//Push data to firestore
const pushData = async (userId, data) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data);
    console.log("pushed data to firestore")
}

//Get data form firestore

const getData = () => {

}

const user1 = settingCurrentData("expense", "ข้าว", 20);
console.log(user1)
pushData("uqe1234", user1);