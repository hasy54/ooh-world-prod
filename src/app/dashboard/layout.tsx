'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import Sidebar from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchTenant = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth'); // Redirect to login if unauthenticated
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching tenant ID:', profileError);
        router.push('/auth'); // Redirect if profile fetch fails
        return;
      }

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError || !tenant) {
        console.error('Error fetching tenant name:', tenantError);
        router.push('/auth'); // Redirect if tenant fetch fails
        return;
      }

      setTenantName(tenant.name); // Set the tenant name
      setLoading(false);
    };

    checkAuthAndFetchTenant();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p> {/* Replace this with a spinner if needed */}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for navigation */}
      <Sidebar tenantName={tenantName || 'Default Name'} />
      {/* Main content area */}
      <main className="flex-grow bg-gray-100 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
