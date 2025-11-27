import { GenerativeSettings } from '../types'

// Geometric Tessellations style
// Creates repeating polygon patterns - Islamic stars, Penrose-style, herringbone, etc.

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

export interface TessellationSettings extends GenerativeSettings {
  variant: 'islamic-stars' | 'herringbone' | 'hexagons' | 'triangles' | 'basketweave' | 'penrose'
}

export const TESSELLATION_STYLES = [
  'Islamic Stars',
  'Herringbone',
  'Hexagons',
  'Triangles',
  'Basketweave',
  'Penrose',
]

export function generateTessellation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: TessellationSettings
): void {
  const { palette, seed, complexity, variant, gridSize } = settings
  const rng = new SeededRandom(seed)

  // Fill background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, width, height)

  const colors = palette.colors

  switch (variant) {
    case 'islamic-stars':
      drawIslamicStars(ctx, width, height, gridSize, colors, rng, complexity)
      break
    case 'herringbone':
      drawHerringbone(ctx, width, height, gridSize, colors, rng)
      break
    case 'hexagons':
      drawHexagons(ctx, width, height, gridSize, colors, rng, complexity)
      break
    case 'triangles':
      drawTriangles(ctx, width, height, gridSize, colors, rng)
      break
    case 'basketweave':
      drawBasketweave(ctx, width, height, gridSize, colors, rng)
      break
    case 'penrose':
      drawPenrose(ctx, width, height, gridSize, colors, rng, complexity)
      break
    default:
      drawIslamicStars(ctx, width, height, gridSize, colors, rng, complexity)
  }
}

// Islamic star pattern - 8-pointed stars with interlocking geometry
function drawIslamicStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom,
  complexity: number
): void {
  const cellSize = Math.max(width, height) / gridSize
  const cols = Math.ceil(width / cellSize) + 1
  const rows = Math.ceil(height / cellSize) + 1

  ctx.lineWidth = 1 + complexity * 2
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Draw background tiles first
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * cellSize + cellSize / 2
      const cy = row * cellSize + cellSize / 2

      // Draw 8-pointed star
      const outerRadius = cellSize * 0.48
      const innerRadius = outerRadius * (0.35 + complexity * 0.15)
      const points = 8

      ctx.fillStyle = colors[Math.floor(rng.next() * colors.length)]
      ctx.strokeStyle = darkenColor(colors[0], 0.3)

      ctx.beginPath()
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw inner decoration
      const innerSize = innerRadius * 0.6
      ctx.fillStyle = colors[(Math.floor(rng.next() * colors.length) + 1) % colors.length]
      ctx.beginPath()
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points
        const x = cx + Math.cos(angle) * innerSize
        const y = cy + Math.sin(angle) * innerSize
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  // Draw connecting diamonds between stars
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * cellSize + cellSize
      const cy = row * cellSize + cellSize
      const size = cellSize * 0.25

      ctx.fillStyle = colors[Math.floor(rng.next() * colors.length)]
      ctx.beginPath()
      ctx.moveTo(cx, cy - size)
      ctx.lineTo(cx + size, cy)
      ctx.lineTo(cx, cy + size)
      ctx.lineTo(cx - size, cy)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }
}

// Herringbone pattern - interlocking rectangles at angles
function drawHerringbone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom
): void {
  const brickWidth = Math.max(width, height) / gridSize
  const brickHeight = brickWidth * 0.35

  ctx.lineWidth = 1
  ctx.strokeStyle = darkenColor(colors[0], 0.4)

  const diagWidth = brickWidth * Math.cos(Math.PI / 4)
  const diagHeight = brickWidth * Math.sin(Math.PI / 4)

  for (let row = -2; row < height / diagHeight + 2; row++) {
    for (let col = -2; col < width / diagWidth + 2; col++) {
      const isEven = (row + col) % 2 === 0
      const baseX = col * diagWidth
      const baseY = row * diagHeight

      ctx.fillStyle = colors[Math.floor(rng.next() * colors.length)]

      ctx.save()
      ctx.translate(baseX, baseY)
      ctx.rotate(isEven ? Math.PI / 4 : -Math.PI / 4)

      ctx.beginPath()
      ctx.rect(-brickWidth / 2, -brickHeight / 2, brickWidth, brickHeight)
      ctx.fill()
      ctx.stroke()

      ctx.restore()
    }
  }
}

