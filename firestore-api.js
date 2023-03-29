import { db } from "./firebase-init.js";
import {
  getDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const verifyUser = async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists();
  };

  // Function to add a new user document to Firestore
export const addUserDocument = async (userId) => {
  try {
    const usersRef = collection(db, 'users');
    const newUserDocRef = doc(usersRef, userId);
    
    const newUserDoc = {
      userId: userId,
    };
    
    await setDoc(newUserDocRef, newUserDoc);
    
    console.log(`New user document added with userId: ${userId}`);
  } catch (error) {
    console.error('Error adding user document:', error);
  }
}


export async function addToList(list) {
  try {    
    // Add data to Firestore
    const docRef = await addDoc(collection(db, 'lists'), list);
    
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

export async function filterDataByDateAndUserId(date, userId) {
  const collectionRef = collection(db, "lists");
  const q = query(collectionRef, where("date", "==", date), where("user_id", "==", userId));
  const querySnapshot = await getDocs(q);
  const filteredData = querySnapshot.docs.map((doc) => ({...doc.data() }));
  return {date: date, list: filteredData};
}