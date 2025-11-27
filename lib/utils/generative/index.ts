// Generative art - main entry point

export * from './types'
export * from './palettes'
export * from './categories'
import { SeededRandom, solidBlock, GenerativeSettings } from './types'
import {
  STYLE_PATTERNS,
  quarterCirclePatterns,
  generateTerrain,
  TERRAIN_STYLES,
  generateContour,
  CONTOUR_STYLES,
  generateFlowField,
  FLOW_FIELD_STYLES,
} from './styles'

// Styles that should always fill every tile (no solid block gaps)
const CONTINUOUS_STYLES = [
  'Truchet',
  'Curved Pipes',
  'Outlined Pipes',
  'Diagonal Lines',
  'Triangles',
]

export function generateArt(canvas: HTMLCanvasElement, settings: GenerativeSettings): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { gridSize, palette, seed, style, complexity } = settings

  // Check if this is a terrain-style pattern (non-tile-based)
  if (TERRAIN_STYLES.includes(style)) {
    // Map style name to variant
    const variantMap: Record<
      string,
      'mountains' | 'mountains-no-sun' | 'dunes' | 'waves' | 'peaks' | 'aurora' | 'reflection'
    > = {
      Mountains: 'mountains',
      'Mountains (No Sun)': 'mountains-no-sun',
      Dunes: 'dunes',
      Waves: 'waves',
      Peaks: 'peaks',
      Aurora: 'aurora',
      Reflection: 'reflection',
    }

    generateTerrain({
      canvas,
      ctx,
      colors: palette.colors,
      background: palette.background,
      seed,
      complexity,
      variant: variantMap[style] || 'mountains',
    })
    return
  }

  // Check if this is a contour-style pattern (non-tile-based)
  if (CONTOUR_STYLES.includes(style)) {
    const variantMap: Record<
      string,
      'topographic' | 'elevation' | 'islands' | 'ridges' | 'thermal' | 'sound-waves' | 'magnetic'
    > = {
      Topographic: 'topographic',
      Elevation: 'elevation',
      Islands: 'islands',
      Ridges: 'ridges',
      Thermal: 'thermal',
      'Sound Waves': 'sound-waves',
      Magnetic: 'magnetic',
    }

    generateContour(ctx, canvas.width, canvas.height, {
      ...settings,
      variant: variantMap[style] || 'topographic',
    })
    return
  }

  // Check if this is a flow field style (non-tile-based)
  if (FLOW_FIELD_STYLES.includes(style)) {
    const variantMap: Record<
      string,
      'streamlines' | 'particle-trails' | 'curl' | 'spiral' | 'converge' | 'turbulent'
    > = {
      Streamlines: 'streamlines',
      'Particle Trails': 'particle-trails',
      'Curl Noise': 'curl',
      Spiral: 'spiral',
      Converge: 'converge',
      Turbulent: 'turbulent',
    }

    generateFlowField(ctx, canvas.width, canvas.height, {
      ...settings,
      variant: variantMap[style] || 'streamlines',
    })
    return
  }

  // Tile-based rendering for other styles
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

  // Check if this style should always draw patterns (no gaps)
  const isContinuous = CONTINUOUS_STYLES.includes(style)

  // For continuous styles, use complexity to control line thickness or other properties
  // For other styles, use complexity to control pattern density

  // Draw tiles
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize
      const y = row * cellSize

      if (isContinuous) {
        // Always draw a pattern for continuous styles
        const pattern = rng.pick(stylePatterns)
        pattern(ctx, x, y, cellSize, palette.colors, rng, complexity)
      } else {
        // Use complexity to determine if we draw a pattern or solid block
        if (rng.next() < complexity) {
          const pattern = rng.pick(stylePatterns)
          pattern(ctx, x, y, cellSize, palette.colors, rng, complexity)
        } else {
          solidBlock(ctx, x, y, cellSize, palette.colors, rng)
        }
      }
    }
  }
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000)
}
