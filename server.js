// ALPEK Supplier Linking Platform - Production Server
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './src/router.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Route API calls
  if (url.pathname.startsWith('/api/')) {
    try {
      await handleApiRequest(req, res, url);
    } catch (err) {
      console.error('API Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    }
    return;
  }

  // Serve static assets from public/
  let filePath = join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = extname(filePath).toLowerCase();

  try {
    const content = await readFile(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // SPA Fallback to index.html
      try {
        const indexHtml = await readFile(join(PUBLIC_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexHtml);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n================================================================`);
  console.log(`🚀 ALPEK SAP Supplier Linking Platform running on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`================================================================`);
  console.log(`⚡ Clean Core Mode: Enabled (S/4HANA OData v4 & cXML / IDocs)`);
  console.log(`⚡ Active Roles: Buyer/Approver & External Supplier Portal\n`);
});
