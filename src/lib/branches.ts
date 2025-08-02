import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Branch {
  id?: string;
  code: string;
  name: string;
  address: string;
  taxFile: string;
  commercialReg: string;
  postalCode: string;
  poBox: string;
  manager: string;
}

export async function fetchBranches(): Promise<Branch[]> {
  const querySnapshot = await getDocs(collection(db, 'branches'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
}
