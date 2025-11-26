import GenerativeArt from '@/components/tools/GenerativeArt'

export const metadata = {
  title: 'Generative Art - ImageLab',
  description: 'Create Bauhaus-inspired geometric art with customizable palettes',
}

export default function GenerativePage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="h-full max-w-7xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Generative Art</h1>
        <div className="flex-1 min-h-0">
          <GenerativeArt />
        </div>
      </div>
    </div>
  )
}
