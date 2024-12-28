import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFViewer } from '@react-pdf/renderer';
import PDFPreview from '@/components/PDFPreview';
import ExcelPreview from '@/components/ExcelPreview'
import { PowerPointPreview } from '@/components/PowerPointPreview'

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

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMedia: Media[];
  onConfirm: (format: 'pdf' | 'excel' | 'ppt') => void;
}

export function ExportPreviewModal({ isOpen, onClose, selectedMedia, onConfirm }: ExportPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'pdf' | 'excel' | 'ppt'>('list');
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Preview</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-grow flex flex-col">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
            <TabsTrigger value="excel">Excel Preview</TabsTrigger>
            <TabsTrigger value="ppt">PowerPoint Preview</TabsTrigger>
          </TabsList>
          <div className="flex-grow flex">
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
                <PDFViewer width="100%" height="600px">
                  <PDFPreview selectedMedia={selectedMedia} />
                </PDFViewer>
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
                        <h2 className="text-2xl font-bold mb-4">{selectedMedia[currentSlide - 1].name}</h2>
                        <p><strong>Location:</strong> {selectedMedia[currentSlide - 1].location}</p>
                        <p><strong>Type:</strong> {selectedMedia[currentSlide - 1].type}</p>
                        <p><strong>Size:</strong> {selectedMedia[currentSlide - 1].width}' x {selectedMedia[currentSlide - 1].height}'</p>
                        <p><strong>Price:</strong> ${selectedMedia[currentSlide - 1].price}</p>
                        <p><strong>Availability:</strong> {selectedMedia[currentSlide - 1].availability}</p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm('pdf')}>Export to PDF</Button>
          <Button onClick={() => onConfirm('excel')}>Export to Excel</Button>
          <Button onClick={() => onConfirm('ppt')}>Export to PowerPoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

