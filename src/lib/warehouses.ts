import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Warehouse {
  id?: string;
  code: string;
  name: string;
  address?: string;
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const querySnapshot = await getDocs(collection(db, 'warehouses'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
}
