'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { StyleCategory } from '@/lib/utils/generative'

interface StyleCardProps {
  style: StyleCategory
  isSelected: boolean
  onClick: () => void
}

// Map style IDs to preview image paths
const PREVIEW_IMAGES: Record<string, string> = {
  bauhaus: '/generative-previews/preview-bauhaus.png',
  truchet: '/generative-previews/preview-truchet.png',
  terrain: '/generative-previews/preview-terrain.png',
  contour: '/generative-previews/preview-contour.png',
  flowfield: '/generative-previews/preview-flowfields.png',
  voronoi: '/generative-previews/preview-voronoi.png',
  tessellation: '/generative-previews/preview-tessellations.png',
}

export default function StyleCard({ style, isSelected, onClick }: StyleCardProps) {
  const previewSrc = PREVIEW_IMAGES[style.id]

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Preview image */}
      {previewSrc ? (
        <Image
          src={previewSrc}
          alt={`${style.name} preview`}
          width={120}
          height={120}
          className="rounded-lg shadow-sm object-cover"
        />
      ) : (
        <div className="w-[120px] h-[120px] rounded-lg shadow-sm bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No preview</span>
        </div>
      )}

      {/* Style info */}
      <div className="mt-3 text-center">
        <h3 className="font-medium text-foreground">{style.name}</h3>
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-200">
          <p className="text-sm text-muted-foreground mt-1 overflow-hidden">{style.description}</p>
        </div>
      </div>
    </button>
  )
}
