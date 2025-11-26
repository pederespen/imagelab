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
  // Future styles will be added here:
  // {
  //   id: 'art-deco',
  //   name: 'Art Deco',
  //   description: 'Elegant patterns with fans, sunbursts and gold accents',
  //   previewColors: ['#D4AF37', '#1C1C1C', '#F5F5DC', '#8B4513'],
  // },
  // {
  //   id: 'memphis',
  //   name: 'Memphis',
  //   description: 'Bold 80s style with squiggles, dots and clashing colors',
  //   previewColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
  // },
]
