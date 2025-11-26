import { TileDrawer, SeededRandom } from '../types'

// Art Deco patterns - elegant fans, sunbursts, and geometric motifs

// Fan/sunburst pattern
const fanPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  // Draw fan rays from a corner
  const corner = Math.floor(rng.next() * 4)
  const cx = corner % 2 === 0 ? x : x + size
  const cy = corner < 2 ? y : y + size
  const startAngle = corner * (Math.PI / 2)

  ctx.fillStyle = fg
  const rays = 5 + Math.floor(rng.next() * 4)
  const angleSpan = Math.PI / 2
  const rayAngle = angleSpan / (rays * 2)

  for (let i = 0; i < rays; i++) {
    const angle = startAngle + rayAngle * (i * 2 + 0.5)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, size * 1.2, angle, angle + rayAngle)
    ctx.closePath()
    ctx.fill()
  }
}

// Stepped pyramid pattern
const steppedPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const steps = 3 + Math.floor(rng.next() * 2)
  const stepSize = size / (steps * 2)

  for (let i = 0; i < steps; i++) {
    const color = colors[(i + 1) % colors.length]
    ctx.fillStyle = color
    const offset = stepSize * i
    ctx.fillRect(x + offset, y + offset, size - offset * 2, size - offset * 2)
  }
}

// Chevron/zigzag pattern
const chevronPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.fillStyle = fg
  const stripes = 3
  const stripeHeight = size / stripes

  for (let i = 0; i < stripes; i += 2) {
    ctx.beginPath()
    ctx.moveTo(x, y + i * stripeHeight)
    ctx.lineTo(x + size / 2, y + i * stripeHeight + stripeHeight / 2)
    ctx.lineTo(x + size, y + i * stripeHeight)
    ctx.lineTo(x + size, y + (i + 1) * stripeHeight)
    ctx.lineTo(x + size / 2, y + i * stripeHeight + stripeHeight * 1.5)
    ctx.lineTo(x, y + (i + 1) * stripeHeight)
    ctx.closePath()
    ctx.fill()
  }
}

// Arch pattern
const archPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))
  const accent = rng.pick(colors.filter(c => c !== bg && c !== fg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  // Outer arch
  ctx.fillStyle = fg
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size, size * 0.45, Math.PI, 0)
  ctx.closePath()
  ctx.fill()

  // Inner arch
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size, size * 0.3, Math.PI, 0)
  ctx.closePath()
  ctx.fill()

  // Innermost
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size, size * 0.15, Math.PI, 0)
  ctx.closePath()
  ctx.fill()
}

// Sunburst from center
const sunburstPattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  const cx = x + size / 2
  const cy = y + size / 2
  const rays = 8 + Math.floor(rng.next() * 8)
  const rayAngle = (Math.PI * 2) / (rays * 2)

  ctx.fillStyle = fg
  for (let i = 0; i < rays; i++) {
    const angle = rayAngle * (i * 2)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, size * 0.7, angle, angle + rayAngle)
    ctx.closePath()
    ctx.fill()
  }

  // Center circle
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2)
  ctx.fill()
}

// Geometric keystone pattern
const keystonePattern: TileDrawer = (ctx, x, y, size, colors, rng) => {
  const bg = rng.pick(colors)
  const fg = rng.pick(colors.filter(c => c !== bg))

  ctx.fillStyle = bg
  ctx.fillRect(x, y, size, size)

  ctx.fillStyle = fg
  // Trapezoid shape
  ctx.beginPath()
  ctx.moveTo(x + size * 0.2, y + size)
  ctx.lineTo(x + size * 0.35, y + size * 0.2)
  ctx.lineTo(x + size * 0.65, y + size * 0.2)
  ctx.lineTo(x + size * 0.8, y + size)
  ctx.closePath()
  ctx.fill()
}

export const artDecoPatterns: TileDrawer[] = [
  fanPattern,
  steppedPattern,
  chevronPattern,
  archPattern,
  sunburstPattern,
  keystonePattern,
]
