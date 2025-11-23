// Character sets for ASCII art conversion
export const CHARACTER_SETS = {
  simple: ' .:-=+*#%@',
  block: ' ░▒▓█',
  braille: 'braille',
  detailed: ' .·•○●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟',
  traditional: ' .,:;ilxXO#@',
} as const

export type CharacterSet = keyof typeof CHARACTER_SETS

export interface AsciiOptions {
  width: number
  characterSet: CharacterSet
  invert: boolean
}

/**
 * Auto-crop whitespace from ImageData
 * Detects and removes white/light-colored borders
 */
function autoCropWhitespace(imageData: ImageData, threshold: number = 240): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  // Find bounding box of non-white content
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = (r + g + b) / 3

      // If pixel is not white/bright
      if (brightness < threshold) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // If no content found, return original
  if (minX >= maxX || minY >= maxY) {
    return imageData
  }

  // Add small padding (2% of dimensions)
  const paddingX = Math.max(2, Math.floor((maxX - minX) * 0.02))
  const paddingY = Math.max(2, Math.floor((maxY - minY) * 0.02))

  minX = Math.max(0, minX - paddingX)
  minY = Math.max(0, minY - paddingY)
  maxX = Math.min(width - 1, maxX + paddingX)
  maxY = Math.min(height - 1, maxY + paddingY)

  // Create cropped image
  const croppedWidth = maxX - minX + 1
  const croppedHeight = maxY - minY + 1
  const cropped = new ImageData(croppedWidth, croppedHeight)

  for (let y = 0; y < croppedHeight; y++) {
    for (let x = 0; x < croppedWidth; x++) {
      const srcIdx = ((minY + y) * width + (minX + x)) * 4
      const dstIdx = (y * croppedWidth + x) * 4

      cropped.data[dstIdx] = data[srcIdx]
      cropped.data[dstIdx + 1] = data[srcIdx + 1]
      cropped.data[dstIdx + 2] = data[srcIdx + 2]
      cropped.data[dstIdx + 3] = data[srcIdx + 3]
    }
  }

  return cropped
}

/**
 * Apply contrast enhancement to ImageData
 */
function enhanceContrast(imageData: ImageData): ImageData {
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(width, height)

  // Calculate histogram
  const histogram = new Array(256).fill(0)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const brightness = Math.floor(
      0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]
    )
    histogram[brightness]++
  }

  // Find min and max brightness values
  let min = 0
  let max = 255
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      min = i
      break
    }
  }
  for (let i = 255; i >= 0; i--) {
    if (histogram[i] > 0) {
      max = i
      break
    }
  }

  // Stretch contrast
  const range = max - min
  if (range === 0) return imageData

  for (let i = 0; i < imageData.data.length; i += 4) {
    const brightness = Math.floor(
      0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2]
    )
    const stretched = ((brightness - min) / range) * 255

    output.data[i] = stretched
    output.data[i + 1] = stretched
    output.data[i + 2] = stretched
    output.data[i + 3] = imageData.data[i + 3]
  }

  return output
}

/**
 * Apply Gaussian blur for smoothing
 */
function gaussianBlur(imageData: ImageData, radius: number = 2): ImageData {
  const output = new ImageData(imageData.width, imageData.height)
  const width = imageData.width
  const height = imageData.height

  // Gaussian kernel weights
  const sigma = radius / 2
  const kernel: number[] = []
  let kernelSum = 0

  for (let i = -radius; i <= radius; i++) {
    const weight = Math.exp(-(i * i) / (2 * sigma * sigma))
    kernel.push(weight)
    kernelSum += weight
  }

  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= kernelSum
  }

  // Horizontal pass
  const temp = new ImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0

      for (let i = -radius; i <= radius; i++) {
        const nx = Math.max(0, Math.min(width - 1, x + i))
        const idx = (y * width + nx) * 4
        const w = kernel[i + radius]
        r += imageData.data[idx] * w
        g += imageData.data[idx + 1] * w
        b += imageData.data[idx + 2] * w
      }

      const outIdx = (y * width + x) * 4
      temp.data[outIdx] = r
      temp.data[outIdx + 1] = g
      temp.data[outIdx + 2] = b
      temp.data[outIdx + 3] = 255
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0

      for (let i = -radius; i <= radius; i++) {
        const ny = Math.max(0, Math.min(height - 1, y + i))
        const idx = (ny * width + x) * 4
        const w = kernel[i + radius]
        r += temp.data[idx] * w
        g += temp.data[idx + 1] * w
        b += temp.data[idx + 2] * w
      }

      const outIdx = (y * width + x) * 4
      output.data[outIdx] = r
      output.data[outIdx + 1] = g
      output.data[outIdx + 2] = b
      output.data[outIdx + 3] = 255
    }
  }

  return output
}

/**
 * Detect edges using Sobel operator and return edge map
 */
function detectEdges(imageData: ImageData): Float32Array {
  const width = imageData.width
  const height = imageData.height
  const edges = new Float32Array(width * height)

  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ]
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ]

  let maxMagnitude = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const brightness =
            (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3

          gx += brightness * sobelX[ky + 1][kx + 1]
          gy += brightness * sobelY[ky + 1][kx + 1]
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      edges[y * width + x] = magnitude
      maxMagnitude = Math.max(maxMagnitude, magnitude)
    }
  }

  // Normalize edges to 0-1 range
  if (maxMagnitude > 0) {
    for (let i = 0; i < edges.length; i++) {
      edges[i] /= maxMagnitude
    }
  }

  return edges
}

