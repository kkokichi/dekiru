import auth from '@react-native-firebase/auth';

export const firebaseAuth = auth();

export type FirebaseUser = ReturnType<typeof auth>['currentUser'];
