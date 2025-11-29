import { GenerativeSettings } from '../types'

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

// Noise functions
function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
  return n - Math.floor(n)
}

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

function fractalNoise(x: number, y: number, seed: number, octaves: number): number {
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

// Shared contour drawing function with proper interpolation
function drawContours(
  ctx: CanvasRenderingContext2D,
  heightMap: number[][],
  width: number,
  height: number,
  numContours: number,
  colors: string[],
  lineWidth: number,
  resolution: number
) {
  const cols = heightMap[0].length
  const rows = heightMap.length

  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < numContours; i++) {
    const threshold = i / numContours
    const color = colors[i % colors.length]
    ctx.strokeStyle = color

    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        const v1 = heightMap[y][x]
        const v2 = heightMap[y][x + 1]
        const v3 = heightMap[y + 1][x + 1]
        const v4 = heightMap[y + 1][x]

        const edges: { x: number; y: number }[] = []

        // Top edge
        if (v1 < threshold !== v2 < threshold) {
          const t = (threshold - v1) / (v2 - v1)
          edges.push({ x: (x + t) * resolution, y: y * resolution })
        }
        // Right edge
        if (v2 < threshold !== v3 < threshold) {
          const t = (threshold - v2) / (v3 - v2)
          edges.push({ x: (x + 1) * resolution, y: (y + t) * resolution })
        }
        // Bottom edge
        if (v3 < threshold !== v4 < threshold) {
          const t = (threshold - v4) / (v3 - v4)
          edges.push({ x: (x + t) * resolution, y: (y + 1) * resolution })
        }
        // Left edge
        if (v4 < threshold !== v1 < threshold) {
          const t = (threshold - v1) / (v4 - v1)
          edges.push({ x: x * resolution, y: (y + t) * resolution })
        }

        if (edges.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(edges[0].x, edges[0].y)
          ctx.lineTo(edges[1].x, edges[1].y)
          ctx.stroke()

          if (edges.length === 4) {
            ctx.beginPath()
            ctx.moveTo(edges[2].x, edges[2].y)
            ctx.lineTo(edges[3].x, edges[3].y)
            ctx.stroke()
          }
        }
      }
    }
  }
}

// Generate a height map from noise
function generateNoiseHeightMap(
  width: number,
  height: number,
  resolution: number,
  scale: number,
  seed: number,
  octaves: number
): number[][] {
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)
  const heightMap: number[][] = []

  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      const nx = (x / cols) * scale
      const ny = (y / rows) * scale
      heightMap[y][x] = fractalNoise(nx, ny, seed, octaves)
    }
  }

  return heightMap
}

export type ContourVariant =
  | 'topographic'
  | 'elevation'
  | 'islands'
  | 'ridges'
  | 'thermal'
  | 'sound-waves'
  | 'magnetic'

export interface ContourSettings extends GenerativeSettings {
  variant: ContourVariant
}

export function generateContour(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ContourSettings
) {
  const { palette, seed, complexity, variant } = settings
  const { colors, background } = palette
  const rng = new SeededRandom(seed)

  switch (variant) {
    case 'topographic':
      generateTopographic(ctx, width, height, colors, background, seed, complexity)
      break
    case 'elevation':
      generateElevation(ctx, width, height, colors, background, seed, complexity)
      break
    case 'islands':
      generateIslands(ctx, width, height, colors, background, seed, complexity, rng)
      break
    case 'ridges':
      generateRidges(ctx, width, height, colors, background, seed, complexity)
      break
    case 'thermal':
      generateThermal(ctx, width, height, colors, background, seed, complexity, rng)
      break
    case 'sound-waves':
      generateSoundWaves(ctx, width, height, colors, background, seed, complexity, rng)
      break
    case 'magnetic':
      generateMagnetic(ctx, width, height, colors, background, seed, complexity, rng)
      break
  }
}

// ============ TOPOGRAPHIC ============
function generateTopographic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const numContours = 12 + Math.floor(complexity * 15)
  const scale = 2.5 + complexity * 2
  const resolution = 4
  const lineWidth = 2 + complexity

  const heightMap = generateNoiseHeightMap(width, height, resolution, scale, seed, 4)
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}

// ============ ELEVATION (filled regions with contour overlay) ============
function generateElevation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const scale = 2.5 + complexity * 2
  const resolution = 4
  const numLevels = colors.length

  // Generate height map
  const heightMap = generateNoiseHeightMap(width, height, resolution, scale, seed, 5)
  const cols = heightMap[0].length
  const rows = heightMap.length

  // Draw filled elevation bands
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      // Sample from height map with interpolation
      const hx = (px / width) * cols
      const hy = (py / height) * rows
      const ix = Math.min(Math.floor(hx), cols - 1)
      const iy = Math.min(Math.floor(hy), rows - 1)
      const noise = heightMap[iy][ix]

      const level = Math.floor(noise * numLevels)
      const color = colors[Math.min(level, colors.length - 1)]

      // Parse color
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)

      const idx = (py * width + px) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Draw subtle contour lines on top
  const numContours = 6 + Math.floor(complexity * 8)
  ctx.globalAlpha = 0.4
  drawContours(ctx, heightMap, width, height, numContours, ['#000000'], 1.5, resolution)
  ctx.globalAlpha = 1
}

