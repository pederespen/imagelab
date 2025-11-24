/**
 * Get the correct asset path with basePath prefix for production
 * In development, returns the path as-is
 * In production (GitHub Pages), adds the /imagelab prefix
 */
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/imagelab' : ''
  return `${basePath}${path}`
}
