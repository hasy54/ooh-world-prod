import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from 'lucide-react'
import { Media } from '@/components/columns'

interface SelectedMediaDetailsProps {
  selectedItem: Media | null;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  handleReplaceImage: () => void;
  handleAddImage: () => void;
  handleDeleteImage: (index: number) => void;
}

export function SelectedMediaDetails({
  selectedItem,
  currentImageIndex,
  setCurrentImageIndex,
  handleReplaceImage,
  handleAddImage,
  handleDeleteImage
}: SelectedMediaDetailsProps) {
  if (!selectedItem) {
    return (
      <div className="text-center text-muted-foreground">
        Select an item to view details
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative h-[400px] w-full">
          {selectedItem.image_urls && selectedItem.image_urls.length > 0 ? (
            <>
              <Image
                src={selectedItem.image_urls[currentImageIndex] || "/placeholder.svg"}
                alt={`${selectedItem.name} - Image ${currentImageIndex + 1}`}
                fill
                className="rounded-md object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button onClick={handleReplaceImage} variant="secondary">Replace</Button>
              </div>
            </>
          ) : (
            <div className="h-full w-full relative flex flex-col items-center justify-center bg-muted rounded-md cursor-pointer overflow-hidden">
              <div className="text-center">
                <Image
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLXVwIj48cGF0aCBkPSJNMTAuMyAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ2MTBsLTMuMS0zLjFhMiAyIDAgMCAwLTIuODE0LjAxNEw2IDIxIi8+PHBhdGggZD0ibTE0IDE5LjUgMy0zIDMgMyIvPjxwYXRoIGQ9Ik0xNyAyMnYtNS41Ii8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48L3N2Zz4="
                  alt="Upload"
                  width={20}
                  height={20}
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  No image available. Click to upload.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {selectedItem.image_urls && selectedItem.image_urls.map((url: string, index: number) => (
            <div
              key={index}
              className="relative w-20 h-20 cursor-pointer group"
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={url || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                fill
                className={`rounded-md object-cover transition-all duration-200 ${
                  currentImageIndex === index ? 'ring-2 ring-primary' : ''
                } group-hover:opacity-50 group-hover:bg-red-500`}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Trash2
                  className="text-white h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(index);
                  }}
                />
              </div>
            </div>
          ))}
          <div
            className="w-20 h-20 bg-muted rounded-md flex items-center justify-center cursor-pointer"
            onClick={handleAddImage}
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-2xl mb-2">{selectedItem.name}</h3>
        <p className="text-lg text-muted-foreground">{selectedItem.city}</p>
      </div>

      <Separator />

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <p className="text-muted-foreground">Type</p>
          <p>{selectedItem.type}</p>
          <p className="text-muted-foreground">Subtype</p>
          <p>{selectedItem.subtype}</p>
          <p className="text-muted-foreground">Dimensions</p>
          <p>{selectedItem.width} x {selectedItem.height}</p>
          <p className="text-muted-foreground">Traffic</p>
          <p>{selectedItem.traffic}</p>
          <p className="text-muted-foreground">Price</p>
          <p>{new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(selectedItem.price)}</p>
          <p className="text-muted-foreground">Availability</p>
          <p>{selectedItem.availability ? 'Available' : 'Not Available'}</p>
        </div>
      </div>
    </div>
  )
}

