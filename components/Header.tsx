import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
              ImageLab
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/bauhaus"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Bauhaus
            </Link>
            <Link
              href="/ascii"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ASCII
            </Link>
            <Link
              href="/meme"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Meme
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
