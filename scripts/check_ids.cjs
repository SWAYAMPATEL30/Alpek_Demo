const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const appIndex = html.indexOf('id="page-app"');
const appPart = html.substring(appIndex);
const ids = [...appPart.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Total IDs in page-app:', ids.length);
console.log('IDs:', ids);
