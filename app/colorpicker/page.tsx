import ColorPicker from '@/components/tools/ColorPicker'

export default function ColorPickerPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-3">Color Picker</h1>
        <p className="text-muted-foreground mb-6">
          Upload an image and click anywhere to extract colors in multiple formats
        </p>
        <ColorPicker />
      </div>
    </div>
  )
}
