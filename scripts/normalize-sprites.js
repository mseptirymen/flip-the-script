import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, '../public/icons');

const TARGET_SIZE = 64;
const PADDING = 4;
const MAX_CONTENT = TARGET_SIZE - (PADDING * 2);

async function processSprite(filePath) {
  const inputBuffer = fs.readFileSync(filePath);
  const { data, info } = await sharp(inputBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * info.channels;
      const alpha = info.channels === 4 ? data[idx + 3] : 255;
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    console.log(`  Empty sprite, skipping: ${filePath}`);
    return;
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;

  const scale = Math.min(MAX_CONTENT / contentWidth, MAX_CONTENT / contentHeight, 1);
  const newWidth = Math.round(contentWidth * scale);
  const newHeight = Math.round(contentHeight * scale);

  const left = Math.round((TARGET_SIZE - newWidth) / 2);
  const top = Math.round((TARGET_SIZE - newHeight) / 2);

  await sharp(inputBuffer)
    .extract({ left: minX, top: minY, width: contentWidth, height: contentHeight })
    .resize(newWidth, newHeight, { kernel: 'lanczos3' })
    .extend({
      top,
      left,
      right: TARGET_SIZE - left - newWidth,
      bottom: TARGET_SIZE - top - newHeight,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toFile(filePath);

  console.log(`  Processed: ${path.basename(filePath)} (${contentWidth}x${contentHeight} -> ${newWidth}x${newHeight})`);
}

async function main() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.png'));
  console.log(`Processing ${files.length} sprites...`);

  for (const file of files) {
    const filePath = path.join(ICONS_DIR, file);
    try {
      await processSprite(filePath);
    } catch (err) {
      console.error(`  Error processing ${file}: ${err.message}`);
    }
  }

  console.log('Done!');
}

main();