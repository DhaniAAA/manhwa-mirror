/**
 * Composable for using image proxy in Vue components
 */

import { computed } from 'vue';
import { getProxiedImageUrl, proxyChapterImages, proxyChaptersData } from '../utils/imageProxy';

export function useImageProxy() {
  /**
   * Convert a single image URL to proxied version
   */
  const getProxiedUrl = (url: string) => {
    return getProxiedImageUrl(url);
  };

  /**
   * Process chapter data to proxy all images
   */
  const proxyChapter = (chapter: any) => {
    return proxyChapterImages(chapter);
  };

  /**
   * Process chapters data to proxy all images
   */
  const proxyChapters = (data: any) => {
    return proxyChaptersData(data);
  };

  /**
   * Create a reactive proxied URL
   */
  const createProxiedUrl = (originalUrl: string) => {
    return computed(() => getProxiedImageUrl(originalUrl));
  };

  /**
   * Load image with error handling
   */
  const loadImage = async (url: string): Promise<string> => {
    const proxiedUrl = getProxiedImageUrl(url);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(proxiedUrl);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = proxiedUrl;
    });
  };

  /**
   * Preload multiple images
   */
  const preloadImages = async (urls: string[]): Promise<string[]> => {
    const promises = urls.map(url => loadImage(url));
    return Promise.all(promises);
  };

  return {
    getProxiedUrl,
    proxyChapter,
    proxyChapters,
    createProxiedUrl,
    loadImage,
    preloadImages
  };
}
