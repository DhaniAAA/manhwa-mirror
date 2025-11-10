/**
 * Generate sitemap.xml dynamically from manhwa data
 * Run: npx tsx scripts/generate-sitemap.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nnaizqqgdtqmfpwzcspe.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYWl6cXFnZHRxbWZwd3pjc3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTQwODYsImV4cCI6MjA3NjIzMDA4Nn0.D799-0qBzC4r-kfwUfqxN6k5wTD5JJ5L3i3aqIQTxSs'
const BUCKET_NAME = 'manga-data'
const SITE_URL = 'https://manhwa-mirror.vercel.app'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

interface ManhwaMetadata {
  slug: string
  title: string
  cover_url?: string
  lastUpdate?: string
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...')

  try {
    // Get comics list
    const { data: comicsListData, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .download('comics-list.json')

    if (listError) throw listError

    const comicsListText = await comicsListData.text()
    const comicsList: string[] = JSON.parse(comicsListText)

    console.log(`📚 Found ${comicsList.length} manhwa`)

    // Fetch metadata for all manhwa (limit to first 100 for performance)
    const manhwaUrls: string[] = []
    const limit = Math.min(comicsList.length, 100)

    for (let i = 0; i < limit; i++) {
      const slug = comicsList[i]
      
      try {
        const { data: metadataData } = await supabase.storage
          .from(BUCKET_NAME)
          .download(`${slug}/metadata.json`)

        if (metadataData) {
          const metadataText = await metadataData.text()
          const metadata: ManhwaMetadata = JSON.parse(metadataText)
          
          const lastmod = metadata.lastUpdate 
            ? new Date(metadata.lastUpdate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

          manhwaUrls.push(`  <url>
    <loc>${SITE_URL}/detail/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
        }
      } catch (error) {
        console.warn(`⚠️  Failed to fetch metadata for ${slug}`)
      }

      if ((i + 1) % 10 === 0) {
        console.log(`📊 Progress: ${i + 1}/${limit}`)
      }
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Search Page -->
  <url>
    <loc>${SITE_URL}/search</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Manhwa Detail Pages -->
${manhwaUrls.join('\n')}
  
</urlset>`

    // Write to public folder
    const publicDir = path.join(process.cwd(), 'public')
    const sitemapPath = path.join(publicDir, 'sitemap.xml')

    fs.writeFileSync(sitemapPath, sitemap, 'utf-8')

    console.log(`✅ Sitemap generated successfully!`)
    console.log(`📍 Location: ${sitemapPath}`)
    console.log(`📊 Total URLs: ${manhwaUrls.length + 2}`)

  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

generateSitemap()
