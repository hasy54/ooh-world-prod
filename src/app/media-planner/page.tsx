'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Media {
  id: string;
  name: string;
  city: string;
  type: string;
  subtype: string;
  width: number;
  height: number;
  traffic: string;
}

const MediaPlanner = () => {
  const [citySearch, setCitySearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: Set<string> }>({
    type: new Set(),
    subtype: new Set(),
    traffic: new Set(),
    width: new Set(),
    height: new Set(),
  });
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [totalMedia, setTotalMedia] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [filterOptions, setFilterOptions] = useState<{ [key: string]: string[] }>({
    type: [],
    subtype: [],
    traffic: [],
    width: [],
    height: [],
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchTotalMediaCount();
    fetchMedia();
  }, [selectedFilters, citySearch]);

  const fetchFilterOptions = async () => {
    try {
      const { data: types } = await supabase.from('media').select('type').neq('type', '');
      const { data: subtypes } = await supabase.from('media').select('subtype').neq('subtype', '');
      const { data: traffic } = await supabase.from('media').select('traffic').neq('traffic', '');
      const { data: widths } = await supabase.from('media').select('width');
      const { data: heights } = await supabase.from('media').select('height');

      setFilterOptions({
        type: Array.from(new Set(types?.map((item) => item.type).filter(Boolean))),
        subtype: Array.from(new Set(subtypes?.map((item) => item.subtype).filter(Boolean))),
        traffic: Array.from(new Set(traffic?.map((item) => item.traffic).filter(Boolean))),
        width: Array.from(new Set(widths?.map((item) => item.width?.toString()).filter(Boolean))),
        height: Array.from(new Set(heights?.map((item) => item.height?.toString()).filter(Boolean))),
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchTotalMediaCount = async () => {
    const { count, error } = await supabase.from('media').select('*', { count: 'exact', head: true });
    if (!error) setTotalMedia(count || 0);
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let query = supabase.from('media').select('*', { count: 'exact' });

      // Filter city
      if (citySearch) query = query.ilike('city', `%${citySearch}%`);

      // Apply selected filters
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (values.size > 0) {
          const filterValues = Array.from(values);
          query = query.in(key, filterValues);
        }
      });

      const { data, count, error } = await query;
      if (error) throw error;

      setMediaList(data || []);
      setFilteredCount(count || 0);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      const values = new Set(updated[key]);
      if (values.has(value)) {
        values.delete(value);
      } else {
        values.add(value);
      }
      updated[key] = values;
      return updated;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      type: new Set(),
      subtype: new Set(),
      traffic: new Set(),
      width: new Set(),
      height: new Set(),
    });
    setCitySearch('');
  };

  const exportList = () => {
    const csvContent = [
      ['Name', 'City', 'Type', 'Subtype', 'Width', 'Height', 'Traffic'].join(','),
      ...mediaList.map((m) => [
        m.name,
        m.city,
        m.type,
        m.subtype,
        m.width,
        m.height,
        m.traffic,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'media_list.csv';
    link.click();
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Filters */}
      <div className="overflow-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <p className="text-gray-700 mb-4">Showing {filteredCount} of {totalMedia} media</p>

        {/* City Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">City</label>
          <Input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city"
            className="mt-1"
          />
        </div>

        {/* Filter Field Options */}
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key} className="mb-4">
            <h3 className="text-sm font-medium mb-2 capitalize">{key}</h3>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Badge
                  key={option}
                  onClick={() => toggleFilter(key, option)}
                  className={`cursor-pointer px-2 py-1 border rounded-lg transition-colors ${
                    selectedFilters[key].has(option) ? 'bg-indigo-600 text-white' : 'border-gray-300'
                  }`}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <Button onClick={resetFilters} className="mt-4 w-full">Reset Filters</Button>
        <Button onClick={exportList} className="mt-2 w-full">Export List</Button>
      </div>

      {/* Right Column: Table List */}
      <div className="overflow-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Media List</h2>
        {loading && <p className="text-gray-500 mb-4">Loading...</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subtype</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Traffic</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaList.length > 0 ? (
              mediaList.map((media) => (
                <TableRow key={media.id}>
                  <TableCell>{media.name}</TableCell>
                  <TableCell>{media.city}</TableCell>
                  <TableCell>{media.type}</TableCell>
                  <TableCell>{media.subtype}</TableCell>
                  <TableCell>{media.width}ft</TableCell>
                  <TableCell>{media.height}ft</TableCell>
                  <TableCell>{media.traffic}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No media found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MediaPlanner;
