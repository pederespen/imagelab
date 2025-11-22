// Character sets for ASCII art conversion
export const CHARACTER_SETS = {
  simple: ' ░▒▓█',
  block: ' ░▒▓█',
  braille: 'braille', // Special marker for braille mode
  detailed: ' .·•○●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟',
  traditional: ' .,:;ilxXO#@',
} as const

export type CharacterSet = keyof typeof CHARACTER_SETS

export interface AsciiOptions {
  width: number
  characterSet: CharacterSet
  invert: boolean
  edgeDetection: boolean
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
 * Apply edge-enhanced processing to ImageData
 * Combines original brightness with edge detection for better detail
 */
function applyEdgeDetection(imageData: ImageData): ImageData {
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(width, height)

  // Sobel kernels
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

  // Calculate edge magnitudes
  const magnitudes: number[] = []
  let maxMagnitude = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      // Apply Sobel kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const brightness =
            (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3

          gx += brightness * sobelX[ky + 1][kx + 1]
          gy += brightness * sobelY[ky + 1][kx + 1]
        }
      }

      // Calculate gradient magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      magnitudes.push(magnitude)
      maxMagnitude = Math.max(maxMagnitude, magnitude)
    }
  }

  // Combine edges with original brightness
  let idx = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIdx = (y * width + x) * 4

      // Get original brightness
      const originalBrightness =
        (imageData.data[pixelIdx] + imageData.data[pixelIdx + 1] + imageData.data[pixelIdx + 2]) / 3

      // Normalize edge magnitude
      const edgeStrength = (magnitudes[idx] / maxMagnitude) * 255

      // Blend: 70% original brightness + 30% edges for definition
      const blended = originalBrightness * 0.7 + edgeStrength * 0.3
      const value = Math.min(255, blended)

      output.data[pixelIdx] = value
      output.data[pixelIdx + 1] = value
      output.data[pixelIdx + 2] = value
      output.data[pixelIdx + 3] = 255
      idx++
    }
  }

  return output
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

  // Apply contrast enhancement
  const processedData = enhanceContrast(imageData)

  // Calculate dimensions - Braille uses 2x4 pixel blocks
  const aspectRatio = processedData.height / processedData.width
  const charWidth = width
  const charHeight = Math.floor(width * aspectRatio * 0.5)

  const pixelWidth = charWidth * 2
  const pixelHeight = charHeight * 4

  const scaleX = processedData.width / pixelWidth
  const scaleY = processedData.height / pixelHeight

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

        if (px < processedData.width && py < processedData.height) {
          const pixelIndex = (py * processedData.width + px) * 4
          const r = processedData.data[pixelIndex]
          const g = processedData.data[pixelIndex + 1]
          const b = processedData.data[pixelIndex + 2]

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b

          // Threshold: if bright enough, set the dot
          const threshold = 127
          const isDark = brightness < threshold
          const shouldDot = invert ? !isDark : isDark

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
  const { width, characterSet, invert, edgeDetection } = options

  // Handle Braille mode separately
  if (characterSet === 'braille') {
    return imageToBraille(imageData, width, invert)
  }

  const chars = CHARACTER_SETS[characterSet] as string

  // Always apply contrast enhancement for better results
  let processedData = enhanceContrast(imageData)

  // Apply edge enhancement if enabled
  if (edgeDetection) {
    processedData = applyEdgeDetection(processedData)
  }

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
 */
export function calculateFontSize(asciiText: string): number {
  const lines = asciiText.split('\n').filter(line => line.length > 0)
  const maxLineLength = Math.max(...lines.map(line => line.length))

  if (maxLineLength > 120) {
    return Math.max(4, Math.floor((450 / maxLineLength) * 7))
  } else if (maxLineLength > 80) {
    return 6
  } else if (maxLineLength > 60) {
    return 7
  } else {
    return 8
  }
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
