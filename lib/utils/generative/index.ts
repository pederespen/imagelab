// Generative art - main entry point

export * from './types'
export * from './palettes'
export * from './categories'
import { SeededRandom, solidBlock, GenerativeSettings, TileDrawer } from './types'
import { STYLE_PATTERNS, quarterCirclePatterns } from './styles'

export function generateArt(canvas: HTMLCanvasElement, settings: GenerativeSettings): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { gridSize, palette, seed, style, complexity } = settings
  const rng = new SeededRandom(seed)

  // Calculate cell size based on canvas dimensions and grid
  const cellSize = Math.max(canvas.width, canvas.height) / gridSize
  const cols = Math.ceil(canvas.width / cellSize)
  const rows = Math.ceil(canvas.height / cellSize)

  // Fill background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Get patterns for selected style
  const stylePatterns = STYLE_PATTERNS[style] || quarterCirclePatterns

  // Draw tiles with complexity-based pattern selection
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize
      const y = row * cellSize

      // Use complexity to determine if we draw a pattern or solid block
      // Higher complexity = more patterns, lower = more solid blocks
      if (rng.next() < complexity) {
        // Draw a pattern
        const pattern = rng.pick(stylePatterns)
        pattern(ctx, x, y, cellSize, palette.colors, rng)
      } else {
        // Draw a solid block for breathing room
        solidBlock(ctx, x, y, cellSize, palette.colors, rng)
      }
    }
  }
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000)
}
