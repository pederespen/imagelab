'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Copy, Check, Pipette } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import {
  getAllColorFormats,
  formatColorString,
  getContrastTextColor,
  type ColorFormats,
} from '@/lib/utils/color'

export default function ColorPicker() {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<ColorFormats | null>(null)
  const [cursorColor, setCursorColor] = useState<ColorFormats | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
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

  const getColorAtPosition = (e: React.MouseEvent<HTMLDivElement>): ColorFormats | null => {
    const canvas = canvasRef.current
    const container = imageContainerRef.current
    if (!canvas || !container) return null

    const rect = container.getBoundingClientRect()
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

    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data
    return getAllColorFormats(pixel[0], pixel[1], pixel[2])
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const color = getColorAtPosition(e)
    if (color) {
      setSelectedColor(color)
    }
  }

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const color = getColorAtPosition(e)
    setCursorColor(color)

    const container = imageContainerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleImageMouseLeave = () => {
    setCursorColor(null)
    setCursorPosition(null)
  }

  const handleCopyColor = async (format: keyof ColorFormats, colors: ColorFormats) => {
    const text = formatColorString(format, colors)
    await navigator.clipboard.writeText(text)
    setCopiedFormat(`${format}-${colors.hex}`)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const colorFormats: (keyof ColorFormats)[] = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk']

  return (
    <div className="space-y-6">
      {/* Hidden canvas for pixel reading */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Image area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pipette className="w-4 h-4" />
                Click on image to pick a color
              </CardTitle>
            </CardHeader>
            <div className="p-5 pt-0">
              {!imageSrc ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-200
                    ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop an image here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can also paste an image from clipboard (Ctrl/Cmd + V)
                  </p>
                </div>
              ) : (
                <div
                  ref={imageContainerRef}
                  onClick={handleImageClick}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={handleImageMouseLeave}
                  className="relative cursor-crosshair rounded-lg overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Uploaded image"
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                  />

                  {/* Cursor color preview */}
                  {cursorColor && cursorPosition && (
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: cursorPosition.x + 15,
                        top: cursorPosition.y + 15,
                      }}
                    >
                      <div className="flex items-center gap-2 bg-popover border border-border rounded-lg shadow-lg p-2">
                        <div
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: cursorColor.hex }}
                        />
                        <span className="text-xs font-mono text-foreground">
                          {cursorColor.hex.toUpperCase()}
                        </span>
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

              {imageSrc && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Color details panel */}
        <div className="space-y-6">
          {/* Selected color */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Color</CardTitle>
            </CardHeader>
            <div className="p-5 pt-0">
              {selectedColor ? (
                <div className="space-y-4">
                  {/* Large color preview */}
                  <div
                    className="w-full aspect-video rounded-lg border border-border flex items-center justify-center"
                    style={{ backgroundColor: selectedColor.hex }}
                  >
                    <span
                      className={`text-xl font-mono font-bold ${
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
                  <div className="space-y-2">
                    {colorFormats.map(format => (
                      <div
                        key={format}
                        className="flex items-center justify-between bg-muted rounded-lg px-3 py-2"
                      >
                        <div>
                          <span className="text-xs text-muted-foreground uppercase">{format}</span>
                          <p className="font-mono text-sm text-foreground">
                            {formatColorString(format, selectedColor)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyColor(format, selectedColor)}
                        >
                          {copiedFormat === `${format}-${selectedColor.hex}` ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pipette className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
