'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function SharePublicLinkPage() {
  const [publicLink, setPublicLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generatePublicLink = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/auth';
        return;
      }

      // Fetch tenant ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) throw new Error('Unable to fetch tenant data');

      const tenantId = profile.tenant_id;

      // Check if public link exists
      const { data: existingLink, error: existingError } = await supabase
        .from('public_links')
        .select('public_link')
        .eq('tenant_id', tenantId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') throw new Error(existingError.message);

      // If link already exists, use it
      if (existingLink) {
        setPublicLink(existingLink.public_link);
        setMessage('Public link already exists.');
        return;
      }

      // Generate new public link
      const link = `${window.location.origin}/public/${tenantId}`;
      const { error: linkError } = await supabase.from('public_links').insert({
        tenant_id: tenantId,
        public_link: link,
      });

      if (linkError) throw new Error(linkError.message);

      setPublicLink(link);
      setMessage('Public link generated successfully.');
    } catch (error) {
      console.error('Error generating public link:', error.message);
      setMessage('Failed to generate public link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Share Public Link</h1>
      {message && <p className="text-blue-500 mb-4">{message}</p>}
      {publicLink ? (
        <div>
          <p className="mb-4">Public Link:</p>
          <a
            href={publicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {publicLink}
          </a>
        </div>
      ) : (
        <button
          onClick={generatePublicLink}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Public Link'}
        </button>
      )}
    </div>
  );
}
