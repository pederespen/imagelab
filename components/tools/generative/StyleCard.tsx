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
        } else if (style.id === 'art-deco') {
          // Fan/sunburst pattern
          const cx = (row + col) % 2 === 0 ? x : x + cellSize
          const cy = (row + col) % 2 === 0 ? y + cellSize : y
          const startAngle = (row + col) % 2 === 0 ? Math.PI * 1.5 : Math.PI / 2

          const rays = 4
          const angleSpan = Math.PI / 2
          const rayAngle = angleSpan / (rays * 2)

          for (let i = 0; i < rays; i++) {
            const angle = startAngle + rayAngle * (i * 2 + 0.5)
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.arc(cx, cy, cellSize * 0.9, angle, angle + rayAngle)
            ctx.closePath()
            ctx.fill()
          }
        } else if (style.id === 'memphis') {
          // Mix of shapes
          const shape = (row * 3 + col) % 4
          if (shape === 0) {
            // Circle
            ctx.beginPath()
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.3, 0, Math.PI * 2)
            ctx.fill()
          } else if (shape === 1) {
            // Triangle
            ctx.beginPath()
            ctx.moveTo(x + cellSize / 2, y + cellSize * 0.2)
            ctx.lineTo(x + cellSize * 0.8, y + cellSize * 0.8)
            ctx.lineTo(x + cellSize * 0.2, y + cellSize * 0.8)
            ctx.closePath()
            ctx.fill()
          } else if (shape === 2) {
            // Cross
            const t = cellSize * 0.15
            ctx.fillRect(x + cellSize / 2 - t / 2, y + cellSize * 0.2, t, cellSize * 0.6)
            ctx.fillRect(x + cellSize * 0.2, y + cellSize / 2 - t / 2, cellSize * 0.6, t)
          } else {
            // Squiggle line
            ctx.strokeStyle = nextColor
            ctx.lineWidth = cellSize * 0.08
            ctx.beginPath()
            ctx.moveTo(x + cellSize * 0.2, y + cellSize * 0.5)
            ctx.bezierCurveTo(
              x + cellSize * 0.4,
              y + cellSize * 0.2,
              x + cellSize * 0.6,
              y + cellSize * 0.8,
              x + cellSize * 0.8,
              y + cellSize * 0.5
            )
            ctx.stroke()
          }
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
        }
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