/**
 * Convert image to Braille art
 * Each Braille character represents a 2x4 grid of pixels
 */
function imageToBraille(imageData: ImageData, width: number, invert: boolean): string {
  // Braille Unicode: U+2800 to U+28FF
  // Bit pattern:
  // 0 3
  // 1 4
  // 2 5
  // 6 7
  const BRAILLE_BASE = 0x2800

  // Smooth image heavily to remove texture noise
  const smoothed = gaussianBlur(imageData, 3)

  // Enhance contrast after smoothing
  const enhanced = enhanceContrast(smoothed)

  // Detect edges
  const edgeMap = detectEdges(enhanced)

  // Edge threshold - only render dots where edges are strong
  const edgeThreshold = 0.15

  // Calculate dimensions - Braille uses 2x4 pixel blocks
  const aspectRatio = enhanced.height / enhanced.width
  const charWidth = width
  const charHeight = Math.floor(width * aspectRatio * 0.5)

  const pixelWidth = charWidth * 2
  const pixelHeight = charHeight * 4

  const scaleX = enhanced.width / pixelWidth
  const scaleY = enhanced.height / pixelHeight

  let braille = ''

  for (let cy = 0; cy < charHeight; cy++) {
    for (let cx = 0; cx < charWidth; cx++) {
      let bits = 0

      // Map 2x4 pixel grid to Braille dots
      const dotMap = [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 3],
        [1, 3],
      ]

      for (let i = 0; i < 8; i++) {
        const px = Math.floor((cx * 2 + dotMap[i][0]) * scaleX)
        const py = Math.floor((cy * 4 + dotMap[i][1]) * scaleY)

        if (px < enhanced.width && py < enhanced.height) {
          const pixelIndex = (py * enhanced.width + px) * 4
          const edgeIndex = py * enhanced.width + px

          const r = enhanced.data[pixelIndex]
          const g = enhanced.data[pixelIndex + 1]
          const b = enhanced.data[pixelIndex + 2]
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b

          const edgeStrength = edgeMap[edgeIndex]

          // Only place dots where there are strong edges OR very dark areas
          const isEdge = edgeStrength > edgeThreshold
          const isDark = brightness < 100

          const shouldDot = invert ? isEdge || brightness > 200 : isEdge || isDark

          if (shouldDot) {
            bits |= 1 << i
          }
        }
      }

      braille += String.fromCharCode(BRAILLE_BASE + bits)
    }
    braille += '\n'
  }

  return braille
}

/**
 * Convert an image to ASCII art using specified character set
 */
export function imageToAscii(imageData: ImageData, options: AsciiOptions): string {
  const { width, characterSet, invert } = options

  // Handle Braille mode separately
  if (characterSet === 'braille') {
    return imageToBraille(imageData, width, invert)
  }

  const chars = CHARACTER_SETS[characterSet] as string

  // Apply light smoothing to reduce texture noise, then enhance contrast
  const smoothed = gaussianBlur(imageData, 1)
  const processedData = enhanceContrast(smoothed)

  // Calculate height maintaining aspect ratio
  const aspectRatio = processedData.height / processedData.width
  const height = Math.floor(width * aspectRatio * 0.5) // 0.5 compensates for character height

  const scaleX = processedData.width / width
  const scaleY = processedData.height / height

  let ascii = ''

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sample pixel at scaled position
      const pixelX = Math.floor(x * scaleX)
      const pixelY = Math.floor(y * scaleY)
      const pixelIndex = (pixelY * processedData.width + pixelX) * 4

      // Get RGB values
      const r = processedData.data[pixelIndex]
      const g = processedData.data[pixelIndex + 1]
      const b = processedData.data[pixelIndex + 2]
      const a = processedData.data[pixelIndex + 3]

      // Calculate brightness using weighted formula (0-255)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b

      // Handle transparency
      const adjustedBrightness = brightness * (a / 255)

      // Map brightness to character (0-1 range)
      let normalized = adjustedBrightness / 255
      if (!invert) normalized = 1 - normalized

      // Map to character index, ensuring we use the full range
      const charIndex = Math.min(chars.length - 1, Math.floor(normalized * chars.length))
      const char = chars[charIndex]
      // Use non-breaking space to prevent collapse
      ascii += char === ' ' ? '\u00A0' : char
    }
    ascii += '\n'
  }

  return ascii
}

/**
 * Calculate optimal font size based on ASCII art dimensions
 * Scales inversely with width so smaller character counts appear larger
 */
export function calculateFontSize(asciiText: string, containerWidth: number = 600): number {
  const lines = asciiText.split('\n').filter(line => line.length > 0)
  const maxLineLength = Math.max(...lines.map(line => line.length))

  // Calculate based on container width with padding consideration
  // Subtract ~32px for padding (16px on each side)
  const availableWidth = containerWidth - 32
  const baseFontSize = (availableWidth / maxLineLength) * 1.5 // 1.5x multiplier for larger display

  // Clamp between reasonable bounds (4px min for very wide, 30px max for narrow)
  return Math.max(4, Math.min(30, Math.floor(baseFontSize)))
}

/**
 * Load image from File and get ImageData
 */
export function loadImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = e => {
      const dataUrl = e.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Fill with white background first (in case of transparency)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw image on canvas
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        resolve(imageData)
      }

      img.onerror = error => {
        reject(new Error('Failed to load image'))
      }

      // CORS fix: Set crossOrigin before setting src
      img.crossOrigin = 'anonymous'
      img.src = dataUrl
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
