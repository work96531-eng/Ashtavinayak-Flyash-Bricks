// Firebase client-side config for Ashtavinayak Flyash Bricks
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPdr3rnb3euBVlNNfMakj1ZAZ1RdOQ4cw",
  authDomain: "ashtavinayak-flyash-bricks.firebaseapp.com",
  projectId: "ashtavinayak-flyash-bricks",
  storageBucket: "ashtavinayak-flyash-bricks.firebasestorage.app",
  messagingSenderId: "500456158819",
  appId: "1:500456158819:web:320ce14b1420565141ea56"
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
