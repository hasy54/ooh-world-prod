import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PhotosTabProps {
  photos?: string[]
  className?: string
}

export function PhotosTab({ photos, className }: PhotosTabProps) {
  if (!photos?.length) {
    return (
      <div className={cn("flex items-center justify-center h-[400px] text-muted-foreground", className)}>
        No photos available
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 p-6", className)}>
      {photos.map((photo, index) => (
        <div key={index} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <Image
            src={photo}
            alt={`Media photo ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}

