import { TileDrawer, SeededRandom } from '../types'

// Truchet tile patterns - tiles that connect seamlessly to create flowing patterns
// The key is that each tile connects at the midpoints of edges
// Complexity controls line thickness (0.15 to 0.45 of cell size)

// Helper to get a random foreground color (not the background)
const getRandomFg = (colors: string[], rng: SeededRandom): string => {
  // Last color is background, pick from the rest
  const fgColors = colors.slice(0, -1)
  return fgColors[Math.floor(rng.next() * fgColors.length)]
}

// Helper to get line width based on complexity (thinner to thicker)
const getLineWidth = (size: number, complexity: number = 0.7): number => {
  // Map complexity 0-1 to line width 0.15-0.45 of cell size
  return size * (0.15 + complexity * 0.3)
}

// Classic curved Truchet - two quarter arcs connecting opposite corners
// This creates the flowing "blob" patterns when tiled
const curvedTruchet: TileDrawer = (ctx, x, y, size, colors, rng, complexity = 0.7) => {
  const bg = colors[colors.length - 1] // Use last color as background
  const fg = getRandomFg(colors, rng)

  // Slightly oversized fill to prevent gaps between tiles
  ctx.fillStyle = bg
  ctx.fillRect(x - 0.5, y - 0.5, size + 1, size + 1)

  const lineWidth = getLineWidth(size, complexity)
  ctx.strokeStyle = fg
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'

  const rotation = Math.floor(rng.next() * 2)

  if (rotation === 0) {
    // Connect top-center to left-center, and bottom-center to right-center
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI / 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x + size, y + size, size / 2, Math.PI, Math.PI * 1.5)
    ctx.stroke()
  } else {
    // Connect top-center to right-center, and bottom-center to left-center
    ctx.beginPath()
    ctx.arc(x + size, y, size / 2, Math.PI / 2, Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x, y + size, size / 2, Math.PI * 1.5, Math.PI * 2)
    ctx.stroke()
  }
}

// Multi-color curved Truchet with outline effect (like the teal example)
const outlinedCurvedTruchet: TileDrawer = (ctx, x, y, size, colors, rng, complexity = 0.7) => {
  const bg = colors[colors.length - 1]
  const fg = getRandomFg(colors, rng)
  // Pick a different color for outline
  const outlineOptions = colors.slice(0, -1).filter(c => c !== fg)
  const outline =
    outlineOptions.length > 0
      ? outlineOptions[Math.floor(rng.next() * outlineOptions.length)]
      : '#000000'

  // Slightly oversized fill to prevent gaps between tiles
  ctx.fillStyle = bg
  ctx.fillRect(x - 0.5, y - 0.5, size + 1, size + 1)

  const lineWidth = getLineWidth(size, complexity)
  const outlineWidth = size * 0.05

  const rotation = Math.floor(rng.next() * 2)

  const drawArcs = (r: number) => {
    if (r === 0) {
      ctx.beginPath()
      ctx.arc(x, y, size / 2, 0, Math.PI / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + size, y + size, size / 2, Math.PI, Math.PI * 1.5)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(x + size, y, size / 2, Math.PI / 2, Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y + size, size / 2, Math.PI * 1.5, Math.PI * 2)
      ctx.stroke()
    }
  }

  // Draw outline first (thicker)
  ctx.strokeStyle = outline
  ctx.lineWidth = lineWidth + outlineWidth * 2
  ctx.lineCap = 'round'
  drawArcs(rotation)

  // Draw fill on top
  ctx.strokeStyle = fg
  ctx.lineWidth = lineWidth
  drawArcs(rotation)
}

// Diagonal line Truchet - creates maze-like patterns
const diagonalTruchet: TileDrawer = (ctx, x, y, size, colors, rng, complexity = 0.7) => {
  const bg = colors[colors.length - 1]
  const fg = getRandomFg(colors, rng)

  // Slightly oversized fill to prevent gaps between tiles
  ctx.fillStyle = bg
  ctx.fillRect(x - 0.5, y - 0.5, size + 1, size + 1)

  ctx.strokeStyle = fg
  ctx.lineWidth = getLineWidth(size, complexity)
  ctx.lineCap = 'square'

  const rotation = Math.floor(rng.next() * 2)

  ctx.beginPath()
  if (rotation === 0) {
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y + size)
  } else {
    ctx.moveTo(x + size, y)
    ctx.lineTo(x, y + size)
  }
  ctx.stroke()
}

// Triangle Truchet - creates geometric patterns like the black/white reference
// Complexity controls how much of the tile the triangle covers (0.3 to 1.0)
const triangleTruchet: TileDrawer = (ctx, x, y, size, colors, rng, complexity = 0.7) => {
  const bg = colors[colors.length - 1]
  const fg = getRandomFg(colors, rng)

  // Slightly oversized fill to prevent gaps between tiles
  ctx.fillStyle = bg
  ctx.fillRect(x - 0.5, y - 0.5, size + 1, size + 1)

  ctx.fillStyle = fg

  // Triangle size scales with complexity (0.3 to 1.0 of tile)
  const scale = 0.3 + complexity * 0.7
  const offset = (size * (1 - scale)) / 2 // Center the scaled triangle
  const scaledSize = size * scale

  // Random rotation 0-3 (which corner has the triangle)
  const rotation = Math.floor(rng.next() * 4)

  ctx.beginPath()
  if (rotation === 0) {
    // Triangle in top-left
    ctx.moveTo(x + offset, y + offset)
    ctx.lineTo(x + offset + scaledSize, y + offset)
    ctx.lineTo(x + offset, y + offset + scaledSize)
  } else if (rotation === 1) {
    // Triangle in top-right
    ctx.moveTo(x + offset, y + offset)
    ctx.lineTo(x + offset + scaledSize, y + offset)
    ctx.lineTo(x + offset + scaledSize, y + offset + scaledSize)
  } else if (rotation === 2) {
    // Triangle in bottom-right
    ctx.moveTo(x + offset + scaledSize, y + offset)
    ctx.lineTo(x + offset + scaledSize, y + offset + scaledSize)
    ctx.lineTo(x + offset, y + offset + scaledSize)
  } else {
    // Triangle in bottom-left
    ctx.moveTo(x + offset, y + offset)
    ctx.lineTo(x + offset + scaledSize, y + offset + scaledSize)
    ctx.lineTo(x + offset, y + offset + scaledSize)
  }
  ctx.closePath()
  ctx.fill()
}

// Export individual pattern sets for sub-pattern selection
export const truchetCurvedPatterns: TileDrawer[] = [curvedTruchet]
export const truchetOutlinedPatterns: TileDrawer[] = [outlinedCurvedTruchet]
export const truchetDiagonalPatterns: TileDrawer[] = [diagonalTruchet]
export const truchetTrianglePatterns: TileDrawer[] = [triangleTruchet]

// Default export uses curved pipes (the best one)
export const truchetPatterns: TileDrawer[] = [curvedTruchet]
