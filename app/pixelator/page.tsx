import Pixelator from '@/components/tools/Pixelator'

export const metadata = {
  title: 'Pixelator - ImageLab',
  description: 'Convert images to pixel art with adjustable pixel size',
}

export default function PixelatorPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="h-full max-w-7xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Pixelator</h1>
        <div className="flex-1 min-h-0">
          <Pixelator />
        </div>
      </div>
    </div>
  )
}
