import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { firebaseAuth } from '@/firebase/auth';

interface AuthContextValue {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, initializing: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return firebaseAuth.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      if (initializing) setInitializing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ user, initializing }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
