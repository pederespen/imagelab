// Simple SVG icons for each tool on the landing page

export function AsciiIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Grid pattern representing ASCII characters */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="8"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
      />
      <text
        x="50"
        y="35"
        fontSize="16"
        fontFamily="monospace"
        textAnchor="middle"
        className="fill-current"
      >
        @#$
      </text>
      <text
        x="50"
        y="55"
        fontSize="16"
        fontFamily="monospace"
        textAnchor="middle"
        className="fill-current"
      >
        %&*
      </text>
      <text
        x="50"
        y="75"
        fontSize="16"
        fontFamily="monospace"
        textAnchor="middle"
        className="fill-current"
      >
        +=-
      </text>
    </svg>
  )
}

export function MemeIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Image frame with text bars */}
      <rect x="10" y="10" width="80" height="80" rx="8" className="fill-current opacity-20" />
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="8"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
      />

      {/* Top text bar */}
      <rect x="15" y="15" width="70" height="12" rx="2" className="fill-current" />

      {/* Bottom text bar */}
      <rect x="15" y="73" width="70" height="12" rx="2" className="fill-current" />

      {/* Emoji-like face */}
      <circle cx="38" cy="45" r="4" className="fill-current" />
      <circle cx="62" cy="45" r="4" className="fill-current" />
      <path
        d="M 35 58 Q 50 68 65 58"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ColorPickerIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Eyedropper tool */}
      <path d="M 65 20 L 80 35 L 75 40 L 60 25 Z" className="fill-current" />
      <path
        d="M 60 25 L 25 60 L 20 80 L 40 75 L 75 40 Z"
        className="stroke-current fill-current opacity-20"
        strokeWidth="2"
      />

      {/* Color swatches at bottom */}
      <circle cx="30" cy="85" r="6" fill="#FF6B6B" />
      <circle cx="50" cy="85" r="6" fill="#4ECDC4" />
      <circle cx="70" cy="85" r="6" fill="#FFD93D" />
    </svg>
  )
}

export function PixelatorIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Pixelated design - grid of squares */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="8"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
      />

      {/* Pixel grid pattern */}
      <rect x="20" y="20" width="12" height="12" className="fill-current opacity-80" />
      <rect x="36" y="20" width="12" height="12" className="fill-current opacity-40" />
      <rect x="52" y="20" width="12" height="12" className="fill-current opacity-60" />
      <rect x="68" y="20" width="12" height="12" className="fill-current opacity-30" />

      <rect x="20" y="36" width="12" height="12" className="fill-current opacity-50" />
      <rect x="36" y="36" width="12" height="12" className="fill-current opacity-90" />
      <rect x="52" y="36" width="12" height="12" className="fill-current opacity-70" />
      <rect x="68" y="36" width="12" height="12" className="fill-current opacity-40" />

      <rect x="20" y="52" width="12" height="12" className="fill-current opacity-60" />
      <rect x="36" y="52" width="12" height="12" className="fill-current opacity-80" />
      <rect x="52" y="52" width="12" height="12" className="fill-current opacity-90" />
      <rect x="68" y="52" width="12" height="12" className="fill-current opacity-50" />

      <rect x="20" y="68" width="12" height="12" className="fill-current opacity-30" />
      <rect x="36" y="68" width="12" height="12" className="fill-current opacity-50" />
      <rect x="52" y="68" width="12" height="12" className="fill-current opacity-40" />
      <rect x="68" y="68" width="12" height="12" className="fill-current opacity-70" />
    </svg>
  )
}

export function GenerativeArtIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Geometric Bauhaus-inspired design */}
      <circle cx="30" cy="30" r="18" className="stroke-current" strokeWidth="3" fill="none" />
      <rect x="52" y="12" width="36" height="36" className="fill-current opacity-20" />
      <rect
        x="52"
        y="12"
        width="36"
        height="36"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
      />

      <circle cx="70" cy="70" r="18" className="fill-current opacity-30" />
      <circle cx="70" cy="70" r="18" className="stroke-current" strokeWidth="3" fill="none" />

      <path d="M 12 52 L 30 88 L 48 52 Z" className="fill-current opacity-20" />
      <path d="M 12 52 L 30 88 L 48 52 Z" className="stroke-current" strokeWidth="3" fill="none" />
    </svg>
  )
}

export function TextToImageIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* AI sparkle/magic wand concept */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="8"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
      />

      {/* Central star/sparkle */}
      <path
        d="M 50 25 L 53 42 L 70 45 L 53 48 L 50 65 L 47 48 L 30 45 L 47 42 Z"
        className="fill-current"
      />

      {/* Small sparkles around */}
      <circle cx="35" cy="30" r="2" className="fill-current" />
      <circle cx="65" cy="30" r="2" className="fill-current" />
      <circle cx="35" cy="60" r="2" className="fill-current" />
      <circle cx="65" cy="60" r="2" className="fill-current" />

      {/* AI wave pattern at bottom */}
      <path
        d="M 20 75 Q 30 70 40 75 T 60 75 T 80 75"
        className="stroke-current"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}
