import { TileDrawer, SeededRandom } from '../types'

// Truchet tile patterns - tiles that connect seamlessly to create flowing patterns
// The key is that each tile connects at the midpoints of edges

// Classic curved Truchet - two quarter arcs connecting opposite corners
// This creates the flowing "blob" patterns when tiled
const curvedTruchet: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = colors[colors.length - 1] // Use last color as background
  const fg = colors[0] // Use first color as foreground

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const lineWidth = size * 0.35
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
const outlinedCurvedTruchet: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = colors[colors.length - 1]
  const fg = colors[0]
  const outline = colors.length > 2 ? colors[1] : '#000000'

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const lineWidth = size * 0.35
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
const diagonalTruchet: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = colors[colors.length - 1]
  const fg = colors[0]

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.strokeStyle = fg
  ctx.lineWidth = size * 0.15
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
const triangleTruchet: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = colors[colors.length - 1]
  const fg = colors[0]

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.fillStyle = fg

  // Random rotation 0-3 (which corner has the triangle)
  const rotation = Math.floor(rng.next() * 4)

  ctx.beginPath()
  if (rotation === 0) {
    // Triangle in top-left
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x, y + size)
  } else if (rotation === 1) {
    // Triangle in top-right
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x + size, y + size)
  } else if (rotation === 2) {
    // Triangle in bottom-right
    ctx.moveTo(x + size, y)
    ctx.lineTo(x + size, y + size)
    ctx.lineTo(x, y + size)
  } else {
    // Triangle in bottom-left
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y + size)
    ctx.lineTo(x, y + size)
  }
  ctx.closePath()
  ctx.fill()
}

// Weave pattern - creates organic flowing lines like the first reference
const weaveTruchet: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = colors[colors.length - 1]
  const colorIndex = Math.floor(rng.next() * (colors.length - 1))
  const fg = colors[colorIndex]

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.strokeStyle = fg
  ctx.lineWidth = size * 0.12
  ctx.lineCap = 'round'

  // Draw multiple curved strokes
  const numStrokes = 3 + Math.floor(rng.next() * 3)
  const rotation = rng.next() * Math.PI * 2

  for (let i = 0; i < numStrokes; i++) {
    const offset = (i / numStrokes) * size * 0.8
    const curve = rng.next() * 0.5 + 0.25

    ctx.beginPath()

    // Create flowing curves that could connect to neighbors
    const startAngle = rotation + (i * Math.PI) / numStrokes
    const cx = x + size / 2
    const cy = y + size / 2

    ctx.beginPath()
    ctx.arc(cx, cy, size * curve, startAngle, startAngle + Math.PI * 0.8)
    ctx.stroke()
  }
}

// Export individual pattern sets for sub-pattern selection
export const truchetCurvedPatterns: TileDrawer[] = [curvedTruchet]
export const truchetOutlinedPatterns: TileDrawer[] = [outlinedCurvedTruchet]
export const truchetDiagonalPatterns: TileDrawer[] = [diagonalTruchet]
export const truchetTrianglePatterns: TileDrawer[] = [triangleTruchet]
export const truchetWeavePatterns: TileDrawer[] = [weaveTruchet]

// Combined for random selection
export const truchetPatterns: TileDrawer[] = [
  curvedTruchet,
  outlinedCurvedTruchet,
  diagonalTruchet,
  triangleTruchet,
  weaveTruchet,
]
