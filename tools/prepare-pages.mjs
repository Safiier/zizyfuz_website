import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const distRoot = join(root, '..', 'dist');
const siteUrl = 'https://zizyfuz.com';
const photographyUrl = `${siteUrl}/photography/`;

await mkdir(distRoot, { recursive: true });

await writeFile(join(distRoot, 'CNAME'), 'zizyfuz.com\n');

await writeFile(
  join(distRoot, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${photographyUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
);

await writeFile(
  join(distRoot, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
);

await writeFile(
  join(distRoot, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0; url=/photography/" />
    <title>zizyfuz</title>
    <link rel="canonical" href="${photographyUrl}" />
  </head>
  <body>
    <script>
      window.location.replace('/photography/');
    </script>
    <a href="/photography/">Enter photography portfolio</a>
  </body>
</html>
`
);
