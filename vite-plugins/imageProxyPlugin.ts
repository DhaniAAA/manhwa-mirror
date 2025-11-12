import type { Plugin } from 'vite';

// Domain mapping: ID -> Domain (WAJIB SAMA DENGAN VERSI SERVER)
const DOMAIN_MAP: Record<string, string> = {
  '1': 'sv1.imgkc1.my.id',
  '2': 'sv2.imgkc2.my.id',
  '3': 'sv3.imgkc3.my.id',
  '4': 'sv4.imgkc4.my.id', // <-- Diperbarui
  '5': 'sv5.imgkc5.my.id', // <-- Diperbarui
  '6': 'komikcast03.com',  // <-- Diperbarui
};

/**
 * Vite plugin to handle image proxy in development mode
 */
export function imageProxyPlugin(): Plugin {
  return {
    name: 'image-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle /api/image requests
        if (!req.url?.startsWith('/api/image/')) {
          return next();
        }

        try {
          // Parse URL: /api/image/{id}/{path}
          // Example: /api/image/1/wp-content/img/A/A_Bad_Person/005/001.jpg
          const urlPath = req.url.replace('/api/image/', '');
          
          // Extract ID (first segment)
          const firstSlashIndex = urlPath.indexOf('/');
          if (firstSlashIndex === -1) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid URL format' }));
            return;
          }
          
          const domainId = urlPath.substring(0, firstSlashIndex);
          const path = urlPath.substring(firstSlashIndex);
          
          // Convert ID to domain
          const domain = DOMAIN_MAP[domainId];
          
          if (!domain) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid domain ID', id: domainId }));
            return;
          }
          
          // Reconstruct original URL
          const imageUrl = `https://${domain}${path}`;

          // Fetch the image
          const response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://komikcast03.com/', // Biarkan referer ini
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: `Failed to fetch image: ${response.statusText}` 
            }));
            return;
          }

          // Get image buffer
          const imageBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(imageBuffer);

          // Set headers
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Access-Control-Allow-Origin', '*');

          // Send image
          res.end(buffer);
        } catch (error) {
          console.error('Proxy error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: 'Failed to proxy image',
            details: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });
    }
  };
}