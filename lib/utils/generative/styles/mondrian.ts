import { TileDrawer } from '../types'

export const mondrianPatterns: TileDrawer[] = [
  // Asymmetric split
  (ctx, x, y, size, colors, rng) => {
    const splitX = size * (0.3 + rng.next() * 0.4)
    const splitY = size * (0.3 + rng.next() * 0.4)
    const shuffled = rng.shuffle([...colors]).slice(0, 4)

    ctx.fillStyle = shuffled[0]
    ctx.fillRect(x, y, splitX, splitY)

    ctx.fillStyle = shuffled[1]
    ctx.fillRect(x + splitX, y, size - splitX, splitY)

    ctx.fillStyle = shuffled[2]
    ctx.fillRect(x, y + splitY, splitX, size - splitY)

    ctx.fillStyle = shuffled[3]
    ctx.fillRect(x + splitX, y + splitY, size - splitX, size - splitY)

    // Black lines
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = size * 0.03
    ctx.beginPath()
    ctx.moveTo(x + splitX, y)
    ctx.lineTo(x + splitX, y + size)
    ctx.moveTo(x, y + splitY)
    ctx.lineTo(x + size, y + splitY)
    ctx.stroke()
  },

  // Horizontal bars
  (ctx, x, y, size, colors, rng) => {
    const shuffled = rng.shuffle([...colors]).slice(0, 3)
    const h1 = size * (0.2 + rng.next() * 0.3)
    const h2 = size * (0.2 + rng.next() * 0.3)

    ctx.fillStyle = shuffled[0]
    ctx.fillRect(x, y, size, h1)

    ctx.fillStyle = shuffled[1]
    ctx.fillRect(x, y + h1, size, h2)

    ctx.fillStyle = shuffled[2]
    ctx.fillRect(x, y + h1 + h2, size, size - h1 - h2)

    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = size * 0.03
    ctx.beginPath()
    ctx.moveTo(x, y + h1)
    ctx.lineTo(x + size, y + h1)
    ctx.moveTo(x, y + h1 + h2)
    ctx.lineTo(x + size, y + h1 + h2)
    ctx.stroke()
  },

  // Large block with accent
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const accentColor = rng.pick(colors.filter(c => c !== bgColor))

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    const accentSize = size * (0.2 + rng.next() * 0.3)
    const corner = Math.floor(rng.next() * 4)

    ctx.fillStyle = accentColor
    if (corner === 0) ctx.fillRect(x, y, accentSize, accentSize)
    else if (corner === 1) ctx.fillRect(x + size - accentSize, y, accentSize, accentSize)
    else if (corner === 2)
      ctx.fillRect(x + size - accentSize, y + size - accentSize, accentSize, accentSize)
    else ctx.fillRect(x, y + size - accentSize, accentSize, accentSize)

    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = size * 0.02
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2)
  },
]
