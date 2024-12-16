"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMedia = async () => {
      if (!query) {
        setMediaList([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("media")
          .select("id, name, location, type, price, availability")
          .ilike("name", `%${query}%`);

        if (error) throw error;

        setMediaList(data || []);
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMedia, 300); // Debounce API call
    return () => clearTimeout(debounce);
  }, [query]);

  const handleMediaClick = (id: string) => {
    router.push(`/media/${id}`); // Navigate to individual media page
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="flex items-center border rounded-full px-4 py-2 shadow-md">
        <Input
          type="text"
          placeholder="Search media..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-none outline-none w-full"
        />
      </div>

      {/* Results Table Dropdown */}
      {mediaList.length > 0 && (
        <div className="mt-4 border rounded-lg shadow-md overflow-auto max-h-64">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Location</th>
                <th className="p-2">Type</th>
                <th className="p-2">Price</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((media) => (
                <tr
                  key={media.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleMediaClick(media.id)}
                >
                  <td className="p-2">{media.name}</td>
                  <td className="p-2">{media.location}</td>
                  <td className="p-2">{media.type}</td>
                  <td className="p-2">${media.price}</td>
                  <td className="p-2">{media.availability ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading State */}
      {loading && <p className="text-center mt-4 text-gray-500">Loading...</p>}

      {/* No Results */}
      {!loading && query && mediaList.length === 0 && (
        <p className="text-center mt-4 text-gray-500">No results found.</p>
      )}
    </div>
  );
}
