'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import Sidebar from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth'); // Redirect to login if the user is not authenticated
      } else {
        setLoading(false); // Stop loading if the user is authenticated
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p> {/* You can replace this with a spinner */}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for navigation */}
      <Sidebar />
      {/* Main content area */}
      <main className="flex-grow bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
