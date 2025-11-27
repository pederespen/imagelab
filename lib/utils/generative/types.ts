// Shared types for generative art

export interface ColorPalette {
  name: string
  colors: string[]
  background: string
}

export interface ArtStyle {
  name: string
  description: string
}

export interface GenerativeSettings {
  gridSize: number
  palette: ColorPalette
  seed: number
  style: string
  complexity: number // 0-1, affects pattern variety vs solid blocks
}

export interface CanvasSize {
  name: string
  width: number
  height: number
}

// Seeded random number generator for reproducible results
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

export type TileDrawer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  colors: string[],
  rng: SeededRandom,
  complexity?: number
) => void

// Solid block pattern - shared across all styles
export const solidBlock: TileDrawer = (ctx, x, y, size, colors, rng) => {
  ctx.fillStyle = rng.pick(colors)
  ctx.fillRect(x, y, size, size)
}
