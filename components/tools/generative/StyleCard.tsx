'use client'

import { Check } from 'lucide-react'
import { StyleCategory } from '@/lib/utils/generative'

interface StyleCardProps {
  style: StyleCategory
  isSelected: boolean
  onClick: () => void
}

// Base path for production deployment
const basePath = process.env.NODE_ENV === 'production' ? '/imagelab' : ''

// Map style IDs to preview image paths
const PREVIEW_IMAGES: Record<string, string> = {
  bauhaus: `${basePath}/generative-previews/preview-bauhaus.png`,
  truchet: `${basePath}/generative-previews/preview-truchet.png`,
  terrain: `${basePath}/generative-previews/preview-terrain.png`,
  contour: `${basePath}/generative-previews/preview-contour.png`,
  flowfield: `${basePath}/generative-previews/preview-flowfields.png`,
  voronoi: `${basePath}/generative-previews/preview-voronoi.png`,
  tessellation: `${basePath}/generative-previews/preview-tessellations.png`,
  gradient: `${basePath}/generative-previews/preview-gradient.png`,
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
      <div className="relative">
        {previewSrc ? (
          <img
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

        {/* Description overlay on hover */}
        <div className="absolute inset-0 rounded-lg bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2">
          <p className="text-xs text-white text-center leading-snug">{style.description}</p>
        </div>
      </div>

      {/* Style info */}
      <div className="mt-3 text-center">
        <h3 className="font-medium text-foreground">{style.name}</h3>
      </div>
    </button>
  )
}
