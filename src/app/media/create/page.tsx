'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddMedia() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    location: '',
    type: '',
    price: '',
    availability: true,
  });
  const [pictures, setPictures] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPictures(Array.from(e.target.files));
    }
  };

  const uploadPictures = async (mediaId: string) => {
    const uploadPromises = pictures.map(async (file) => {
      const { data, error } = await supabase.storage
        .from('media-pictures')
        .upload(`${mediaId}/${file.name}`, file);

      if (error) throw error;
      return data.path;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Insert the new media
      const { data: newMedia, error: mediaError } = await supabase
        .from('media')
        .insert({
          name: form.name,
          location: form.location,
          type: form.type,
          price: Number(form.price),
          availability: form.availability,
        })
        .select()
        .single();

      if (mediaError || !newMedia) {
        console.error('Error adding media:', mediaError);
        setError('Failed to create new media.');
        return;
      }

      // Upload pictures if any
      if (pictures.length > 0) {
        const picturePaths = await uploadPictures(newMedia.id);
        
        // Update media with picture paths
        const { error: updateError } = await supabase
          .from('media')
          .update({ photos: picturePaths })
          .eq('id', newMedia.id);

        if (updateError) {
          console.error('Error updating media with pictures:', updateError);
        }
      }

      // Navigate back to the media list
      router.push('/media');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Media</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                placeholder="Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability"
                checked={form.availability}
                onCheckedChange={(checked) => 
                  setForm({ ...form, availability: checked as boolean })
                }
              />
              <Label htmlFor="availability">Available</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pictures">Upload Pictures</Label>
              <Input
                id="pictures"
                type="file"
                multiple
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push('/media')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Media
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

