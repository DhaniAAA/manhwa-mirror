/**
 * Utility functions for generating structured data (JSON-LD) for SEO
 */

export interface ManhwaStructuredData {
  title: string;
  description: string;
  coverUrl: string;
  url: string;
  author: string;
  artist?: string;
  genres: string[];
  status: string;
  type: string;
  rating?: string;
  totalChapters?: number;
  lastUpdate?: string;
  releaseYear?: number;
}

export interface ReaderStructuredData {
  title: string;
  chapterTitle: string;
  url: string;
  manhwaUrl: string;
  previousChapterUrl?: string;
  nextChapterUrl?: string;
  chapterNumber: number;
  author: string;
  artist?: string;
  coverUrl: string;
}

/**
 * Generate structured data for manhwa detail page (Book schema)
 */
export function generateManhwaStructuredData(data: ManhwaStructuredData) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: data.title,
    description: data.description,
    url: data.url,
    image: data.coverUrl,
    author: {
      "@type": "Person",
      name: data.author,
    },
    genre: data.genres,
    inLanguage: "id",
    publisher: {
      "@type": "Organization",
      name: "Manhwa Mirror",
      url: "https://www.manhwaku.biz.id",
    },
    bookFormat: "EBook",
    keywords: data.genres.join(", "),
    about: data.genres.map((genre) => ({
      "@type": "Thing",
      name: genre,
    })),
  };

  // Add optional properties only if they exist
  if (data.artist) {
    structuredData.artist = {
      "@type": "Person",
      name: data.artist,
    };
  }

  if (data.releaseYear) {
    structuredData.datePublished = `${data.releaseYear}-01-01`;
  }

  if (data.lastUpdate) {
    structuredData.dateModified = data.lastUpdate;
  }

  if (data.rating) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.rating,
      ratingCount: "100",
      bestRating: "10",
      worstRating: "1",
    };
  }

  if (data.totalChapters) {
    structuredData.numberOfPages = data.totalChapters;
  }

  return structuredData;
}

/**
 * Generate structured data for reader page (Article schema for chapter)
 */
export function generateReaderStructuredData(data: ReaderStructuredData) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.chapterTitle,
    name: data.chapterTitle,
    description: `Baca ${data.title} Chapter ${data.chapterNumber} online gratis`,
    url: data.url,
    image: data.coverUrl,
    author: {
      "@type": "Person",
      name: data.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Manhwa Mirror",
      url: "https://www.manhwaku.biz.id",
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    isPartOf: {
      "@type": "Book",
      name: data.title,
      url: data.manhwaUrl,
    },
    position: data.chapterNumber,
    articleSection: "Chapter",
    inLanguage: "id",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.url,
    },
    hasPart: [
      {
        "@type": "WebPageElement",
        name: "Chapter Content",
        isAccessibleForFree: true,
      },
    ],
  };

  // Add optional properties only if they exist
  if (data.artist) {
    structuredData.artist = {
      "@type": "Person",
      name: data.artist,
    };
  }

  if (data.nextChapterUrl) {
    structuredData.potentialAction = {
      "@type": "ReadAction",
      object: {
        "@type": "WebPage",
        url: data.nextChapterUrl,
      },
    };
  }

  return structuredData;
}

/**
 * Generate structured data for homepage (WebSite schema)
 */
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Manhwa Mirror",
    description: "Platform modern untuk membaca manhwa dengan antarmuka yang nyaman dan intuitif",
    url: "https://www.manhwaku.biz.id",
    image: "https://www.manhwaku.biz.id/og-image.jpg",
    publisher: {
      "@type": "Organization",
      name: "Manhwa Mirror",
      url: "https://www.manhwaku.biz.id",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.manhwaku.biz.id/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id",
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
