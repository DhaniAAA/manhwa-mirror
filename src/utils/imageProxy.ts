/**
 * Image Proxy Utility
 * Converts external image URLs to use our proxy
 */

// List of domains to proxy
const PROXY_DOMAINS = [
  'sv1.imgkc1.my.id',
  'sv2.imgkc2.my.id',
  'sv3.imgkc3.my.id'
];

// Domain mapping: ID -> Domain (exported for use in other modules)
export const DOMAIN_MAP: Record<string, string> = {
  '1': 'sv1.imgkc1.my.id',
  '2': 'sv2.imgkc2.my.id',
  '3': 'sv3.imgkc3.my.id'
};

// Reverse mapping: Domain -> ID
const DOMAIN_TO_ID: Record<string, string> = {
  'sv1.imgkc1.my.id': '1',
  'sv2.imgkc2.my.id': '2',
  'sv3.imgkc3.my.id': '3'
};

/**
 * Check if URL should be proxied
 */
export function shouldProxyUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return Object.keys(DOMAIN_TO_ID).includes(urlObj.hostname);
  } catch {
    return false;
  }
}

/**
 * Convert external image URL to proxied URL
 * @param originalUrl - Original image URL from sv1/sv2/sv3
 * @returns Proxied URL through your domain (with hidden domain ID)
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!shouldProxyUrl(originalUrl)) {
    return originalUrl;
  }

  try {
    // Parse URL to extract domain and path
    const urlObj = new URL(originalUrl);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Convert domain to ID (1, 2, 3)
    const domainId = DOMAIN_TO_ID[domain];
    
    if (!domainId) {
      console.error('Unknown domain:', domain);
      return originalUrl;
    }
    
    // Create clean proxy URL with ID: /api/image/{id}{path}
    // Example: /api/image/1/wp-content/img/A/A_Bad_Person/005/001.jpg
    const cleanPath = `/api/image/${domainId}${path}`;
    
    // For development, use relative path
    if (import.meta.env.DEV) {
      return cleanPath;
    }
    
    // For production, use full URL
    const baseUrl = window.location.origin;
    return `${baseUrl}${cleanPath}`;
  } catch (e) {
    // Fallback to original URL if parsing fails
    console.error('Failed to parse image URL:', originalUrl, e);
    return originalUrl;
  }
}

/**
 * Process chapter data to replace all image URLs with proxied versions
 */
export function proxyChapterImages(chapter: any): any {
  if (!chapter || !chapter.images) {
    return chapter;
  }

  return {
    ...chapter,
    images: chapter.images.map((url: string) => getProxiedImageUrl(url))
  };
}

/**
 * Process multiple chapters data
 */
export function proxyChaptersData(data: any): any {
  if (!data || !data.chapters) {
    return data;
  }

  return {
    ...data,
    chapters: data.chapters.map((chapter: any) => proxyChapterImages(chapter))
  };
}

/**
 * Direct fetch with proxy headers (alternative method)
 * This can be used if you want to fetch images directly with proper headers
 */
export async function fetchImageWithProxy(url: string): Promise<Blob> {
  const proxiedUrl = getProxiedImageUrl(url);
  
  const response = await fetch(proxiedUrl, {
    headers: {
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  return response.blob();
}
