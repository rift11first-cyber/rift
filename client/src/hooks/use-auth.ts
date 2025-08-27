import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, InsertUser, COLLEGE_DOMAINS } from '@shared/schema';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateCollegeEmail = (email: string): boolean => {
    const domain = email.split('@')[1];
    return COLLEGE_DOMAINS.includes(domain);
  };

  const signUp = async (email: string, password: string, userData: Omit<InsertUser, 'email'>) => {
    try {
      setError(null);
      
      if (!validateCollegeEmail(email)) {
        throw new Error('Please use a valid college email address');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      const newUser: InsertUser = {
        ...userData,
        email,
        profileComplete: false,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: new Date(),
      });

      return userCredential.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!firebaseUser) return;
    
    try {
      setError(null);
      await setDoc(doc(db, 'users', firebaseUser.uid), updates, { merge: true });
      
      // Update local state
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    error,
    signUp,
    signIn,
    logout,
    updateUser,
  };
}
