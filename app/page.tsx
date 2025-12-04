'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockService } from '@/lib/mock-service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await MockService.getCurrentUser();
      if (user) {
        router.push('/discover');
      } else {
        router.push('/onboarding');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
