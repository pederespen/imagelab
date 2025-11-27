import { SeededRandom } from '../types'

// Terrain style
// Creates smooth, flowing horizontal layers with depth

export interface TerrainSettings {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  colors: string[]
  background: string
  seed: number
  complexity: number // Controls wave smoothness/drama
  variant: 'mountains' | 'mountains-no-sun' | 'dunes' | 'waves' | 'peaks' | 'aurora' | 'reflection'
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

// Generate jagged peak points for rocky mountains
function generateJaggedPeaks(
  width: number,
  baseY: number,
  amplitude: number,
  scale: number,
  seed: number,
  rng: SeededRandom,
  numPoints: number = 150
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []

  // Create major peaks at random positions
  const numPeaks = Math.floor(3 + rng.next() * 4)
  const peakPositions: number[] = []
  for (let i = 0; i < numPeaks; i++) {
    peakPositions.push(rng.next())
  }
  peakPositions.sort((a, b) => a - b)

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const x = t * width

    // Base noise for small variations
    const noise = fractalNoise(t * scale, seed, 3)
    let y = baseY + (noise - 0.5) * amplitude * 0.5

    // Add sharp peaks
    for (const peakPos of peakPositions) {
      const dist = Math.abs(t - peakPos)
      if (dist < 0.15) {
        // Sharp triangular peak shape
        const peakHeight = amplitude * (0.8 + rng.next() * 0.6)
        const peakInfluence = Math.max(0, 1 - dist / 0.15)
        // Use pow to make it sharper
        y -= peakHeight * Math.pow(peakInfluence, 1.5)
      }
    }

    // Add small jagged variations
    if (i > 0 && i < numPoints) {
      y += (rng.next() - 0.5) * amplitude * 0.15
    }

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

// Draw stars for night sky
function drawStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: SeededRandom,
  maxY: number // Don't draw stars below this
) {
  const numStars = Math.floor(50 + rng.next() * 100)

  for (let i = 0; i < numStars; i++) {
    const x = rng.next() * width
    const y = rng.next() * maxY
    const size = 0.5 + rng.next() * 2
    const brightness = 0.3 + rng.next() * 0.7

    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Draw aurora borealis effect
function drawAurora(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  seed: number,
  rng: SeededRandom
) {
  const numWaves = 3 + Math.floor(rng.next() * 3)

  for (let w = 0; w < numWaves; w++) {
    const color = colors[w % colors.length]
    const baseY = height * (0.1 + rng.next() * 0.3)
    const amplitude = height * (0.05 + rng.next() * 0.1)
    const waveWidth = height * (0.02 + rng.next() * 0.04)

    // Create gradient for aurora glow
    const gradient = ctx.createLinearGradient(
      0,
      baseY - amplitude - waveWidth,
      0,
      baseY + amplitude + waveWidth * 2
    )
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(0.3, adjustAlpha(color, 0.1))
    gradient.addColorStop(0.5, adjustAlpha(color, 0.4))
    gradient.addColorStop(0.7, adjustAlpha(color, 0.1))
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(0, height)

    // Draw wavy aurora shape
    for (let x = 0; x <= width; x += 5) {
      const t = x / width
      const noise1 = fractalNoise(t * 3 + w, seed + w * 100, 3)
      const noise2 = fractalNoise(t * 6 + w, seed + w * 200, 2)
      const y = baseY + (noise1 - 0.5) * amplitude + (noise2 - 0.5) * amplitude * 0.5
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fill()
  }
}

// Main generation function
export function generateTerrain(settings: TerrainSettings): void {
  const { canvas, ctx, colors, background, seed, complexity, variant } = settings
  const { width, height } = canvas
  const rng = new SeededRandom(seed)

  // Handle special variants first
  if (variant === 'aurora') {
    // Dark night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(0.5, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw stars
    drawStars(ctx, width, height, rng, height * 0.6)

    // Draw aurora
    drawAurora(ctx, width, height, colors, seed, rng)

    // Draw dark mountain silhouettes at bottom
    const numLayers = Math.min(3, colors.length)
    for (let i = 0; i < numLayers; i++) {
      const baseY = height * (0.65 + i * 0.12)
      const layerSeed = seed + i * 1000
      const amplitude = height * 0.08 * (1 - i * 0.2)
      const points = generateSmoothWave(width, baseY, amplitude, 1.5, layerSeed, 200, 4)

      // Dark silhouette colors
      const darkness = 0.05 + i * 0.05
      drawSmoothLayer(ctx, points, `rgba(0, 0, 0, ${1 - darkness})`, height)
    }
    return
  }

  if (variant === 'reflection') {
    // Sky gradient (top half)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.5)
    skyGradient.addColorStop(0, background)
    skyGradient.addColorStop(1, blendColors(background, colors[0], 0.3))
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, height * 0.5)

    // Water gradient (bottom half)
    const waterGradient = ctx.createLinearGradient(0, height * 0.5, 0, height)
    waterGradient.addColorStop(0, blendColors(background, colors[0], 0.4))
    waterGradient.addColorStop(1, blendColors(background, colors[0], 0.6))
    ctx.fillStyle = waterGradient
    ctx.fillRect(0, height * 0.5, width, height * 0.5)

    // Draw sun
    const sunRadius = Math.min(width, height) * (0.05 + rng.next() * 0.03)
    const sunX = width * (0.3 + rng.next() * 0.4)
    const sunY = height * (0.12 + rng.next() * 0.08)
    const sunColor = lightenColor(colors[0], 0.7)
    drawSun(ctx, sunX, sunY, sunRadius, sunColor)

    // Draw mountains (in the upper portion)
    const horizonY = height * 0.5
    const numLayers = colors.length
    const layerHeight = (horizonY * 0.7) / numLayers

    // Store points for reflection
    const allLayerPoints: { x: number; y: number }[][] = []

    for (let i = 0; i < numLayers; i++) {
      const baseY = height * 0.25 + i * layerHeight
      const layerSeed = seed + i * 1000 + rng.next() * 500
      const amplitude = height * 0.06 * (1 - i * 0.1)
      const points = generateSmoothWave(
        width,
        baseY,
        amplitude,
        1.2 + complexity,
        layerSeed,
        200,
        4
      )

      allLayerPoints.push(points)
      drawSmoothLayer(ctx, points, colors[i % colors.length], horizonY)
    }

    // Draw reflections (mirrored, slightly distorted)
    ctx.save()
    ctx.globalAlpha = 0.4

    for (let i = numLayers - 1; i >= 0; i--) {
      const originalPoints = allLayerPoints[i]
      const reflectedPoints = originalPoints.map((p, idx) => {
        // Mirror around horizon and add wave distortion
        const distortion = Math.sin(idx * 0.1 + seed) * 3
        return {
          x: p.x,
          y: horizonY + (horizonY - p.y) + distortion,
        }
      })

      // Draw reflected layer (from horizon upward in the water)
      ctx.fillStyle = colors[i % colors.length]
      ctx.beginPath()
      ctx.moveTo(reflectedPoints[0].x, horizonY)

      for (let j = 0; j < reflectedPoints.length; j++) {
        ctx.lineTo(reflectedPoints[j].x, reflectedPoints[j].y)
      }

      ctx.lineTo(reflectedPoints[reflectedPoints.length - 1].x, height)
      ctx.lineTo(reflectedPoints[0].x, height)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()

    // Add subtle water ripple lines
    ctx.strokeStyle = adjustAlpha(background, 0.3)
    ctx.lineWidth = 1
    for (let y = horizonY + 20; y < height; y += 15 + rng.next() * 10) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + y * 0.1) * 2)
      }
      ctx.stroke()
    }

    return
  }

