// Safety check run before every build: every photo in src/data/photos.js must
// have its four web files, a unique slug and the basic fields. A missing file
// stops the build, so a broken image can never be deployed.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { photos } from '../src/data/photos.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const seen = new Set();

for (const photo of photos) {
  if (seen.has(photo.slug)) problems.push(`duplicate slug: ${photo.slug}`);
  seen.add(photo.slug);
  for (const field of ['series', 'title', 'year', 'alt', 'width', 'height']) {
    if (!photo[field]) problems.push(`${photo.slug}: missing ${field}`);
  }
  const files = [`${photo.slug}.jpg`, ...[800, 1600, 2200].map((edge) => `${photo.slug}-${edge}.webp`)];
  for (const file of files) {
    if (!existsSync(join(root, 'public', 'photos-web', file))) {
      problems.push(`${photo.slug}: missing public/photos-web/${file}`);
    }
  }
}

if (problems.length) {
  console.error(`\n✗ Photo check failed:\n  ${problems.join('\n  ')}\n`);
  process.exit(1);
}
console.log(`✓ Photo check: ${photos.length} photos, all files present.`);
