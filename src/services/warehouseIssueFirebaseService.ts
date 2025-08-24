import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

export async function saveWarehouseIssueToFirebase(issueData) {
  // إضافة تاريخ الإنشاء
  const data = {
    ...issueData,
    createdAt: Timestamp.now(),
  };
  // حفظ في مجموعة warehouseIssues
  const docRef = await addDoc(collection(db, "warehouseIssues"), data);
  return docRef.id;
}

// دالة جلب كل أذونات الصرف من Firebase
export async function fetchWarehouseIssues() {
  const snapshot = await getDocs(collection(db, "warehouseIssues"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
