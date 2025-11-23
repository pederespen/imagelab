import AsciiConverter from '@/components/tools/AsciiConverter'

export default function AsciiPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Image to ASCII</h1>
        <AsciiConverter />
      </div>
    </div>
  )
}
