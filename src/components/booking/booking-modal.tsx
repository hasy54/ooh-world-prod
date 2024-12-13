'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Media } from '@/hooks/useMediaData'
import { BookingFormData, BookingStep1, BookingStep2, BookingStep3 } from './booking-steps'

interface BookingModalProps {
  initialMedia?: Media[]
  onClose: () => void
  onSubmit: (data: BookingFormData) => void
}

export function BookingModal({ initialMedia = [], onClose, onSubmit }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: '',
    endDate: '',
    selectedMedia: initialMedia,
    notes: '',
  })

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
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
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">New Booking</h2>
                <span className="text-sm text-muted-foreground">Step {step} of 3</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {step === 1 && (
                <BookingStep1
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleNext}
                />
              )}
              {step === 2 && (
                <BookingStep2
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 3 && (
                <BookingStep3
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleSubmit}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

