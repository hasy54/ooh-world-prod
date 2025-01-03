import React from 'react'
import { Progress } from "@/components/ui/progress"

interface ExportProgressProps {
  progress: number
}

export function ExportProgress({ progress }: ExportProgressProps) {
  return (
    <div className="w-full max-w-md">
      <Progress value={progress} className="w-full" />
      <p className="text-center mt-2">{progress}% Complete</p>
    </div>
  )
}

