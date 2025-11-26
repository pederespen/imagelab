'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Copy, Check, Pipette } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import {
  getAllColorFormats,
  formatColorString,
  getContrastTextColor,
  rgbToHex,
  type ColorFormats,
} from '@/lib/utils/color'

export default function ColorPicker() {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<ColorFormats | null>(null)
  const [cursorColor, setCursorColor] = useState<ColorFormats | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
  const [surroundingPixels, setSurroundingPixels] = useState<string[][]>([])
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) handleFileLoad(file)
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleFileLoad = async (file: File) => {
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    setSelectedColor(null)
    setCursorColor(null)

    // Load image onto canvas for pixel reading
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
    }
    img.src = url
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileLoad(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const getColorAtPosition = (
    e: React.MouseEvent<HTMLDivElement>
  ): { color: ColorFormats; grid: string[][] } | null => {
    const canvas = canvasRef.current
    const container = imageContainerRef.current
    if (!canvas || !container) return null

    const img = container.querySelector('img')
    if (!img) return null

    const imgRect = img.getBoundingClientRect()

    // Calculate position relative to the displayed image
    const x = e.clientX - imgRect.left
    const y = e.clientY - imgRect.top

    // Check if click is within image bounds
    if (x < 0 || y < 0 || x > imgRect.width || y > imgRect.height) return null

    // Scale to canvas coordinates
    const scaleX = canvas.width / imgRect.width
    const scaleY = canvas.height / imgRect.height
    const canvasX = Math.floor(x * scaleX)
    const canvasY = Math.floor(y * scaleY)

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Get center pixel
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data
    const color = getAllColorFormats(pixel[0], pixel[1], pixel[2])

    // Get 3x3 grid of surrounding pixels
    const grid: string[][] = []
    for (let dy = -1; dy <= 1; dy++) {
      const row: string[] = []
      for (let dx = -1; dx <= 1; dx++) {
        const px = Math.max(0, Math.min(canvas.width - 1, canvasX + dx))
        const py = Math.max(0, Math.min(canvas.height - 1, canvasY + dy))
        const p = ctx.getImageData(px, py, 1, 1).data
        row.push(rgbToHex(p[0], p[1], p[2]))
      }
      grid.push(row)
    }

    return { color, grid }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const result = getColorAtPosition(e)
    if (result) {
      setSelectedColor(result.color)
    }
  }

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const result = getColorAtPosition(e)
    if (result) {
      setCursorColor(result.color)
      setSurroundingPixels(result.grid)
    } else {
      setCursorColor(null)
      setSurroundingPixels([])
    }

    const container = imageContainerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleImageMouseLeave = () => {
    setCursorColor(null)
    setCursorPosition(null)
    setSurroundingPixels([])
  }

  const handleCopyColor = async (format: keyof ColorFormats, colors: ColorFormats) => {
    const text = formatColorString(format, colors)
    await navigator.clipboard.writeText(text)
    setCopiedFormat(`${format}-${colors.hex}`)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const colorFormats: (keyof ColorFormats)[] = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk']

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Hidden canvas for pixel reading */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Image area */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          <div
            onClick={!imageSrc ? () => fileInputRef.current?.click() : undefined}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              bg-muted rounded-lg overflow-hidden flex-1 flex items-center justify-center border-2 relative transition-all duration-200 min-h-[400px]
              ${!imageSrc ? 'cursor-pointer' : ''}
              ${isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-border'}
              ${!imageSrc && !isDragging ? 'border-dashed hover:border-primary/50' : ''}
            `}
          >
            {!imageSrc ? (
              <div className="text-center text-muted-foreground">
                <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Drop an image here or click to upload</p>
                <p className="text-xs mt-1.5 opacity-75">You can also paste from clipboard</p>
              </div>
            ) : (
              <div
                ref={imageContainerRef}
                onClick={handleImageClick}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                className="relative cursor-crosshair w-full h-full flex items-center justify-center p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Uploaded image"
                  className="max-w-full max-h-full object-contain"
                />

                {/* Cursor color preview with pixel grid */}
                {cursorColor && cursorPosition && surroundingPixels.length > 0 && (
                  <div
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: cursorPosition.x + 15,
                      top: cursorPosition.y + 15,
                    }}
                  >
                    <div className="bg-popover border border-border rounded-md shadow-lg p-1.5">
                      {/* 3x3 pixel grid */}
                      <div className="grid grid-cols-3 gap-px bg-border/50 rounded-sm overflow-hidden">
                        {surroundingPixels.map((row, rowIdx) =>
                          row.map((hex, colIdx) => (
                            <div
                              key={`${rowIdx}-${colIdx}`}
                              className={`w-7 h-7 ${
                                rowIdx === 1 && colIdx === 1 ? 'ring-2 ring-red-500 ring-inset' : ''
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))
                        )}
                      </div>
                      {/* Hex value */}
                      <p className="text-xs font-mono text-foreground text-center mt-1">
                        {cursorColor.hex.toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleFileLoad(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Color details panel */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>Selected Color</CardTitle>
            </CardHeader>
            <div className="p-5 pt-0 flex-1 flex flex-col">
              {selectedColor ? (
                <div className="space-y-3">
                  {/* Large color preview */}
                  <div
                    className="w-full aspect-[16/9] rounded-lg border border-border flex items-center justify-center"
                    style={{ backgroundColor: selectedColor.hex }}
                  >
                    <span
                      className={`text-lg font-mono font-bold ${
                        getContrastTextColor(
                          selectedColor.rgb.r,
                          selectedColor.rgb.g,
                          selectedColor.rgb.b
                        ) === 'light'
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      {selectedColor.hex.toUpperCase()}
                    </span>
                  </div>

                  {/* Color formats */}
                  <div className="space-y-1.5">
                    {colorFormats.map(format => (
                      <div
                        key={format}
                        className="flex items-center justify-between bg-muted rounded-lg px-2.5 py-1.5"
                      >
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {format}
                          </span>
                          <p className="font-mono text-xs text-foreground">
                            {formatColorString(format, selectedColor)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopyColor(format, selectedColor)}
                        >
                          {copiedFormat === `${format}-${selectedColor.hex}` ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">Click on the image to pick a color</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
