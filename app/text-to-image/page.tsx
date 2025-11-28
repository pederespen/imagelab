import TextToImageGenerator from '@/components/tools/TextToImageGenerator'

export default function TextToImagePage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="h-full max-w-7xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Text-to-Image Generator</h1>
        <div className="flex-1 min-h-0">
          <TextToImageGenerator />
        </div>
      </div>
    </div>
  )
}
