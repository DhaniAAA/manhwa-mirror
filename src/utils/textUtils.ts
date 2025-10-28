/**
 * Text Utility Functions
 * Provides helper functions for text processing
 */

/**
 * Fix Mojibake - UTF-8 text incorrectly decoded as Windows-1252
 */
export function fixMojibake(text: string): string {
  return text
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€¦/g, '…')
    .replace(/Iâ€™m/g, "I'm")
    .replace(/donâ€™t/g, "don't")
    .replace(/canâ€™t/g, "can't")
    .replace(/wonâ€™t/g, "won't")
    .replace(/itâ€™s/g, "it's")
}

/**
 * Clean and normalize manhwa title
 */
export function cleanManhwaTitle(title: string): string {
  return fixMojibake(title)
    .replace(/\s+Bahasa Indonesia$/i, '')
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
