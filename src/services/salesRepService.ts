import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { fetchBranches } from '@/lib/branches';

export interface SalesRepData {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  branchName?: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

export const getSalesRepresentativeData = async (uid: string): Promise<SalesRepData | null> => {
  try {
    // Search for sales representative by uid
    const q = query(collection(db, 'sales_representatives'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const repDoc = querySnapshot.docs[0];
      const repData = repDoc.data() as Omit<SalesRepData, 'id'>;
      
      // Get branch name
      const branches = await fetchBranches();
      const branch = branches.find(b => b.id === repData.branch);
      
      return {
        id: repDoc.id,
        ...repData,
        branchName: branch?.name || 'فرع غير محدد'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching sales representative data:', error);
    return null;
  }
};

export const updateSalesRepresentativeData = async (id: string, updates: Partial<SalesRepData>): Promise<void> => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const repRef = doc(db, 'sales_representatives', id);
    await updateDoc(repRef, updates);
  } catch (error) {
    console.error('Error updating sales representative data:', error);
    throw error;
  }
};
