'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function Dashboard() {
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndAgency = async () => {
      try {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = '/auth'; // Redirect to login if not signed in
          return;
        }

        // Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Unable to fetch profile');
        }

        // Fetch the agency name
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError || !tenant) {
          throw new Error('Unable to fetch agency name');
        }

        setAgencyName(tenant.name);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserAndAgency();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth'; // Redirect to login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-[400px] p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Dashboard</h1>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            <p className="text-lg text-center">
              Welcome to {agencyName || 'your agency'}!
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md w-full"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
