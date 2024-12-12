'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer'; // Import Drawer components from shadcn
import { supabase } from '@/lib/supabase';

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
}

interface Props {
  media: Media;
  onClose: () => void;
  onSave: (updatedMedia: Media) => void;
  isOpen: boolean;
}

export default function ListingDetailsDrawer({
  media,
  onClose,
  onSave,
  isOpen,
}: Props) {
  const [updatedMedia, setUpdatedMedia] = useState(media);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('media')
        .update(updatedMedia)
        .eq('id', updatedMedia.id);

      if (error) {
        console.error('Error updating media:', error);
        return;
      }

      onSave(updatedMedia);
    } catch (err) {
      console.error('Unexpected error updating media:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-6"> {/* Removed the `side` prop */}
        <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={updatedMedia.name}
            onChange={(e) => setUpdatedMedia({ ...updatedMedia, name: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={updatedMedia.location}
            onChange={(e) => setUpdatedMedia({ ...updatedMedia, location: e.target.value })}
          />
          <Input
            placeholder="Type"
            value={updatedMedia.type}
            onChange={(e) => setUpdatedMedia({ ...updatedMedia, type: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Price"
            value={updatedMedia.price}
            onChange={(e) =>
              setUpdatedMedia({ ...updatedMedia, price: Number(e.target.value) })
            }
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={updatedMedia.availability}
              onChange={(e) =>
                setUpdatedMedia({ ...updatedMedia, availability: e.target.checked })
              }
            />
            <span>Available</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
