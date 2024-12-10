// import { auth, db } from './config';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const signUp = async (email, password, userData) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await firestore()
            .collection('users')
            .doc(user.uid)
            .set({
                email: user.email,
                ...userData,
            });

        return user;
    } catch (error) {
        console.error("Sign up error:", error);
        throw error;
    }
};

export const signIn = async (email, password) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Sign in error:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth().signOut();
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Sign out error:", error);
        throw error;
    }
};