'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generatePDF } from '@/lib/exportTemplates/pdfTemplate';
import { generateExcel } from '@/lib/exportTemplates/excelTemplate';
import { generatePPT } from '@/lib/exportTemplates/pptTemplate';

const PDFPreview = dynamic(() => import('@/components/PDFPreview'), { ssr: false });
const ExcelPreview = dynamic(() => import('@/components/ExcelPreview'), { ssr: false });

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  width: number;
  height: number;
  price: number;
  availability: string;
}

function ExportPreviewContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'pdf' | 'excel' | 'ppt'>('list');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSelectedMedia = async () => {
      const selectedIds = searchParams.get('selectedIds')?.split(',') || [];
      if (selectedIds.length > 0) {
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .in('id', selectedIds);
        
        if (error) {
          console.error('Error fetching selected media:', error);
        } else {
          setSelectedMedia(data || []);
        }
      }
    };

    fetchSelectedMedia();
  }, [searchParams]);

  const exportList = (format: 'pdf' | 'excel' | 'ppt') => {
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
  };

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/create-plan">Create Plan</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/create-plan/media-selection">Media Selection</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Export Preview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <Link href="/media-planner">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Media Selection
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Export Preview</h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-grow flex flex-col">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
          <TabsTrigger value="excel">Excel Preview</TabsTrigger>
          <TabsTrigger value="ppt">PowerPoint Preview</TabsTrigger>
        </TabsList>
        <div className="flex-grow flex mt-4">
          <div className="w-1/5 bg-gray-100 p-4 border-r">
            <h3 className="font-semibold mb-4">Slides</h3>
            <div className="space-y-2">
              {selectedMedia.map((media, index) => (
                <div
                  key={media.id}
                  className={`bg-white p-2 rounded shadow text-sm cursor-pointer hover:bg-blue-100 ${
                    currentSlide === index ? 'bg-blue-200' : ''
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  Slide {index + 1}
                </div>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-grow">
            <TabsContent value="list" className="h-full p-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMedia.map((media) => (
                    <TableRow key={media.id}>
                      <TableCell>{media.name}</TableCell>
                      <TableCell>{media.location}</TableCell>
                      <TableCell>{media.type}</TableCell>
                      <TableCell>{`${media.width}' x ${media.height}'`}</TableCell>
                      <TableCell>${media.price}</TableCell>
                      <TableCell>{media.availability}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="pdf" className="h-full p-8">
              <PDFPreview selectedMedia={selectedMedia} />
            </TabsContent>
            <TabsContent value="excel" className="h-full p-8">
              <ExcelPreview selectedMedia={selectedMedia} />
            </TabsContent>
            <TabsContent value="ppt" className="h-full">
              <div className="bg-gray-200 p-8 h-full">
                <div className="bg-white aspect-video shadow-lg p-8">
                  {currentSlide === 0 ? (
                    <>
                      <h2 className="text-3xl font-bold mb-4">OOH Media Portfolio</h2>
                      <p className="text-xl mb-2">Shraddha Advertising/Saturn Publicity</p>
                      <p>Email: saturnpublicitysurat@gmail.com | Tel: 92270 29292</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-4">{selectedMedia[currentSlide - 1]?.name}</h2>
                      <p><strong>Location:</strong> {selectedMedia[currentSlide - 1]?.location}</p>
                      <p><strong>Type:</strong> {selectedMedia[currentSlide - 1]?.type}</p>
                      <p><strong>Size:</strong> {selectedMedia[currentSlide - 1]?.width}' x {selectedMedia[currentSlide - 1]?.height}'</p>
                      <p><strong>Price:</strong> ${selectedMedia[currentSlide - 1]?.price}</p>
                      <p><strong>Availability:</strong> {selectedMedia[currentSlide - 1]?.availability}</p>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={() => exportList('pdf')}>Export to PDF</Button>
        <Button onClick={() => exportList('excel')}>Export to Excel</Button>
        <Button onClick={() => exportList('ppt')}>Export to PowerPoint</Button>
      </div>
    </div>
  );
}

export default function ExportPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExportPreviewContent />
    </Suspense>
  );
}