  if (variant === 'peaks') {
    // Sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, background)
    gradient.addColorStop(1, blendColors(background, colors[0], 0.25))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw sun
    const sunRadius = Math.min(width, height) * (0.06 + rng.next() * 0.04)
    const sunX = width * (0.25 + rng.next() * 0.5)
    const sunY = height * (0.1 + rng.next() * 0.12)
    const sunColor = lightenColor(colors[0], 0.65)
    drawSun(ctx, sunX, sunY, sunRadius, sunColor)

    // Draw jagged peaks
    const numLayers = colors.length
    for (let i = 0; i < numLayers; i++) {
      const baseY = height * (0.25 + i * 0.15)
      const layerSeed = seed + i * 1000
      const amplitude = height * (0.12 - i * 0.015) * (0.8 + complexity * 0.4)

      // Create new RNG for this layer
      const layerRng = new SeededRandom(layerSeed)
      const points = generateJaggedPeaks(
        width,
        baseY,
        amplitude,
        2 + complexity,
        layerSeed,
        layerRng,
        200
      )

      drawSmoothLayer(ctx, points, colors[i % colors.length], height)
    }
    return
  }

  // Original variants: mountains, mountains-no-sun, dunes, waves
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
export const terrainPatternNames = [
  'Mountains',
  'Mountains (No Sun)',
  'Dunes',
  'Waves',
  'Peaks',
  'Aurora',
  'Reflection',
]
