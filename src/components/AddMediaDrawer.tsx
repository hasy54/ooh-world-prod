'use client';

import { useState, useEffect } from 'react';
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
  media: Media | null; // Allow `null` for initial render
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMedia: Media) => void;
}

export default function ListingDetailsDrawer({ media, isOpen, onClose, onSave }: Props) {
  const [updatedMedia, setUpdatedMedia] = useState<Media | null>(media);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update `updatedMedia` whenever the `media` prop changes
  useEffect(() => {
    setUpdatedMedia(media);
  }, [media]);

  const handleSave = async () => {
    if (!updatedMedia) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('media')
        .update({
          name: updatedMedia.name,
          location: updatedMedia.location,
          type: updatedMedia.type,
          price: updatedMedia.price,
          availability: updatedMedia.availability,
        })
        .eq('id', updatedMedia.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating media:', error);
        setError('Unable to update media. Please try again.');
        return;
      }

      if (data) {
        onSave(data); // Pass the updated media back to the parent
      }
      onClose(); // Close the drawer after saving
    } catch (err) {
      console.error('Unexpected error updating media:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Edit Media Details</h2>
        {updatedMedia ? (
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={updatedMedia.name || ''}
              onChange={(e) =>
                setUpdatedMedia((prev) => ({ ...prev!, name: e.target.value }))
              }
            />
            <Input
              placeholder="Location"
              value={updatedMedia.location || ''}
              onChange={(e) =>
                setUpdatedMedia((prev) => ({ ...prev!, location: e.target.value }))
              }
            />
            <Input
              placeholder="Type"
              value={updatedMedia.type || ''}
              onChange={(e) =>
                setUpdatedMedia((prev) => ({ ...prev!, type: e.target.value }))
              }
            />
            <Input
              type="number"
              placeholder="Price"
              value={updatedMedia.price || 0}
              onChange={(e) =>
                setUpdatedMedia((prev) => ({
                  ...prev!,
                  price: Number(e.target.value),
                }))
              }
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={updatedMedia.availability || false}
                onChange={(e) =>
                  setUpdatedMedia((prev) => ({
                    ...prev!,
                    availability: e.target.checked,
                  }))
                }
              />
              <span>Available</span>
            </label>
          </div>
        ) : (
          <p className="text-gray-500">No media selected for editing.</p>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !updatedMedia}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
