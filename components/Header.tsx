'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-card-border/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-muted-foreground transition-colors">
              ImageLab
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/bauhaus"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Bauhaus
            </Link>
            <Link
              href="/ascii"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ASCII
            </Link>
            <Link
              href="/meme"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Meme
            </Link>

            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-muted-foreground"
                >
                  <path
                    d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-muted-foreground"
                >
                  <path
                    d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
