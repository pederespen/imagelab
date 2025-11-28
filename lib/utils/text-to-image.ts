// AI Art Generator utilities and types

export interface ArtStyle {
  id: string
  name: string
  promptSuffix: string
  category: 'classic' | 'technique' | 'modern' | 'decorative'
}

// Prompt tips from Janus official demo:
// "Adding description like 'digital art' at the end of the prompt or
// writing the prompt in more detail can help produce better images!"
//
// Good example prompts from the model:
// - "A cute and adorable baby fox with big brown eyes, autumn leaves in the background enchanting, immortal, fluffy, shiny mane, Petals, fairyism, unreal engine 5 and Octane Render, highly detailed, photorealistic, cinematic, natural colors."
// - "A stunning princess from kabul in red, white traditional clothing, blue eyes, brown hair"
// - "Astronaut in a jungle, cold color palette, muted colors, detailed, 8k"

export const ART_STYLES: ArtStyle[] = [
  // Classic Art Movements
  {
    id: 'impressionist',
    name: 'Impressionist',
    promptSuffix:
      'impressionist painting style, soft visible brushstrokes, natural light, dreamy atmospheric quality, vibrant colors blending, Claude Monet inspired, fine art, museum quality',
    category: 'classic',
  },
  {
    id: 'cubist',
    name: 'Cubist',
    promptSuffix:
      'cubist art style, geometric abstract shapes, fragmented angular forms, multiple perspectives, bold outlines, Pablo Picasso inspired, avant-garde, artistic',
    category: 'classic',
  },
  {
    id: 'surrealist',
    name: 'Surrealist',
    promptSuffix:
      'surrealist art style, dreamlike impossible scene, melting distorted forms, mysterious ethereal atmosphere, Salvador Dalí inspired, imaginative, fantastical',
    category: 'classic',
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    promptSuffix:
      'pop art style, bold flat vibrant colors, Ben-Day dots halftone, high contrast, comic book aesthetic, Andy Warhol Roy Lichtenstein inspired, graphic design',
    category: 'classic',
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    promptSuffix:
      'art nouveau style, elegant flowing organic curves, ornate decorative patterns, natural floral motifs, Alphonse Mucha inspired, intricate details, beautiful',
    category: 'classic',
  },

  // Techniques
  {
    id: 'watercolor',
    name: 'Watercolor',
    promptSuffix:
      'beautiful watercolor painting, soft wet edges, transparent color washes, delicate brushwork, flowing pigments on paper, artistic traditional medium',
    category: 'technique',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    promptSuffix:
      'classical oil painting on canvas, rich impasto textures, visible expressive brushstrokes, warm color palette, museum masterpiece quality, fine art',
    category: 'technique',
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    promptSuffix:
      'detailed pencil sketch drawing, fine graphite shading, delicate cross-hatching, realistic rendering, paper texture, artist study, monochrome',
    category: 'technique',
  },

  // Modern/Digital
  {
    id: 'anime',
    name: 'Anime',
    promptSuffix:
      'anime art style, vibrant saturated colors, expressive big eyes, clean cel shading, Studio Ghibli Makoto Shinkai inspired, beautiful detailed',
    category: 'modern',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    promptSuffix:
      'pixel art style, 16-bit retro video game aesthetic, limited color palette, crisp pixels, nostalgic Nintendo SNES era, charming',
    category: 'modern',
  },
  {
    id: 'abstract',
    name: 'Abstract',
    promptSuffix:
      'abstract expressionist art, bold dynamic shapes, vivid expressive colors, emotional composition, Kandinsky Pollock inspired, modern art, creative',
    category: 'modern',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    promptSuffix:
      'minimalist art style, simple geometric forms, clean elegant lines, limited muted color palette, negative space, contemporary design, refined',
    category: 'modern',
  },

  // Decorative
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    promptSuffix:
      'stained glass window art style, bold black lead outlines, vibrant jewel-toned translucent colors, gothic cathedral aesthetic, luminous, decorative',
    category: 'decorative',
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    promptSuffix:
      'ancient mosaic tile art, small colorful tessera pieces, Byzantine Roman style, intricate geometric patterns, historical artifact, beautiful',
    category: 'decorative',
  },
]

// Build a detailed prompt optimized for the Janus model
// The model works best with detailed descriptions and quality terms
export function buildPrompt(subject: string, style: ArtStyle): string {
  const cleanSubject = subject.trim()
  // Format: subject description + style details + quality boosters
  return `${cleanSubject}, ${style.promptSuffix}, highly detailed, 8k, professional quality`
}

export function getStyleById(id: string): ArtStyle | undefined {
  return ART_STYLES.find(style => style.id === id)
}

export function getStylesByCategory(category: ArtStyle['category']): ArtStyle[] {
  return ART_STYLES.filter(style => style.category === category)
}

// WebGPU detection
export function isWebGPUSupported(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(navigator as any).gpu
}

// Model status types
export type ModelStatus = 'idle' | 'checking' | 'loading' | 'ready' | 'generating' | 'error'

export interface ProgressInfo {
  file: string
  loaded: number
  total: number
  progress: number
}

export interface GenerationResult {
  imageUrl: string
  generationTime: number
}
