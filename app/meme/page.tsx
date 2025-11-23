import MemeGenerator from '@/components/tools/MemeGenerator'

export default function MemePage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-3">Meme Generator</h1>
        <MemeGenerator />
      </div>
    </div>
  )
}
