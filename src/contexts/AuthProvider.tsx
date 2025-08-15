import React, { useEffect, useState } from "react";
import { AuthContext } from "./useAuth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface User {
  uid: string;
  name?: string;
  email?: string;
  avatar?: string;
  jobTitle?: string;
  role?: string;
  phone?: string;
  branch?: string;
  status?: string;
}

interface BranchData {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
          const userData = userDoc.data();
          
          // If user is a sales representative, get additional data from sales_representatives collection
          if (userData.role === 'sales_representative') {
            try {
              // Search for sales representative data by uid
              const salesRepQuery = query(
                collection(db, 'sales_representatives'), 
                where('uid', '==', firebaseUser.uid)
              );
              const salesRepSnapshot = await getDocs(salesRepQuery);
              
              if (!salesRepSnapshot.empty) {
                const salesRepDoc = salesRepSnapshot.docs[0];
                const salesRepData = salesRepDoc.data();
                
                // Get branch name
                const branchesSnapshot = await getDocs(collection(db, 'branches'));
                const branches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BranchData[];
                const branch = branches.find(b => b.id === salesRepData.branch);
                
                setUser({ 
                  uid: firebaseUser.uid, 
                  name: salesRepData.name || userData.name,
                  email: salesRepData.email || userData.email,
                  avatar: salesRepData.avatar || userData.avatar,
                  jobTitle: userData.jobTitle || 'مندوب مبيعات',
                  role: userData.role,
                  phone: salesRepData.phone,
                  branch: branch?.name || 'فرع غير محدد',
                  status: salesRepData.status
                });
              } else {
                // Fallback to user data if no sales rep data found
                setUser({ uid: firebaseUser.uid, ...userData });
              }
            } catch (error) {
              console.error('Error fetching sales rep data:', error);
              setUser({ uid: firebaseUser.uid, ...userData });
            }
          } else {
            setUser({ uid: firebaseUser.uid, ...userData });
          }
        } else {
          // إنشاء وثيقة جديدة للمستخدم في Firestore
          // تجنب استخدام Facebook URLs التي تسبب خطأ 403
          let avatarUrl = "";
          if (firebaseUser.photoURL && !firebaseUser.photoURL.includes('fbcdn.net') && !firebaseUser.photoURL.includes('facebook.com')) {
            avatarUrl = firebaseUser.photoURL;
          }
          
          const newUser = {
            name: firebaseUser.displayName || "مستخدم جديد",
            email: firebaseUser.email || "",
            avatar: avatarUrl,
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
