import AsciiConverter from '@/components/tools/AsciiConverter'

export default function AsciiPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Image to ASCII</h1>
        <p className="text-muted-foreground mb-6">
          Convert images into ASCII art using block characters for consistent rendering across
          platforms.
        </p>
        <AsciiConverter />
      </div>
    </div>
  )
}
