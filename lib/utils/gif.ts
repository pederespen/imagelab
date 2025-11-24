import { parseGIF, decompressFrames } from 'gifuct-js'
import { imageToAscii, type AsciiOptions } from './ascii'
import { getAssetPath } from './assets'

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

  // Create persistent canvas for frame composition
  const compositeCanvas = document.createElement('canvas')
  compositeCanvas.width = fullWidth
  compositeCanvas.height = fullHeight
  const compositeCtx = compositeCanvas.getContext('2d', { willReadFrequently: true })

  if (!compositeCtx) throw new Error('Could not get canvas context')

  // Set background from GIF global color table if available
  if (gif.lsd.gct && gif.lsd.backgroundColorIndex !== undefined) {
    const gct = gif.lsd.gct as unknown as number[]
    const bgColorIndex = gif.lsd.backgroundColorIndex * 3
    const r = gct[bgColorIndex]
    const g = gct[bgColorIndex + 1]
    const b = gct[bgColorIndex + 2]
    compositeCtx.fillStyle = `rgb(${r},${g},${b})`
    compositeCtx.fillRect(0, 0, fullWidth, fullHeight)
  }

  return frames.map(
    (frame: {
      dims: { left: number; top: number; width: number; height: number }
      patch: Uint8ClampedArray
      delay: number
      disposalType: number
    }) => {
      const { dims, patch, delay, disposalType } = frame

      // Create ImageData from the frame patch
      const patchImageData = new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height)

      // Create temporary canvas for the patch
      const patchCanvas = document.createElement('canvas')
      patchCanvas.width = dims.width
      patchCanvas.height = dims.height
      const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true })

      if (!patchCtx) throw new Error('Could not get patch canvas context')

      patchCtx.putImageData(patchImageData, 0, 0)

      // Composite the patch onto the main canvas at the correct position
      compositeCtx.drawImage(patchCanvas, dims.left, dims.top)

      // Get the current composite frame
      const imageData = compositeCtx.getImageData(0, 0, fullWidth, fullHeight)

      // Handle disposal method for next frame
      // disposalType: 0 = no disposal, 1 = do not dispose, 2 = restore to background, 3 = restore to previous
      if (disposalType === 2) {
        // Restore to background color
        if (gif.lsd.gct && gif.lsd.backgroundColorIndex !== undefined) {
          const gct = gif.lsd.gct as unknown as number[]
          const bgColorIndex = gif.lsd.backgroundColorIndex * 3
          const r = gct[bgColorIndex]
          const g = gct[bgColorIndex + 1]
          const b = gct[bgColorIndex + 2]
          compositeCtx.fillStyle = `rgb(${r},${g},${b})`
        } else {
          compositeCtx.fillStyle = 'transparent'
        }
        compositeCtx.fillRect(dims.left, dims.top, dims.width, dims.height)
      } else if (disposalType === 3) {
        // Restore to previous - this would need frame caching, skip for now
        // Most GIFs don't use this disposal method
      }
      // disposalType 0 or 1: keep the frame, do nothing

      return {
        imageData,
        delay: delay || 100, // Default 100ms if no delay specified
      }
    }
  )
}

/**
 * Create an animated GIF preview from frames
 */
export function createGifPreview(_frames: GifFrame[]): string {
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
  console.log('[generateAsciiGif] Starting with', frames.length, 'frames')
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[generateAsciiGif] Importing gif.js.optimized')
      // Dynamic import to avoid SSR issues
      const GIF = (await import('gif.js.optimized')).default
      console.log('[generateAsciiGif] GIF library loaded:', typeof GIF)

      // Convert first frame to get dimensions
      console.log('[generateAsciiGif] Converting first frame to ASCII for dimensions')
      const firstAscii = imageToAscii(frames[0].imageData, options)
      const lines = firstAscii.split('\n').filter(line => line.length > 0)
      const maxLineLength = Math.max(...lines.map(line => line.length))

      // Calculate dimensions
      const fontSize = 8
      const charWidth = fontSize * 0.6
      const lineHeight = fontSize * 1.2
      const width = Math.ceil(charWidth * maxLineLength) + 20
      const height = Math.ceil(lineHeight * lines.length) + 20
      console.log('[generateAsciiGif] GIF dimensions:', width, 'x', height)

      // Initialize GIF encoder
      console.log('[generateAsciiGif] Initializing GIF encoder')
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: getAssetPath('/gif.worker.js'),
      })
      console.log(
        '[generateAsciiGif] GIF encoder created, worker script:',
        getAssetPath('/gif.worker.js')
      )

      // Convert each frame to ASCII and add to GIF
      console.log('[generateAsciiGif] Starting frame conversion loop')
      frames.forEach((frame, index) => {
        if (index % 10 === 0) {
          console.log(`[generateAsciiGif] Processing frame ${index}/${frames.length}`)
        }
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
      console.log('[generateAsciiGif] All frames added to GIF encoder')

      gif.on('progress', (progress: number) => {
        console.log('[generateAsciiGif] Encoding progress:', (progress * 100).toFixed(1) + '%')
        if (onProgress) {
          onProgress(0.8 + progress * 0.2) // Last 20% for encoding
        }
      })

      gif.on('finished', (blob: Blob) => {
        console.log('[generateAsciiGif] GIF encoding finished! Blob size:', blob.size, 'bytes')
        resolve(blob)
      })

      console.log('[generateAsciiGif] Starting GIF render')
      gif.render()
      console.log('[generateAsciiGif] Render called, waiting for encoding to complete')
    } catch (error) {
      console.error('[generateAsciiGif] Error:', error)
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
