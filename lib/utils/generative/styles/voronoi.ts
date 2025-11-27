import { GenerativeSettings } from '../types'

// Voronoi / Cellular style
// Creates cell-based patterns with distinct regions - organic, crystalline look
// Uses vector-based polygon rendering for smooth edges

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

interface Point {
  x: number
  y: number
  color: string
}

interface VoronoiCell {
  site: Point
  vertices: { x: number; y: number }[]
}

// Generate random seed points with margin to avoid edge issues
function generatePoints(
  width: number,
  height: number,
  count: number,
  colors: string[],
  rng: SeededRandom
): Point[] {
  const points: Point[] = []
  const margin = Math.max(width, height) * 0.15

  for (let i = 0; i < count; i++) {
    points.push({
      x: -margin + rng.next() * (width + margin * 2),
      y: -margin + rng.next() * (height + margin * 2),
      color: colors[Math.floor(rng.next() * colors.length)],
    })
  }
  return points
}

// Compute Voronoi cells using a ray-casting approach for smooth polygons
function computeVoronoiCells(width: number, height: number, points: Point[]): VoronoiCell[] {
  const cells: VoronoiCell[] = points.map(site => ({
    site,
    vertices: [],
  }))

  // For each site, find its cell boundary by sampling angles from the site
  const numAngles = 72 // More angles = smoother polygons

  for (let i = 0; i < points.length; i++) {
    const site = points[i]
    const vertices: { x: number; y: number }[] = []

    for (let a = 0; a < numAngles; a++) {
      const angle = (a / numAngles) * Math.PI * 2
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)

      // Binary search to find the boundary
      let low = 0
      let high = Math.max(width, height) * 2

      while (high - low > 1) {
        const mid = (low + high) / 2
        const x = site.x + dx * mid
        const y = site.y + dy * mid

        // Check if another point is closer
        let closerFound = false
        const currentDistSq = mid * mid

        for (let j = 0; j < points.length; j++) {
          if (i === j) continue
          const other = points[j]
          const odx = x - other.x
          const ody = y - other.y
          const otherDistSq = odx * odx + ody * ody

          if (otherDistSq < currentDistSq - 0.001) {
            closerFound = true
            break
          }
        }

        if (closerFound) {
          high = mid
        } else {
          low = mid
        }
      }

      vertices.push({
        x: site.x + dx * low,
        y: site.y + dy * low,
      })
    }

    cells[i].vertices = vertices
  }

  return cells
}

// Draw a single cell as a smooth polygon
function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: VoronoiCell,
  fillColor: string,
  strokeColor?: string,
  strokeWidth?: number,
  inset?: number
): void {
  if (cell.vertices.length < 3) return

  ctx.beginPath()

  if (inset && inset > 0) {
    // Shrink polygon toward center for gap effect
    const cx = cell.site.x
    const cy = cell.site.y

    const firstV = cell.vertices[0]
    const firstDx = firstV.x - cx
    const firstDy = firstV.y - cy
    const firstDist = Math.sqrt(firstDx * firstDx + firstDy * firstDy)
    const firstScale = Math.max(0, (firstDist - inset) / firstDist)
    ctx.moveTo(cx + firstDx * firstScale, cy + firstDy * firstScale)

    for (let i = 1; i < cell.vertices.length; i++) {
      const v = cell.vertices[i]
      const vdx = v.x - cx
      const vdy = v.y - cy
      const vdist = Math.sqrt(vdx * vdx + vdy * vdy)
      const scale = Math.max(0, (vdist - inset) / vdist)
      ctx.lineTo(cx + vdx * scale, cy + vdy * scale)
    }
  } else {
    ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y)
    for (let i = 1; i < cell.vertices.length; i++) {
      ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y)
    }
  }

  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()

  if (strokeColor && strokeWidth) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
}

export interface VoronoiSettings extends GenerativeSettings {
  variant: 'cells' | 'stained-glass' | 'mosaic' | 'cracked' | 'honeycomb' | 'crystals'
}

export const VORONOI_STYLES = [
  'Cells',
  'Stained Glass',
  'Mosaic',
  'Cracked',
  'Honeycomb',
  'Crystals',
]

