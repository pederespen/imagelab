import { TileDrawer } from '../types'

export const diamondPatterns: TileDrawer[] = [
  // Centered diamond
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const fgColor = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    const cx = x + size / 2
    const cy = y + size / 2
    const d = size * 0.4

    ctx.fillStyle = fgColor
    ctx.beginPath()
    ctx.moveTo(cx, cy - d)
    ctx.lineTo(cx + d, cy)
    ctx.lineTo(cx, cy + d)
    ctx.lineTo(cx - d, cy)
    ctx.closePath()
    ctx.fill()
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

  // Chevron
  (ctx, x, y, size, colors, rng) => {
    const color1 = rng.pick(colors)
    const color2 = rng.pick(colors.filter(c => c !== color1))
    const isUp = rng.next() > 0.5

    ctx.fillStyle = color1
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = color2
    ctx.beginPath()
    if (isUp) {
      ctx.moveTo(x, y + size)
      ctx.lineTo(x + size / 2, y + size * 0.3)
      ctx.lineTo(x + size, y + size)
    } else {
      ctx.moveTo(x, y)
      ctx.lineTo(x + size / 2, y + size * 0.7)
      ctx.lineTo(x + size, y)
    }
    ctx.closePath()
    ctx.fill()
  },
]
