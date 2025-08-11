import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PaymentMethod {
  id: string;
  name?: string;
  value?: string;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'payment_methods'));
      const methods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentMethod[];
      setPaymentMethods(methods);
    } catch (error) {
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return { paymentMethods, loading };
}
