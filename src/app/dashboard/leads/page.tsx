'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function EnquiryListPage() {
  const [enquiries, setEnquiries] = useState([]); // List of enquiries
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error messages

  // Fetch enquiries for the tenant
  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      // Get the session to fetch the tenant ID
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found. Redirecting to auth.');
        window.location.href = '/auth';
        return;
      }

      // Fetch tenant_id from the `profiles` table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Unable to fetch user profile');
      }

      // Fetch enquiries for the tenant
      const { data: enquiryData, error: enquiryError } = await supabase
        .from('inquiries')
        .select(`
          id,
          media_id,
          client_name,
          client_email,
          client_phone,
          message,
          created_at,
          media (name, type, location, price)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (enquiryError) {
        console.error('Error fetching enquiries:', enquiryError);
        throw new Error('Unable to fetch enquiries');
      }

      setEnquiries(enquiryData || []);
      console.log('Fetched enquiries:', enquiryData);
    } catch (err) {
      console.error('Error in fetchEnquiries:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Enquiries</h1>
      {enquiries.length === 0 ? (
        <p>No enquiries found.</p>
      ) : (
        <ul className="space-y-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-semibold">{enquiry.client_name}</h2>
              <p>
                <strong>Email:</strong> {enquiry.client_email}
              </p>
              <p>
                <strong>Phone:</strong> {enquiry.client_phone || 'N/A'}
              </p>
              <p>
                <strong>Message:</strong> {enquiry.message || 'No message provided.'}
              </p>
              <p>
                <strong>Media:</strong> {enquiry.media?.name || 'N/A'} ({enquiry.media?.type || 'N/A'})
              </p>
              <p>
                <strong>Price:</strong> ${enquiry.media?.price || 'N/A'}/day
              </p>
              <p>
                <strong>Created At:</strong> {new Date(enquiry.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
