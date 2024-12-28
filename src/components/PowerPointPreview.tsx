import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface PowerPointPreviewProps {
  selectedMedia: Media[];
}

export function PowerPointPreview({ selectedMedia }: PowerPointPreviewProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">OOH Media Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Shraddha Advertising/Saturn Publicity</p>
          <p>Email: saturnpublicitysurat@gmail.com | Tel: 92270 29292</p>
        </CardContent>
      </Card>
      {selectedMedia.map((media) => (
        <Card key={media.id} className="bg-white">
          <CardHeader>
            <CardTitle>{media.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Location:</strong> {media.location}</p>
            <p><strong>Type:</strong> {media.type}</p>
            <p><strong>Size:</strong> {`${media.width}' x ${media.height}'`}</p>
            <p><strong>Price:</strong> ${media.price}</p>
            <p><strong>Availability:</strong> {media.availability}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

