'use client'

import { Plus } from 'lucide-react'
import ColorPickerPopover from './ColorPickerPopover'

interface ColorPaletteEditorProps {
  colors: string[]
  background: string
  onColorsChange: (colors: string[]) => void
  onBackgroundChange: (color: string) => void
}

const MIN_COLORS = 2
const MAX_COLORS = 8

export default function ColorPaletteEditor({
  colors,
  background,
  onColorsChange,
  onBackgroundChange,
}: ColorPaletteEditorProps) {
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors]
    newColors[index] = newColor
    onColorsChange(newColors)
  }

  const handleRemoveColor = (index: number) => {
    if (colors.length <= MIN_COLORS) return
    const newColors = colors.filter((_, i) => i !== index)
    onColorsChange(newColors)
  }

  const handleAddColor = () => {
    if (colors.length >= MAX_COLORS) return
    // Generate a random color
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`
    onColorsChange([...colors, randomColor])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Pattern Colors */}
        {colors.map((color, i) => (
          <ColorPickerPopover
            key={i}
            color={color}
            onChange={newColor => handleColorChange(i, newColor)}
            onDelete={() => handleRemoveColor(i)}
            canDelete={colors.length > MIN_COLORS}
          />
        ))}

        {/* Add color button */}
        {colors.length < MAX_COLORS && (
          <button
            onClick={handleAddColor}
            className="w-7 h-7 rounded border border-dashed border-border hover:border-foreground/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            title="Add color"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Background Color */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">BG</span>
          <ColorPickerPopover color={background} onChange={onBackgroundChange} canDelete={false} />
        </div>
      </div>
    </div>
  )
}
