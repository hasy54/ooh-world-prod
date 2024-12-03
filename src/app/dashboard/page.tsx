'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function DashboardPage() {
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencyName = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = '/auth';
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Unable to fetch user profile');
        }

        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError || !tenant) {
          throw new Error('Unable to fetch tenant details');
        }

        setAgencyName(tenant.name);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchAgencyName();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!agencyName) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to {agencyName} Dashboard</h1>
      <p>Manage your media, bookings, and more!</p>
    </div>
  );
}
