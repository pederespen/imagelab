# ImageLab

A collection of creative image manipulation tools built with Next.js, TypeScript, and Tailwind CSS.

## Tools

- **Image to ASCII**: Convert images into ASCII art with customizable density
- **Meme Generator**: Create memes with templates or your own images

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Format code
pnpm format

# Lint
pnpm lint

# Type check
pnpm type-check
```

## Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality. Install them with:

```bash
pre-commit install
```

## Deployment

Built as a static site for GitHub Pages:

```bash
npm run build
```

The static files will be in the `out/` directory.

## Guidelines

See [.github/copilot-instructions.md](./.github/copilot-instructions.md) for development standards and best practices.
