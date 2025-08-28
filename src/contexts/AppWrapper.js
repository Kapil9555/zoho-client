'use client';

import Loader from '@/components/custom/ui/Loader';
import { useUI } from '@/contexts/UIcontext';


export default function AppWrapper({ children }) {
  const { loading } = useUI();

  return (
    <>
      
      {loading && <Loader />}
      {children}
    </>
  );
}
