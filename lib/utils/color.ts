export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

export interface ColorFormats {
  hex: string
  rgb: RGB
  hsl: HSL
  hsv: HSV
  cmyk: CMYK
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(r: number, g: number, b: number): CMYK {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  const rPrime = r / 255
  const gPrime = g / 255
  const bPrime = b / 255

  const k = 1 - Math.max(rPrime, gPrime, bPrime)
  const c = (1 - rPrime - k) / (1 - k)
  const m = (1 - gPrime - k) / (1 - k)
  const y = (1 - bPrime - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

/**
 * Get all color formats from RGB values
 */
export function getAllColorFormats(r: number, g: number, b: number): ColorFormats {
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
    hsv: rgbToHsv(r, g, b),
    cmyk: rgbToCmyk(r, g, b),
  }
}

/**
 * Format color as string for display/copy
 */
export function formatColorString(format: keyof ColorFormats, colors: ColorFormats): string {
  switch (format) {
    case 'hex':
      return colors.hex.toUpperCase()
    case 'rgb':
      return `rgb(${colors.rgb.r}, ${colors.rgb.g}, ${colors.rgb.b})`
    case 'hsl':
      return `hsl(${colors.hsl.h}, ${colors.hsl.s}%, ${colors.hsl.l}%)`
    case 'hsv':
      return `hsv(${colors.hsv.h}, ${colors.hsv.s}%, ${colors.hsv.v}%)`
    case 'cmyk':
      return `cmyk(${colors.cmyk.c}%, ${colors.cmyk.m}%, ${colors.cmyk.y}%, ${colors.cmyk.k}%)`
  }
}

/**
 * Calculate relative luminance for contrast calculations
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Determine if text should be light or dark based on background color
 */
export function getContrastTextColor(r: number, g: number, b: number): 'light' | 'dark' {
  const luminance = getLuminance(r, g, b)
  return luminance > 0.179 ? 'dark' : 'light'
}

/**
 * Extract dominant colors from image data using color quantization
 */
export function extractDominantColors(imageData: ImageData, numColors: number = 8): RGB[] {
  const pixels: RGB[] = []
  const data = imageData.data

  // Sample pixels (skip some for performance on large images)
  const step = Math.max(1, Math.floor(data.length / 4 / 10000))

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Skip transparent pixels
    if (a < 128) continue

    pixels.push({ r, g, b })
  }

  // Simple k-means-like clustering
  return kMeansColors(pixels, numColors)
}

/**
 * Simple k-means clustering for color extraction
 */
function kMeansColors(pixels: RGB[], k: number, iterations: number = 10): RGB[] {
  if (pixels.length === 0) return []
  if (pixels.length <= k) return pixels

  // Initialize centroids with random pixels
  let centroids: RGB[] = []
  const usedIndices = new Set<number>()

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * pixels.length)
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx)
      centroids.push({ ...pixels[idx] })
    }
  }

  for (let iter = 0; iter < iterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters: RGB[][] = Array.from({ length: k }, () => [])

    for (const pixel of pixels) {
      let minDist = Infinity
      let nearestIdx = 0

      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(pixel, centroids[i])
        if (dist < minDist) {
          minDist = dist
          nearestIdx = i
        }
      }

      clusters[nearestIdx].push(pixel)
    }

    // Update centroids
    centroids = clusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i]

      const sum = cluster.reduce((acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }), {
        r: 0,
        g: 0,
        b: 0,
      })

      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length),
      }
    })
  }

  // Sort by frequency (cluster size) - approximate by distance from average
  return centroids.filter(c => c.r !== undefined)
}

/**
 * Calculate euclidean distance between two colors
 */
function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2))
}
