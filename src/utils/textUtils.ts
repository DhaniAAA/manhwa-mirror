/**
 * Text Utility Functions
 * Provides helper functions for text processing
 */

/**
 * Clean and normalize manhwa title
 * Remove "Bahasa Indonesia" suffix from title
 */
export function cleanManhwaTitle(title: string): string {
  return title
    .replace(/\s+Bahasa Indonesia$/i, '') // Remove "Bahasa Indonesia" suffix
    .trim()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
