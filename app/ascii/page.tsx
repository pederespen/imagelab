import AsciiConverter from '@/components/tools/AsciiConverter'

export default function AsciiPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Image to ASCII</h1>
        <p className="text-slate-600 mb-6">
          Convert images into ASCII art using block characters for consistent rendering across
          platforms.
        </p>
        <AsciiConverter />
      </div>
    </div>
  )
}
