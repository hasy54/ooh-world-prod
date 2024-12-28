import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

interface PDFPreviewProps {
  selectedMedia: Media[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  table: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
});

const PDFPreview = ({ selectedMedia }: PDFPreviewProps) => {
  return (
    <div className="border rounded-md p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">PDF Preview</h3>
      <p>This is a simplified representation of the PDF content:</p>
      <div className="mt-4">
        <h2 className="text-xl font-bold">OOH Media Portfolio</h2>
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Location</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Size</th>
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Availability</th>
            </tr>
          </thead>
          <tbody>
            {selectedMedia.map((media) => (
              <tr key={media.id}>
                <td className="border px-2 py-1">{media.name}</td>
                <td className="border px-2 py-1">{media.location}</td>
                <td className="border px-2 py-1">{media.type}</td>
                <td className="border px-2 py-1">{`${media.width}' x ${media.height}'`}</td>
                <td className="border px-2 py-1">${media.price}</td>
                <td className="border px-2 py-1">{media.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PDFPreview;
