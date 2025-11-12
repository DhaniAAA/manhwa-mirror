/**
 * Image Proxy API
 * Proxies images from sv1/sv2/sv3.imgkc.my.id
 * Usage: /api/image-proxy/1/wp-content/img/...
 */

// Domain mapping: ID -> Domain (updated with fallback)
const DOMAIN_MAP = {
  '1': 'sv1.imgkc1.my.id',
  '2': 'sv2.imgkc2.my.id',
  '3': 'sv3.imgkc3.my.id',
  '4': 'sv4.imgkc4.my.id',
  '5': 'sv5.imgkc5.my.id',
  '6': 'komikcast03.com',
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get parameters from query (Vercel routing passes them as query params)
  const { id, path } = req.query;
  
  // Validate parameters
  if (!id || !path) {
    return res.status(400).json({ 
      error: 'Missing parameters', 
      id, 
      path,
      url: req.url 
    });
  }
  
  // Convert ID to domain
  const domain = DOMAIN_MAP[id];
  
  if (!domain) {
    return res.status(403).json({ 
      error: 'Invalid domain ID', 
      id, 
      availableIds: Object.keys(DOMAIN_MAP) 
    });
  }
  
  // Reconstruct original URL
  // Path might be array if it contains multiple segments
  const imagePath = Array.isArray(path) ? '/' + path.join('/') : '/' + path;
  const url = `https://${domain}${imagePath}`;

  try {
    // Fetch the image from the original source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://komikcast03.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch image: ${response.statusText}` 
      });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set cache headers for better performance
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send the image
    return res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy image',
      details: error.message 
    });
  }
}
