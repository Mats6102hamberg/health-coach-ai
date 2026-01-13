'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /app to root (main app)
    router.replace('/');
  }, [router]);

  return null;
}
