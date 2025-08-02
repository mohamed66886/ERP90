import React, { useEffect, useState } from "react";
import { AuthContext } from "./useAuth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AUTH_PROVIDER firebaseUser:', firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        console.log('AUTH_PROVIDER userDoc.exists:', userDoc.exists());
        console.log('AUTH_PROVIDER userDoc.data:', userDoc.data());
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          // إنشاء وثيقة جديدة للمستخدم في Firestore
          const newUser = {
            name: firebaseUser.displayName || "مستخدم جديد",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            jobTitle: "",
            role: "user"
          };
          await setDoc(userRef, newUser);
          setUser({ uid: firebaseUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
