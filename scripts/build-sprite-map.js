import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildMap() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
  const data = await response.json();

  const map = {};
  for (const pokemon of data.results) {
    const id = pokemon.url.split('/').filter(Boolean).pop();
    map[id] = pokemon.name;
  }

  const spritesDir = path.join(__dirname, '../public/sprites/icons');
  const files = fs.readdirSync(spritesDir).filter(f => f.endsWith('.png'));

  const renames = [];

  for (const file of files) {
    const nameWithoutExt = file.replace('.png', '');
    const parts = nameWithoutExt.split('-');
    const id = parts[0];

    if (id in map) {
      const newName = parts.length > 1
        ? `${map[id]}-${parts.slice(1).join('-')}.png`
        : `${map[id]}.png`;

      if (newName !== file) {
        renames.push({ from: file, to: newName });
      }
    } else {
      console.log(`ID ${id} not found: ${file}`);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, '../src/data/spriteMap.json'),
    JSON.stringify(map, null, 2)
  );

  const renameScript = renames
    .map(r => `mv "public/sprites/icons/${r.from}" "public/sprites/icons/${r.to}"`)
    .join('\n');

  fs.writeFileSync(path.join(__dirname, 'rename_sprites.sh'), renameScript);
  fs.chmodSync(path.join(__dirname, 'rename_sprites.sh'), '755');

  console.log(`Mapped ${Object.keys(map).length} pokemon`);
  console.log(`Generated ${renames.length} renames`);
  console.log('Run: bash scripts/rename_sprites.sh');
}

buildMap();