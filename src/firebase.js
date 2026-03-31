import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAK1CRgrcE15eWO5WzLqqaRvuC1BXnXvTk",
  authDomain: "slv-english.firebaseapp.com",
  projectId: "slv-english",
  storageBucket: "slv-english.firebasestorage.app",
  messagingSenderId: "41471809947",
  appId: "1:41471809947:web:73719bcceedcbeefaea93e",
  measurementId: "G-TX12G1QK0T"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
