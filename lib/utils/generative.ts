// Generative art utilities for Bauhaus-style quarter-circle tile patterns

export interface ColorPalette {
  name: string
  colors: string[]
  background: string
}

export const PALETTES: ColorPalette[] = [
  {
    name: 'Bauhaus Classic',
    colors: ['#E53935', '#FDD835', '#1E88E5', '#212121', '#F5F5DC'],
    background: '#F5F5DC',
  },
  {
    name: 'Warm Earth',
    colors: ['#D84315', '#F4A261', '#2A9D8F', '#264653', '#E9C46A'],
    background: '#FAF3E0',
  },
  {
    name: 'Cool Ocean',
    colors: ['#003F5C', '#58508D', '#BC5090', '#FF6361', '#FFA600'],
    background: '#F0F4F8',
  },
  {
    name: 'Forest',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332'],
    background: '#F1FAEE',
  },
  {
    name: 'Sunset',
    colors: ['#FF6B6B', '#FEC89A', '#FFD93D', '#6BCB77', '#4D96FF'],
    background: '#FFF8E7',
  },
  {
    name: 'Monochrome',
    colors: ['#1A1A1A', '#4A4A4A', '#7A7A7A', '#AAAAAA', '#DADADA'],
    background: '#F5F5F5',
  },
  {
    name: 'Retro Pop',
    colors: ['#E63946', '#F4A261', '#2A9D8F', '#457B9D', '#1D3557'],
    background: '#F1FAEE',
  },
  {
    name: 'Nordic',
    colors: ['#5E81AC', '#81A1C1', '#88C0D0', '#8FBCBB', '#2E3440'],
    background: '#ECEFF4',
  },
]

export interface GenerativeSettings {
  gridSize: number
  palette: ColorPalette
  seed: number
  complexity: number // 0-1, affects which tile types are used
}

export interface CanvasSize {
  name: string
  width: number
  height: number
}

export const CANVAS_SIZES: CanvasSize[] = [
  { name: 'Phone (1080×1920)', width: 1080, height: 1920 },
  { name: 'Phone Landscape (1920×1080)', width: 1920, height: 1080 },
  { name: 'Desktop (1920×1080)', width: 1920, height: 1080 },
  { name: 'Desktop 4K (3840×2160)', width: 3840, height: 2160 },
  { name: 'Square (1080×1080)', width: 1080, height: 1080 },
  { name: 'Square Large (2048×2048)', width: 2048, height: 2048 },
  { name: 'Poster A4 (2480×3508)', width: 2480, height: 3508 },
  { name: 'Poster A3 (3508×4961)', width: 3508, height: 4961 },
]

// Seeded random number generator for reproducible results
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

type TileDrawer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  colors: string[],
  rng: SeededRandom
) => void

