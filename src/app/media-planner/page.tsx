'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, X } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generatePDF } from '@/lib/exportTemplates/pdfTemplate';
import { generateExcel } from '@/lib/exportTemplates/excelTemplate';
import { generatePPT } from '@/lib/exportTemplates/pptTemplate';


interface Media {
  id: string;
  name: string;
  location: string;
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

export default function MediaSelectionPage() {
  const [keywords, setKeywords] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({
    type: [],
    subtype: [],
    traffic: [],
    width: [],
    height: [],
    availability: [],
  });
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<Media | null>(null);
  const [activeType, setActiveType] = useState<string>("All");
  //const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); //Removed

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
    fetchMedia();
  }, [selectedFilters, keywords, sortConfig, activeType]);

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

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let query = supabase.from('media').select('*', { count: 'exact' });

      if (keywords) {
        query = query.or(`name.ilike.%${keywords}%,city.ilike.%${keywords}%,type.ilike.%${keywords}%`);
      }

      Object.entries(selectedFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          query = query.in(key, values);
        }
      });

      if (activeType !== "All") {
        query = query.eq('type', activeType);
      }

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

  const removeFilter = (key: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
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

  const exportList = (format: 'pdf' | 'excel' | 'ppt') => {
    const selectedMedia = mediaList.filter(m => selectedItems.has(m.id));
    switch (format) {
      case 'pdf':
        generatePDF(selectedMedia);
        break;
      case 'excel':
        generateExcel(selectedMedia);
        break;
      case 'ppt':
        generatePPT(selectedMedia);
        break;
    }
    //setIsPreviewModalOpen(false); //Removed
  };

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    if (selectMode) {
      setSelectedItems(new Set());
    }
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

  //const openPreviewModal = () => { //Removed
  //  setIsPreviewModalOpen(true);
  //};

  return (
    <Card>
      <CardHeader className="flex justify-center items-center space-x-4">
        <CardTitle>Media Selection</CardTitle>
        <Button 
          variant="outline" 
          asChild
          disabled={selectedItems.size === 0}
        >
          <Link href={`/media-planner/export-preview?selectedIds=${Array.from(selectedItems).join(',')}`}>
            Preview Export ({selectedItems.size})
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Column 1: Enhanced Filter & Search */}
          <div className="w-1/4 space-y-6 bg-muted p-4 rounded-lg">
            <div>
              <Label htmlFor="search">Search Media</Label>
              <Input
                id="search"
                placeholder="Search by name, type, or location"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(selectedFilters).map(([key, values]) =>
                values.map((value) => (
                  <Badge key={`${key}-${value}`} variant="secondary" className="cursor-pointer" onClick={() => removeFilter(key, value)}>
                    {`${key}: ${value}`}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))
              )}
            </div>
            <Accordion type="multiple" className="w-full">
              {Object.entries(filterOptions).map(([key, options]) => (
                <AccordionItem value={key} key={key}>
                  <AccordionTrigger className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${key}-${option}`}
                            checked={selectedFilters[key].includes(option)}
                            onCheckedChange={() => handleFilterChange(key, option)}
                          />
                          <Label htmlFor={`${key}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button onClick={resetFilters} variant="outline" className="w-full">
              Reset Filters
            </Button>
          </div>

          {/* Column 2: Media List */}
          <div className="w-2/4">
            <Tabs defaultValue="All" className="w-full mb-4" onValueChange={(value) => setActiveType(value)}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="All">All</TabsTrigger>
                {filterOptions.type.map((type) => (
                  <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex justify-between mb-4">
              <div>
                <Button onClick={toggleSelectMode} variant="outline" className="mr-2">
                  {selectMode ? 'Cancel Selection' : 'Select Items'}
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectMode && <TableHead className="w-[50px]">Select</TableHead>}
                    <TableHead className="w-[50%]">
                      <Button variant="ghost" onClick={() => handleSort('name')}>
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[25%]">
                      <Button variant="ghost" onClick={() => handleSort('width')}>
                        Size {getSortIcon('width')}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[25%]">Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mediaList.map((item) => (
                    <TableRow key={item.id} onClick={() => setPreviewItem(item)} className="cursor-pointer">
                      {selectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => toggleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      <TableCell>{truncateText(item.name, 30)}</TableCell>
                      <TableCell>{`${item.width}' x ${item.height}'`}</TableCell>
                      <TableCell>
                        <Badge variant={item.availability === 'Available' ? 'default' : 'secondary'}>
                          {item.availability}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Column 3: Preview */}
          <div className="w-1/4">
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle>Media Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewItem ? (
                  <div className="space-y-4">
                    <div className="aspect-video relative">
                      <Image
                        src={previewItem.thumbnail || '/placeholder.png'}
                        alt={previewItem.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{previewItem.name}</h3>
                      <p><strong>Type:</strong> {previewItem.type}</p>
                      <p><strong>Subtype:</strong> {previewItem.subtype}</p>
                      <p><strong>City:</strong> {previewItem.city}</p>
                      <p><strong>Size:</strong> {previewItem.width}' x {previewItem.height}'</p>
                      <p><strong>Traffic:</strong> {previewItem.traffic}</p>
                      <p><strong>Price:</strong> ${previewItem.price}/month</p>
                      <p><strong>Availability:</strong> {previewItem.availability}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px]">
                    <span className="text-muted-foreground">Select a media item to preview</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/create-plan">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/create-plan/review">Next: Review & Submit</Link>
        </Button>
      </CardFooter>
      {/*<ExportPreviewModal //Removed
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        selectedMedia={mediaList.filter(m => selectedItems.has(m.id))}
        onConfirm={exportList}
      />*/}
    </Card>
  );
}

