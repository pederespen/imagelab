# AI Development Guidelines

This document provides guidelines for AI-assisted development on this project.

## Code Organization

### File Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
├── bauhaus/
│   └── page.tsx            # Bauhaus generator tool
├── ascii/
│   └── page.tsx            # ASCII converter tool
└── meme/
    └── page.tsx            # Meme generator tool

components/
├── ui/                     # Reusable UI components
└── tools/                  # Tool-specific components

lib/
├── utils/                  # Utility functions
└── types/                  # Shared TypeScript types
```

### File Length Guidelines

- **Max file length**: 250 lines
- **Component files**: Split into smaller components if exceeding ~150 lines
- **Utility files**: Group related functions, split by domain if growing large
- **When to split**: If a file handles multiple concerns, extract them into separate files

### Component Guidelines

- **Prefer composition**: Break complex components into smaller, focused pieces
- **Single responsibility**: Each component should do one thing well
- **Max component complexity**: If a component has more than 3-4 useState hooks or complex logic, consider extracting custom hooks or child components
- **Prop drilling**: If passing props through more than 2 levels, consider composition or context

## Code Style

### Comments

- **Prefer self-documenting code**: Good naming over comments
- **When to comment**:
  - Complex algorithms or business logic
  - Non-obvious optimizations
  - Workarounds for bugs or limitations
- **Avoid**: Obvious comments, commented-out code

### Naming Conventions

- **Components**: PascalCase (`BauhausCanvas.tsx`)
- **Functions/variables**: camelCase (`generateArtwork`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CANVAS_SIZE`)
- **Types/Interfaces**: PascalCase, prefix interfaces with `I` if ambiguous (`ToolConfig`)
- **Files**: Match export name, kebab-case for multi-word utilities (`canvas-utils.ts`)

### TypeScript

- **Strict mode**: Enabled, no `any` unless absolutely necessary (use `unknown` instead)
- **Type everything**: No implicit any
- **Prefer interfaces** for object shapes, types for unions/intersections
- **Generic types**: Use when creating reusable components/functions

## Architecture Patterns

### State Management

- Use `useState` for local component state
- Use `useReducer` for complex state logic
- Consider Context for cross-cutting concerns (theme, settings)
- Avoid prop drilling; prefer composition

### Custom Hooks

- Extract reusable logic into custom hooks
- Name with `use` prefix
- Keep hooks focused on a single concern

### Canvas Components

- Separate canvas logic from UI components
- Use `useRef` for canvas element access
- Clean up event listeners and animation frames in `useEffect` cleanup

### Performance

- Use `useMemo` for expensive calculations
- Use `useCallback` for callback props to memoized components
- Lazy load heavy components if needed
- Optimize canvas rendering (requestAnimationFrame, offscreen canvas for heavy operations)

## Tool-Specific Guidelines

### Bauhaus Generator

- Parameterize: colors, shapes, grid size, randomness
- Provide preset styles but allow customization
- Download as PNG with transparent background option

### ASCII Converter

- Configurable character density/resolution
- Live preview as settings change
- Copy to clipboard and download as text file
- Handle image size/format edge cases

### Meme Generator

- Canvas-based for flexibility
- Draggable/resizable text
- Font size, color, stroke customization
- Popular templates + custom upload
- Download as image

## General Best Practices

1. **Mobile-first**: Design for mobile, enhance for desktop
2. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
3. **Error handling**: Graceful degradation, clear error messages
4. **Loading states**: Show feedback for async operations
5. **Responsive**: Test on multiple screen sizes
6. **Performance**: Optimize images, lazy load, minimize rerenders

## What to Avoid

- ❌ Large monolithic components
- ❌ Inline styles (use Tailwind classes)
- ❌ Magic numbers (use named constants)
- ❌ Deeply nested components
- ❌ Unused imports/variables
- ❌ console.log in production code (use console.error/warn if needed)
- ❌ Mutating state directly
- ❌ Any TypeScript `any` type without justification

## Development Workflow

1. Write clean, readable code first
2. Refactor if file grows beyond guidelines
3. Run linter and type-check before committing
4. Test in browser frequently during development
5. Verify static export builds successfully
