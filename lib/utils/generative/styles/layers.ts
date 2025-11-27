import { SeededRandom } from '../types'

// Layered Mountains / Wave Layers style
// Creates smooth, flowing horizontal layers with depth

export interface LayersSettings {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  colors: string[]
  background: string
  seed: number
  complexity: number // Controls wave smoothness/drama
  variant: 'mountains' | 'mountains-no-sun' | 'dunes' | 'waves'
}

// Simple noise function for smooth randomness
function smoothNoise(x: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453
  return n - Math.floor(n)
}

// Interpolated noise for smoother results
function interpolatedNoise(x: number, seed: number): number {
  const intX = Math.floor(x)
  const fracX = x - intX

  const v1 = smoothNoise(intX, seed)
  const v2 = smoothNoise(intX + 1, seed)

  // Smooth interpolation (ease in-out)
  const t = fracX * fracX * (3 - 2 * fracX)
  return v1 * (1 - t) + v2 * t
}

// Multi-octave noise for natural-looking waves
function fractalNoise(x: number, seed: number, octaves: number = 4): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += interpolatedNoise(x * frequency, seed + i * 100) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / maxValue
}

// Generate ultra-smooth wave points using fractal noise
function generateSmoothWave(
  width: number,
  baseY: number,
  amplitude: number,
  scale: number,
  seed: number,
  numPoints: number = 300, // More points = smoother
  octaves: number = 4 // Fewer octaves = smoother, less detailed
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * width
    const noiseX = (i / numPoints) * scale

    // Use fractal noise for smooth, natural curves
    const noise = fractalNoise(noiseX, seed, octaves)
    const y = baseY + (noise - 0.5) * amplitude * 2

    points.push({ x, y })
  }

  return points
}

// Draw a filled layer with smooth curves
function drawSmoothLayer(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  canvasHeight: number
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  // Use bezier curves for extra smoothness
  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2
    const yc = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
  }

  // Handle last points
  if (points.length > 2) {
    const last = points[points.length - 1]
    const secondLast = points[points.length - 2]
    ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y)
  }

  // Close the path
  ctx.lineTo(points[points.length - 1].x, canvasHeight + 10)
  ctx.lineTo(points[0].x, canvasHeight + 10)
  ctx.closePath()
  ctx.fill()
}

// Draw sun with soft glow
function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  // Soft glow effect
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2.5)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.4, adjustAlpha(color, 0.3))
  gradient.addColorStop(1, adjustAlpha(color, 0))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Main circle
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

// Main generation function
export function generateLayers(settings: LayersSettings): void {
  const { canvas, ctx, colors, background, seed, complexity, variant } = settings
  const { width, height } = canvas
  const rng = new SeededRandom(seed)

  // Sky gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, background)
  gradient.addColorStop(1, blendColors(background, colors[0], 0.25))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Draw sun for appropriate variants
  if (variant === 'mountains' || variant === 'dunes') {
    const sunRadius = Math.min(width, height) * (0.06 + rng.next() * 0.04)
    const sunX = width * (0.25 + rng.next() * 0.5)
    const sunY = height * (0.1 + rng.next() * 0.12)
    const sunColor = lightenColor(colors[0], 0.65)
    drawSun(ctx, sunX, sunY, sunRadius, sunColor)
  }

  // Determine layer parameters based on variant
  const numLayers = colors.length
  let layerStartY: number
  let layerEndY: number
  let waveScale: number
  let amplitudeMultiplier: number
  let octaves: number // Fewer octaves = smoother, less detailed

  switch (variant) {
    case 'dunes':
      // Big, smooth, gentle rolling dunes
      layerStartY = height * 0.35
      layerEndY = height * 1.0
      waveScale = 0.4 + complexity * 0.4 // Very wide, gentle curves (less than 1 wave across)
      amplitudeMultiplier = 0.7
      octaves = 2 // Fewer octaves = smoother curves
      break
    case 'waves':
      // More dramatic, ocean-like
      layerStartY = height * 0.2
      layerEndY = height * 1.0
      waveScale = 2.0 + complexity * 2.0 // More waves across
      amplitudeMultiplier = 0.8
      octaves = 4
      break
    default: // mountains, mountains-no-sun
      layerStartY = height * 0.2
      layerEndY = height * 0.95
      waveScale = 1.0 + complexity * 1.2
      amplitudeMultiplier = 1.0
      octaves = 4
  }

  const layerSpacing = (layerEndY - layerStartY) / numLayers
  const baseAmplitude = height * (0.025 + complexity * 0.045) * amplitudeMultiplier

  // Draw layers from back to front
  for (let i = 0; i < numLayers; i++) {
    const baseY = layerStartY + i * layerSpacing

    // Each layer gets a unique seed for variation
    const layerSeed = seed + i * 1000 + rng.next() * 500

    // Slightly vary amplitude per layer for more natural look
    const layerAmplitude = baseAmplitude * (0.7 + rng.next() * 0.6)
    const layerScale = waveScale * (0.8 + rng.next() * 0.4)

    const points = generateSmoothWave(
      width,
      baseY,
      layerAmplitude,
      layerScale,
      layerSeed,
      300,
      octaves
    )

    // Get color for this layer
    const color = colors[i % colors.length]
    drawSmoothLayer(ctx, points, color, height)
  }
}

// Helper: blend two colors
function blendColors(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  if (!c1 || !c2) return color1

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

  return `rgb(${r}, ${g}, ${b})`
}

// Helper: lighten a color
function lightenColor(color: string, amount: number): string {
  const c = hexToRgb(color)
  if (!c) return '#FFEB3B'

  const r = Math.min(255, Math.round(c.r + (255 - c.r) * amount))
  const g = Math.min(255, Math.round(c.g + (255 - c.g) * amount))
  const b = Math.min(255, Math.round(c.b + (255 - c.b) * amount))

  return `rgb(${r}, ${g}, ${b})`
}

// Helper: add alpha to color
function adjustAlpha(color: string, alpha: number): string {
  const c = hexToRgb(color)
  if (!c) return color
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
}

// Helper: hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (hex.startsWith('rgb')) {
    const match = hex.match(/\d+/g)
    if (match && match.length >= 3) {
      return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) }
    }
    return null
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Pattern names for the style picker
export const layersPatternNames = ['Mountains', 'Mountains (No Sun)', 'Dunes', 'Waves']
