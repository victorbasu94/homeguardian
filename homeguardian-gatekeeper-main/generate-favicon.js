import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SVG file
const svgPath = path.join(__dirname, 'public', 'shield-favicon.svg');
// Path to save the PNG file
const pngPath = path.join(__dirname, 'public', 'favicon.png');

// Read the SVG file
const svgBuffer = fs.readFileSync(svgPath);

// Convert SVG to PNG
sharp(svgBuffer)
  .resize(32, 32) // Resize to 32x32 pixels
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log(`PNG favicon created at ${pngPath}`);
  })
  .catch(err => {
    console.error('Error creating PNG favicon:', err);
  }); 