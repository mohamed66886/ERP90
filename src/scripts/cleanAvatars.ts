/**
 * Clean up script to remove Facebook avatar URLs from existing user data
 * This can be run manually if needed to clean up existing data
 */

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isSafeImageUrl } from '@/utils/imageUtils';

interface UserData {
  id: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Clean Facebook avatar URLs from all users
 */
export const cleanUserAvatars = async (): Promise<void> => {
  console.log('Starting avatar cleanup process...');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[];

    console.log(`Found ${users.length} users to check`);

    let cleanedCount = 0;

    for (const user of users) {
      if (user.avatar && !isSafeImageUrl(user.avatar)) {
        console.log(`Cleaning avatar for user ${user.id}: ${user.avatar}`);
        
        // Update user document to remove the problematic avatar
        await updateDoc(doc(db, 'users', user.id), {
          avatar: ''
        });
        
        cleanedCount++;
      }
    }

    console.log(`Cleanup completed. Cleaned ${cleanedCount} users.`);
  } catch (error) {
    console.error('Error during avatar cleanup:', error);
    throw error;
  }
};

/**
 * Clean Facebook avatar URLs from sales representatives
 */
export const cleanSalesRepAvatars = async (): Promise<void> => {
  console.log('Starting sales rep avatar cleanup process...');
  
  try {
    // Get all sales representatives
    const salesRepsSnapshot = await getDocs(collection(db, 'sales_representatives'));
    const salesReps = salesRepsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[];

    console.log(`Found ${salesReps.length} sales representatives to check`);

    let cleanedCount = 0;

    for (const salesRep of salesReps) {
      if (salesRep.avatar && !isSafeImageUrl(salesRep.avatar)) {
        console.log(`Cleaning avatar for sales rep ${salesRep.id}: ${salesRep.avatar}`);
        
        // Update sales rep document to remove the problematic avatar
        await updateDoc(doc(db, 'sales_representatives', salesRep.id), {
          avatar: ''
        });
        
        cleanedCount++;
      }
    }

    console.log(`Sales rep cleanup completed. Cleaned ${cleanedCount} sales representatives.`);
  } catch (error) {
    console.error('Error during sales rep avatar cleanup:', error);
    throw error;
  }
};

/**
 * Run full avatar cleanup for all collections
 */
export const runFullAvatarCleanup = async (): Promise<void> => {
  console.log('Starting full avatar cleanup...');
  
  try {
    await cleanUserAvatars();
    await cleanSalesRepAvatars();
    console.log('Full avatar cleanup completed successfully!');
  } catch (error) {
    console.error('Error during full avatar cleanup:', error);
    throw error;
  }
};
