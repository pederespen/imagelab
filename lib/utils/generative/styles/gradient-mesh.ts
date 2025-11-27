import { GenerativeSettings } from '../types'

// Gradient Mesh style
// Creates smooth, flowing color gradients with organic blending
// Inspired by modern gradient design tools

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

// Improved noise function for smoother gradients
function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0

  // Smoother interpolation (quintic)
  const smoothFx = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const smoothFy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)

  const n00 = noise2D(x0, y0, seed)
  const n10 = noise2D(x0 + 1, y0, seed)
  const n01 = noise2D(x0, y0 + 1, seed)
  const n11 = noise2D(x0 + 1, y0 + 1, seed)

  const nx0 = n00 * (1 - smoothFx) + n10 * smoothFx
  const nx1 = n01 * (1 - smoothFx) + n11 * smoothFx

  return nx0 * (1 - smoothFy) + nx1 * smoothFy
}

function fractalNoise(x: number, y: number, seed: number, octaves: number = 4): number {
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

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 128, g: 128, b: 128 }
}

// Available gradient mesh styles
export const GRADIENT_MESH_STYLES = ['Soft Mesh', 'Lava', 'Plasma', 'Orbs', 'Spotlight', 'Silk']

interface GradientMeshSettings extends GenerativeSettings {
  variant: 'soft-mesh' | 'lava' | 'plasma' | 'orbs' | 'spotlight' | 'silk'
}

export function generateGradientMesh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: GradientMeshSettings
): void {
  const { palette, seed, complexity, variant } = settings
  const rng = new SeededRandom(seed)
  const colors = palette.colors.map(hexToRgb)
  const bgColor = hexToRgb(palette.background)

  switch (variant) {
    case 'lava':
      generateLava(ctx, width, height, colors, bgColor, rng, seed, complexity)
      break
    case 'plasma':
      generatePlasma(ctx, width, height, colors, seed, complexity)
      break
    case 'orbs':
      generateOrbs(ctx, width, height, colors, bgColor, rng, complexity)
      break
    case 'spotlight':
      generateSpotlight(ctx, width, height, colors, bgColor, rng, seed, complexity)
      break
    case 'silk':
      generateSilk(ctx, width, height, colors, bgColor, rng, seed, complexity)
      break
    case 'soft-mesh':
    default:
      generateSoftMesh(ctx, width, height, colors, bgColor, rng, seed, complexity)
      break
  }
}

// Gradient blob for soft mesh
interface Blob {
  x: number
  y: number
  radiusX: number
  radiusY: number
  rotation: number
  color: { r: number; g: number; b: number }
  intensity: number
}

// Soft Mesh - overlapping organic gradient blobs (like the reference images)
function generateSoftMesh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  bgColor: { r: number; g: number; b: number },
  rng: SeededRandom,
  seed: number,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Create organic blobs
  const numBlobs = 5 + Math.floor(complexity * 6)
  const blobs: Blob[] = []

  for (let i = 0; i < numBlobs; i++) {
    const baseRadius = Math.max(width, height) * (0.3 + rng.next() * 0.5)
    blobs.push({
      x: rng.next() * width,
      y: rng.next() * height,
      radiusX: baseRadius * (0.6 + rng.next() * 0.8),
      radiusY: baseRadius * (0.6 + rng.next() * 0.8),
      rotation: rng.next() * Math.PI * 2,
      color: colors[Math.floor(rng.next() * colors.length)],
      intensity: 0.4 + rng.next() * 0.6,
    })
  }

  // Noise offset for organic distortion
  const noiseScale = 2 + complexity * 2

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Start with background
      let r = bgColor.r
      let g = bgColor.g
      let b = bgColor.b

      // Add noise-based distortion to coordinates
      const noiseX = fractalNoise((x / width) * noiseScale, (y / height) * noiseScale, seed, 3)
      const noiseY = fractalNoise(
        (x / width) * noiseScale + 100,
        (y / height) * noiseScale + 100,
        seed,
        3
      )
      const distortedX = x + (noiseX - 0.5) * width * 0.1 * complexity
      const distortedY = y + (noiseY - 0.5) * height * 0.1 * complexity

      // Blend each blob
      for (const blob of blobs) {
        const dx = distortedX - blob.x
        const dy = distortedY - blob.y

        const cos = Math.cos(blob.rotation)
        const sin = Math.sin(blob.rotation)
        const rx = dx * cos + dy * sin
        const ry = -dx * sin + dy * cos

        const dist = Math.sqrt((rx / blob.radiusX) ** 2 + (ry / blob.radiusY) ** 2)

        if (dist < 1) {
          const t = Math.cos(dist * Math.PI * 0.5) ** 2 * blob.intensity
          r = r + (blob.color.r - r) * t
          g = g + (blob.color.g - g) * t
          b = b + (blob.color.b - b) * t
        }
      }

      data[idx] = Math.round(r)
      data[idx + 1] = Math.round(g)
      data[idx + 2] = Math.round(b)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Lava - metaball-style blobby gradients that merge together
