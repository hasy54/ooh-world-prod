'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, Search, ArrowUpDown, X } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Media {
  id: string;
  name: string;
  city: string;
  type: string;
  subtype: string;
  width: number;
  height: number;
  traffic: string;
  price: number;
  availability: string;
  thumbnail: string;
}

type SortConfig = {
  key: keyof Media;
  direction: 'asc' | 'desc';
} | null;

const MediaPlanner = () => {
  const [keywords, setKeywords] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({
    type: [],
    subtype: [],
    traffic: [],
    width: [],
    height: [],
    availability: [],
  });
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [totalMedia, setTotalMedia] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const [filterOptions, setFilterOptions] = useState<{ [key: string]: string[] }>({
    type: [],
    subtype: [],
    traffic: [],
    width: [],
    height: [],
    availability: [],
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchTotalMediaCount();
    fetchMedia();
  }, [selectedFilters, keywords, sortConfig]);

  const fetchFilterOptions = async () => {
    try {
      const { data: types } = await supabase.from('media').select('type').neq('type', '');
      const { data: subtypes } = await supabase.from('media').select('subtype').neq('subtype', '');
      const { data: traffic } = await supabase.from('media').select('traffic').neq('traffic', '');
      const { data: widths } = await supabase.from('media').select('width');
      const { data: heights } = await supabase.from('media').select('height');
      const { data: availability } = await supabase.from('media').select('availability').neq('availability', '');

      setFilterOptions({
        type: Array.from(new Set(types?.map((item) => item.type).filter(Boolean))),
        subtype: Array.from(new Set(subtypes?.map((item) => item.subtype).filter(Boolean))),
        traffic: Array.from(new Set(traffic?.map((item) => item.traffic).filter(Boolean))),
        width: Array.from(new Set(widths?.map((item) => item.width?.toString()).filter(Boolean))),
        height: Array.from(new Set(heights?.map((item) => item.height?.toString()).filter(Boolean))),
        availability: Array.from(new Set(availability?.map((item) => item.availability).filter(Boolean))),
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

      // Apply keyword search
      if (keywords) {
        query = query.or(`name.ilike.%${keywords}%,city.ilike.%${keywords}%,type.ilike.%${keywords}%`);
      }

      // Apply filters
      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          query = query.in(key, values);
        }
      });

      // Apply sorting
      if (sortConfig) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      }

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

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const resetFilters = () => {
    setSelectedFilters({
      type: [],
      subtype: [],
      traffic: [],
      width: [],
      height: [],
      availability: [],
    });
    setKeywords('');
  };

  const handleSort = (key: keyof Media) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof Media) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const exportList = () => {
    const dataToExport = selectMode ? mediaList.filter(m => selectedItems.has(m.id)) : mediaList;
    const csvContent = [
      ['Name', 'City', 'Type', 'Price', 'Availability'].join(','),
      ...dataToExport.map((m) => [
        m.name,
        m.city,
        m.type,
        m.price,
        m.availability,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'media_list.csv';
    link.click();
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems(new Set());
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Search by name, city, or type..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
            className="text-sm"
          >
            Clear filters
            <X className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleSelectMode}>
            {selectMode ? 'Cancel Selection' : 'Select Items'}
          </Button>
          <Button variant="primary" size="sm" onClick={exportList}>
            Export {selectMode ? 'Selected' : 'All'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-sm font-medium">Filters</div>
        {Object.entries(filterOptions).map(([key, options]) => (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="capitalize flex justify-between"
                role="combobox"
              >
                {key}
                {selectedFilters[key].length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedFilters[key].length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder={`Search ${key}...`} />
                <CommandEmpty>No {key} found.</CommandEmpty>
                <ScrollArea className="h-[200px]">
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => handleFilterChange(key, option)}
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                            selectedFilters[key].includes(option)
                              ? 'bg-primary border-primary'
                              : 'border-muted'
                          }`}
                        >
                          {selectedFilters[key].includes(option) && (
                            <span className="text-primary-foreground text-xs">✓</span>
                          )}
                        </div>
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Media List ({filteredCount} of {totalMedia})</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-md border">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  {selectMode && <TableHead className="w-[50px]">Select</TableHead>}
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Name {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('city')}>
                    <div className="flex items-center">
                      City {getSortIcon('city')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center">
                      Type {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Price {getSortIcon('price')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('availability')}>
                    <div className="flex items-center">
                      Availability {getSortIcon('availability')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      {selectMode && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  mediaList.map((media) => (
                    <TableRow key={media.id}>
                      {selectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(media.id)}
                            onCheckedChange={() => toggleSelectItem(media.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 relative">
                            <Image
                              src={media.thumbnail || '/placeholder.svg'}
                              alt={media.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="text-align: left;">
                                  <div className="font-medium">{truncateText(media.name, 20)}</div>
                                  <div className="text-sm text-blue-600 cursor-pointer">View</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{media.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>{media.city}</TableCell>
                      <TableCell>{media.type}</TableCell>
                      <TableCell>₹{media.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          media.availability === 'Available' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {media.availability}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Quick Book
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))
            ) : (
              mediaList.map((media) => (
                <div key={media.id} className="border rounded-lg p-4 space-y-4">
                  {selectMode && (
                    <div className="flex justify-end">
                      <Checkbox
                        checked={selectedItems.has(media.id)}
                        onCheckedChange={() => toggleSelectItem(media.id)}
                      />
                    </div>
                  )}
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={media.thumbnail || '/placeholder.svg'}
                      alt={media.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-align:justify">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <h3 className="font-medium">{truncateText(media.name, 20)}</h3>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{media.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-sm text-blue-600 cursor-pointer">View</div>
                    <div className="text-sm text-gray-500">{media.city}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      media.availability === 'Available' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {media.availability}
                    </span>
                    <Button variant="outline" size="sm">
                      Quick Book
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default MediaPlanner;

