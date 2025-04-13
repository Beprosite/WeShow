'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // מעביר את המשתמש ישירות לדף ההתחברות
    router.push('/login');
  }, []);

  return null;
}