'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Download, RefreshCw, Shuffle, ArrowLeft } from 'lucide-react'
import { Button, Card, Slider, Dropdown } from '@/components/ui'
import ColorPaletteEditor from './generative/ColorPaletteEditor'
import StyleCard from './generative/StyleCard'
import {
  generateArt,
  generateRandomSeed,
  PALETTES,
  CANVAS_SIZES,
  STYLE_CATEGORIES,
  type StyleCategory,
} from '@/lib/utils/generative'

// Pattern options for each style category
const CATEGORY_PATTERNS: Record<string, { name: string; description: string }[]> = {
  bauhaus: [
    { name: 'Quarter Circles', description: 'Flowing arcs and curves' },
    { name: 'Concentric', description: 'Layered circular patterns' },
    { name: 'Shadow Blocks', description: 'Squares with geometric shadows' },
    { name: 'Mondrian', description: 'Rectangular grid divisions' },
    { name: 'Diamonds', description: 'Rotated squares and triangles' },
    { name: 'Circles', description: 'Overlapping circular forms' },
  ],
  truchet: [
    { name: 'Curved Pipes', description: 'Smooth flowing connected curves' },
    { name: 'Outlined Pipes', description: 'Curves with outline effect' },
    { name: 'Diagonal Lines', description: 'Maze-like diagonal patterns' },
    { name: 'Triangles', description: 'Geometric triangle tiles' },
  ],
  terrain: [
    { name: 'Mountains', description: 'Classic layered peaks with sun' },
    { name: 'Mountains (No Sun)', description: 'Layered peaks, no sun' },
    { name: 'Dunes', description: 'Gentle rolling desert dunes' },
    { name: 'Waves', description: 'Flowing ocean-like waves' },
    { name: 'Peaks', description: 'Jagged rocky mountain peaks' },
    { name: 'Aurora', description: 'Night sky with northern lights' },
    { name: 'Reflection', description: 'Mountains reflected in water' },
  ],
  contour: [
    { name: 'Topographic', description: 'Classic terrain contour lines' },
    { name: 'Elevation', description: 'Filled elevation bands with contours' },
    { name: 'Islands', description: 'Multiple peak archipelago map' },
    { name: 'Ridges', description: 'Sharp mountain ridge formations' },
    { name: 'Thermal', description: 'Heat map with gradient intensity' },
    { name: 'Sound Waves', description: 'Circular wave interference patterns' },
    { name: 'Magnetic', description: 'Magnetic field potential lines' },
  ],
}

const GRID_SIZE_MIN = 4
const GRID_SIZE_MAX = 20

export default function GenerativeArt() {
  // Style category selection (null = show picker)
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null)

  // Editor state
  const [seed, setSeed] = useState(generateRandomSeed)
  const [gridSize, setGridSize] = useState(8)
  const [patternIndex, setPatternIndex] = useState(0)
  const [complexity, setComplexity] = useState(0.7)
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [customColors, setCustomColors] = useState<string[]>(PALETTES[0].colors)
  const [customBackground, setCustomBackground] = useState(PALETTES[0].background)
  const [isCustomPalette, setIsCustomPalette] = useState(false)
  const [canvasSizeIndex, setCanvasSizeIndex] = useState(4)
  const [customWidth, setCustomWidth] = useState(CANVAS_SIZES[4].width)
  const [customHeight, setCustomHeight] = useState(CANVAS_SIZES[4].height)
  const [isCustomSize, setIsCustomSize] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const canvasSize = useMemo(
    () =>
      isCustomSize
        ? { name: 'Custom', width: customWidth, height: customHeight }
        : CANVAS_SIZES[canvasSizeIndex],
    [isCustomSize, customWidth, customHeight, canvasSizeIndex]
  )

  // Get patterns for current category
  const categoryPatterns = selectedCategory ? CATEGORY_PATTERNS[selectedCategory.id] || [] : []
  const currentPattern = categoryPatterns[patternIndex] || categoryPatterns[0]

  const handleSizePresetChange = (index: number) => {
    setCanvasSizeIndex(index)
    setCustomWidth(CANVAS_SIZES[index].width)
    setCustomHeight(CANVAS_SIZES[index].height)
    setIsCustomSize(false)
  }

  const handleWidthChange = (width: number) => {
    setCustomWidth(width)
    setIsCustomSize(true)
  }

  const handleHeightChange = (height: number) => {
    setCustomHeight(height)
    setIsCustomSize(true)
  }

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
    if (!canvas || !currentPattern) return

    setIsGenerating(true)
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    requestAnimationFrame(() => {
      generateArt(canvas, {
        gridSize,
        palette: currentPalette,
        seed,
        style: currentPattern.name,
        complexity,
      })
      setIsGenerating(false)
    })
  }, [gridSize, currentPalette, seed, currentPattern, canvasSize, complexity])

  useEffect(() => {
    if (selectedCategory) {
      generate()
    }
  }, [generate, selectedCategory])

  const handlePaletteSelect = (index: number) => {
    setPaletteIndex(index)
    setCustomColors(PALETTES[index].colors)
    setCustomBackground(PALETTES[index].background)
    setIsCustomPalette(false)
  }

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
    if (categoryPatterns.length > 1) {
      setPatternIndex(Math.floor(Math.random() * categoryPatterns.length))
    }
    const newPaletteIndex = Math.floor(Math.random() * PALETTES.length)
    handlePaletteSelect(newPaletteIndex)
    setGridSize(Math.floor(Math.random() * (GRID_SIZE_MAX - GRID_SIZE_MIN + 1)) + GRID_SIZE_MIN)
    setComplexity(0.4 + Math.random() * 0.5)
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

  const handleSelectCategory = (category: StyleCategory) => {
    setSelectedCategory(category)
    // Reset to defaults for the selected style
    setPatternIndex(0)
    setSeed(generateRandomSeed())
  }

  const handleBackToStyles = () => {
    setSelectedCategory(null)
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

  const patternOptions = categoryPatterns.map((p, i) => ({
    value: String(i),
    label: p.name,
  }))

  // Style Picker View
  if (!selectedCategory) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Style</h2>
          <p className="text-muted-foreground">Select an art style to start creating</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {STYLE_CATEGORIES.map(category => (
            <StyleCard
              key={category.id}
              style={category}
              isSelected={false}
              onClick={() => handleSelectCategory(category)}
            />
          ))}
        </div>
      </div>
    )
  }

  // Editor View
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleBackToStyles}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Styles
        </Button>
        <h2 className="text-lg font-bold text-foreground">{selectedCategory.name}</h2>
      </div>

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

            {/* Grid Size - only for tile-based styles */}
            {selectedCategory?.id !== 'terrain' && selectedCategory?.id !== 'contour' && (
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
            )}

            {/* Complexity/Line Thickness/Waviness - label depends on style */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">
                  {selectedCategory?.id === 'truchet'
                    ? 'Line Thickness'
                    : selectedCategory?.id === 'terrain'
                      ? 'Waviness'
                      : selectedCategory?.id === 'contour'
                        ? 'Detail'
                        : 'Complexity'}
                </label>
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

            {/* Pattern - only show if category has multiple patterns */}
            {categoryPatterns.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Pattern</label>
                <Dropdown
                  value={String(patternIndex)}
                  onChange={value => setPatternIndex(Number(value))}
                  options={patternOptions}
                  size="sm"
                />
              </div>
            )}

            {/* Color Palette - shared across styles */}
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

            {/* Seed - shared across styles */}
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
