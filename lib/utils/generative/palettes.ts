import { ColorPalette, CanvasSize, ArtStyle } from './types'

export const PALETTES: ColorPalette[] = [
  {
    name: 'Bauhaus Classic',
    colors: ['#E53935', '#FDD835', '#1E88E5', '#212121', '#F5F5DC'],
    background: '#F5F5DC',
  },
  {
    name: 'Warm Earth',
    colors: ['#D84315', '#F4A261', '#2A9D8F', '#264653', '#E9C46A'],
    background: '#FAF3E0',
  },
  {
    name: 'Cool Ocean',
    colors: ['#003F5C', '#58508D', '#BC5090', '#FF6361', '#FFA600'],
    background: '#F0F4F8',
  },
  {
    name: 'Forest',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332'],
    background: '#F1FAEE',
  },
  {
    name: 'Sunset',
    colors: ['#FF6B6B', '#FEC89A', '#FFD93D', '#6BCB77', '#4D96FF'],
    background: '#FFF8E7',
  },
  {
    name: 'Monochrome',
    colors: ['#1A1A1A', '#4A4A4A', '#7A7A7A', '#AAAAAA', '#DADADA'],
    background: '#F5F5F5',
  },
  {
    name: 'Retro Pop',
    colors: ['#E63946', '#F4A261', '#2A9D8F', '#457B9D', '#1D3557'],
    background: '#F1FAEE',
  },
  {
    name: 'Nordic',
    colors: ['#5E81AC', '#81A1C1', '#88C0D0', '#8FBCBB', '#2E3440'],
    background: '#ECEFF4',
  },
]

export const CANVAS_SIZES: CanvasSize[] = [
  { name: 'Phone (1080×1920)', width: 1080, height: 1920 },
  { name: 'Phone Landscape (1920×1080)', width: 1920, height: 1080 },
  { name: 'Desktop (1920×1080)', width: 1920, height: 1080 },
  { name: 'Desktop 4K (3840×2160)', width: 3840, height: 2160 },
  { name: 'Square (1080×1080)', width: 1080, height: 1080 },
  { name: 'Square Large (2048×2048)', width: 2048, height: 2048 },
  { name: 'Poster A4 (2480×3508)', width: 2480, height: 3508 },
  { name: 'Poster A3 (3508×4961)', width: 3508, height: 4961 },
]

export const ART_STYLES: ArtStyle[] = [
  { name: 'Quarter Circles', description: 'Flowing arcs and curves' },
  { name: 'Concentric', description: 'Layered circular patterns' },
  { name: 'Shadow Blocks', description: 'Squares with geometric shadows' },
  { name: 'Mondrian', description: 'Rectangular grid divisions' },
  { name: 'Diamonds', description: 'Rotated squares and triangles' },
  { name: 'Circles', description: 'Overlapping circular forms' },
]
