import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

import { firebaseConfig } from './config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const cloudFunctions = firebase.functions();
