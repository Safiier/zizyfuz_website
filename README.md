# zizyfuz Photography Portfolio

A React/Vite photography portfolio for zizyfuz. It uses the original images in
`photos` as source material and serves optimized display copies from
`public/photos-web`.

The full-size `photos` folder is intentionally kept out of Git by `.gitignore`.
This keeps the GitHub repository lighter; the optimized website images are kept
in `public/photos-web`.

## Run the site

Because this Codex shell does not currently expose `npm` in PATH, use the full
Windows npm path:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

Then open the local URL printed by Vite.

## Add future photos

1. Put the new original photo in `photos`.
2. Create one optimized JPG copy in `public/photos-web`.
3. Add one object to `src/data/photos.js`.

To optimize one new image, run this from the project folder:

```powershell
.\tools\Optimize-Photo.ps1 -Source '.\photos\New Photo.jpg' -Target '.\public\photos-web\new-photo.jpg'
```

This keeps the original file unchanged and writes a smaller web copy.

Example:

```js
{
  slug: 'new-photo',
  title: 'New Photo',
  category: 'Landscape',
  orientation: 'landscape',
  src: '/photos-web/new-photo.jpg',
  original: 'photos/New Photo.jpg',
}
```

Use `featured: true` on a photo if you want it to be eligible for the home page
hero image.
