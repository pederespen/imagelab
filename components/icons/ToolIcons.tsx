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
      <text x="50" y="35" fontSize="16" fontFamily="monospace" textAnchor="middle" fill="#00ff00">
        @#$
      </text>
      <text x="50" y="55" fontSize="16" fontFamily="monospace" textAnchor="middle" fill="#00ff00">
        %&*
      </text>
      <text x="50" y="75" fontSize="16" fontFamily="monospace" textAnchor="middle" fill="#00ff00">
        +=-
      </text>
    </svg>
  )
}

export function MemeIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Image frame with text bars */}
      <rect x="10" y="10" width="80" height="80" rx="8" fill="#667eea" fillOpacity="0.2" />
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
      <rect x="15" y="15" width="70" height="12" rx="2" fill="#ffffff" />

      {/* Bottom text bar */}
      <rect x="15" y="73" width="70" height="12" rx="2" fill="#ffffff" />

      {/* Emoji-like face */}
      <circle cx="38" cy="45" r="4" fill="#FFD93D" />
      <circle cx="62" cy="45" r="4" fill="#FFD93D" />
      <path
        d="M 35 58 Q 50 68 65 58"
        stroke="#FFD93D"
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

      {/* Pixel grid pattern with colors */}
      <rect x="20" y="20" width="12" height="12" fill="#FF6B6B" />
      <rect x="36" y="20" width="12" height="12" fill="#4ECDC4" />
      <rect x="52" y="20" width="12" height="12" fill="#45B7D1" />
      <rect x="68" y="20" width="12" height="12" fill="#FFA07A" />

      <rect x="20" y="36" width="12" height="12" fill="#98D8C8" />
      <rect x="36" y="36" width="12" height="12" fill="#F7DC6F" />
      <rect x="52" y="36" width="12" height="12" fill="#BB8FCE" />
      <rect x="68" y="36" width="12" height="12" fill="#85C1E2" />

      <rect x="20" y="52" width="12" height="12" fill="#4ECDC4" />
      <rect x="36" y="52" width="12" height="12" fill="#FF6B6B" />
      <rect x="52" y="52" width="12" height="12" fill="#FFA07A" />
      <rect x="68" y="52" width="12" height="12" fill="#98D8C8" />

      <rect x="20" y="68" width="12" height="12" fill="#85C1E2" />
      <rect x="36" y="68" width="12" height="12" fill="#BB8FCE" />
      <rect x="52" y="68" width="12" height="12" fill="#45B7D1" />
      <rect x="68" y="68" width="12" height="12" fill="#F7DC6F" />
    </svg>
  )
}

export function GenerativeArtIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Geometric Bauhaus-inspired design */}
      <circle cx="30" cy="30" r="18" stroke="#FF6B6B" strokeWidth="3" fill="none" />
      <rect x="52" y="12" width="36" height="36" fill="#4ECDC4" fillOpacity="0.3" />
      <rect x="52" y="12" width="36" height="36" stroke="#4ECDC4" strokeWidth="3" fill="none" />

      <circle cx="70" cy="70" r="18" fill="#FFD93D" fillOpacity="0.4" />
      <circle cx="70" cy="70" r="18" stroke="#FFD93D" strokeWidth="3" fill="none" />

      <path d="M 12 52 L 30 88 L 48 52 Z" fill="#6BCB77" fillOpacity="0.3" />
      <path d="M 12 52 L 30 88 L 48 52 Z" stroke="#6BCB77" strokeWidth="3" fill="none" />
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

      {/* Central star/sparkle with gradient colors */}
      <path
        d="M 50 25 L 53 42 L 70 45 L 53 48 L 50 65 L 47 48 L 30 45 L 47 42 Z"
        fill="url(#sparkle-gradient)"
      />

      {/* Small sparkles around */}
      <circle cx="35" cy="30" r="2" fill="#FFD93D" />
      <circle cx="65" cy="30" r="2" fill="#FF6B6B" />
      <circle cx="35" cy="60" r="2" fill="#4ECDC4" />
      <circle cx="65" cy="60" r="2" fill="#BB8FCE" />

      {/* AI wave pattern at bottom */}
      <path
        d="M 20 75 Q 30 70 40 75 T 60 75 T 80 75"
        stroke="#667eea"
        strokeWidth="2"
        fill="none"
      />

      <defs>
        <linearGradient id="sparkle-gradient" x1="30" y1="25" x2="70" y2="65">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
      </defs>
    </svg>
  )
}
