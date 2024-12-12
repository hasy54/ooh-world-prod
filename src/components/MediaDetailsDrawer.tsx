'use client';

import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MediaDetailsDrawerProps {
  open: boolean; // Changed from `isOpen` to `open`
  onClose: () => void;
  media: Media;
  owner: User | null;
}

export default function MediaDetailsDrawer({
  open,
  onClose,
  media,
  owner,
}: MediaDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose}> {/* Updated prop from `isOpen` to `open` */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{media.name}</h2>
        <p>
          <strong>Location:</strong> {media.location}
        </p>
        <p>
          <strong>Type:</strong> {media.type}
        </p>
        <p>
          <strong>Price:</strong> ${media.price}
        </p>
        <p>
          <strong>Availability:</strong>{' '}
          {media.availability ? 'Available' : 'Unavailable'}
        </p>

        {owner ? (
          <div className="mt-6">
            <h3 className="text-lg font-bold">Owner Details</h3>
            <p>
              <strong>Name:</strong> {owner.name}
            </p>
            <p>
              <strong>Email:</strong> {owner.email}
            </p>
            <p>
              <strong>Role:</strong> {owner.role}
            </p>
          </div>
        ) : (
          <p className="text-red-500 mt-6">Owner details not available.</p>
        )}

        <Button onClick={onClose} className="mt-6">
          Close
        </Button>
      </div>
    </Drawer>
  );
}
