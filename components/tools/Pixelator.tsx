'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download } from 'lucide-react'
import { Button, Card, Slider, Dropdown } from '@/components/ui'
import { pixelateImage, type ColorPalette } from '@/lib/utils/pixelator'

export default function Pixelator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [pixelSize, setPixelSize] = useState(10)
  const [colorDepth, setColorDepth] = useState(64)
  const [colorPalette, setColorPalette] = useState<ColorPalette>('none')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const processImage = useCallback(() => {
    const sourceCanvas = sourceCanvasRef.current
    const displayCanvas = displayCanvasRef.current

    if (!sourceCanvas || !displayCanvas) return

    setIsProcessing(true)

    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
      try {
        const pixelatedCanvas = pixelateImage(sourceCanvas, pixelSize, {
          colorDepth: colorDepth < 64 ? colorDepth : undefined,
          colorPalette: colorPalette !== 'none' ? colorPalette : undefined,
        })

        displayCanvas.width = pixelatedCanvas.width
        displayCanvas.height = pixelatedCanvas.height

        const ctx = displayCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(pixelatedCanvas, 0, 0)
        }
      } catch (error) {
        console.error('Error pixelating image:', error)
      } finally {
        setIsProcessing(false)
      }
    })
  }, [pixelSize, colorDepth, colorPalette])

  // Load image to source canvas
  useEffect(() => {
    if (!imageSrc || !sourceCanvasRef.current) return

    const img = new Image()
    img.onload = () => {
      const canvas = sourceCanvasRef.current
      if (!canvas) return

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        processImage()
      }
    }
    img.src = imageSrc
  }, [imageSrc, processImage])

  // Debounced processing when pixel size changes
  useEffect(() => {
    if (!sourceCanvasRef.current || !imageSrc) return

    // Clear any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }

    // Debounce the processing by 100ms
    processingTimeoutRef.current = setTimeout(() => {
      processImage()
    }, 100)

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [pixelSize, colorDepth, colorPalette, imageSrc, processImage])

  // Handle paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFileSelect(file)
          }
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      setImageSrc(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDownload = () => {
    const canvas = displayCanvasRef.current
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pixelated-${pixelSize}px.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleChangeImage = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <canvas ref={sourceCanvasRef} className="hidden" />

      <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Image Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {imageSrc ? (
            <Card className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-medium text-foreground">Pixelated Image</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleChangeImage}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Change Image
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <canvas ref={displayCanvasRef} className="max-w-full max-h-full object-contain" />
              </div>
            </Card>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center bg-muted border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-muted/80' : 'border-border hover:border-primary/50'
              }`}
            >
              <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2 text-foreground">
                Upload an image to pixelate
              </p>
              <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-medium text-foreground">Settings</h3>
          </div>

          {imageSrc ? (
            <div className="flex-1 px-4 pb-4 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Pixel Size</label>
                  <span className="text-sm text-muted-foreground">{pixelSize}px</span>
                </div>
                <Slider
                  value={pixelSize}
                  onChange={e => setPixelSize(Number(e.target.value))}
                  min={2}
                  max={50}
                  step={1}
                  disabled={!imageSrc || isProcessing}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Larger values create bigger pixel blocks
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Color Depth</label>
                  <span className="text-sm text-muted-foreground">
                    {colorDepth === 64 ? 'Full' : `${colorDepth} colors`}
                  </span>
                </div>
                <Slider
                  value={colorDepth}
                  onChange={e => setColorDepth(Number(e.target.value))}
                  min={2}
                  max={64}
                  step={2}
                  disabled={!imageSrc || isProcessing}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Lower values create stronger posterization
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Color Palette
                </label>
                <Dropdown
                  value={colorPalette}
                  onChange={value => setColorPalette(value as ColorPalette)}
                  options={[
                    { value: 'none', label: 'None (Original Colors)' },
                    { value: 'gameboy', label: 'GameBoy Green' },
                    { value: 'cga', label: 'CGA (4 colors)' },
                    { value: 'nes', label: 'NES Palette' },
                    { value: 'grayscale', label: 'Grayscale' },
                    { value: 'sepia', label: 'Sepia Tone' },
                    { value: 'vapor', label: 'Vaporwave' },
                  ]}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Apply classic retro color schemes
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground px-4">
              <p className="text-sm">Upload an image to adjust settings</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
