import { TileDrawer } from '../types'

export const quarterCirclePatterns: TileDrawer[] = [
  // Single quarter circle in corner
  (ctx, x, y, size, colors, rng) => {
    const corner = Math.floor(rng.next() * 4)
    const bgColor = rng.pick(colors)
    const fgColor = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = fgColor
    ctx.beginPath()

    const corners = [
      [x, y],
      [x + size, y],
      [x + size, y + size],
      [x, y + size],
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
    const edge = Math.floor(rng.next() * 4)
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
]
