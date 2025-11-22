import Link from 'next/link'

const tools = [
  {
    name: 'Bauhaus Generator',
    description: 'Create geometric art inspired by the Bauhaus movement',
    href: '/bauhaus',
    icon: '🎨',
  },
  {
    name: 'Image to ASCII',
    description: 'Convert images into ASCII art with customizable density',
    href: '/ascii',
    icon: '📝',
  },
  {
    name: 'Meme Generator',
    description: 'Create memes with templates or your own images',
    href: '/meme',
    icon: '😂',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">ImageLab</h1>
          <p className="text-xl text-slate-600">
            A collection of creative image tools for your projects
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-slate-200 hover:border-slate-300"
            >
              <div className="text-5xl mb-4">{tool.icon}</div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {tool.name}
              </h2>
              <p className="text-slate-600">{tool.description}</p>
            </Link>
          ))}
        </div>

        <footer className="text-center mt-16 text-slate-500">
          <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  )
}
