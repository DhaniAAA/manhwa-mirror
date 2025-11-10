/**
 * Text Utility Functions
 * Provides helper functions for text processing
 */

/**
 * Fix Mojibake - UTF-8 text incorrectly decoded as Windows-1252
 * Removes common encoding artifacts and special characters
 */
export function fixMojibake(text: string): string {
  return text
    // Common mojibake patterns
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
    // Additional mojibake patterns (â, Â, etc.)
    .replace(/â€¢/g, '•')
    .replace(/â€"/g, '—')
    .replace(/â€"/g, '–')
    .replace(/â€¦/g, '…')
    .replace(/â€ /g, '†')
    .replace(/â€¡/g, '‡')
    .replace(/â€°/g, '‰')
    .replace(/â€¹/g, '‹')
    .replace(/â€º/g, '›')
    // Remove standalone â, Â, and similar artifacts
    .replace(/â\s/g, ' ')
    .replace(/\sâ/g, ' ')
    .replace(/Â/g, '')
    .replace(/â/g, '')
    .replace(//g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
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

/**
 * Parse relative time string (e.g., "1 day ago", "2 hours ago") to Date object
 * @param relativeTimeStr - Relative time string
 * @returns Date object or null if invalid
 */
function parseRelativeTime(relativeTimeStr: string): Date | null {
  const match = relativeTimeStr.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i)
  
  if (!match) return null
  
  const amount = parseInt(match[1])
  const unit = match[2].toLowerCase()
  const now = new Date()
  
  switch (unit) {
    case 'second':
      return new Date(now.getTime() - amount * 1000)
    case 'minute':
      return new Date(now.getTime() - amount * 60 * 1000)
    case 'hour':
      return new Date(now.getTime() - amount * 60 * 60 * 1000)
    case 'day':
      return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000)
    case 'week':
      return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000)
    case 'year':
      return new Date(now.getTime() - amount * 365 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

/**
 * Format timestamp to relative time (e.g., "4 detik lalu", "2 jam lalu")
 * For dates older than 1 year, shows absolute date (e.g., "10 Nov 2023")
 * Supports both ISO 8601 format and relative time strings (e.g., "1 day ago")
 * @param dateString - ISO 8601 timestamp string or relative time string
 * @returns Formatted relative time string or absolute date
 */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return 'Baru'
  
  try {
    let date = new Date(dateString)
    
    // Jika parsing gagal, coba parse sebagai relative time string
    if (isNaN(date.getTime())) {
      const parsedDate = parseRelativeTime(dateString)
      if (parsedDate) {
        date = parsedDate
      } else {
        // Jika tetap gagal, return format original atau 'Baru'
        return dateString.includes('ago') ? dateString : 'Baru'
      }
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // Jika diff negatif (tanggal di masa depan), return 'Baru'
    if (diff < 0) {
      return 'Baru'
    }
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)

    // Untuk waktu terbaru (< 1 tahun): tampilkan waktu relatif
    if (seconds < 60) return `${seconds} detik lalu`
    if (minutes < 60) return `${minutes} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    if (days < 7) return `${days} hari lalu`
    if (weeks < 4) return `${weeks} minggu lalu`
    if (months < 12) return `${months} bulan lalu`
    
    // Untuk waktu lama (≥ 1 tahun): tampilkan tanggal absolut
    // Format: "10 Nov 2023"
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    // Jika ada error tapi string mengandung 'ago', return string original
    return dateString && dateString.includes('ago') ? dateString : 'Baru'
  }
}
