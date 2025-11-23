import { parseGIF, decompressFrames } from 'gifuct-js'
import GIF from 'gif.js.optimized'
import { imageToAscii, type AsciiOptions } from './ascii'

export interface GifFrame {
  imageData: ImageData
  delay: number
}

/**
 * Check if a file is a GIF
 */
export function isGif(file: File): boolean {
  return file.type === 'image/gif'
}

/**
 * Parse GIF file and extract all frames with their delays
 */
export async function parseGifFrames(file: File): Promise<GifFrame[]> {
  const arrayBuffer = await file.arrayBuffer()
  const gif = parseGIF(arrayBuffer)
  const frames = decompressFrames(gif, true)

  // Get the full GIF dimensions (logical screen size)
  const fullWidth = gif.lsd.width
  const fullHeight = gif.lsd.height

  return frames.map((frame: any) => {
    const { dims, patch, delay } = frame

    // Create a full-size canvas
    const canvas = document.createElement('canvas')
    canvas.width = fullWidth
    canvas.height = fullHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) throw new Error('Could not get canvas context')

    // Fill with transparent background
    ctx.clearRect(0, 0, fullWidth, fullHeight)

    // Create ImageData from the frame patch
    const patchImageData = new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height)

    // Draw the patch at its offset position
    ctx.putImageData(patchImageData, dims.left, dims.top)

    // Get the full-size image data
    const imageData = ctx.getImageData(0, 0, fullWidth, fullHeight)

    return {
      imageData,
      delay: delay || 100, // Default 100ms if no delay specified
    }
  })
}

/**
 * Create an animated GIF preview from frames
 */
export function createGifPreview(frames: GifFrame[]): string {
  // For preview, we'll use the original file's blob URL
  // This function is kept for potential future use
  return ''
}

/**
 * Convert ASCII text to canvas ImageData
 */
function asciiToImageData(
  asciiText: string,
  fontSize: number,
  backgroundColor: string = '#ffffff',
  textColor: string = '#000000'
): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Could not get canvas context')

  // Set up font
  ctx.font = `${fontSize}px monospace`

  // Split into lines
  const lines = asciiText.split('\n').filter(line => line.length > 0)
  const maxLineLength = Math.max(...lines.map(line => line.length))

  // Calculate canvas size
  const charWidth = ctx.measureText('M').width
  const lineHeight = fontSize * 1.2

  canvas.width = Math.ceil(charWidth * maxLineLength) + 20
  canvas.height = Math.ceil(lineHeight * lines.length) + 20

  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw text
  ctx.fillStyle = textColor
  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'

  lines.forEach((line, i) => {
    ctx.fillText(line, 10, 10 + i * lineHeight)
  })

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Generate an animated ASCII GIF from frames
 */
export async function generateAsciiGif(
  frames: GifFrame[],
  options: AsciiOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Convert first frame to get dimensions
      const firstAscii = imageToAscii(frames[0].imageData, options)
      const lines = firstAscii.split('\n').filter(line => line.length > 0)
      const maxLineLength = Math.max(...lines.map(line => line.length))

      // Calculate dimensions
      const fontSize = 8
      const charWidth = fontSize * 0.6
      const lineHeight = fontSize * 1.2
      const width = Math.ceil(charWidth * maxLineLength) + 20
      const height = Math.ceil(lineHeight * lines.length) + 20

      // Initialize GIF encoder
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js', // We'll need to add this to public
      })

      // Convert each frame to ASCII and add to GIF
      frames.forEach((frame, index) => {
        const asciiText = imageToAscii(frame.imageData, options)
        const imageData = asciiToImageData(asciiText, fontSize)

        // Create canvas for this frame
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('Could not get canvas context')

        ctx.putImageData(imageData, 0, 0)

        gif.addFrame(canvas, { delay: frame.delay })

        if (onProgress) {
          onProgress(((index + 1) / frames.length) * 0.8) // 80% progress for frame conversion
        }
      })

      gif.on('progress', (progress: number) => {
        if (onProgress) {
          onProgress(0.8 + progress * 0.2) // Last 20% for encoding
        }
      })

      gif.on('finished', (blob: Blob) => {
        resolve(blob)
      })

      gif.render()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Load GIF and return first frame for preview
 */
export async function getGifFirstFrame(file: File): Promise<ImageData> {
  const frames = await parseGifFrames(file)
  if (frames.length === 0) {
    throw new Error('GIF has no frames')
  }
  return frames[0].imageData
}
