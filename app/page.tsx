'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AsciiIcon,
  MemeIcon,
  ColorPickerIcon,
  PixelatorIcon,
  GenerativeArtIcon,
  TextToImageIcon,
} from '@/components/icons/ToolIcons'

const tools = [
  {
    name: 'Generative Art',
    description: 'Create geometric art with customizable palettes',
    href: '/generative',
    icon: GenerativeArtIcon,
  },
  {
    name: 'Image to ASCII',
    description: 'Convert images into ASCII art with customizable density',
    href: '/ascii',
    icon: AsciiIcon,
  },
  {
    name: 'Meme Generator',
    description: 'Create memes with templates or your own images',
    href: '/meme',
    icon: MemeIcon,
  },
  {
    name: 'Color Picker',
    description: 'Extract colors from images in HEX, RGB, HSL, and more',
    href: '/colorpicker',
    icon: ColorPickerIcon,
  },
  {
    name: 'Pixelator',
    description: 'Convert images to pixel art with adjustable pixel size',
    href: '/pixelator',
    icon: PixelatorIcon,
  },
]

export default function Home() {
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Check WebGPU support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setWebGPUSupported(!!(navigator as any).gpu)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">ImageLab</h1>
          <p className="text-xl text-muted-foreground">Select a tool to get started</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tools.map(tool => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-card-border hover:border-border"
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-16 h-16 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Text-to-Image Generator - requires WebGPU */}
          {webGPUSupported === true ? (
            <Link
              href="/text-to-image"
              className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-card-border hover:border-border"
            >
              <div className="flex items-center gap-4">
                <TextToImageIcon className="w-16 h-16 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Text-to-Image
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generate artwork from text descriptions using AI
                  </p>
                </div>
              </div>
            </Link>
          ) : webGPUSupported === false ? (
            <div className="bg-card rounded-xl shadow-md p-6 border border-card-border opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <TextToImageIcon className="w-16 h-16 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground mb-0.5">Text-to-Image</h2>
                  <p className="text-xs text-muted-foreground mb-1">
                    Requires WebGPU (Chrome 113+)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generate artwork from text descriptions using AI
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-md p-6 border border-card-border animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-secondary rounded flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-6 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
