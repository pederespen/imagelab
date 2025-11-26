export type ColorPalette = 'none' | 'gameboy' | 'cga' | 'nes' | 'sepia' | 'grayscale' | 'vapor'

const COLOR_PALETTES: Record<ColorPalette, number[][] | null> = {
  none: null,
  gameboy: [
    [15, 56, 15], // Darkest green
    [48, 98, 48], // Dark green
    [139, 172, 15], // Light green
    [155, 188, 15], // Lightest green
  ],
  cga: [
    [0, 0, 0], // Black
    [0, 170, 170], // Cyan
    [170, 0, 170], // Magenta
    [170, 170, 170], // White
  ],
  nes: [
    [124, 124, 124], // Gray
    [0, 0, 252], // Blue
    [0, 168, 0], // Green
    [216, 0, 204], // Pink
    [228, 92, 16], // Orange
    [252, 252, 252], // White
  ],
  sepia: [
    [112, 66, 20], // Dark sepia
    [161, 104, 47], // Medium dark
    [216, 151, 75], // Medium
    [240, 195, 110], // Light
    [255, 230, 180], // Lightest
  ],
  grayscale: [
    [0, 0, 0],
    [64, 64, 64],
    [128, 128, 128],
    [192, 192, 192],
    [255, 255, 255],
  ],
  vapor: [
    [1, 0, 38], // Dark purple
    [94, 49, 140], // Purple
    [255, 71, 142], // Pink
    [1, 233, 255], // Cyan
    [255, 252, 213], // Light yellow
  ],
}

/**
 * Pixelates an image by reducing resolution and scaling up
 */
export function pixelateImage(
  sourceCanvas: HTMLCanvasElement,
  pixelSize: number,
  options: {
    colorDepth?: number
    colorPalette?: ColorPalette
  } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  const width = sourceCanvas.width
  const height = sourceCanvas.height

  canvas.width = width
  canvas.height = height

  // Calculate the number of "pixels" we'll have
  const cols = Math.ceil(width / pixelSize)
  const rows = Math.ceil(height / pixelSize)

  // Get source image data
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!sourceCtx) {
    throw new Error('Could not get source canvas context')
  }

  const sourceImageData = sourceCtx.getImageData(0, 0, width, height)
  const sourceData = sourceImageData.data

  const palette = options.colorPalette ? COLOR_PALETTES[options.colorPalette] : null

  // Process each "pixel" block
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate average color for this block
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        count = 0

      const startX = col * pixelSize
      const startY = row * pixelSize
      const endX = Math.min(startX + pixelSize, width)
      const endY = Math.min(startY + pixelSize, height)

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4
          r += sourceData[idx]
          g += sourceData[idx + 1]
          b += sourceData[idx + 2]
          a += sourceData[idx + 3]
          count++
        }
      }

      // Average the colors
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
      a = Math.round(a / count)

      // Apply color palette if specified
      if (palette) {
        ;[r, g, b] = findClosestPaletteColor(r, g, b, palette)
      }

      // Apply color depth reduction if specified
      if (options.colorDepth && options.colorDepth < 256) {
        const levels = options.colorDepth
        r = Math.round((r / 255) * (levels - 1)) * (255 / (levels - 1))
        g = Math.round((g / 255) * (levels - 1)) * (255 / (levels - 1))
        b = Math.round((b / 255) * (levels - 1)) * (255 / (levels - 1))
      }

      // Draw the solid color block
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`
      ctx.fillRect(startX, startY, endX - startX, endY - startY)
    }
  }

  return canvas
}

/**
 * Find the closest color in a palette using Euclidean distance
 */
function findClosestPaletteColor(
  r: number,
  g: number,
  b: number,
  palette: number[][]
): [number, number, number] {
  let closestColor = palette[0]
  let minDistance = Infinity

  for (const color of palette) {
    const distance = Math.sqrt(
      Math.pow(r - color[0], 2) + Math.pow(g - color[1], 2) + Math.pow(b - color[2], 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  return [closestColor[0], closestColor[1], closestColor[2]]
}

/**
 * Loads an image file and returns it as a canvas
 */
export function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
