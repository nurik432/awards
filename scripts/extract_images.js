const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'farovon_awards_slider.html');
const imagesDir = path.join(__dirname, '..', 'public', 'images');
const outputHtmlPath = path.join(__dirname, '..', 'public', 'clean_content.html');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Extract base64 images from src attributes
const base64Regex = /src="data:image\/(jpeg|png|gif|webp|svg\+xml);base64,([^"]+)"/g;

let imgCount = 0;
html = html.replace(base64Regex, (match, ext, base64Data) => {
  imgCount++;
  const cleanExt = ext.replace('+xml', '');
  const filename = `image_${imgCount}.${cleanExt}`;
  const filepath = path.join(imagesDir, filename);
  
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`  Extracted: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return `src="/images/${filename}"`;
});

// Extract base64 images from CSS url() if any
const cssBase64Regex = /url\(['"]?data:image\/(jpeg|png|gif|webp|svg\+xml);base64,([^)'"]+)['"]?\)/g;
html = html.replace(cssBase64Regex, (match, ext, base64Data) => {
  imgCount++;
  const cleanExt = ext.replace('+xml', '');
  const filename = `bg_${imgCount}.${cleanExt}`;
  const filepath = path.join(imagesDir, filename);
  
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`  Extracted CSS bg: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return `url('/images/${filename}')`;
});

fs.writeFileSync(outputHtmlPath, html, 'utf8');
console.log(`\nDone! Extracted ${imgCount} images total.`);
console.log(`Clean HTML saved to: ${outputHtmlPath}`);
console.log(`Clean HTML size: ${(fs.statSync(outputHtmlPath).size / 1024).toFixed(1)} KB`);
