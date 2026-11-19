#!/usr/bin/env node
// Add one photograph to the website.
//
// What it does
//   1. Reads the edited original (any folder, e.g. G:\摄影\...\After\xxx.jpg).
//      The original is only READ, never changed.
//   2. Writes the web files to public/photos-web/:
//        <slug>-800.webp, <slug>-1600.webp, <slug>-2200.webp, <slug>.jpg
//   3. Reads the capture year from EXIF (or from a "20260926 ..." folder name).
//   4. Adds an entry to src/data/photos.js (at the end of the list).
//
// Usage (PowerShell, in the project folder)
//   & 'C:\Program Files\nodejs\npm.cmd' run add-photo -- `
//     --file "G:\摄影\20260926 赤峰...\After\乌兰布统-2.jpg" `
//     --slug ulan-butong-horses `
//     --title "Horses on the Hill" `
//     --place "Ulan Butong, Inner Mongolia" `
//     --series northern-autumn `
//     --alt "Horses grazing on a golden hillside" `
//     --featured
//
// Options
//   --file      required  path to the edited original
//   --slug      required  lowercase-words-with-hyphens, must be new
//   --title     required  short English title (not shown on screen)
//   --alt       required  one-sentence description for screen readers / search
//   --series    required  one of the series keys listed in src/data/photos.js
//   --place     optional  shown under the enlarged photo, e.g. "Oxford"
//   --year      optional  overrides the year found in EXIF / folder name
//   --featured  optional  also show it in Selected Works on the home page
//   --dry-run   optional  show what would happen without writing anything
//
// After adding: run `npm run build`, check the page, then commit.
// To change its position in the grids, move its block inside photos.js.

import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import sharp from 'sharp';
import exifReader from 'exif-reader';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photosFile = join(root, 'src', 'data', 'photos.js');
const outDir = join(root, 'public', 'photos-web');
const sizes = [800, 1600, 2200];
const seriesKeys = [
  'northern-autumn', 'western-sichuan', 'huangshan', 'oxford', 'chongqing',
  'coast', 'westminster', 'night', 'early',
];

const fail = (message) => {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
};

const { values: args } = parseArgs({
  options: {
    file: { type: 'string' },
    slug: { type: 'string' },
    title: { type: 'string' },
    alt: { type: 'string' },
    series: { type: 'string' },
    place: { type: 'string' },
    year: { type: 'string' },
    featured: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
});

for (const key of ['file', 'slug', 'title', 'alt', 'series']) {
  if (!args[key]) fail(`Missing --${key}. See the usage notes at the top of tools/add-photo.mjs.`);
}
if (!existsSync(args.file)) fail(`File not found: ${args.file}`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(args.slug)) {
  fail(`--slug must be lowercase words joined by hyphens, e.g. "wytham-dawn-horse".`);
}
if (!seriesKeys.includes(args.series)) {
  fail(`--series must be one of: ${seriesKeys.join(', ')}`);
}

const photosSource = await readFile(photosFile, 'utf8');
if (photosSource.includes(`slug: '${args.slug}'`)) {
  fail(`A photo with slug "${args.slug}" already exists in photos.js.`);
}

// --- capture year: --year > EXIF > "YYYYMMDD ..." folder name ---------------
const metadata = await sharp(args.file, { failOn: 'none' }).metadata();
let year = args.year ? Number(args.year) : null;
if (!year && metadata.exif) {
  try {
    const exif = exifReader(metadata.exif);
    const date = exif?.Photo?.DateTimeOriginal ?? exif?.Image?.DateTime;
    if (date instanceof Date && !Number.isNaN(date.getTime())) year = date.getFullYear();
  } catch {
    // unreadable EXIF: fall through to the folder name
  }
}
if (!year) {
  const match = args.file.match(/[\\/](\d{4})\d{4}[^\\/]*[\\/]/);
  if (match) year = Number(match[1]);
}
if (!year) fail('Could not find the capture year. Add --year 2026 (for example).');

// --- web files ---------------------------------------------------------------
// fit: 'inside' scales the LONG edge to the target size; never enlarges.
const render = (edge) =>
  sharp(args.file, { failOn: 'none' })
    .rotate()
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true });

const probe = await render(2200).toBuffer({ resolveWithObject: true });
const finalWidth = probe.info.width;
const finalHeight = probe.info.height;
const ratio = finalWidth / finalHeight;
const orientation = ratio > 1.15 ? 'landscape' : ratio < 0.87 ? 'portrait' : 'square';

console.log(`\nAdding "${args.title}" (${basename(args.file)})`);
console.log(`  web size ${finalWidth}×${finalHeight}, ${orientation}, ${year}`);

if (!args['dry-run']) {
  await mkdir(outDir, { recursive: true });
  for (const edge of sizes) {
    const file = `${args.slug}-${edge}.webp`;
    await render(edge).webp({ quality: edge === 2200 ? 86 : 84, effort: 6 }).toFile(join(outDir, file));
    console.log(`  wrote public/photos-web/${file}`);
  }
  await render(2200)
    .jpeg({ quality: 85, mozjpeg: true, progressive: true })
    .toFile(join(outDir, `${args.slug}.jpg`));
  console.log(`  wrote public/photos-web/${args.slug}.jpg`);
}

// --- photos.js entry -----------------------------------------------------------
const quote = (text) => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const lines = [
  `    slug: ${quote(args.slug)},`,
  `    series: ${quote(args.series)},`,
  ...(args.featured ? ['    featured: true,'] : []),
  `    title: ${quote(args.title)},`,
  ...(args.place ? [`    place: ${quote(args.place)},`] : []),
  `    year: ${year},`,
  `    alt: ${quote(args.alt)},`,
  `    orientation: ${quote(orientation)},`,
  `    src: ${quote(`/photos-web/${args.slug}.jpg`)},`,
  `    width: ${finalWidth},`,
  `    height: ${finalHeight},`,
  `    source: ${quote(args.file)},`,
];
const entry = `\n  {\n${lines.join('\n')}\n  },`;
const listEnd = photosSource.indexOf('\n];', photosSource.indexOf('const rawPhotos = ['));
if (listEnd < 0) fail('Could not find the end of rawPhotos in photos.js.');

if (args['dry-run']) {
  console.log('\nDry run, nothing written. photos.js entry would be:' + entry + '\n');
} else {
  await writeFile(photosFile, photosSource.slice(0, listEnd) + entry + photosSource.slice(listEnd));
  console.log('  added entry to src/data/photos.js (end of the list)');
  console.log('\nNext: npm run build, check the page, then commit.\n');
}
