import { TextLayer } from '@/lib/types/meme'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  isSelected: boolean = false
) {
  ctx.save()

  // Translate to text position and rotate
  ctx.translate(layer.x, layer.y)
  ctx.rotate((layer.rotation * Math.PI) / 180)

  // Set text properties
  ctx.font = `${layer.fontSize}px ${layer.fontFamily}`
  ctx.textAlign = layer.textAlign
  ctx.textBaseline = 'middle'
  ctx.fillStyle = layer.color

  // Draw stroke
  if (layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.strokeColor
    ctx.lineWidth = layer.strokeWidth
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2

    // Draw text with stroke
    const lines = layer.text.split('\n')
    lines.forEach((line, index) => {
      const yOffset = (index - (lines.length - 1) / 2) * layer.fontSize * 1.2
      ctx.strokeText(line, 0, yOffset, layer.maxWidth)
    })
  }

  // Draw fill
  const lines = layer.text.split('\n')
  lines.forEach((line, index) => {
    const yOffset = (index - (lines.length - 1) / 2) * layer.fontSize * 1.2
    ctx.fillText(line, 0, yOffset, layer.maxWidth)
  })

  ctx.restore()

  // Draw selection box
  if (isSelected) {
    ctx.save()

    // Measure all lines to get proper dimensions
    ctx.font = `${layer.fontSize}px ${layer.fontFamily}`
    ctx.textAlign = layer.textAlign
    ctx.textBaseline = 'middle'

    const lines = layer.text.split('\n')
    const lineHeight = layer.fontSize * 1.2
    let maxWidth = 0

    lines.forEach(line => {
      const metrics = ctx.measureText(line)
      maxWidth = Math.max(maxWidth, metrics.width)
    })

    const textWidth = maxWidth
    const textHeight = lines.length * lineHeight

    // Add stroke width to dimensions
    const extraPadding = layer.strokeWidth

    ctx.translate(layer.x, layer.y)
    ctx.rotate((layer.rotation * Math.PI) / 180)

    const padding = 4 + extraPadding
    let x = -textWidth / 2 - padding
    if (layer.textAlign === 'left') x = -padding
    if (layer.textAlign === 'right') x = -textWidth - padding

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, -textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2)
    ctx.restore()
  }
}

export function isPointInTextLayer(
  x: number,
  y: number,
  layer: TextLayer,
  ctx: CanvasRenderingContext2D
): boolean {
  ctx.save()
  ctx.font = `${layer.fontSize}px ${layer.fontFamily}`
  ctx.textAlign = layer.textAlign

  // Split text into lines and measure all of them
  const lines = layer.text.split('\n')
  const lineHeight = layer.fontSize * 1.2
  let maxWidth = 0

  lines.forEach(line => {
    const metrics = ctx.measureText(line)
    maxWidth = Math.max(maxWidth, metrics.width)
  })

  const textWidth = maxWidth
  const textHeight = lines.length * lineHeight

  // Transform point to text's local space
  const dx = x - layer.x
  const dy = y - layer.y
  const angle = (-layer.rotation * Math.PI) / 180
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle)

  // Add stroke width and padding to hitbox
  const extraPadding = layer.strokeWidth
  const padding = 4 + extraPadding

  let left = -textWidth / 2 - padding
  if (layer.textAlign === 'left') left = -padding
  if (layer.textAlign === 'right') left = -textWidth - padding

  const right = left + textWidth + padding * 2
  const top = -textHeight / 2 - padding
  const bottom = top + textHeight + padding * 2

  ctx.restore()

  return localX >= left && localX <= right && localY >= top && localY <= bottom
}

export async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function getImageBounds(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height)
  const width = image.width * scale
  const height = image.height * scale
  const x = (canvas.width - width) / 2
  const y = (canvas.height - height) / 2
  return { x, y, width, height }
}

export function createCroppedCanvas(
  sourceCanvas: HTMLCanvasElement,
  image: HTMLImageElement
): HTMLCanvasElement {
  const bounds = getImageBounds(sourceCanvas, image)
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = bounds.width
  croppedCanvas.height = bounds.height

  const ctx = croppedCanvas.getContext('2d')
  if (!ctx) return croppedCanvas

  // Copy the image area from source canvas
  ctx.drawImage(
    sourceCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height
  )

  return croppedCanvas
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'meme.png') {
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (!blob) {
        reject(new Error('Failed to create blob'))
        return
      }

      try {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}
