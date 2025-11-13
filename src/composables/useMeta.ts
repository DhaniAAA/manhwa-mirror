import { onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

export interface MetaOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  keywords?: string
  canonical?: string
  structuredData?: Record<string, any>
}

/**
 * Composable untuk mengelola meta tags secara dinamis
 */
export function useMeta(options: MetaOptions | Ref<MetaOptions>) {
  const getOptions = (): MetaOptions => {
    return typeof options === 'object' && 'value' in options ? options.value : options
  }

  const updateMeta = () => {
    const opts = getOptions()
    
    // Update title
    if (opts.title) {
      document.title = opts.title
    }

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector)
      if (element) {
        element.setAttribute('content', content)
      } else {
        element = document.createElement('meta')
        const [attr, value] = selector.includes('property=') 
          ? ['property', selector.match(/property="([^"]+)"/)?.[1] || '']
          : ['name', selector.match(/name="([^"]+)"/)?.[1] || '']
        element.setAttribute(attr, value)
        element.setAttribute('content', content)
        document.head.appendChild(element)
      }
    }

    // Standard meta tags
    if (opts.description) {
      updateMetaTag('meta[name="description"]', opts.description)
    }

    if (opts.keywords) {
      updateMetaTag('meta[name="keywords"]', opts.keywords)
    }

    // Open Graph tags
    if (opts.title) {
      updateMetaTag('meta[property="og:title"]', opts.title)
    }

    if (opts.description) {
      updateMetaTag('meta[property="og:description"]', opts.description)
    }

    if (opts.image) {
      updateMetaTag('meta[property="og:image"]', opts.image)
    }

    if (opts.url) {
      updateMetaTag('meta[property="og:url"]', opts.url)
    }

    if (opts.type) {
      updateMetaTag('meta[property="og:type"]', opts.type)
    }

    // Twitter tags
    if (opts.title) {
      updateMetaTag('meta[name="twitter:title"]', opts.title)
    }

    if (opts.description) {
      updateMetaTag('meta[name="twitter:description"]', opts.description)
    }

    if (opts.image) {
      updateMetaTag('meta[name="twitter:image"]', opts.image)
    }

    if (opts.url) {
      updateMetaTag('meta[name="twitter:url"]', opts.url)
    }

    // Canonical URL
    if (opts.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (canonicalLink) {
        canonicalLink.setAttribute('href', opts.canonical)
      } else {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        canonicalLink.setAttribute('href', opts.canonical)
        document.head.appendChild(canonicalLink)
      }
    }

    // Structured Data (JSON-LD)
    if (opts.structuredData) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]')
      if (scriptElement) {
        scriptElement.textContent = JSON.stringify(opts.structuredData)
      } else {
        scriptElement = document.createElement('script')
        scriptElement.setAttribute('type', 'application/ld+json')
        scriptElement.textContent = JSON.stringify(opts.structuredData)
        document.head.appendChild(scriptElement)
      }
    }
  }

  // Initial update
  onMounted(() => {
    updateMeta()
  })

  // Watch for changes if options is a ref
  if (typeof options === 'object' && 'value' in options) {
    watch(options, () => {
      updateMeta()
    }, { deep: true })
  }

  // Cleanup on unmount (restore defaults)
  onUnmounted(() => {
    document.title = 'Manhwa Mirror - Baca Manhwa Online'
  })

  return {
    updateMeta
  }
}
