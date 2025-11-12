/**
 * Image Service for handling image loading and fallback
 */

interface ImageConfig {
  fallbackUrl: string
  retryCount: number
  retryDelay: number
}

const DEFAULT_CONFIG: ImageConfig = {
  fallbackUrl: '/placeholder-cover.jpg',
  retryCount: 3,
  retryDelay: 1000
}

export class ImageService {
  /**
   * Check if image is accessible
   */
  static async checkImage(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok && (response.headers.get('content-type') || '').startsWith('image/')
    } catch {
      return false
    }
  }

  /**
   * Get working image URL with fallback
   */
  static async getImageUrl(originalUrl: string, config = DEFAULT_CONFIG): Promise<string> {
    if (!originalUrl) return config.fallbackUrl

    // Check if it's already a proxy URL
    if (originalUrl.includes('/api/image-proxy/')) {
      return originalUrl
    }

    // Try to use proxy with fallback
    const proxyUrl = this.createProxyUrl(originalUrl)
    
    // Test proxy URL
    const isAccessible = await this.checkImage(proxyUrl)
    return isAccessible ? proxyUrl : config.fallbackUrl
  }

  /**
   * Create proxy URL from original image URL
   */
  static createProxyUrl(originalUrl: string): string {
    if (!originalUrl) return ''
    
    // Extract server ID and path
    const match = originalUrl.match(/https:\/\/sv(\d+)\.imgkc\d+\.my\.id(.*)/)
    if (match) {
      const [, serverId, path] = match
      return `/api/image-proxy/${serverId}${path}`
    }
    
    // For other URLs, use server 1 as default
    const encodedUrl = encodeURIComponent(originalUrl)
    return `/api/image-proxy/1${encodedUrl}`
  }

  /**
   * Get placeholder image
   */
  static getPlaceholderUrl(width = 300, height = 400): string {
    return `https://via.placeholder.com/${width}x${height}/1a1a1a/666666?text=No+Cover`
  }

  /**
   * Retry loading image with exponential backoff
   */
  static async retryLoadImage(
    url: string, 
    config = DEFAULT_CONFIG
  ): Promise<string> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < config.retryCount; attempt++) {
      try {
        const isAccessible = await this.checkImage(url)
        if (isAccessible) {
          return url
        }
      } catch (error) {
        lastError = error as Error
      }
      
      // Exponential backoff
      const delay = config.retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    console.warn(`Failed to load image after ${config.retryCount} attempts:`, lastError)
    return config.fallbackUrl
  }

  /**
   * Preload image to cache
   */
  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload: ${url}`))
      img.src = url
    })
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(url: string): Promise<{width: number, height: number} | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = url
    })
  }
}
