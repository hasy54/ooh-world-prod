import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export default function TenantLandingPage() {
  const router = useRouter();
  const { tenant } = router.query;

  const [media, setMedia] = useState([]);
  const [websiteConfig, setWebsiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWebsiteData = async () => {
    try {
      setLoading(true);

      // Fetch website configuration and media for the tenant
      const { data: config, error: configError } = await supabase
        .from('website_configurations')
        .select('*, tenant_id')
        .eq('subdomain', tenant)
        .single();

      if (configError || !config) {
        console.error('Error fetching website configuration:', configError);
        throw new Error('Website configuration not found.');
      }

      setWebsiteConfig(config);

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('tenant_id', config.tenant_id);

      if (mediaError) {
        console.error('Error fetching media:', mediaError);
        throw new Error('Unable to fetch media for tenant.');
      }

      setMedia(mediaData || []);
    } catch (err) {
      console.error('Error in fetchWebsiteData:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      fetchWebsiteData();
    }
  }, [tenant]);

  if (loading) return <div>Loading...</div>;
  if (!websiteConfig) return <div>Website not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{websiteConfig.website_title}</h1>
      <p className="text-sm text-gray-500 mb-4">Made with OOH World</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <div key={item.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p>Type: {item.type}</p>
            <p>Location: {item.location}</p>
            <p>Price: ${item.price}/day</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border rounded shadow bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Book Media</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Media</label>
            <select className="w-full px-4 py-2 border rounded">
              {media.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ${item.price}/day
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit Booking
          </button>
        </form>
      </div>
    </div>
  );
}
