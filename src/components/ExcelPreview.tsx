import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  width: number;
  height: number;
  price: number | null;
  availability: string;
}

interface ExcelPreviewProps {
  selectedMedia: Media[];
}

export default function ExcelPreview({ selectedMedia }: ExcelPreviewProps) {
  return (
    <div className="border rounded-md p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">Excel Preview</h3>
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
              <TableCell>${media.price != null ? media.price.toFixed(2) : 'N/A'}</TableCell>
              <TableCell>{media.availability}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

