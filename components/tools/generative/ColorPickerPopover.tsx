'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface ColorPickerPopoverProps {
  color: string
  onChange: (color: string) => void
  onDelete?: () => void
  canDelete?: boolean
}

// Convert HSV to RGB hex
function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  const toHex = (val: number) =>
    Math.round((val + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Convert hex to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : d / max
  const v = max

  return { h, s, v }
}

export default function ColorPickerPopover({
  color,
  onChange,
  onDelete,
  canDelete = true,
}: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hsv, setHsv] = useState(() => hexToHsv(color))
  const [hexInput, setHexInput] = useState(color)
  const [openAbove, setOpenAbove] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const satValRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const isDraggingSatVal = useRef(false)
  const isDraggingHue = useRef(false)

  // Sync when color prop changes externally
  useEffect(() => {
    const newHsv = hexToHsv(color)
    setHsv(newHsv)
    setHexInput(color)
  }, [color])

  // Handle opening - check position first, then open
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const popoverHeight = 280
      setOpenAbove(spaceBelow < popoverHeight && rect.top > popoverHeight)
    }
    setIsOpen(!isOpen)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const updateColor = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      setHsv(newHsv)
      const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v)
      setHexInput(newHex)
      onChange(newHex)
    },
    [onChange]
  )

  // Saturation/Value picker handlers
  const handleSatValMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!satValRef.current) return
      const rect = satValRef.current.getBoundingClientRect()
      const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
      updateColor({ ...hsv, s, v })
    },
    [hsv, updateColor]
  )

  const handleSatValMouseDown = (e: React.MouseEvent) => {
    isDraggingSatVal.current = true
    handleSatValMove(e.clientX, e.clientY)
  }

  // Hue slider handlers
  const handleHueMove = useCallback(
    (clientX: number) => {
      if (!hueRef.current) return
      const rect = hueRef.current.getBoundingClientRect()
      const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360))
      updateColor({ ...hsv, h })
    },
    [hsv, updateColor]
  )

  const handleHueMouseDown = (e: React.MouseEvent) => {
    isDraggingHue.current = true
    handleHueMove(e.clientX)
  }

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSatVal.current) {
        handleSatValMove(e.clientX, e.clientY)
      }
      if (isDraggingHue.current) {
        handleHueMove(e.clientX)
      }
    }

    const handleMouseUp = () => {
      isDraggingSatVal.current = false
      isDraggingHue.current = false
    }

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isOpen, handleSatValMove, handleHueMove])

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newHsv = hexToHsv(value)
      setHsv(newHsv)
      onChange(value)
    }
  }

  const handleHexBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(color)
    }
  }

  const handleDelete = () => {
    setIsOpen(false)
    onDelete?.()
  }

  const hueColor = hsvToHex(hsv.h, 1, 1)

  return (
    <div className="relative" ref={popoverRef}>
      {/* Color Swatch Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-7 h-7 rounded border border-border hover:border-foreground/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        style={{ backgroundColor: color }}
        title={color}
      />

      {/* Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 bg-popover border border-border rounded-lg shadow-lg p-3 w-[200px] ${
            openAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="space-y-3">
            {/* Saturation/Value Picker */}
            <div
              ref={satValRef}
              className="w-full h-32 rounded-md cursor-crosshair relative"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
              }}
              onMouseDown={handleSatValMouseDown}
            >
              {/* Picker indicator */}
              <div
                className="absolute w-3.5 h-3.5 border-2 border-white rounded-full shadow-md pointer-events-none"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              ref={hueRef}
              className="w-full h-3 rounded-md cursor-pointer relative"
              style={{
                background:
                  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
              onMouseDown={handleHueMouseDown}
            >
              {/* Hue indicator */}
              <div
                className="absolute w-2 h-full border-2 border-white rounded-sm shadow-md pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {/* Hex Input */}
            <div className="flex gap-2 items-center">
              <div
                className="w-7 h-7 rounded border border-border flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={e => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                placeholder="#000000"
                className="w-0 flex-1 min-w-0 px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-mono uppercase"
              />
            </div>

            {/* Delete Button */}
            {canDelete && onDelete && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