export function generateVoronoi(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: VoronoiSettings
): void {
  const { palette, seed, complexity, variant, gridSize } = settings
  const rng = new SeededRandom(seed)

  // Fill background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, width, height)

  const colors = palette.colors

  // Grid size controls number of cells
  const basePoints = 20 + (gridSize - 4) * 15
  const pointCount = Math.floor(basePoints * (0.5 + complexity * 0.8))

  // Generate seed points
  const points = generatePoints(width, height, pointCount, colors, rng)

  switch (variant) {
    case 'cells':
      drawCells(ctx, width, height, points)
      break
    case 'stained-glass':
      drawStainedGlass(ctx, width, height, points)
      break
    case 'mosaic':
      drawMosaic(ctx, width, height, points)
      break
    case 'cracked':
      drawCracked(ctx, width, height, points, palette.background, complexity)
      break
    case 'honeycomb':
      drawHoneycomb(ctx, width, height, gridSize, colors, rng, palette.background)
      break
    case 'crystals':
      drawCrystals(ctx, width, height, points)
      break
    default:
      drawCells(ctx, width, height, points)
  }
}

// Basic filled Voronoi cells - smooth vector rendering
function drawCells(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[]
): void {
  const cells = computeVoronoiCells(width, height, points)

  for (const cell of cells) {
    drawCell(ctx, cell, cell.site.color)
  }
}

// Stained glass effect with dark borders
function drawStainedGlass(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[]
): void {
  const cells = computeVoronoiCells(width, height, points)

  // Draw cells with stroke
  for (const cell of cells) {
    drawCell(ctx, cell, cell.site.color, '#1a1a1a', 3)
  }
}

// Mosaic with gaps between cells
function drawMosaic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[]
): void {
  const cells = computeVoronoiCells(width, height, points)

  // Draw cells with inset for gap effect
  for (const cell of cells) {
    drawCell(ctx, cell, cell.site.color, undefined, undefined, 3)
  }
}

// Cracked earth / dried mud effect
function drawCracked(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[],
  background: string,
  complexity: number
): void {
  const cells = computeVoronoiCells(width, height, points)

  // Use first color as base
  const baseColor = points[0]?.color || background
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, width, height)

  // Draw cell edges as cracks
  const crackColor = darkenColor(baseColor, 0.3)
  ctx.strokeStyle = crackColor
  ctx.lineWidth = 1 + complexity * 2
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  for (const cell of cells) {
    if (cell.vertices.length < 3) continue

    ctx.beginPath()
    ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y)
    for (let i = 1; i < cell.vertices.length; i++) {
      ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  }
}

// Honeycomb pattern (regular hexagonal grid)
function drawHoneycomb(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  colors: string[],
  rng: SeededRandom,
  background: string
): void {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const hexRadius = Math.max(width, height) / gridSize / 1.5
  const hexHeight = hexRadius * 2
  const hexWidth = Math.sqrt(3) * hexRadius
  const vertDist = hexHeight * 0.75

  ctx.lineWidth = 2
  ctx.strokeStyle = darkenColor(background, 0.7)
  ctx.lineJoin = 'round'

  for (let row = -1; row < height / vertDist + 1; row++) {
    for (let col = -1; col < width / hexWidth + 1; col++) {
      const x = col * hexWidth + (row % 2 === 0 ? 0 : hexWidth / 2)
      const y = row * vertDist

      ctx.fillStyle = colors[Math.floor(rng.next() * colors.length)]

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
    }
  }
}

// Crystal effect with lighter centers
function drawCrystals(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Point[]
): void {
  const cells = computeVoronoiCells(width, height, points)

  for (const cell of cells) {
    if (cell.vertices.length < 3) continue

    // Create radial gradient from center
    const cx = cell.site.x
    const cy = cell.site.y

    // Find max radius
    let maxR = 0
    for (const v of cell.vertices) {
      const d = Math.sqrt((v.x - cx) ** 2 + (v.y - cy) ** 2)
      if (d > maxR) maxR = d
    }

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
    const baseColor = cell.site.color
    gradient.addColorStop(0, lightenColor(baseColor, 1.3))
    gradient.addColorStop(0.7, baseColor)
    gradient.addColorStop(1, darkenColor(baseColor, 0.7))

    ctx.beginPath()
    ctx.moveTo(cell.vertices[0].x, cell.vertices[0].y)
    for (let i = 1; i < cell.vertices.length; i++) {
      ctx.lineTo(cell.vertices[i].x, cell.vertices[i].y)
    }
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // White edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
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

// Helper: Lighten a hex color
function lightenColor(hex: string, factor: number): string {
  const rgb = hexToRgb(hex)
  const r = Math.min(255, Math.floor(rgb.r * factor))
  const g = Math.min(255, Math.floor(rgb.g * factor))
  const b = Math.min(255, Math.floor(rgb.b * factor))
  return `rgb(${r}, ${g}, ${b})`
}
