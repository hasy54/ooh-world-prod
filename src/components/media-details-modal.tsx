'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotosTab } from './photos-tab'
import { BookingModal } from './booking/booking-modal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@clerk/nextjs'
import { Media } from '@/types/media';

interface MediaDetailsModalProps {
  media: Media
  onClose: () => void
  onUpdate: (updatedMedia: Media) => void
  isMyMedia: boolean
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ media, onClose, onUpdate, isMyMedia }) => {
  const [copied, setCopied] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedMedia, setEditedMedia] = useState<Media>(media);
  const [newPictures, setNewPictures] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const { userId } = useAuth()

  const copyId = () => {
    navigator.clipboard.writeText(media.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBookingSubmit = async (data: any) => {
    // Handle booking submission
    console.log('Booking submitted:', data)
    setShowBooking(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPictures(Array.from(e.target.files))
    }
  }

  const uploadPictures = async (mediaId: string) => {
    const uploadPromises = newPictures.map(async (file) => {
      const { data, error } = await supabase.storage
        .from('media-pictures')
        .upload(`${mediaId}/${file.name}`, file)

      if (error) throw error
      return data.path
    })

    return Promise.all(uploadPromises)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Update media details
      const { error: updateError } = await supabase
        .from('media')
        .update(editedMedia)
        .eq('id', media.id)

      if (updateError) throw updateError

      // Upload new pictures if any
      if (newPictures.length > 0) {
        const newPicturePaths = await uploadPictures(media.id)
        const updatedPhotos = [...(editedMedia.photos || []), ...newPicturePaths]

        // Update media with new picture paths
        const { error: photoUpdateError } = await supabase
          .from('media')
          .update({ photos: updatedPhotos })
          .eq('id', media.id)

        if (photoUpdateError) throw photoUpdateError

        setEditedMedia(prev => ({ ...prev, photos: updatedPhotos }))
      }

      onUpdate(editedMedia)
      setEditMode(false)
    } catch (error) {
      console.error('Error updating media:', error)
    } finally {
      setLoading(false)
    }
  }

  const DetailsContent = () => (
    <div className="space-y-6">
      {editMode ? (
        <>
          <Input
            value={editedMedia.name}
            onChange={(e) => setEditedMedia({ ...editedMedia, name: e.target.value })}
            placeholder="Name"
          />
          <Input
            value={editedMedia.location || ''}
            onChange={(e) => setEditedMedia({ ...editedMedia, location: e.target.value })}
            placeholder="Location"
          />
          <Input
            value={editedMedia.type}
            onChange={(e) => setEditedMedia({ ...editedMedia, type: e.target.value })}
            placeholder="Type"
          />
          <Input
            type="number"
            value={editedMedia.price || ''}
            onChange={(e) => setEditedMedia({ ...editedMedia, price: Number(e.target.value) })}
            placeholder="Price"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="availability"
              checked={editedMedia.availability}
              onCheckedChange={(checked) => 
                setEditedMedia({ ...editedMedia, availability: checked as boolean })
              }
            />
            <Label htmlFor="availability">Available</Label>
          </div>
          <div>
            <Label htmlFor="new-pictures">Add New Pictures</Label>
            <Input
              id="new-pictures"
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Media ID</span>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1">
                #{media.id.slice(0, 8)}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyId}
              >
                <Copy className={cn(
                  "h-4 w-4",
                  copied && "text-green-500"
                )} />
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="font-semibold">Location Details</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div>{editedMedia.location || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">City</div>
                    <div>{editedMedia.city || 'N/A'}</div>
                  </div>
                </div>
                {editedMedia.geolocation && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Latitude</div>
                      <div>{editedMedia.geolocation.latitude || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Longitude</div>
                      <div>{editedMedia.geolocation.longitude || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="font-semibold">Media Details</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div>{editedMedia.type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Subtype</div>
                    <div>{editedMedia.subtype || 'N/A'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Width</div>
                    <div>{editedMedia.width ? `${editedMedia.width}m` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Height</div>
                    <div>{editedMedia.height ? `${editedMedia.height}m` : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="font-semibold">Traffic & Pricing</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Traffic Level</div>
                    <div>{editedMedia.traffic || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Price</div>
                    <div>{editedMedia.price ? `$${editedMedia.price.toLocaleString()}` : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const BookingTab = () => (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Quick Booking</h3>
        <p className="text-sm text-muted-foreground">
          Book this media location for your campaign
        </p>
      </div>
      <Button 
        className="w-full" 
        onClick={() => setShowBooking(true)}
      >
        Book Now
      </Button>
    </div>
  )

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl border-l bg-background shadow-lg"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">{editedMedia.name}</h2>
                  <Badge variant={editedMedia.availability ? 'default' : 'secondary'}>
                    {editedMedia.availability ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger 
                      value="details"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="photos"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Photos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="booking"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Booking
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="p-6">
                    <DetailsContent />
                  </TabsContent>
                  <TabsContent value="photos">
                    <PhotosTab photos={editedMedia.photos} />
                  </TabsContent>
                  <TabsContent value="booking">
                    <BookingTab />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="border-t p-6">
                <div className="flex justify-end gap-4">
                  {isMyMedia ? (
                    editMode ? (
                      <>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={onClose}>
                          Close
                        </Button>
                        <Button onClick={() => setEditMode(true)}>
                          Edit
                        </Button>
                      </>
                    )
                  ) : (
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showBooking && (
        <BookingModal
          initialMedia={[editedMedia]}
          onClose={() => setShowBooking(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </>
  )
}

