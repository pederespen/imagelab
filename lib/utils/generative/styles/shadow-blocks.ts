import { TileDrawer } from '../types'

export const shadowBlockPatterns: TileDrawer[] = [
  // Square with shadow
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const shadowColor = rng.pick(colors.filter(c => c !== bgColor))
    const squareColor = rng.pick(colors.filter(c => c !== bgColor && c !== shadowColor))

    const squareSize = size * 0.6
    const offset = size * 0.2

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    // Shadow (diagonal offset)
    ctx.fillStyle = shadowColor
    ctx.beginPath()
    ctx.moveTo(x + offset + squareSize, y + offset)
    ctx.lineTo(x + size, y + offset)
    ctx.lineTo(x + size, y + size)
    ctx.lineTo(x + offset, y + size)
    ctx.lineTo(x + offset, y + offset + squareSize)
    ctx.lineTo(x + offset + squareSize, y + offset + squareSize)
    ctx.closePath()
    ctx.fill()

    // Main square
    ctx.fillStyle = squareColor
    ctx.fillRect(x + offset, y + offset, squareSize, squareSize)
  },

  // Triangle shadow block
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const shadowColor = rng.pick(colors.filter(c => c !== bgColor))
    const fgColor = rng.pick(colors.filter(c => c !== bgColor && c !== shadowColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    // Shadow triangle
    ctx.fillStyle = shadowColor
    ctx.beginPath()
    ctx.moveTo(x, y + size)
    ctx.lineTo(x + size, y + size)
    ctx.lineTo(x + size, y)
    ctx.closePath()
    ctx.fill()

    // Foreground square
    const squareSize = size * 0.5
    ctx.fillStyle = fgColor
    ctx.fillRect(x + size * 0.15, y + size * 0.15, squareSize, squareSize)
  },

  // Offset rectangles
  (ctx, x, y, size, colors, rng) => {
    const color1 = rng.pick(colors)
    const color2 = rng.pick(colors.filter(c => c !== color1))
    const color3 = rng.pick(colors.filter(c => c !== color1 && c !== color2))

    ctx.fillStyle = color1
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = color2
    ctx.fillRect(x + size * 0.1, y + size * 0.3, size * 0.5, size * 0.6)

    ctx.fillStyle = color3
    ctx.fillRect(x + size * 0.4, y + size * 0.1, size * 0.5, size * 0.5)
  },
]