function generateLava(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  bgColor: { r: number; g: number; b: number },
  rng: SeededRandom,
  seed: number,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const numBlobs = 4 + Math.floor(complexity * 5)

  interface MetaBall {
    x: number
    y: number
    radius: number
    color: { r: number; g: number; b: number }
  }

  const balls: MetaBall[] = []
  for (let i = 0; i < numBlobs; i++) {
    balls.push({
      x: rng.next() * width,
      y: rng.next() * height,
      radius: Math.max(width, height) * (0.15 + rng.next() * 0.25),
      color: colors[Math.floor(rng.next() * colors.length)],
    })
  }

  const noiseScale = 1.5 + complexity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Add some noise distortion
      const noise = fractalNoise((x / width) * noiseScale, (y / height) * noiseScale, seed, 3)
      const px = x + (noise - 0.5) * 50 * complexity
      const py = y + (noise - 0.5) * 50 * complexity

      // Calculate metaball field value
      let totalField = 0
      let r = 0,
        g = 0,
        b = 0

      for (const ball of balls) {
        const dx = px - ball.x
        const dy = py - ball.y
        const distSq = dx * dx + dy * dy
        const field = (ball.radius * ball.radius) / (distSq + 1)
        totalField += field

        r += ball.color.r * field
        g += ball.color.g * field
        b += ball.color.b * field
      }

      // Smooth threshold for blobby effect
      const threshold = 0.8 + complexity * 0.4
      const t = Math.min(1, totalField / threshold)
      const smoothT = t * t * (3 - 2 * t)

      if (totalField > 0) {
        r = r / totalField
        g = g / totalField
        b = b / totalField
      }

      // Blend with background
      data[idx] = Math.round(bgColor.r + (r - bgColor.r) * smoothT)
      data[idx + 1] = Math.round(bgColor.g + (g - bgColor.g) * smoothT)
      data[idx + 2] = Math.round(bgColor.b + (b - bgColor.b) * smoothT)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Plasma - psychedelic interference patterns
function generatePlasma(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  seed: number,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const freq = 2 + complexity * 4
  const seedOffset = seed * 0.1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      const nx = x / width
      const ny = y / height

      // Multiple sine waves create interference pattern
      let value = 0
      value += Math.sin(nx * freq * Math.PI + seedOffset)
      value += Math.sin(ny * freq * 1.3 * Math.PI + seedOffset * 1.5)
      value += Math.sin((nx + ny) * freq * 0.8 * Math.PI + seedOffset * 0.7)
      value += Math.sin(
        Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * freq * 2 * Math.PI + seedOffset
      )
      value += Math.sin((nx * Math.cos(seedOffset) + ny * Math.sin(seedOffset)) * freq * Math.PI)

      value = (value + 5) / 10

      const colorPos = value * (colors.length - 1)
      const colorIdx = Math.floor(colorPos)
      const blend = colorPos - colorIdx
      const nextIdx = Math.min(colorIdx + 1, colors.length - 1)

      const c1 = colors[colorIdx]
      const c2 = colors[nextIdx]
      const t = blend * blend * (3 - 2 * blend)

      data[idx] = Math.round(c1.r + (c2.r - c1.r) * t)
      data[idx + 1] = Math.round(c1.g + (c2.g - c1.g) * t)
      data[idx + 2] = Math.round(c1.b + (c2.b - c1.b) * t)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Orbs - overlapping spherical gradients with depth
function generateOrbs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  bgColor: { r: number; g: number; b: number },
  rng: SeededRandom,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const numOrbs = 4 + Math.floor(complexity * 6)

  interface Orb {
    x: number
    y: number
    radius: number
    color: { r: number; g: number; b: number }
    depth: number
  }

  const orbs: Orb[] = []
  for (let i = 0; i < numOrbs; i++) {
    orbs.push({
      x: rng.next() * width,
      y: rng.next() * height,
      radius: Math.max(width, height) * (0.15 + rng.next() * 0.35),
      color: colors[Math.floor(rng.next() * colors.length)],
      depth: rng.next(),
    })
  }

  orbs.sort((a, b) => a.depth - b.depth)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      let r = bgColor.r
      let g = bgColor.g
      let b = bgColor.b

      for (const orb of orbs) {
        const dx = x - orb.x
        const dy = y - orb.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < orb.radius) {
          const normDist = dist / orb.radius
          const t = Math.cos(normDist * Math.PI * 0.5) ** 1.5 * 0.85

          r = r + (orb.color.r - r) * t
          g = g + (orb.color.g - g) * t
          b = b + (orb.color.b - b) * t
        }
      }

      data[idx] = Math.round(r)
      data[idx + 1] = Math.round(g)
      data[idx + 2] = Math.round(b)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Spotlight - dramatic gradient lighting from corners/edges
function generateSpotlight(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  bgColor: { r: number; g: number; b: number },
  rng: SeededRandom,
  seed: number,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const numLights = 2 + Math.floor(complexity * 3)

  interface Light {
    x: number
    y: number
    color: { r: number; g: number; b: number }
    intensity: number
    spread: number
  }

  const lights: Light[] = []

  // Place lights at edges/corners
  for (let i = 0; i < numLights; i++) {
    const edge = rng.next()
    let lx: number, ly: number

    if (edge < 0.25) {
      lx = rng.next() * width
      ly = -height * 0.1
    } else if (edge < 0.5) {
      lx = rng.next() * width
      ly = height * 1.1
    } else if (edge < 0.75) {
      lx = -width * 0.1
      ly = rng.next() * height
    } else {
      lx = width * 1.1
      ly = rng.next() * height
    }

    lights.push({
      x: lx,
      y: ly,
      color: colors[Math.floor(rng.next() * colors.length)],
      intensity: 0.6 + rng.next() * 0.4,
      spread: Math.max(width, height) * (0.6 + rng.next() * 0.8),
    })
  }

  const noiseScale = 2 + complexity * 2

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      let r = bgColor.r
      let g = bgColor.g
      let b = bgColor.b

      // Add subtle noise variation
      const noise = fractalNoise((x / width) * noiseScale, (y / height) * noiseScale, seed, 2)

      for (const light of lights) {
        const dx = x - light.x
        const dy = y - light.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Soft spotlight falloff with noise variation
        const adjustedSpread = light.spread * (0.9 + noise * 0.2)
        const t = Math.max(0, 1 - dist / adjustedSpread) ** 2 * light.intensity

        r = r + (light.color.r - r) * t
        g = g + (light.color.g - g) * t
        b = b + (light.color.b - b) * t
      }

      data[idx] = Math.round(Math.min(255, r))
      data[idx + 1] = Math.round(Math.min(255, g))
      data[idx + 2] = Math.round(Math.min(255, b))
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Silk - flowing curved gradient ribbons with soft blending
function generateSilk(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { r: number; g: number; b: number }[],
  bgColor: { r: number; g: number; b: number },
  rng: SeededRandom,
  seed: number,
  complexity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const numRibbons = 3 + Math.floor(complexity * 3)

  interface Ribbon {
    startX: number
    startY: number
    curveX: number
    curveY: number
    endX: number
    endY: number
    color: { r: number; g: number; b: number }
    width: number
  }

  const ribbons: Ribbon[] = []

  // Create curved ribbons that flow across the canvas
  for (let i = 0; i < numRibbons; i++) {
    // Start from edges
    const startEdge = rng.next()
    let startX: number, startY: number, endX: number, endY: number

    if (startEdge < 0.5) {
      // Start from left/right
      startX = rng.next() < 0.5 ? -width * 0.2 : width * 1.2
      startY = rng.next() * height
      endX = startX < 0 ? width * 1.2 : -width * 0.2
      endY = rng.next() * height
    } else {
      // Start from top/bottom
      startX = rng.next() * width
      startY = rng.next() < 0.5 ? -height * 0.2 : height * 1.2
      endX = rng.next() * width
      endY = startY < 0 ? height * 1.2 : -height * 0.2
    }

    ribbons.push({
      startX,
      startY,
      curveX: rng.next() * width,
      curveY: rng.next() * height,
      endX,
      endY,
      color: colors[Math.floor(rng.next() * colors.length)],
      width: Math.max(width, height) * (0.15 + rng.next() * 0.25 + complexity * 0.1),
    })
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      let r = bgColor.r
      let g = bgColor.g
      let b = bgColor.b

      // Add subtle noise for organic feel
      const noise = fractalNoise((x / width) * 2, (y / height) * 2, seed, 2)
      const px = x + (noise - 0.5) * 20 * complexity
      const py = y + (noise - 0.5) * 20 * complexity

      for (const ribbon of ribbons) {
        // Find closest point on quadratic bezier curve
        let minDist = Infinity

        // Sample along the curve (coarser sampling for performance)
        for (let t = 0; t <= 1; t += 0.1) {
          const invT = 1 - t
          const bx =
            invT * invT * ribbon.startX + 2 * invT * t * ribbon.curveX + t * t * ribbon.endX
          const by =
            invT * invT * ribbon.startY + 2 * invT * t * ribbon.curveY + t * t * ribbon.endY

          const dx = px - bx
          const dy = py - by
          const dist = dx * dx + dy * dy // Skip sqrt for comparison
          minDist = Math.min(minDist, dist)
        }

        // Take sqrt only once at the end
        minDist = Math.sqrt(minDist)

        if (minDist < ribbon.width) {
          // Very smooth gaussian falloff for soft edges
          const normDist = minDist / ribbon.width
          const t = Math.exp(-(normDist * normDist) * 3) * 0.8

          r = r + (ribbon.color.r - r) * t
          g = g + (ribbon.color.g - g) * t
          b = b + (ribbon.color.b - b) * t
        }
      }

      data[idx] = Math.round(r)
      data[idx + 1] = Math.round(g)
      data[idx + 2] = Math.round(b)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
