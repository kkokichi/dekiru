import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const db = firestore();
export const FieldValue = firestore.FieldValue;
export const Timestamp = firestore.Timestamp;

export const docExists = (snap: FirebaseFirestoreTypes.DocumentSnapshot): boolean => snap.exists();

export const userDoc = (uid: string) => db.collection('users').doc(uid);
export const reflectionsCollection = (uid: string) => userDoc(uid).collection('reflections');
export const categoriesCollection = (uid: string) => userDoc(uid).collection('categories');
export const statsDoc = (uid: string) => userDoc(uid).collection('stats').doc('weekly');
