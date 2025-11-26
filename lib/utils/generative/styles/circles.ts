import { TileDrawer } from '../types'

export const circlePatterns: TileDrawer[] = [
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

  // Offset circles (overlapping)
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const color1 = rng.pick(colors.filter(c => c !== bgColor))
    const color2 = rng.pick(colors.filter(c => c !== bgColor && c !== color1))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    const offset = size * 0.15
    const radius = size * 0.35

    ctx.fillStyle = color1
    ctx.beginPath()
    ctx.arc(x + size / 2 - offset, y + size / 2, radius, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = color2
    ctx.beginPath()
    ctx.arc(x + size / 2 + offset, y + size / 2, radius, 0, 2 * Math.PI)
    ctx.fill()
  },

  // Half circles
  (ctx, x, y, size, colors, rng) => {
    const color1 = rng.pick(colors)
    const color2 = rng.pick(colors.filter(c => c !== color1))
    const isVertical = rng.next() > 0.5

    ctx.fillStyle = color1
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = color2
    ctx.beginPath()
    if (isVertical) {
      ctx.arc(x + size / 2, y, size / 2, 0, Math.PI)
      ctx.arc(x + size / 2, y + size, size / 2, Math.PI, 2 * Math.PI)
    } else {
      ctx.arc(x, y + size / 2, size / 2, -0.5 * Math.PI, 0.5 * Math.PI)
      ctx.arc(x + size, y + size / 2, size / 2, 0.5 * Math.PI, 1.5 * Math.PI)
    }
    ctx.fill()
  },
]
