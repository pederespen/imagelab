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
  {
    id: 'terrain',
    name: 'Terrain',
    description: 'Smooth wavy mountain silhouettes with gradient depth',
    previewColors: ['#FFA07A', '#E85D4C', '#C74B50', '#8B3A62', '#4A235A'],
  },
  {
    id: 'contour',
    name: 'Contour',
    description: 'Topographic-style contour lines and elevation maps',
    previewColors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
  },
  {
    id: 'flowfield',
    name: 'Flow Fields',
    description: 'Organic particle trails following vector noise fields',
    previewColors: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#0F172A'],
  },
  {
    id: 'voronoi',
    name: 'Voronoi',
    description: 'Cellular patterns with organic, crystalline regions',
    previewColors: ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#1E293B'],
  },
  {
    id: 'tessellation',
    name: 'Tessellations',
    description: 'Geometric repeating patterns like Islamic stars and tiles',
    previewColors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#FFFFFF'],
  },
  {
    id: 'gradient',
    name: 'Gradient Mesh',
    description: 'Smooth flowing color gradients with organic blending',
    previewColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD'],
  },
]