// Tile patterns - each fills a square cell
const TILE_PATTERNS: TileDrawer[] = [
  // Quarter circle in corner (4 rotations possible)
  (ctx, x, y, size, colors, rng) => {
    const corner = Math.floor(rng.next() * 4)
    const bgColor = rng.pick(colors)
    const fgColor = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = fgColor
    ctx.beginPath()

    const corners = [
      [x, y], // top-left
      [x + size, y], // top-right
      [x + size, y + size], // bottom-right
      [x, y + size], // bottom-left
    ]
    const startAngles = [0, 0.5, 1, 1.5]

    ctx.arc(
      corners[corner][0],
      corners[corner][1],
      size,
      startAngles[corner] * Math.PI,
      (startAngles[corner] + 0.5) * Math.PI
    )
    ctx.lineTo(corners[corner][0], corners[corner][1])
    ctx.closePath()
    ctx.fill()
  },

  // Two quarter circles (opposite corners)
  (ctx, x, y, size, colors, rng) => {
    const isHorizontal = rng.next() > 0.5
    const bgColor = rng.pick(colors)
    const fg1 = rng.pick(colors.filter(c => c !== bgColor))
    const fg2 = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    if (isHorizontal) {
      // Top-left and bottom-right
      ctx.fillStyle = fg1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 0.5 * Math.PI)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = fg2
      ctx.beginPath()
      ctx.arc(x + size, y + size, size, Math.PI, 1.5 * Math.PI)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      ctx.fill()
    } else {
      // Top-right and bottom-left
      ctx.fillStyle = fg1
      ctx.beginPath()
      ctx.arc(x + size, y, size, 0.5 * Math.PI, Math.PI)
      ctx.lineTo(x + size, y)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = fg2
      ctx.beginPath()
      ctx.arc(x, y + size, size, 1.5 * Math.PI, 2 * Math.PI)
      ctx.lineTo(x, y + size)
      ctx.closePath()
      ctx.fill()
    }
  },

  // Half circle on edge
  (ctx, x, y, size, colors, rng) => {
    const edge = Math.floor(rng.next() * 4) // 0=top, 1=right, 2=bottom, 3=left
    const bgColor = rng.pick(colors)
    const fgColor = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = fgColor
    ctx.beginPath()

    const halfSize = size / 2
    if (edge === 0) {
      ctx.arc(x + halfSize, y, halfSize, 0, Math.PI)
    } else if (edge === 1) {
      ctx.arc(x + size, y + halfSize, halfSize, 0.5 * Math.PI, 1.5 * Math.PI)
    } else if (edge === 2) {
      ctx.arc(x + halfSize, y + size, halfSize, Math.PI, 2 * Math.PI)
    } else {
      ctx.arc(x, y + halfSize, halfSize, -0.5 * Math.PI, 0.5 * Math.PI)
    }
    ctx.closePath()
    ctx.fill()
  },

  // Concentric quarter circles
  (ctx, x, y, size, colors, rng) => {
    const corner = Math.floor(rng.next() * 4)
    const shuffledColors = rng.shuffle([...colors]).slice(0, 3)

    const corners = [
      [x, y],
      [x + size, y],
      [x + size, y + size],
      [x, y + size],
    ]
    const startAngles = [0, 0.5, 1, 1.5]

    // Draw from largest to smallest
    const radii = [size, size * 0.66, size * 0.33]
    radii.forEach((radius, i) => {
      ctx.fillStyle = shuffledColors[i % shuffledColors.length]
      ctx.beginPath()
      ctx.arc(
        corners[corner][0],
        corners[corner][1],
        radius,
        startAngles[corner] * Math.PI,
        (startAngles[corner] + 0.5) * Math.PI
      )
      ctx.lineTo(corners[corner][0], corners[corner][1])
      ctx.closePath()
      ctx.fill()
    })
  },

  // Split diagonal
  (ctx, x, y, size, colors, rng) => {
    const isForward = rng.next() > 0.5
    const color1 = rng.pick(colors)
    const color2 = rng.pick(colors.filter(c => c !== color1))

    ctx.fillStyle = color1
    ctx.beginPath()
    if (isForward) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x, y + size)
    } else {
      ctx.moveTo(x, y)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x + size, y + size)
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = color2
    ctx.beginPath()
    if (isForward) {
      ctx.moveTo(x + size, y)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x, y + size)
    } else {
      ctx.moveTo(x, y)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x, y + size)
    }
    ctx.closePath()
    ctx.fill()
  },

  // Full circle centered
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const fgColor = rng.pick(colors.filter(c => c !== bgColor))
    const innerColor = rng.pick(colors.filter(c => c !== fgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = fgColor
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size * 0.45, 0, 2 * Math.PI)
    ctx.fill()

    if (rng.next() > 0.5) {
      ctx.fillStyle = innerColor
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size * 0.2, 0, 2 * Math.PI)
      ctx.fill()
    }
  },

  // Solid color block (for breathing room)
  (ctx, x, y, size, colors, rng) => {
    ctx.fillStyle = rng.pick(colors)
    ctx.fillRect(x, y, size, size)
  },
]

export function generateArt(canvas: HTMLCanvasElement, settings: GenerativeSettings): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { gridSize, palette, seed, complexity } = settings
  const rng = new SeededRandom(seed)

  // Calculate cell size based on canvas dimensions and grid
  const cellSize = Math.max(canvas.width, canvas.height) / gridSize
  const cols = Math.ceil(canvas.width / cellSize)
  const rows = Math.ceil(canvas.height / cellSize)

  // Fill background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Determine which patterns to use based on complexity
  // Low complexity = more solid blocks and simple shapes
  // High complexity = more intricate patterns
  const patternCount = Math.max(2, Math.floor(TILE_PATTERNS.length * complexity))
  const availablePatterns = TILE_PATTERNS.slice(0, patternCount)

  // Add solid block pattern more frequently at low complexity
  if (complexity < 0.5) {
    for (let i = 0; i < 3; i++) {
      availablePatterns.push(TILE_PATTERNS[TILE_PATTERNS.length - 1])
    }
  }

  // Draw tiles
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize
      const y = row * cellSize
      const pattern = rng.pick(availablePatterns)
      pattern(ctx, x, y, cellSize, palette.colors, rng)
    }
  }
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000)
}
