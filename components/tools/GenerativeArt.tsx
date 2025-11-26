'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Download, RefreshCw, Shuffle } from 'lucide-react'
import { Button, Card, Slider, Dropdown } from '@/components/ui'
import {
  generateArt,
  generateRandomSeed,
  PALETTES,
  CANVAS_SIZES,
  type ColorPalette,
  type CanvasSize,
} from '@/lib/utils/generative'

const GRID_SIZE_MIN = 4
const GRID_SIZE_MAX = 20

export default function GenerativeArt() {
  const [seed, setSeed] = useState(generateRandomSeed)
  const [gridSize, setGridSize] = useState(8)
  const [complexity, setComplexity] = useState(0.7)
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [canvasSizeIndex, setCanvasSizeIndex] = useState(4) // Square 1080x1080 default
  const [isGenerating, setIsGenerating] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const palette: ColorPalette = PALETTES[paletteIndex]
  const canvasSize: CanvasSize = CANVAS_SIZES[canvasSizeIndex]

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
        palette,
        seed,
        complexity,
      })
      setIsGenerating(false)
    })
  }, [gridSize, palette, seed, complexity, canvasSize])

  // Generate on mount and when settings change
  useEffect(() => {
    generate()
  }, [generate])

  const handleRandomize = () => {
    setSeed(generateRandomSeed())
  }

  const handleRandomizePalette = () => {
    setPaletteIndex(Math.floor(Math.random() * PALETTES.length))
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

  const paletteOptions = PALETTES.map((p, i) => ({
    value: String(i),
    label: p.name,
  }))

  const sizeOptions = CANVAS_SIZES.map((s, i) => ({
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
                  onClick={handleRandomize}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  New Seed
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
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-medium text-foreground">Settings</h3>
          </div>

          <div className="flex-1 px-4 pb-4 space-y-6 overflow-y-auto">
            {/* Canvas Size */}
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Canvas Size</label>
              <Dropdown
                value={String(canvasSizeIndex)}
                onChange={value => setCanvasSizeIndex(Number(value))}
                options={sizeOptions}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {canvasSize.width} × {canvasSize.height} pixels
              </p>
            </div>

            {/* Grid Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Grid Size</label>
                <span className="text-sm text-muted-foreground">{gridSize} tiles</span>
              </div>
              <Slider
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                min={GRID_SIZE_MIN}
                max={GRID_SIZE_MAX}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-2">Fewer tiles = larger shapes</p>
            </div>

            {/* Complexity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Complexity</label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(complexity * 100)}%
                </span>
              </div>
              <Slider
                value={complexity}
                onChange={e => setComplexity(Number(e.target.value))}
                min={0.1}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground mt-2">Lower = simpler patterns</p>
            </div>

            {/* Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Color Palette</label>
                <button
                  onClick={handleRandomizePalette}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Random palette"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
              <Dropdown
                value={String(paletteIndex)}
                onChange={value => setPaletteIndex(Number(value))}
                options={paletteOptions}
              />
              {/* Color swatches */}
              <div className="flex gap-1.5 mt-3">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Background: {palette.background}</p>
            </div>

            {/* Seed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Seed</label>
                <span className="text-sm text-muted-foreground font-mono">{seed}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={seed}
                  onChange={e => setSeed(Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <Button onClick={handleRandomize} variant="secondary" size="md">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Same seed = same artwork</p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              <Button onClick={handleDownload} variant="primary" fullWidth>
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button onClick={handleRandomize} variant="secondary" fullWidth>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
