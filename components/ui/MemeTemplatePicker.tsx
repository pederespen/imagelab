'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Upload } from 'lucide-react'
import { MemeTemplate } from '@/lib/types/meme'
import { getAssetPath } from '@/lib/utils/assets'

interface MemeTemplatePickerProps {
  templates: MemeTemplate[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function MemeTemplatePicker({
  templates,
  selectedId,
  onSelect,
}: MemeTemplatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedTemplate = templates.find(t => t.id === selectedId)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (id: string) => {
    onSelect(id)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-56">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[30px] px-3 rounded-md bg-card border border-border hover:bg-muted transition-colors flex items-center justify-between gap-2 text-sm text-foreground"
      >
        <span className="truncate">{selectedTemplate?.name || 'Select Template'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Grid */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-[600px] lg:w-[800px] -translate-x-1/2 left-1/2 sm:left-0 sm:translate-x-0">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  template.id === selectedId
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {template.id === 'custom' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                    <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium text-center px-1">
                      Custom Upload
                    </span>
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAssetPath(template.imagePath)}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium line-clamp-2 text-center">
                          {template.name}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