// ============ ISLANDS (multiple peaks) ============
function generateIslands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number,
  rng: SeededRandom
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const resolution = 4
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)

  // Create multiple island centers
  const numIslands = 2 + Math.floor(complexity * 3)
  const islands: { x: number; y: number; size: number }[] = []

  for (let i = 0; i < numIslands; i++) {
    islands.push({
      x: cols * (0.15 + rng.next() * 0.7),
      y: rows * (0.15 + rng.next() * 0.7),
      size: Math.min(cols, rows) * (0.2 + rng.next() * 0.3),
    })
  }

  // Generate height map with multiple peaks
  const heightMap: number[][] = []
  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      let h = 0
      for (const island of islands) {
        const dx = x - island.x
        const dy = y - island.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const falloff = Math.max(0, 1 - dist / island.size)
        h = Math.max(h, falloff * falloff)
      }
      // Add some noise
      const nx = (x / cols) * 3
      const ny = (y / rows) * 3
      h += fractalNoise(nx, ny, seed, 3) * 0.15
      heightMap[y][x] = Math.min(1, h)
    }
  }

  const numContours = 10 + Math.floor(complexity * 12)
  const lineWidth = 2 + complexity * 0.5
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}

// ============ RIDGES (sharp mountain ridges) ============
function generateRidges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const resolution = 4
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)
  const scale = 2 + complexity * 2

  // Generate ridged noise (absolute value creates ridges)
  const heightMap: number[][] = []
  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      const nx = (x / cols) * scale
      const ny = (y / rows) * scale

      let value = 0
      let amplitude = 1
      let frequency = 1
      let maxValue = 0

      for (let o = 0; o < 5; o++) {
        const n = smoothNoise(nx * frequency, ny * frequency, seed + o * 100)
        const ridged = 1 - Math.abs(n * 2 - 1)
        value += ridged * ridged * amplitude
        maxValue += amplitude
        amplitude *= 0.5
        frequency *= 2
      }

      heightMap[y][x] = value / maxValue
    }
  }

  const numContours = 15 + Math.floor(complexity * 20)
  const lineWidth = 1.5 + complexity
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}

// ============ THERMAL (heat map style) ============
function generateThermal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number,
  rng: SeededRandom
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const resolution = 4
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)

  // Create heat sources
  const numSources = 2 + Math.floor(complexity * 4)
  const sources: { x: number; y: number; intensity: number; radius: number }[] = []

  for (let i = 0; i < numSources; i++) {
    sources.push({
      x: cols * rng.next(),
      y: rows * rng.next(),
      intensity: 0.5 + rng.next() * 0.5,
      radius: Math.min(cols, rows) * (0.25 + rng.next() * 0.35),
    })
  }

  // Generate heat map
  const heightMap: number[][] = []
  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      let heat = 0
      for (const source of sources) {
        const dx = x - source.x
        const dy = y - source.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const falloff = Math.exp((-dist * dist) / (source.radius * source.radius))
        heat += source.intensity * falloff
      }
      // Add turbulence
      const nx = (x / cols) * 4
      const ny = (y / rows) * 4
      heat += fractalNoise(nx, ny, seed, 3) * 0.1
      heightMap[y][x] = Math.min(1, heat)
    }
  }

  const numContours = 12 + Math.floor(complexity * 15)
  const lineWidth = 2 + complexity
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}

// ============ SOUND WAVES (circular ripples with interference) ============
function generateSoundWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number,
  rng: SeededRandom
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const resolution = 3
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)

  // Wave sources
  const numSources = 1 + Math.floor(complexity * 2)
  const sources: { x: number; y: number; frequency: number; phase: number }[] = []

  for (let i = 0; i < numSources; i++) {
    sources.push({
      x: cols * (0.2 + rng.next() * 0.6),
      y: rows * (0.2 + rng.next() * 0.6),
      frequency: 0.15 + rng.next() * 0.15,
      phase: rng.next() * Math.PI * 2,
    })
  }

  // Generate interference pattern
  const heightMap: number[][] = []
  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      let wave = 0
      for (const source of sources) {
        const dx = x - source.x
        const dy = y - source.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        wave += Math.sin(dist * source.frequency + source.phase)
      }
      heightMap[y][x] = (wave / sources.length + 1) / 2
    }
  }

  const numContours = 15 + Math.floor(complexity * 20)
  const lineWidth = 2 + complexity * 0.5
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}

// ============ MAGNETIC (field lines between poles) ============
function generateMagnetic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  background: string,
  seed: number,
  complexity: number,
  rng: SeededRandom
) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const resolution = 3
  const cols = Math.ceil(width / resolution)
  const rows = Math.ceil(height / resolution)

  // Magnetic poles (positive and negative)
  const numPoles = 2 + Math.floor(complexity * 2)
  const poles: { x: number; y: number; charge: number }[] = []

  for (let i = 0; i < numPoles; i++) {
    poles.push({
      x: cols * (0.15 + rng.next() * 0.7),
      y: rows * (0.15 + rng.next() * 0.7),
      charge: i % 2 === 0 ? 1 : -1,
    })
  }

  // Generate potential field
  const heightMap: number[][] = []
  for (let y = 0; y < rows; y++) {
    heightMap[y] = []
    for (let x = 0; x < cols; x++) {
      let potential = 0
      for (const pole of poles) {
        const dx = x - pole.x
        const dy = y - pole.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 5
        potential += pole.charge / dist
      }
      // Normalize to 0-1
      heightMap[y][x] = Math.atan(potential * 30) / Math.PI + 0.5
    }
  }

  const numContours = 20 + Math.floor(complexity * 25)
  const lineWidth = 1.5 + complexity
  drawContours(ctx, heightMap, width, height, numContours, colors, lineWidth, resolution)
}
