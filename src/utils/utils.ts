import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export Firebase services
export * from '../services/firebase';
export * from '../services/accountsService';
export * from './sampleData';
