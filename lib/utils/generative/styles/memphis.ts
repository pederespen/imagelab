import { TileDrawer, SeededRandom } from '../types'

// Memphis style patterns - bold 80s with squiggles, dots, and geometric shapes

// Squiggle pattern
const squigglePattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.strokeStyle = fg
  ctx.lineWidth = size * 0.08
  ctx.lineCap = 'round'

  // Draw a wavy line
  ctx.beginPath()
  const startY = y + size * 0.3 + rng.next() * size * 0.4
  ctx.moveTo(x, startY)

  const waves = 2 + Math.floor(rng.next() * 2)
  const waveWidth = size / waves
  for (let i = 0; i < waves; i++) {
    const cp1x = x + waveWidth * (i + 0.25)
    const cp1y = startY - size * 0.2
    const cp2x = x + waveWidth * (i + 0.75)
    const cp2y = startY + size * 0.2
    const endX = x + waveWidth * (i + 1)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, startY)
  }
  ctx.stroke()
}

// Confetti dots pattern
const confettiPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const dots = 4 + Math.floor(rng.next() * 6)
  for (let i = 0; i < dots; i++) {
    const color = rng.pick(colors.filter(c => c !== bg))
    const dotX = x + size * 0.15 + rng.next() * size * 0.7
    const dotY = y + size * 0.15 + rng.next() * size * 0.7
    const dotSize = size * 0.05 + rng.next() * size * 0.08

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Zigzag/lightning bolt pattern
const zigzagPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.moveTo(x + size * 0.3, y)
  ctx.lineTo(x + size * 0.5, y + size * 0.4)
  ctx.lineTo(x + size * 0.3, y + size * 0.4)
  ctx.lineTo(x + size * 0.5, y + size)
  ctx.lineTo(x + size * 0.7, y + size)
  ctx.lineTo(x + size * 0.5, y + size * 0.6)
  ctx.lineTo(x + size * 0.7, y + size * 0.6)
  ctx.lineTo(x + size * 0.5, y)
  ctx.closePath()
  ctx.fill()
}

// Cross/plus pattern
const crossPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const thickness = size * 0.25
  ctx.fillStyle = fg

  // Vertical bar
  ctx.fillRect(x + size / 2 - thickness / 2, y + size * 0.1, thickness, size * 0.8)
  // Horizontal bar
  ctx.fillRect(x + size * 0.1, y + size / 2 - thickness / 2, size * 0.8, thickness)
}

// Triangle pattern
const trianglePattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))
  const accent = rng.pick(colors.filter(c => c !== bg && c !== fg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  // Main triangle
  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.moveTo(x + size / 2, y + size * 0.15)
  ctx.lineTo(x + size * 0.85, y + size * 0.85)
  ctx.lineTo(x + size * 0.15, y + size * 0.85)
  ctx.closePath()
  ctx.fill()

  // Small accent triangle
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.moveTo(x + size / 2, y + size * 0.4)
  ctx.lineTo(x + size * 0.65, y + size * 0.7)
  ctx.lineTo(x + size * 0.35, y + size * 0.7)
  ctx.closePath()
  ctx.fill()
}

// Dashed line pattern
const dashedPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.strokeStyle = fg
  ctx.lineWidth = size * 0.06
  ctx.setLineDash([size * 0.1, size * 0.08])

  const angle = rng.next() * Math.PI
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2)
  ctx.rotate(angle)

  ctx.beginPath()
  ctx.moveTo(-size * 0.6, 0)
  ctx.lineTo(size * 0.6, 0)
  ctx.stroke()

  ctx.restore()
  ctx.setLineDash([])
}

// Circle with outline pattern
const outlineCirclePattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const cx = x + size / 2
  const cy = y + size / 2
  const radius = size * 0.35

  ctx.strokeStyle = fg
  ctx.lineWidth = size * 0.08
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()
}

export const memphisPatterns: TileDrawer[] = [
  squigglePattern,
  confettiPattern,
  zigzagPattern,
  crossPattern,
  trianglePattern,
  dashedPattern,
  outlineCirclePattern,
]
