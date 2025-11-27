'use client'

import { useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { StyleCategory } from '@/lib/utils/generative'

interface StyleCardProps {
  style: StyleCategory
  isSelected: boolean
  onClick: () => void
}

export default function StyleCard({ style, isSelected, onClick }: StyleCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw a simple preview pattern
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 120
    canvas.width = size
    canvas.height = size

    // Draw a simple preview based on style
    const colors = style.previewColors
    const cellSize = size / 3

    // Simple grid preview with style-appropriate patterns
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellSize
        const y = row * cellSize
        const colorIndex = (row + col) % colors.length

        ctx.fillStyle = colors[colorIndex]
        ctx.fillRect(x, y, cellSize, cellSize)

        const nextColor = colors[(colorIndex + 1) % colors.length]
        ctx.fillStyle = nextColor

        // Add style-specific shapes
        if (style.id === 'bauhaus') {
          // Quarter circles in alternating corners
          const corner = (row + col) % 4
          ctx.beginPath()
          if (corner === 0) {
            ctx.arc(x, y, cellSize * 0.8, 0, Math.PI / 2)
            ctx.lineTo(x, y)
          } else if (corner === 1) {
            ctx.arc(x + cellSize, y, cellSize * 0.8, Math.PI / 2, Math.PI)
            ctx.lineTo(x + cellSize, y)
          } else if (corner === 2) {
            ctx.arc(x + cellSize, y + cellSize, cellSize * 0.8, Math.PI, Math.PI * 1.5)
            ctx.lineTo(x + cellSize, y + cellSize)
          } else {
            ctx.arc(x, y + cellSize, cellSize * 0.8, Math.PI * 1.5, Math.PI * 2)
            ctx.lineTo(x, y + cellSize)
          }
          ctx.closePath()
          ctx.fill()
        } else if (style.id === 'truchet') {
          // Curved truchet tiles - stroked arcs that connect
          ctx.strokeStyle = nextColor
          ctx.lineWidth = cellSize * 0.3
          ctx.lineCap = 'round'

          const rotation = (row + col) % 2
          if (rotation === 0) {
            ctx.beginPath()
            ctx.arc(x, y, cellSize / 2, 0, Math.PI / 2)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(x + cellSize, y + cellSize, cellSize / 2, Math.PI, Math.PI * 1.5)
            ctx.stroke()
          } else {
            ctx.beginPath()
            ctx.arc(x + cellSize, y, cellSize / 2, Math.PI / 2, Math.PI)
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(x, y + cellSize, cellSize / 2, Math.PI * 1.5, Math.PI * 2)
            ctx.stroke()
          }
        } else if (style.id === 'terrain') {
          // Skip tile rendering for terrain - handle separately below
        } else if (style.id === 'contour') {
          // Skip tile rendering for contour - handle separately below
        }
      }
    }

    // Special rendering for terrain style (non-tile-based)
    if (style.id === 'terrain') {
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, size)
      gradient.addColorStop(0, colors[colors.length - 1]) // Lightest at top
      gradient.addColorStop(1, colors[Math.floor(colors.length / 2)])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Draw sun
      ctx.fillStyle = '#FFE066'
      ctx.beginPath()
      ctx.arc(size * 0.6, size * 0.2, size * 0.1, 0, Math.PI * 2)
      ctx.fill()

      // Draw wavy layers
      const numLayers = Math.min(colors.length, 4)
      for (let i = 0; i < numLayers; i++) {
        const baseY = size * (0.35 + i * 0.18)
        ctx.fillStyle = colors[i]
        ctx.beginPath()
        ctx.moveTo(0, baseY + Math.sin(0) * size * 0.03)

        // Simple wave
        for (let px = 0; px <= size; px += 2) {
          const wave = Math.sin((px / size) * Math.PI * 2 + i * 1.5) * size * 0.04
          ctx.lineTo(px, baseY + wave)
        }

        ctx.lineTo(size, size)
        ctx.lineTo(0, size)
        ctx.closePath()
        ctx.fill()
      }
    }

    // Special rendering for contour style (topographic lines)
    if (style.id === 'contour') {
      // Background
      ctx.fillStyle = colors[colors.length - 1] || '#F5F5F5'
      ctx.fillRect(0, 0, size, size)

      // Draw concentric contour lines with organic wobble
      const centerX = size * 0.45
      const centerY = size * 0.5
      const numContours = 6

      ctx.lineWidth = 2
      ctx.lineCap = 'round'

      for (let i = numContours; i >= 1; i--) {
        const baseRadius = (i / numContours) * size * 0.42
        ctx.strokeStyle = colors[i % colors.length]
        ctx.beginPath()

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          // Add organic wobble to radius
          const wobble = Math.sin(angle * 3 + i) * baseRadius * 0.15
          const radius = baseRadius + wobble
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()
        ctx.stroke()
      }

      // Add a second cluster for more interest
      const centerX2 = size * 0.75
      const centerY2 = size * 0.35
      const numContours2 = 4

      for (let i = numContours2; i >= 1; i--) {
        const baseRadius = (i / numContours2) * size * 0.25
        ctx.strokeStyle = colors[(i + 2) % colors.length]
        ctx.beginPath()

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          const wobble = Math.sin(angle * 4 + i * 2) * baseRadius * 0.2
          const radius = baseRadius + wobble
          const x = centerX2 + Math.cos(angle) * radius
          const y = centerY2 + Math.sin(angle) * radius

          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()
        ctx.stroke()
      }
    }
  }, [style])

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

      {/* Preview canvas */}
      <canvas ref={canvasRef} className="w-[120px] h-[120px] rounded-lg shadow-sm" />

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
