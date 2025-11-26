'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Download, RefreshCw, Shuffle } from 'lucide-react'
import { Button, Card, Slider, Dropdown } from '@/components/ui'
import ColorPaletteEditor from './generative/ColorPaletteEditor'
import {
  generateArt,
  generateRandomSeed,
  PALETTES,
  CANVAS_SIZES,
  ART_STYLES,
  type CanvasSize,
} from '@/lib/utils/generative'

const GRID_SIZE_MIN = 4
const GRID_SIZE_MAX = 20

export default function GenerativeArt() {
  const [seed, setSeed] = useState(generateRandomSeed)
  const [gridSize, setGridSize] = useState(8)
  const [styleIndex, setStyleIndex] = useState(0)
  const [complexity, setComplexity] = useState(0.7)
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [customColors, setCustomColors] = useState<string[]>(PALETTES[0].colors)
  const [customBackground, setCustomBackground] = useState(PALETTES[0].background)
  const [isCustomPalette, setIsCustomPalette] = useState(false)
  const [canvasSizeIndex, setCanvasSizeIndex] = useState(4) // Square 1080x1080 default
  const [customWidth, setCustomWidth] = useState(CANVAS_SIZES[4].width)
  const [customHeight, setCustomHeight] = useState(CANVAS_SIZES[4].height)
  const [isCustomSize, setIsCustomSize] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use custom dimensions or preset
  const canvasSize = isCustomSize
    ? { name: 'Custom', width: customWidth, height: customHeight }
    : CANVAS_SIZES[canvasSizeIndex]
  const style = ART_STYLES[styleIndex]

  // When selecting a preset, update custom dimensions
  const handleSizePresetChange = (index: number) => {
    setCanvasSizeIndex(index)
    setCustomWidth(CANVAS_SIZES[index].width)
    setCustomHeight(CANVAS_SIZES[index].height)
    setIsCustomSize(false)
  }

  // When manually changing dimensions, mark as custom
  const handleWidthChange = (width: number) => {
    setCustomWidth(width)
    setIsCustomSize(true)
  }

  const handleHeightChange = (height: number) => {
    setCustomHeight(height)
    setIsCustomSize(true)
  }

  // Memoize the palette to prevent infinite re-renders
  const currentPalette = useMemo(
    () => ({
      name: isCustomPalette ? 'Custom' : PALETTES[paletteIndex].name,
      colors: customColors,
      background: customBackground,
    }),
    [isCustomPalette, paletteIndex, customColors, customBackground]
  )

  const generate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsGenerating(true)

    // Set actual canvas size for high-res output
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    requestAnimationFrame(() => {
      generateArt(canvas, {
        gridSize,
        palette: currentPalette,
        seed,
        style: style.name,
        complexity,
      })
      setIsGenerating(false)
    })
  }, [gridSize, currentPalette, seed, style, canvasSize, complexity])

  // Generate on mount and when settings change
  useEffect(() => {
    generate()
  }, [generate])

  // When selecting a preset palette, update custom colors
  const handlePaletteSelect = (index: number) => {
    setPaletteIndex(index)
    setCustomColors(PALETTES[index].colors)
    setCustomBackground(PALETTES[index].background)
    setIsCustomPalette(false)
  }

  // When editing colors manually, mark as custom
  const handleColorsChange = (colors: string[]) => {
    setCustomColors(colors)
    setIsCustomPalette(true)
  }

  const handleBackgroundChange = (color: string) => {
    setCustomBackground(color)
    setIsCustomPalette(true)
  }

  const handleRandomizeAll = () => {
    setSeed(generateRandomSeed())
    setStyleIndex(Math.floor(Math.random() * ART_STYLES.length))
    const newPaletteIndex = Math.floor(Math.random() * PALETTES.length)
    handlePaletteSelect(newPaletteIndex)
    setGridSize(Math.floor(Math.random() * (GRID_SIZE_MAX - GRID_SIZE_MIN + 1)) + GRID_SIZE_MIN)
    setComplexity(0.4 + Math.random() * 0.5) // Keep between 40-90% for good results
  }

  const handleRandomizeSeed = () => {
    setSeed(generateRandomSeed())
  }

  const handleRandomizePalette = () => {
    const newIndex = Math.floor(Math.random() * PALETTES.length)
    handlePaletteSelect(newIndex)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generative-art-${seed}.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  const paletteOptions = [
    ...(isCustomPalette ? [{ value: 'custom', label: 'Custom' }] : []),
    ...PALETTES.map((p, i) => ({
      value: String(i),
      label: p.name,
    })),
  ]

  const sizeOptions = [
    ...(isCustomSize ? [{ value: 'custom', label: 'Custom' }] : []),
    ...CANVAS_SIZES.map((s, i) => ({
      value: String(i),
      label: s.name,
    })),
  ]

  const styleOptions = ART_STYLES.map((s, i) => ({
    value: String(i),
    label: s.name,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Canvas Area */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-medium text-foreground">Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRandomizeAll}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
            <div
              ref={containerRef}
              className="flex-1 flex items-center justify-center p-4 overflow-auto bg-muted/30"
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-lg"
                style={{
                  aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-medium text-foreground">Settings</h3>
          </div>

          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
            {/* Canvas Size */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">
                Canvas Size
              </label>
              <Dropdown
                value={isCustomSize ? 'custom' : String(canvasSizeIndex)}
                onChange={value => {
                  if (value !== 'custom') {
                    handleSizePresetChange(Number(value))
                  }
                }}
                options={sizeOptions}
                size="sm"
              />
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={e => handleWidthChange(Number(e.target.value))}
                    min={100}
                    max={8000}
                    className="w-full px-2 py-1.5 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Height</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={e => handleHeightChange(Number(e.target.value))}
                    min={100}
                    max={8000}
                    className="w-full px-2 py-1.5 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Grid Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Grid Size</label>
                <span className="text-xs text-muted-foreground">{gridSize}</span>
              </div>
              <Slider
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                min={GRID_SIZE_MIN}
                max={GRID_SIZE_MAX}
                step={1}
              />
            </div>

            {/* Complexity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Complexity</label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(complexity * 100)}%
                </span>
              </div>
              <Slider
                value={complexity}
                onChange={e => setComplexity(Number(e.target.value))}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            {/* Style */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Style</label>
              <Dropdown
                value={String(styleIndex)}
                onChange={value => setStyleIndex(Number(value))}
                options={styleOptions}
                size="sm"
              />
            </div>

            {/* Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Palette</label>
                <button
                  onClick={handleRandomizePalette}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Random palette"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
              <Dropdown
                value={isCustomPalette ? 'custom' : String(paletteIndex)}
                onChange={value => {
                  if (value !== 'custom') {
                    handlePaletteSelect(Number(value))
                  }
                }}
                options={paletteOptions}
                size="sm"
              />
              <div className="mt-2">
                <ColorPaletteEditor
                  colors={customColors}
                  background={customBackground}
                  onColorsChange={handleColorsChange}
                  onBackgroundChange={handleBackgroundChange}
                />
              </div>
            </div>

            {/* Seed */}
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Seed</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={e => setSeed(Number(e.target.value))}
                  className="flex-1 px-2.5 py-1.5 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <Button onClick={handleRandomizeSeed} variant="secondary" size="sm">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
