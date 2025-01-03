import { v4 as uuidv4 } from 'uuid'
import { Media } from '@/components/columns'

export function saveExportedProposal(format: string, mediaItems: Media[]) {
  const existingProposals = JSON.parse(localStorage.getItem('exportedProposals') || '[]')
  const newProposal = {
    id: uuidv4(),
    format,
    mediaItems,
    exportedAt: new Date().toISOString(),
  }
  localStorage.setItem('exportedProposals', JSON.stringify([...existingProposals, newProposal]))
}

