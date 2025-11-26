import { TileDrawer } from '../types'

export const concentricPatterns: TileDrawer[] = [
  // Concentric quarter circles
  (ctx, x, y, size, colors, rng) => {
    const corner = Math.floor(rng.next() * 4)
    const shuffledColors = rng.shuffle([...colors]).slice(0, 3)

    const corners = [
      [x, y],
      [x + size, y],
      [x + size, y + size],
      [x, y + size],
    ]
    const startAngles = [0, 0.5, 1, 1.5]

    const radii = [size, size * 0.66, size * 0.33]
    radii.forEach((radius, i) => {
      ctx.fillStyle = shuffledColors[i % shuffledColors.length]
      ctx.beginPath()
      ctx.arc(
        corners[corner][0],
        corners[corner][1],
        radius,
        startAngles[corner] * Math.PI,
        (startAngles[corner] + 0.5) * Math.PI
      )
      ctx.lineTo(corners[corner][0], corners[corner][1])
      ctx.closePath()
      ctx.fill()
    })
  },

  // Concentric full circles (target)
  (ctx, x, y, size, colors, rng) => {
    const bgColor = rng.pick(colors)
    const shuffledColors = rng.shuffle([...colors]).slice(0, 4)

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, size, size)

    const cx = x + size / 2
    const cy = y + size / 2
    const radii = [size * 0.45, size * 0.32, size * 0.2, size * 0.1]

    radii.forEach((radius, i) => {
      ctx.fillStyle = shuffledColors[i % shuffledColors.length]
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      ctx.fill()
    })
  },

  // Arc stripes
  (ctx, x, y, size, colors, rng) => {
    const corner = Math.floor(rng.next() * 4)
    const color1 = rng.pick(colors)
    const color2 = rng.pick(colors.filter(c => c !== color1))
    const color3 = rng.pick(colors.filter(c => c !== color1))

    const corners = [
      [x, y],
      [x + size, y],
      [x + size, y + size],
      [x, y + size],
    ]
    const startAngles = [0, 0.5, 1, 1.5]
    const cx = corners[corner][0]
    const cy = corners[corner][1]
    const startAngle = startAngles[corner] * Math.PI
    const endAngle = (startAngles[corner] + 0.5) * Math.PI

    ctx.fillStyle = color1
    ctx.beginPath()
    ctx.arc(cx, cy, size, startAngle, endAngle)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = color2
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.66, startAngle, endAngle)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = color3
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.33, startAngle, endAngle)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    ctx.fill()
  },
]
