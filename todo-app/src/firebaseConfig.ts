import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCuLatzZOHTrasU-_oeoI1fCCQxlu2g1c4",
    authDomain: "todo-list-1337-42.firebaseapp.com",
    projectId: "todo-list-1337-42",
    storageBucket: "todo-list-1337-42.appspot.com",
    messagingSenderId: "247478691710",
    appId: "1:247478691710:web:05eb8954fc88ed00edb52f",
    measurementId: "G-H01MQ7KPCG"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export { auth };
