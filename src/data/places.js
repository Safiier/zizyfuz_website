// Rough coordinates for each place name used in photos.js (one decimal is
// enough — this is a quiet detail, not a map). Add a line when you add a
// photo from a new place; unknown places simply show no coordinates.
const places = {
  'Huangshan, Anhui': '30.1° N  118.2° E',
  'Chengkan, Anhui': '29.9° N  118.3° E',
  'Chifeng, Inner Mongolia': '42.3° N  118.9° E',
  'Ulan Butong, Inner Mongolia': '42.6° N  117.2° E',
  'Mount Genyen, Sichuan': '29.8° N  99.7° E',
  'Bipenggou, Sichuan': '31.4° N  102.9° E',
  'Jiuzhaigou, Sichuan': '33.2° N  103.9° E',
  'Dali, Yunnan': '25.6° N  100.2° E',
  'Guilin, Guangxi': '25.3° N  110.3° E',
  Chongqing: '29.6° N  106.6° E',
  'Tiaodeng, Chongqing': '29.4° N  106.5° E',
  Oxford: '51.8° N  1.3° W',
  'Wytham, Oxford': '51.8° N  1.3° W',
  'Wytham Woods, Oxford': '51.8° N  1.3° W',
  'Port Meadow, Oxford': '51.8° N  1.3° W',
  "St Hugh's College, Oxford": '51.8° N  1.3° W',
  'Westminster Abbey, London': '51.5° N  0.1° W',
  'Seven Sisters, East Sussex': '50.8° N  0.2° E',
  'Beachy Head, East Sussex': '50.7° N  0.2° E',
  'Old Harry Rocks, Dorset': '50.6° N  1.9° W',
  'Swanage, Dorset': '50.6° N  2.0° W',
  Dorset: '50.7° N  2.3° W',
  Singapore: '1.3° N  103.8° E',
  'Singapore Zoo': '1.4° N  103.8° E',
  'Jurong Bird Park, Singapore': '1.3° N  103.7° E',
  'Johor Strait, Singapore': '1.4° N  103.8° E',
};

export const photoCoordinates = (photo) => places[photo.place] ?? '';
