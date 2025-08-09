import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Branch } from '@/lib/branches';

const sampleBranches: Omit<Branch, 'id'>[] = [
  {
    code: 'BR001',
    name: 'الفرع الرئيسي',
    address: 'شارع الملك فهد، الرياض',
    taxFile: '123456789',
    commercialReg: 'CR123456',
    postalCode: '12345',
    poBox: 'P.O. Box 1234',
    manager: 'محمد أحمد'
  },
  {
    code: 'BR002',
    name: 'فرع جدة',
    address: 'شارع التحلية، جدة',
    taxFile: '987654321',
    commercialReg: 'CR654321',
    postalCode: '21234',
    poBox: 'P.O. Box 5678',
    manager: 'أحمد محمد'
  },
  {
    code: 'BR003',
    name: 'فرع الدمام',
    address: 'شارع الخليج، الدمام',
    taxFile: '456789123',
    commercialReg: 'CR789123',
    postalCode: '31234',
    poBox: 'P.O. Box 9012',
    manager: 'عبدالله سعد'
  }
];

export const initializeSampleBranches = async (): Promise<void> => {
  try {
    // Check if branches already exist
    const branchesSnapshot = await getDocs(collection(db, 'branches'));
    
    if (branchesSnapshot.empty) {
      console.log('No branches found. Adding sample branches...');
      
      // Add sample branches
      for (const branch of sampleBranches) {
        await addDoc(collection(db, 'branches'), branch);
        console.log(`Added branch: ${branch.name}`);
      }
      
      console.log('Sample branches initialized successfully!');
    } else {
      console.log('Branches already exist. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing sample branches:', error);
    throw error;
  }
};
