import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { firebaseConfig } from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const FieldValue = firebase.firestore.FieldValue;
export const Timestamp = firebase.firestore.Timestamp;

export const docExists = (snap: firebase.firestore.DocumentSnapshot): boolean => snap.exists;

export const userDoc = (uid: string) => db.collection('users').doc(uid);
export const reflectionsCollection = (uid: string) => userDoc(uid).collection('reflections');
export const categoriesCollection = (uid: string) => userDoc(uid).collection('categories');
export const statsDoc = (uid: string) => userDoc(uid).collection('stats').doc('weekly');
