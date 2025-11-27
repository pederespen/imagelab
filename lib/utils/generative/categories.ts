// Art style categories for the generative art tool
// Each category can have its own patterns and settings

export interface StyleCategory {
  id: string
  name: string
  description: string
  // Preview colors for the card thumbnail
  previewColors: string[]
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  {
    id: 'bauhaus',
    name: 'Bauhaus',
    description: 'Geometric shapes inspired by the 1920s design movement',
    previewColors: ['#E53935', '#FDD835', '#1E88E5', '#212121'],
  },
  {
    id: 'truchet',
    name: 'Truchet',
    description: 'Interlocking curved tiles creating flowing maze patterns',
    previewColors: ['#2D3436', '#DFE6E9', '#0984E3', '#74B9FF'],
  },
]
