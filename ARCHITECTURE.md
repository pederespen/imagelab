# CanvasCraft Architecture

## Overview

CanvasCraft is a generative art application that creates Bauhaus-style compositions using HTML Canvas and exports them as high-resolution SVGs for printing.

## How Art Generation Works

### Core Architecture

**Shape-Based System**: All art is represented as an array of `Shape` objects that can be rendered on Canvas and converted to SVG.

```typescript
interface Shape {
  type: 'circle' | 'rect' | 'line' | 'triangle'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  color: string
  rotation?: number
  opacity?: number
}
```

### Composition Generator Pattern

All art styles extend the `CompositionGenerator` base class:

```typescript
abstract class CompositionGenerator {
  abstract generate(): Shape[]
  draw(ctx: CanvasRenderingContext2D): void
  toSVG(): string
}
```

**Key Methods:**

- `generate()` - Returns array of shapes (algorithmic composition)
- `draw()` - Renders shapes to canvas context
- `toSVG()` - Converts shapes to SVG string for export

### Creating New Art Styles

1. **Create generator file** in `src/lib/generators/`:

```typescript
export class MyStyleGenerator extends CompositionGenerator {
  generate(): Shape[] {
    const random = new SeededRandom(this.params.seed)
    const palette = COLOR_PALETTES[this.params.colorScheme]
    const shapes: Shape[] = []

    // Your algorithmic composition logic here
    // Use this.width, this.height, this.params

    return shapes
  }
}
```

2. **Add to types** in `src/types/canvas.ts`:

```typescript
export type CompositionStyle = 'my-style' | ...;
```

3. **Register in ArtCanvas** component:

```typescript
import { MyStyleGenerator } from '@/lib/generators/my-style';

// Add to switch statement
case 'my-style':
  generator = new MyStyleGenerator(actualWidth, actualHeight, parameters);
  break;
```

### Seeded Randomization

Use `SeededRandom` for reproducible results:

```typescript
const random = new SeededRandom(this.params.seed)

random.next() // 0-1
random.range(10, 50) // 10-50
random.int(0, 5) // 0-4
random.bool() // true/false
random.pick(array) // random element
random.shuffle(array) // shuffled copy
```

### Parameters

Each generator receives:

- `width`, `height` - Canvas dimensions in pixels (300 DPI)
- `params.seed` - Random seed for reproducibility
- `params.density` - 0-100 (controls element count)
- `params.complexity` - 0-100 (controls structural detail)
- `params.colorScheme` - Color palette selection

### Rendering Pipeline

1. **User adjusts parameters** → State update in `page.tsx`
2. **ArtCanvas component** creates appropriate generator
3. **Generator.generate()** produces shape array
4. **Generator.draw()** renders to canvas (displayed to user)
5. **Export button** calls `Generator.toSVG()` for download

### Canvas vs SVG

- **Canvas**: Fast real-time rendering, preview at scaled size
- **SVG**: Vector export at full resolution (300 DPI equivalent)

Both use the same `Shape[]` array, ensuring WYSIWYG exports.

### Current Art Styles

| Style                  | Description                                     | Key Technique              |
| ---------------------- | ----------------------------------------------- | -------------------------- |
| **Grid Poster**        | Mid-century modern tiles with segmented circles | Grid system + masking      |
| **Klee Mosaic**        | Colorful cell-based composition                 | Small rect grid + overlays |
| **Textile Pattern**    | Bauhaus weaving patterns                        | Stripes/blocks + overlays  |
| **Constructivist**     | Bold diagonal shapes                            | Rotated rects + dynamics   |
| **Geometric Shapes**   | Kandinsky-inspired                              | Focal points + balance     |
| **Layered Rectangles** | Mondrian grid                                   | Sparse fills + bold lines  |
| **Circle Study**       | Concentric circles                              | Golden ratio positioning   |

### Color Palettes

Defined in `src/types/canvas.ts`:

- `bauhaus-primary` - Red, blue, yellow, black, white
- `bauhaus-warm` - Reds, oranges, yellows
- `bauhaus-cool` - Blues, greens, grays
- `monochrome` - Black, white, grays
- `pastel-bauhaus` - Softer muted tones

### Best Practices

1. **Fill the canvas** - Avoid large empty spaces
2. **Use composition rules** - Golden ratio, rule of thirds
3. **Balance randomness** - Structure + variation
4. **Test at print size** - 300 DPI, A4/A3 dimensions
5. **Respect parameters** - Make density/complexity meaningful

### File Structure

```
src/
├── lib/
│   ├── composition.ts          # Base generator class
│   ├── random.ts              # Seeded random utilities
│   ├── utils.ts               # DPI conversion, helpers
│   └── generators/            # Art style implementations
│       ├── grid-poster.ts
│       ├── klee-inspired.ts
│       └── ...
├── components/
│   ├── ArtCanvas.tsx          # Canvas renderer
│   └── ControlPanel.tsx       # UI controls
└── types/
    └── canvas.ts              # TypeScript definitions
```

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to see the generator in action.
