// src/components/booking/booking-steps.tsx

import { useState, useEffect } from 'react'
import { Media } from '@/types/media' // Centralized Media type
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaData } from '@/hooks/useMediaData' // Optional: use the hook

export interface BookingFormData {
  startDate: string
  endDate: string
  selectedMedia: Media[]
  notes?: string
}

export interface BookingStepProps {
  data: BookingFormData
  onUpdate: (data: Partial<BookingFormData>) => void
  onNext: () => void
  onBack?: () => void
}

export function BookingStep1({ data, onUpdate, onNext }: BookingStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Campaign Duration</h2>
        <p className="text-sm text-muted-foreground">
          Select the start and end dates for your campaign
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={data.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
            className="w-full rounded-md border px-3 py-2"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            value={data.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
            className="w-full rounded-md border px-3 py-2"
            min={data.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            value={data.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full rounded-md border px-3 py-2"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!data.startDate || !data.endDate}
          className="rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function BookingStep2({ data, onUpdate, onNext, onBack }: BookingStepProps) {
  const { media: allMedia, loading, error } = useMediaData() // Use the centralized hook

  const toggleMediaSelection = (media: Media) => {
    const isSelected = data.selectedMedia.some(m => m.id === media.id)
    if (isSelected) {
      onUpdate({ selectedMedia: data.selectedMedia.filter(m => m.id !== media.id) })
    } else {
      onUpdate({ selectedMedia: [...data.selectedMedia, media] })
    }
  }

  if (loading) {
    return <div>Loading media...</div>
  }

  if (error) {
    return <div>Error loading media: {error}</div>
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-4 pr-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Select Media</h2>
          <p className="text-sm text-muted-foreground">
            Choose the media locations for your campaign
          </p>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {allMedia.map((media) => (
              <div
                key={media.id}
                className="flex items-center space-x-4 rounded-md border p-4"
              >
                <Checkbox
                  checked={data.selectedMedia.some(m => m.id === media.id)}
                  onCheckedChange={() => toggleMediaSelection(media)}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{media.name}</h3>
                  <p className="text-sm text-muted-foreground">{media.location}</p>
                </div>
                <p className="text-sm font-medium">${media.price}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="w-1/3 border-l pl-4">
        <h3 className="mb-4 text-lg font-semibold">Selected Media</h3>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {data.selectedMedia.map((media) => (
              <div
                key={media.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <h4 className="font-medium">{media.name}</h4>
                  <p className="text-sm text-muted-foreground">{media.location}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMediaSelection(media)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex justify-between mt-6 w-full">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={data.selectedMedia.length === 0}
        >
          Review
        </Button>
      </div>
    </div>
  )
}

export function BookingStep3({ data, onBack, onNext: onConfirm }: BookingStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground">
          Please review your booking details
        </p>
      </div>
      <div className="rounded-md border p-4 space-y-4">
        <div>
          <h3 className="font-medium">Campaign Duration</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="font-medium">Selected Media ({data.selectedMedia.length})</h3>
          <ul className="mt-2 space-y-2">
            {data.selectedMedia.map((media) => (
              <li key={media.id} className="text-sm text-muted-foreground">
                {media.name} - {media.location}
              </li>
            ))}
          </ul>
        </div>
        {data.notes && (
          <div>
            <h3 className="font-medium">Additional Notes</h3>
            <p className="text-sm text-muted-foreground">{data.notes}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-md border px-4 py-2"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  )
}
