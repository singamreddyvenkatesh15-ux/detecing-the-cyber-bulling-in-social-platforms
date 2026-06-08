// src/firebase.js  
import { initializeApp } from "firebase/app";  
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';   

const firebaseConfig = {
  apiKey: "AIzaSyCGpqz7NRi7BOCfWbznqpyEwA1WEsiF7d4",
  authDomain: "cyberguardian-62208.firebaseapp.com",
  projectId: "cyberguardian-62208",
  storageBucket: "cyberguardian-62208.firebasestorage.app",
  messagingSenderId: "448047076426",
  appId: "1:448047076426:web:037293f3dfa10e9bc302b3",
  measurementId: "G-9H9Q0JHMY4"
};
  
// Initialize Firebase  
const app = initializeApp(firebaseConfig);  
const analytics = getAnalytics(app);  
const storage = getStorage(app); 
export { storage ,app};
