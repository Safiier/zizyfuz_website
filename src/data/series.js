import { photos } from './photos.js';

// A series gets its own page only when it has MORE than this many photos.
// Smaller groups (for now: English Coast, Westminster, Night Sky) stay in
// Selected Works / All Works until they grow. Photos with series 'early'
// (Early Work & Others) never get a series page, by choice; they appear in
// All Works only.
export const minSeriesSize = 12;

// Order here = order of the series cards on the home page.
// `intro` is intentionally empty for now; write a short paragraph later and
// it will appear under the series title automatically.
const seriesDefinitions = [
  { key: 'northern-autumn', title: 'Northern Autumn', cover: 'ulan-butong-birch-wall', intro: '' },
  { key: 'western-sichuan', title: 'Western Sichuan', cover: 'genie-tree-and-peak', intro: '' },
  { key: 'huangshan', title: 'Huangshan & Huizhou', cover: 'huangshan-first-light', intro: '' },
  { key: 'oxford', title: 'Wytham & Port Meadow', cover: 'wytham-dawn-horse', intro: '' },
  { key: 'chongqing', title: 'Chongqing', cover: 'chongqing-10', intro: '' },
  { key: 'coast', title: 'English Coast', cover: 'seven-sisters-cliffs', intro: '' },
  { key: 'westminster', title: 'Westminster Abbey', cover: 'westminster-stained-glass', intro: '' },
  { key: 'night', title: 'Night Sky', cover: 'st-hughs-stars', intro: '' },
];

const yearRange = (items) => {
  const years = items.map((photo) => photo.year).filter(Boolean);
  if (!years.length) return '';
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? `${first}` : `${first}–${last}`;
};

export const seriesList = seriesDefinitions
  .map((definition) => {
    const items = photos.filter((photo) => photo.series === definition.key);
    return {
      ...definition,
      items,
      years: yearRange(items),
      coverPhoto: items.find((photo) => photo.slug === definition.cover) ?? items[0],
    };
  })
  .filter((series) => series.items.length > minSeriesSize);

export const seriesByKey = Object.fromEntries(
  seriesList.map((series) => [series.key, series])
);

export const featuredPhotos = photos.filter((photo) => photo.featured);
