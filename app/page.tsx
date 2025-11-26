import Link from 'next/link'

const tools = [
  {
    name: 'Image to ASCII',
    description: 'Convert images into ASCII art with customizable density',
    href: '/ascii',
  },
  {
    name: 'Meme Generator',
    description: 'Create memes with templates or your own images',
    href: '/meme',
  },
  {
    name: 'Color Picker',
    description: 'Extract colors from images in HEX, RGB, HSL, and more',
    href: '/colorpicker',
  },
  {
    name: 'Pixelator',
    description: 'Convert images to pixel art with adjustable pixel size',
    href: '/pixelator',
  },
  {
    name: 'Generative Art',
    description: 'Create Bauhaus-inspired geometric art with customizable palettes',
    href: '/generative',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">ImageLab</h1>
          <p className="text-xl text-muted-foreground">
            A collection of creative image tools for your projects
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-card-border hover:border-border"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {tool.name}
              </h2>
              <p className="text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>

        <footer className="text-center mt-16 text-muted-foreground">
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  )
}
