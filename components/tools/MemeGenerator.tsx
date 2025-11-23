'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Copy, Check, Plus, Trash2, Save } from 'lucide-react'
import { Button, Card, Input, Dropdown, Slider } from '@/components/ui'
import MemeTemplatePicker from '@/components/ui/MemeTemplatePicker'
import { useTheme } from '@/components/ThemeProvider'
import {
  TextLayer,
  MemeTemplate,
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

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null)
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom')

  // Handle keyboard input for selected text layer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId || !selectedLayer) return

      // Ignore if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault()
        updateSelectedLayer({ text: selectedLayer.text.slice(0, -1) })
      }
      // Handle regular character input
      else if (e.key.length === 1) {
        e.preventDefault()
        updateSelectedLayer({ text: selectedLayer.text + e.key })
      }
      // Handle Enter for new line
      else if (e.key === 'Enter') {
        e.preventDefault()
        updateSelectedLayer({ text: selectedLayer.text + '\n' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLayerId, textLayers])

  // Redraw canvas whenever layers or image changes
  useEffect(() => {
    redrawCanvas()
  }, [baseImage, textLayers, selectedLayerId, theme])

  const redrawCanvas = (forExport = false) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas - use white for export, theme-aware muted for preview
    if (forExport) {
      ctx.fillStyle = '#ffffff'
    } else {
      ctx.fillStyle = theme === 'dark' ? '#262626' : '#f1f5f9'
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw base image
    if (baseImage) {
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
    setIsLoading(true)

    try {
      const template = MEME_TEMPLATES.find(t => t.id === templateId)
      if (!template) return

      if (template.id === 'custom') {
        fileInputRef.current?.click()
        setIsLoading(false)
        return
      }

      // Load from URL if it starts with http, otherwise from local path
      const img = template.imagePath.startsWith('http')
        ? await loadImageFromUrl(template.imagePath)
        : await loadImageFromUrl(template.imagePath) // Will handle local paths too

      setBaseImage(img)

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
      } else {
        setTextLayers([])
        setSelectedLayerId(null)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      alert('Failed to load template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const img = await loadImageFromFile(file)
      setBaseImage(img)
      setTextLayers([])
      setSelectedLayerId(null)
    } catch (error) {
      console.error('Failed to load image:', error)
      alert('Failed to load image. Please try another file.')
    } finally {
      setIsLoading(false)
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

    updateSelectedLayer({
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas || !baseImage) return
    redrawCanvas(true) // Redraw with white background for export
    const croppedCanvas = createCroppedCanvas(canvas, baseImage)
    downloadCanvas(croppedCanvas)
    redrawCanvas(false) // Restore preview background
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

    // Output to console for easy copy-paste
    console.log('='.repeat(80))
    console.log('TEMPLATE CONFIG FOR: ' + template.name)
    console.log('='.repeat(80))
    console.log(JSON.stringify(templateConfig, null, 2))
    console.log('='.repeat(80))

    alert('Template config saved to console! Check DevTools.')
  }

  const handleDownloadBaseImage = () => {
    if (!baseImage) return

    const canvas = document.createElement('canvas')
    canvas.width = baseImage.width
    canvas.height = baseImage.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(baseImage, 0, 0)

    const template = MEME_TEMPLATES.find(t => t.id === selectedTemplate)
    const filename = template?.id ? `${template.id}.jpg` : 'meme-template.jpg'

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/jpeg')
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
                  className="inline-flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
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
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">
                    {textLayers.length > 0
                      ? 'Click a text layer to edit'
                      : 'Add a text layer to get started'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
