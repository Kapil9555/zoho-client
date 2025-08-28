// src/hooks/useAuthRedirect.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function useAuthRedirect() {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  console.log('useAuthRedirect:', userInfo);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/profile');
      }
    }
  }, [userInfo, router]);
}
