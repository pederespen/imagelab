import AiArtGenerator from '@/components/tools/AiArtGenerator'

export default function AiArtPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="h-full max-w-7xl mx-auto p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">AI Art Generator</h1>
        <div className="flex-1 min-h-0">
          <AiArtGenerator />
        </div>
      </div>
    </div>
  )
}
