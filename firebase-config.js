// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFep1y9I0OR5Hu_Gf0Mbywu-PEgFdQD2k",
  authDomain: "smartadmin-hr-project.firebaseapp.com",
  databaseURL: "https://smartadmin-hr-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartadmin-hr-project",
  storageBucket: "smartadmin-hr-project.firebasestorage.app",
  messagingSenderId: "797763301010",
  appId: "1:797763301010:web:2c4b5e24ac0750e67cc04b"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Export a reference to the database
export { database };