// Hexagon tessellation with varied fills
function drawHexagons(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom,
  complexity: number
): void {
  const hexRadius = Math.max(width, height) / gridSize / 1.5
  const hexWidth = Math.sqrt(3) * hexRadius
  const hexHeight = hexRadius * 2
  const vertDist = hexHeight * 0.75

  ctx.lineWidth = 2
  ctx.lineJoin = 'round'

  for (let row = -1; row < height / vertDist + 1; row++) {
    for (let col = -1; col < width / hexWidth + 1; col++) {
      const x = col * hexWidth + (row % 2 === 0 ? 0 : hexWidth / 2)
      const y = row * vertDist

      const color = colors[Math.floor(rng.next() * colors.length)]
      ctx.fillStyle = color
      ctx.strokeStyle = darkenColor(color, 0.6)

      // Draw hexagon
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const hx = x + hexRadius * Math.cos(angle)
        const hy = y + hexRadius * Math.sin(angle)
        if (i === 0) {
          ctx.moveTo(hx, hy)
        } else {
          ctx.lineTo(hx, hy)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Add inner pattern based on complexity
      if (complexity > 0.3) {
        const innerRadius = hexRadius * (0.3 + (1 - complexity) * 0.3)
        ctx.fillStyle = colors[(Math.floor(rng.next() * colors.length) + 1) % colors.length]
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const hx = x + innerRadius * Math.cos(angle)
          const hy = y + innerRadius * Math.sin(angle)
          if (i === 0) {
            ctx.moveTo(hx, hy)
          } else {
            ctx.lineTo(hx, hy)
          }
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    }
  }
}

// Triangle tessellation
function drawTriangles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom
): void {
  const triSize = Math.max(width, height) / gridSize
  const triHeight = (triSize * Math.sqrt(3)) / 2

  ctx.lineWidth = 1
  ctx.lineJoin = 'round'

  for (let row = -1; row < height / triHeight + 1; row++) {
    for (let col = -1; col < width / triSize + 2; col++) {
      const isOffset = row % 2 === 1
      const x = col * triSize + (isOffset ? triSize / 2 : 0)
      const y = row * triHeight

      // Draw upward triangle
      const color1 = colors[Math.floor(rng.next() * colors.length)]
      ctx.fillStyle = color1
      ctx.strokeStyle = darkenColor(color1, 0.5)

      ctx.beginPath()
      ctx.moveTo(x, y + triHeight)
      ctx.lineTo(x + triSize / 2, y)
      ctx.lineTo(x + triSize, y + triHeight)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw downward triangle
      const color2 = colors[Math.floor(rng.next() * colors.length)]
      ctx.fillStyle = color2
      ctx.strokeStyle = darkenColor(color2, 0.5)

      ctx.beginPath()
      ctx.moveTo(x + triSize / 2, y)
      ctx.lineTo(x + triSize, y + triHeight)
      ctx.lineTo(x + triSize * 1.5, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }
}

// Basketweave pattern
function drawBasketweave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom
): void {
  const cellSize = Math.max(width, height) / gridSize
  const stripWidth = cellSize / 3

  ctx.lineWidth = 1
  ctx.lineJoin = 'round'

  for (let row = -1; row < height / cellSize + 1; row++) {
    for (let col = -1; col < width / cellSize + 1; col++) {
      const x = col * cellSize
      const y = row * cellSize
      const isVertical = (row + col) % 2 === 0

      for (let i = 0; i < 3; i++) {
        const color = colors[Math.floor(rng.next() * colors.length)]
        ctx.fillStyle = color
        ctx.strokeStyle = darkenColor(color, 0.5)

        if (isVertical) {
          // Vertical strips
          ctx.beginPath()
          ctx.rect(x + i * stripWidth, y, stripWidth - 1, cellSize)
          ctx.fill()
          ctx.stroke()
        } else {
          // Horizontal strips
          ctx.beginPath()
          ctx.rect(x, y + i * stripWidth, cellSize, stripWidth - 1)
          ctx.fill()
          ctx.stroke()
        }
      }
    }
  }
}

// Penrose-like rhombus tiling
function drawPenrose(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom,
  complexity: number
): void {
  const size = Math.max(width, height) / gridSize

  // Golden ratio angles for Penrose-like pattern
  const phi = (1 + Math.sqrt(5)) / 2
  const angles = [0, Math.PI / 5, (2 * Math.PI) / 5, (3 * Math.PI) / 5, (4 * Math.PI) / 5]

  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'

  // Create a grid of rhombuses with varied angles
  for (let row = -2; row < height / size + 2; row++) {
    for (let col = -2; col < width / size + 2; col++) {
      const cx = col * size + (row % 2 === 0 ? 0 : size / 2)
      const cy = row * size * 0.8

      // Pick a rhombus type based on position
      const angleIndex = Math.abs((row * 3 + col * 7) % 5)
      const angle = angles[angleIndex]

      // Thin or thick rhombus
      const isThin = rng.next() > 0.5
      const acuteAngle = isThin ? Math.PI / 5 : (2 * Math.PI) / 5

      const color = colors[Math.floor(rng.next() * colors.length)]
      ctx.fillStyle = color
      ctx.strokeStyle = darkenColor(color, 0.4)

      // Draw rhombus
      const halfDiag1 = size * 0.4
      const halfDiag2 = halfDiag1 * Math.tan(acuteAngle / 2)

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(halfDiag1, 0)
      ctx.lineTo(0, halfDiag2)
      ctx.lineTo(-halfDiag1, 0)
      ctx.lineTo(0, -halfDiag2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Inner decoration for complexity
      if (complexity > 0.5) {
        const innerScale = 0.4
        ctx.fillStyle = colors[(Math.floor(rng.next() * colors.length) + 1) % colors.length]
        ctx.beginPath()
        ctx.moveTo(halfDiag1 * innerScale, 0)
        ctx.lineTo(0, halfDiag2 * innerScale)
        ctx.lineTo(-halfDiag1 * innerScale, 0)
        ctx.lineTo(0, -halfDiag2 * innerScale)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
    }
  }
}

// Helper: Convert hex to RGB
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

// Helper: Darken a hex color
function darkenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex)
  const r = Math.floor(rgb.r * factor)
  const g = Math.floor(rgb.g * factor)
  const b = Math.floor(rgb.b * factor)
  return `rgb(${r}, ${g}, ${b})`
}
