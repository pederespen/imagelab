# Meme Templates

This directory contains meme template images referenced by the meme generator.

## Adding New Templates

1. Enable "Creator Mode" in the meme generator
2. Upload your meme template image
3. Add text layers and position them where you want
4. Fill in the Template ID, Name, and Category
5. Click "Save Template" - the config will be logged to console
6. Save your image as `public/memes/{template-id}.jpg`
7. Copy the config from console into `MEME_TEMPLATES` array in `lib/types/meme.ts`

## Image Guidelines

- **Format**: JPG or PNG
- **Size**: Recommended 800x600px or similar aspect ratio
- **Quality**: Good quality but optimized for web
- **Naming**: Use kebab-case matching the template ID (e.g., `drake-meme.jpg`)

## Current Templates

Place your meme template images here. Examples:

- `drake.jpg`
- `distracted-boyfriend.jpg`
- `two-buttons.jpg`
- etc.
