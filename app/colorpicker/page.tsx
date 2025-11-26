import ColorPicker from '@/components/tools/ColorPicker'

export default function ColorPickerPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="h-full max-w-7xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Color Picker</h1>
        <div className="flex-1 min-h-0">
          <ColorPicker />
        </div>
      </div>
    </div>
  )
}
