/**
 * Netlify Function for Image Proxy
 * Proxies images from sv1/sv2/sv3.imgkc.my.id
 * Usage: /.netlify/functions/image-proxy/1/wp-content/img/...
 */

// Domain mapping: ID -> Domain
const DOMAIN_MAP = {
  '1': 'sv1.imgkc1.my.id',
  '2': 'sv2.imgkc2.my.id',
  '3': 'sv3.imgkc3.my.id'
};

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse path from event
  const path = event.path.replace('/.netlify/functions/image-proxy/', '');
  
  // Extract ID (first segment)
  const firstSlashIndex = path.indexOf('/');
  if (firstSlashIndex === -1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid URL format' })
    };
  }
  
  const domainId = path.substring(0, firstSlashIndex);
  const imagePath = path.substring(firstSlashIndex);
  
  // Convert ID to domain
  const domain = DOMAIN_MAP[domainId];
  
  if (!domain) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Invalid domain ID', id: domainId })
    };
  }
  
  // Reconstruct original URL
  const url = `https://${domain}${imagePath}`;

  try {
    // Fetch the image from the original source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://komikcast03.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Failed to fetch image: ${response.statusText}` 
        })
      };
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      },
      body: base64Image,
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to proxy image',
        details: error.message 
      })
    };
  }
};
