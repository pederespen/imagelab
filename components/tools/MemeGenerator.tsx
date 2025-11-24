'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, Copy, Check, Plus, Trash2, Save } from 'lucide-react'
import { Button, Card, Dropdown, Slider } from '@/components/ui'
import MemeTemplatePicker from '@/components/ui/MemeTemplatePicker'
import { useTheme } from '@/components/ThemeProvider'
import {
  TextLayer,
  MEME_TEMPLATES,
  DEFAULT_TEXT_LAYER,
  FONT_OPTIONS,
  RelativeTextPosition,
} from '@/lib/types/meme'
import {
  generateId,
  drawTextLayer,
  isPointInTextLayer,
  loadImageFromUrl,
  loadImageFromFile,
  downloadCanvas,
  copyCanvasToClipboard,
  createCroppedCanvas,
} from '@/lib/utils/meme'
import { isGif, parseGifFrames, type GifFrame } from '@/lib/utils/gif'
import { getAssetPath } from '@/lib/utils/assets'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null)
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [editedLayerIds, setEditedLayerIds] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // GIF-specific state
  const [isGifFile, setIsGifFile] = useState(false)
  const [gifFrames, setGifFrames] = useState<GifFrame[]>([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isGeneratingGif, setIsGeneratingGif] = useState(false)
  const [gifProgress, setGifProgress] = useState(0)

  // Animate GIF frames
  useEffect(() => {
    if (!isGifFile || gifFrames.length === 0 || !canvasRef.current) return

    let frameIndex = 0
    let timeoutId: NodeJS.Timeout

    const animate = () => {
      setCurrentFrameIndex(frameIndex)
      const delay = gifFrames[frameIndex].delay
      frameIndex = (frameIndex + 1) % gifFrames.length
      timeoutId = setTimeout(animate, delay)
    }

    animate()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isGifFile, gifFrames])

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) continue

          await handleFileLoad(file)
          break
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle keyboard input for selected text layer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selectedLayer = textLayers.find(l => l.id === selectedLayerId)

      if (!selectedLayerId || !selectedLayer) {
        // Handle escape even without selection to ensure deselect works
        if (e.key === 'Escape' && selectedLayerId) {
          setSelectedLayerId(null)
        }
        return
      }

      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Handle Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedLayerId(null)
        return
      }

      const hasBeenEdited = editedLayerIds.has(selectedLayerId)

      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (!hasBeenEdited) {
          // First edit - clear all text
          updateSelectedLayer({ text: '' })
          setEditedLayerIds(prev => new Set(prev).add(selectedLayerId))
        } else {
          // Already edited - remove last character
          updateSelectedLayer({ text: selectedLayer.text.slice(0, -1) })
        }
      }
      // Handle regular character input
      else if (e.key.length === 1) {
        e.preventDefault()
        if (!hasBeenEdited) {
          // First edit - replace text
          updateSelectedLayer({ text: e.key })
          setEditedLayerIds(prev => new Set(prev).add(selectedLayerId))
        } else {
          // Already edited - append
          updateSelectedLayer({ text: selectedLayer.text + e.key })
        }
      }
      // Handle Enter for new line
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (!hasBeenEdited) {
          // First edit - replace with newline
          updateSelectedLayer({ text: '\n' })
          setEditedLayerIds(prev => new Set(prev).add(selectedLayerId))
        } else {
          // Already edited - append newline
          updateSelectedLayer({ text: selectedLayer.text + '\n' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayerId, textLayers, editedLayerIds])

  // Redraw canvas whenever layers or image changes
  useEffect(() => {
    redrawCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImage, textLayers, selectedLayerId, theme, currentFrameIndex, isGifFile, gifFrames])

  const redrawCanvas = (forExport = false) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Clear canvas - use white for export, theme-aware muted for preview
    if (forExport) {
      ctx.fillStyle = '#ffffff'
    } else {
      ctx.fillStyle = theme === 'dark' ? '#262626' : '#f1f5f9'
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw base image or current GIF frame
    if (isGifFile && gifFrames.length > 0) {
      // Find maximum dimensions across all frames for consistent scaling
      let maxWidth = 0
      let maxHeight = 0
      gifFrames.forEach(frame => {
        maxWidth = Math.max(maxWidth, frame.imageData.width)
        maxHeight = Math.max(maxHeight, frame.imageData.height)
      })

      const scale = Math.min(canvas.width / maxWidth, canvas.height / maxHeight)
      const x = (canvas.width - maxWidth * scale) / 2
      const y = (canvas.height - maxHeight * scale) / 2

      // Draw current frame with consistent dimensions based on max
      const frame = gifFrames[currentFrameIndex]
      if (frame) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = frame.imageData.width
        tempCanvas.height = frame.imageData.height
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })
        if (tempCtx) {
          tempCtx.putImageData(frame.imageData, 0, 0)
          // Scale to match the max dimensions area
          ctx.drawImage(tempCanvas, x, y, maxWidth * scale, maxHeight * scale)
        }
      }
    } else if (baseImage) {
      const scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height)
      const x = (canvas.width - baseImage.width * scale) / 2
      const y = (canvas.height - baseImage.height * scale) / 2
      ctx.drawImage(baseImage, x, y, baseImage.width * scale, baseImage.height * scale)
    }

    // Draw text layers
    textLayers.forEach(layer => {
      drawTextLayer(ctx, layer, layer.id === selectedLayerId)
    })
  }

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId)

    try {
      const template = MEME_TEMPLATES.find(t => t.id === templateId)
      if (!template) return

      if (template.id === 'custom') {
        fileInputRef.current?.click()
        return
      }

      // Load from URL if it starts with http, otherwise from local path
      const imagePath = template.imagePath.startsWith('http')
        ? template.imagePath
        : getAssetPath(template.imagePath)
      const img = await loadImageFromUrl(imagePath)

      setBaseImage(img)

      // Clear GIF state when loading a preset template
      setIsGifFile(false)
      setGifFrames([])

      // Convert relative positions to absolute canvas positions
      if (template.defaultTexts && template.defaultTexts.length > 0) {
        const layers: TextLayer[] = template.defaultTexts.map(relPos => ({
          id: generateId(),
          ...DEFAULT_TEXT_LAYER,
          text: relPos.text,
          x: relPos.x * CANVAS_WIDTH,
          y: relPos.y * CANVAS_HEIGHT,
          fontSize: relPos.fontSize,
          textAlign: relPos.textAlign || 'center',
        }))
        setTextLayers(layers)
        setSelectedLayerId(layers[0]?.id || null)
        setEditedLayerIds(new Set())
      } else {
        setTextLayers([])
        setSelectedLayerId(null)
        setEditedLayerIds(new Set())
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      alert('Failed to load template. Please try again.')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await handleFileLoad(file)
  }

  const handleFileLoad = async (file: File) => {
    try {
      // Check if it's a GIF
      if (isGif(file)) {
        // Parse GIF frames
        const frames = await parseGifFrames(file)
        setGifFrames(frames)
        setIsGifFile(true)

        // Create image from first frame for canvas
        const canvas = document.createElement('canvas')
        canvas.width = frames[0].imageData.width
        canvas.height = frames[0].imageData.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.putImageData(frames[0].imageData, 0, 0)
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = canvas.toDataURL()
          })
          setBaseImage(img)
        }
      } else {
        // Regular image
        const img = await loadImageFromFile(file)
        setBaseImage(img)
        setIsGifFile(false)
        setGifFrames([])
      }

      setTextLayers([])
      setSelectedLayerId(null)
      setSelectedTemplate('custom')
    } catch (error) {
      console.error('Failed to load image:', error)
      alert('Failed to load image. Please try another file.')
    }
  }

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: generateId(),
      ...DEFAULT_TEXT_LAYER,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    }
    setTextLayers([...textLayers, newLayer])
    setSelectedLayerId(newLayer.id)
  }

  const deleteSelectedLayer = () => {
    if (!selectedLayerId) return
    setTextLayers(textLayers.filter(l => l.id !== selectedLayerId))
    setSelectedLayerId(null)
  }

  const updateSelectedLayer = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return
    setTextLayers(
      textLayers.map(layer => (layer.id === selectedLayerId ? { ...layer, ...updates } : layer))
    )
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check if clicking on a text layer (in reverse order, top to bottom)
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i]
      if (isPointInTextLayer(x, y, layer, ctx)) {
        setSelectedLayerId(layer.id)
        setIsDragging(true)
        setDragOffset({ x: x - layer.x, y: y - layer.y })
        return
      }
    }

    // Clicked on empty space
    setSelectedLayerId(null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayerId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    const newX = x - dragOffset.x
    const newY = y - dragOffset.y

    updateSelectedLayer({ x: newX, y: newY })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas || !baseImage) return

    // If it's a GIF, download as animated GIF
    if (isGifFile && gifFrames.length > 0) {
      await handleDownloadGif()
      return
    }

    // Otherwise download as static image
    redrawCanvas(true) // Redraw with white background for export
    const croppedCanvas = createCroppedCanvas(canvas, baseImage)
    downloadCanvas(croppedCanvas)
    redrawCanvas(false) // Restore preview background
  }

  const handleDownloadGif = async () => {
    if (!isGifFile || gifFrames.length === 0) return

    setIsGeneratingGif(true)
    setGifProgress(0)

    try {
      // Dynamic import to avoid SSR issues
      const GIF = (await import('gif.js.optimized')).default

      // Calculate the image bounds for cropping
      const frame = gifFrames[0]
      const scale = Math.min(
        CANVAS_WIDTH / frame.imageData.width,
        CANVAS_HEIGHT / frame.imageData.height
      )
      const imageWidth = frame.imageData.width * scale
      const imageHeight = frame.imageData.height * scale
      const imageX = (CANVAS_WIDTH - imageWidth) / 2
      const imageY = (CANVAS_HEIGHT - imageHeight) / 2

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: Math.round(imageWidth),
        height: Math.round(imageHeight),
        workerScript: getAssetPath('/gif.worker.js'),
      })

      // Render each frame with text overlays
      for (let i = 0; i < gifFrames.length; i++) {
        const frame = gifFrames[i]
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = CANVAS_WIDTH
        tempCanvas.height = CANVAS_HEIGHT
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })

        if (tempCtx) {
          // White background
          tempCtx.fillStyle = '#ffffff'
          tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          // Draw frame
          const frameCanvas = document.createElement('canvas')
          frameCanvas.width = frame.imageData.width
          frameCanvas.height = frame.imageData.height
          const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })
          if (frameCtx) {
            frameCtx.putImageData(frame.imageData, 0, 0)
            tempCtx.drawImage(frameCanvas, imageX, imageY, imageWidth, imageHeight)
          }

          // Draw text layers
          textLayers.forEach(layer => {
            drawTextLayer(tempCtx, layer, false)
          })

          // Crop to image bounds
          const croppedCanvas = document.createElement('canvas')
          croppedCanvas.width = Math.round(imageWidth)
          croppedCanvas.height = Math.round(imageHeight)
          const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true })
          if (croppedCtx) {
            croppedCtx.drawImage(
              tempCanvas,
              imageX,
              imageY,
              imageWidth,
              imageHeight,
              0,
              0,
              imageWidth,
              imageHeight
            )
            gif.addFrame(croppedCanvas, { delay: frame.delay })
          }
        }

        setGifProgress(Math.floor(((i + 1) / gifFrames.length) * 80))
      }

      gif.on('progress', (progress: number) => {
        setGifProgress(80 + Math.floor(progress * 20))
      })

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'meme.gif'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsGeneratingGif(false)
        setGifProgress(0)
      })

      gif.render()
    } catch (error) {
      console.error('Error generating GIF:', error)
      alert('Failed to generate GIF. Please try again.')
      setIsGeneratingGif(false)
      setGifProgress(0)
    }
  }

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas || !baseImage) return

    redrawCanvas(true) // Redraw with white background for export
    try {
      const croppedCanvas = createCroppedCanvas(canvas, baseImage)
      await copyCanvasToClipboard(croppedCanvas)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    } finally {
      redrawCanvas(false) // Restore preview background
    }
  }

  const handleSaveTemplate = () => {
    if (!baseImage || textLayers.length === 0) {
      alert('Please add an image and at least one text layer')
      return
    }

    const template = MEME_TEMPLATES.find(t => t.id === selectedTemplate)
    if (!template || template.id === 'custom') {
      alert('Please select a template (not Custom Upload)')
      return
    }

    // Convert absolute positions to relative (0-1)
    const relativeTexts: RelativeTextPosition[] = textLayers.map(layer => ({
      x: layer.x / CANVAS_WIDTH,
      y: layer.y / CANVAS_HEIGHT,
      fontSize: layer.fontSize,
      text: layer.text,
      textAlign: layer.textAlign,
    }))

    const templateConfig = {
      id: template.id,
      name: template.name,
      imagePath: template.imagePath,
      defaultTexts: relativeTexts,
    }

    // Copy to clipboard instead of console
    navigator.clipboard.writeText(JSON.stringify(templateConfig, null, 2))
    alert('Template config copied to clipboard!')
  }

  const selectedLayer = textLayers.find(l => l.id === selectedLayerId)

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top Controls */}
      <Card>
        <div className="p-2">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <MemeTemplatePicker
              templates={MEME_TEMPLATES}
              selectedId={selectedTemplate}
              onSelect={handleTemplateSelect}
            />

            {baseImage && (
              <>
                <div className="hidden sm:block h-6 w-px bg-border" />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addTextLayer}
                  className="inline-flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Text
                </Button>
              </>
            )}

            {selectedLayerId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={deleteSelectedLayer}
                className="inline-flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            )}

            {baseImage && (
              <>
                <div className="hidden sm:block flex-1" />
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveTemplate}
                    className="inline-flex items-center justify-center"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Config
                  </Button>
                )}
                <Button
                  variant={copyStatus === 'copied' ? 'success' : 'secondary'}
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="inline-flex items-center justify-center"
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGeneratingGif}
                  className="inline-flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {isGeneratingGif ? `${gifProgress}%` : 'Download'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-2 min-h-0">
          <div className="bg-muted rounded-lg overflow-hidden flex-1 flex items-center justify-center border border-border min-h-[400px] relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="max-w-full max-h-full cursor-move"
            />
            {!baseImage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground px-4">
                  <p className="text-sm">Select a preset or upload your own image to get started</p>
                  <p className="text-xs mt-1 opacity-75">You can also paste an image</p>
                  <p className="text-xs mt-1 opacity-75">
                    (GIFs must be uploaded to preserve animation)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Editor Panel */}
        <div className="flex flex-col gap-2 min-h-0">
          <Card className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              {selectedLayer ? (
                <>
                  <h3 className="text-sm font-semibold text-foreground">Edit Text</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <Slider
                      label="Font Size"
                      min={12}
                      max={120}
                      value={selectedLayer.fontSize}
                      onChange={e => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                    />

                    <Slider
                      label="Stroke"
                      min={0}
                      max={10}
                      value={selectedLayer.strokeWidth}
                      onChange={e => updateSelectedLayer({ strokeWidth: Number(e.target.value) })}
                    />
                  </div>

                  <Dropdown
                    label="Font"
                    value={selectedLayer.fontFamily}
                    onChange={value => updateSelectedLayer({ fontFamily: value })}
                    options={FONT_OPTIONS}
                  />

                  <Dropdown
                    label="Alignment"
                    value={selectedLayer.textAlign}
                    onChange={value =>
                      updateSelectedLayer({ textAlign: value as 'left' | 'center' | 'right' })
                    }
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={selectedLayer.color}
                        onChange={e => updateSelectedLayer({ color: e.target.value })}
                        className="w-full h-10 rounded-lg border border-input cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Stroke Color
                      </label>
                      <input
                        type="color"
                        value={selectedLayer.strokeColor}
                        onChange={e => updateSelectedLayer({ strokeColor: e.target.value })}
                        className="w-full h-10 rounded-lg border border-input cursor-pointer"
                      />
                    </div>
                  </div>

                  <Slider
                    label="Rotation"
                    min={-180}
                    max={180}
                    value={selectedLayer.rotation}
                    onChange={e => updateSelectedLayer({ rotation: Number(e.target.value) })}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground px-4">
                    <p className="text-sm">
                      {textLayers.length > 0
                        ? 'Click a text layer to edit'
                        : 'Add a text layer to get started'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
