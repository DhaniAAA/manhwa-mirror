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

interface ManhwaCardData {
  slug: string
  title: string
  cover_url?: string
  lastUpdate?: string
  lastUpdateTime?: number
  latestChapters?: Array<{
    title: string
    waktu_rilis?: string
    slug?: string
  }>
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...')

  try {
    // Get all manhwa metadata from single file (NO MORE N+1 QUERIES!)
    const { data: allMetadataData, error: metadataError } = await supabase.storage
      .from(BUCKET_NAME)
      .download('all-manhwa-metadata.json')

    if (metadataError) throw metadataError

    const allMetadataText = await allMetadataData.text()
    const allManhwa: ManhwaCardData[] = JSON.parse(allMetadataText)

    console.log(`📚 Found ${allManhwa.length} manhwa in all-manhwa-metadata.json`)

    // Generate URLs for all manhwa (no limit needed, single request!)
    const manhwaUrls: string[] = allManhwa.map(manhwa => {
      // Use lastUpdateTime if available, otherwise use latest chapter waktu_rilis, or current date
      let lastmod: string
      
      try {
        if (manhwa.lastUpdateTime && !isNaN(manhwa.lastUpdateTime)) {
          const date = new Date(manhwa.lastUpdateTime)
          if (!isNaN(date.getTime())) {
            lastmod = date.toISOString().split('T')[0]
          } else {
            throw new Error('Invalid date from lastUpdateTime')
          }
        } else if (manhwa.latestChapters && manhwa.latestChapters[0]?.waktu_rilis) {
          const date = new Date(manhwa.latestChapters[0].waktu_rilis)
          if (!isNaN(date.getTime())) {
            lastmod = date.toISOString().split('T')[0]
          } else {
            throw new Error('Invalid date from waktu_rilis')
          }
        } else {
          throw new Error('No valid date found')
        }
      } catch (error) {
        // Fallback to current date if any date parsing fails
        lastmod = new Date().toISOString().split('T')[0]
      }

      return `  <url>
    <loc>${SITE_URL}/detail/${manhwa.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    console.log(`✅ Generated ${manhwaUrls.length} manhwa URLs`)

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
