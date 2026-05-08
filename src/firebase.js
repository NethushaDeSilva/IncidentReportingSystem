import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbQXa3ayDzZyd0ar3A7ZSg51vJO1FH0Go",
  authDomain: "incident-reporting-syste-d16bc.firebaseapp.com",
  projectId: "incident-reporting-syste-d16bc",
  storageBucket: "incident-reporting-syste-d16bc.firebasestorage.app",
  messagingSenderId: "636795870331",
  appId: "1:636795870331:web:b37068952ef6d327f1d6de",
  measurementId: "G-XZ7GDGYYTS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);