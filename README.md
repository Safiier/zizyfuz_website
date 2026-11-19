# zizyfuz Photography Portfolio

React + Vite photography portfolio, live at https://zizyfuz.com/photography/.
Pushing to `main` deploys automatically through GitHub Pages.

The project rules for AI assistants (Codex, Claude) are in `AGENTS.md`.

## Run the site

npm may not be on PATH on this computer, so use the full Windows path:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

Then open http://127.0.0.1:5173/photography/.

`npm run build` first checks that every photo has all of its web files
(`tools/check-photos.mjs`), then builds the site into `dist/`.

## How the content is organised

- `src/data/photos.js`: every photograph. The order of the list is the order
  on the page. Each photo has a `series`, optional `featured: true` (shown in
  Selected Works on the home page), `place` and `year` (shown under the
  enlarged photo) and an `alt` description.
- `src/data/series.js`: series titles, cover photos and intro text. A series
  only gets its own page when it has **more than 12** photos.
- `public/photos-web/`: four files per photo: `<slug>-800.webp`,
  `<slug>-1600.webp`, `<slug>-2200.webp` and `<slug>.jpg`.

## Add a photo

The edited originals live in `G:\摄影\<date> <place>\After\`. They are only
read, never changed.

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run add-photo -- `
  --file "G:\摄影\20260926 赤峰...\After\乌兰布统-2.jpg" `
  --slug ulan-butong-horses `
  --title "Horses on the Hill" `
  --place "Ulan Butong, Inner Mongolia" `
  --series northern-autumn `
  --alt "Horses grazing on a golden hillside" `
  --featured
```

This writes the four web files, reads the year from EXIF (or from a
`20260926 ...` folder name) and adds the photo at the end of `photos.js`.
Add `--dry-run` to preview without writing anything. Move the photo's block
in `photos.js` to change where it appears.

Series keys: `northern-autumn`, `western-sichuan`, `huangshan`, `oxford`,
`chongqing`, `coast`, `westminster`, `night`, `early`.

## Website analytics

The site supports Google Analytics 4 through the `VITE_GA_MEASUREMENT_ID`
environment variable (value like `G-XXXXXXXXXX`).

- Local testing: copy `.env.example` to `.env.local` and put the real ID in it
  (`.env.local` is ignored by Git).
- Live site: in the GitHub repository go to
  `Settings > Secrets and variables > Actions > Variables`, add
  `GA_MEASUREMENT_ID`, then push to `main` or re-run the deploy workflow.

Use Google Analytics for page views, traffic sources, devices and countries,
and Google Search Console for search clicks, impressions and queries. The
build also publishes an image sitemap at https://zizyfuz.com/sitemap.xml.

## Roll back

The site before the 2026-11 redesign is saved as the Git tag
`v1-live-2026-11-19`.
