import { GenerativeSettings } from '../types'

// Flow Fields style
// Creates organic, flowing particle paths following noise-based vector fields

// Seeded random number generator
class SeededRandom {
  private seed: number
  constructor(seed: number) {
    this.seed = seed
  }
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }
}

// 2D noise function for flow field angles
function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return n - Math.floor(n)
}

// Smooth interpolated noise
function smoothNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0

  const smoothFx = fx * fx * (3 - 2 * fx)
  const smoothFy = fy * fy * (3 - 2 * fy)

  const n00 = noise2D(x0, y0, seed)
  const n10 = noise2D(x0 + 1, y0, seed)
  const n01 = noise2D(x0, y0 + 1, seed)
  const n11 = noise2D(x0 + 1, y0 + 1, seed)

  const nx0 = n00 * (1 - smoothFx) + n10 * smoothFx
  const nx1 = n01 * (1 - smoothFx) + n11 * smoothFx

  return nx0 * (1 - smoothFy) + nx1 * smoothFy
}

// Multi-octave fractal noise for natural patterns
function fractalNoise(x: number, y: number, seed: number, octaves: number = 3): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 100) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }

  return value / maxValue
}

// Get flow angle at a point
function getFlowAngle(x: number, y: number, scale: number, seed: number, variant: string): number {
  const nx = x * scale
  const ny = y * scale

  switch (variant) {
    case 'curl':
      // Curl noise - creates closed loops
      const dx = fractalNoise(nx + 0.01, ny, seed) - fractalNoise(nx - 0.01, ny, seed)
      const dy = fractalNoise(nx, ny + 0.01, seed) - fractalNoise(nx, ny - 0.01, seed)
      return Math.atan2(dx, -dy)

    case 'spiral':
      // Spiral from center
      const cx = x - 0.5
      const cy = y - 0.5
      const baseAngle = Math.atan2(cy, cx)
      const dist = Math.sqrt(cx * cx + cy * cy)
      return baseAngle + dist * 3 + fractalNoise(nx, ny, seed) * 0.5

    case 'converge':
      // Converge toward multiple attractor points
      // Create 3-5 attractor points based on seed
      const numAttractors = 3 + Math.floor(smoothNoise(seed * 0.1, 0, 0) * 3)
      let attractX = 0
      let attractY = 0
      let totalWeight = 0
      for (let i = 0; i < numAttractors; i++) {
        const ax = smoothNoise(i * 100, seed, 0)
        const ay = smoothNoise(i * 100 + 50, seed, 0)
        const distSq = (x - ax) * (x - ax) + (y - ay) * (y - ay)
        const weight = 1 / (distSq + 0.01)
        attractX += (ax - x) * weight
        attractY += (ay - y) * weight
        totalWeight += weight
      }
      return (
        Math.atan2(attractY / totalWeight, attractX / totalWeight) +
        fractalNoise(nx, ny, seed) * 0.3
      )

    case 'turbulent':
      // High-frequency turbulent flow
      return fractalNoise(nx * 2, ny * 2, seed, 5) * Math.PI * 4

    case 'radial':
      // Radial outward flow
      const rcx = x - 0.5
      const rcy = y - 0.5
      return Math.atan2(rcy, rcx) + fractalNoise(nx, ny, seed) * 0.8

    case 'magnetic':
      // Two-pole magnetic field effect
      const pole1x = 0.3
      const pole1y = 0.5
      const pole2x = 0.7
      const pole2y = 0.5
      const a1 = Math.atan2(y - pole1y, x - pole1x)
      const a2 = Math.atan2(y - pole2y, x - pole2x)
      return (a1 - a2) / 2 + fractalNoise(nx, ny, seed) * 0.3

    default:
      // Classic flow field
      return fractalNoise(nx, ny, seed) * Math.PI * 2
  }
}

export interface FlowFieldSettings extends GenerativeSettings {
  variant: 'streamlines' | 'particle-trails' | 'curl' | 'spiral' | 'converge' | 'turbulent'
}

export const FLOW_FIELD_STYLES = [
  'Streamlines',
  'Particle Trails',
  'Curl Noise',
  'Spiral',
  'Converge',
  'Turbulent',
]

export function generateFlowField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: FlowFieldSettings
): void {
  const { palette, seed, complexity, variant, gridSize } = settings
  const rng = new SeededRandom(seed)

  // Fill background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, width, height)

  const colors = palette.colors

  // Grid size controls the flow field resolution/scale
  // Lower grid = larger features, higher grid = finer detail
  // Map gridSize (4-20) to scale: 4 = very smooth/large, 20 = detailed/small
  const baseScale = 0.15 + (gridSize - 4) * 0.08
  const scale = baseScale / Math.max(width, height)

  // Number of particles/lines based on canvas size and complexity
  const baseCount = Math.floor((width * height) / 2500)
  const particleCount = Math.floor(baseCount * (0.4 + complexity * 1.2))

  // Line properties - complexity affects length and thickness
  const lineWidth = 1 + (1 - complexity) * 2
  const stepLength = 2 + complexity * 3
  const maxSteps = 40 + Math.floor(complexity * 160)

  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (variant === 'particle-trails') {
    // Particle mode - dots along flow paths
    drawParticleTrails(
      ctx,
      width,
      height,
      colors,
      rng,
      scale,
      seed,
      particleCount,
      maxSteps,
      stepLength
    )
  } else {
    // Streamline mode - continuous lines
    drawStreamlines(
      ctx,
      width,
      height,
      colors,
      rng,
      scale,
      seed,
      particleCount,
      maxSteps,
      stepLength,
      lineWidth,
      variant
    )
  }
}

function drawStreamlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  rng: SeededRandom,
  scale: number,
  seed: number,
  count: number,
  maxSteps: number,
  stepLength: number,
  lineWidth: number,
  variant: string
): void {
  ctx.globalAlpha = 0.7

  for (let i = 0; i < count; i++) {
    let x = rng.next() * width
    let y = rng.next() * height

    const color = colors[Math.floor(rng.next() * colors.length)]
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth * (0.5 + rng.next() * 1)

    ctx.beginPath()
    ctx.moveTo(x, y)

    for (let step = 0; step < maxSteps; step++) {
      const angle = getFlowAngle(x / width, y / height, scale * width, seed, variant)

      x += Math.cos(angle) * stepLength
      y += Math.sin(angle) * stepLength

      // Stop if out of bounds
      if (x < 0 || x > width || y < 0 || y > height) break

      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function drawParticleTrails(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  rng: SeededRandom,
  scale: number,
  seed: number,
  count: number,
  maxSteps: number,
  stepLength: number
): void {
  ctx.globalAlpha = 0.8

  for (let i = 0; i < count * 2; i++) {
    let x = rng.next() * width
    let y = rng.next() * height

    const color = colors[Math.floor(rng.next() * colors.length)]
    const particleSize = 1 + rng.next() * 2

    for (let step = 0; step < maxSteps; step++) {
      const angle = getFlowAngle(x / width, y / height, scale * width, seed, 'streamlines')

      // Fade out particles along path
      const alpha = 1 - step / maxSteps
      ctx.globalAlpha = alpha * 0.6

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, particleSize * alpha, 0, Math.PI * 2)
      ctx.fill()

      x += Math.cos(angle) * stepLength * 1.5
      y += Math.sin(angle) * stepLength * 1.5

      if (x < 0 || x > width || y < 0 || y > height) break
    }
  }

  ctx.globalAlpha = 1
}
