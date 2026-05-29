#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { Readable } = require('stream');

const DEFAULT_INPUT = 'https://glovo-products-dataset-d1c9720d.s3.amazonaws.com/glovo-foodi-ml-dataset.csv';
const DEFAULT_OUTPUT = path.join('src', 'data', 'glovoFoodDatabase.js');

const args = parseArgs(process.argv.slice(2));
const input = args.input || DEFAULT_INPUT;
const output = args.output || DEFAULT_OUTPUT;
const country = (args.country || 'CI').toUpperCase();
const city = args.city ? args.city.toUpperCase() : null;
const limit = Number.isFinite(Number(args.limit)) ? Number(args.limit) : 500;

const profiles = {
  drinks: { calories: 42, protein: 0, carbs: 10.5, fat: 0, unit: '100ml' },
  water: { calories: 0, protein: 0, carbs: 0, fat: 0, unit: '100ml' },
  juice: { calories: 48, protein: 0.3, carbs: 11.5, fat: 0.1, unit: '100ml' },
  alcohol: { calories: 80, protein: 0.1, carbs: 4, fat: 0, unit: '100ml' },
  coffee: { calories: 35, protein: 1.5, carbs: 5, fat: 1, unit: '100ml' },
  pizza: { calories: 266, protein: 11, carbs: 33, fat: 10, unit: '100g' },
  burger: { calories: 295, protein: 15, carbs: 29, fat: 14, unit: '100g' },
  sandwich: { calories: 240, protein: 11, carbs: 30, fat: 8, unit: '100g' },
  fries: { calories: 312, protein: 3.4, carbs: 41, fat: 15, unit: '100g' },
  pasta: { calories: 160, protein: 5, carbs: 28, fat: 3, unit: '100g' },
  rice: { calories: 180, protein: 4, carbs: 31, fat: 4, unit: '100g' },
  ivorian: { calories: 185, protein: 8, carbs: 24, fat: 6, unit: '100g' },
  fish: { calories: 180, protein: 23, carbs: 1, fat: 8, unit: '100g' },
  poultry: { calories: 190, protein: 24, carbs: 1, fat: 10, unit: '100g' },
  meat: { calories: 230, protein: 23, carbs: 1, fat: 15, unit: '100g' },
  vegetarian: { calories: 130, protein: 5, carbs: 18, fat: 4, unit: '100g' },
  salad: { calories: 85, protein: 3, carbs: 8, fat: 4, unit: '100g' },
  sauce: { calories: 120, protein: 4, carbs: 8, fat: 8, unit: '100g' },
  dessert: { calories: 330, protein: 5, carbs: 48, fat: 13, unit: '100g' },
  bakery: { calories: 300, protein: 8, carbs: 50, fat: 8, unit: '100g' },
  snack: { calories: 450, protein: 7, carbs: 55, fat: 22, unit: '100g' },
  dairy: { calories: 95, protein: 4, carbs: 7, fat: 5, unit: '100g' },
  meal: { calories: 180, protein: 9, carbs: 20, fat: 7, unit: '100g' }
};

const nonFoodPattern = new RegExp([
  'shampoo', 'savon', 'gel douche', 'dentifrice', 'brosse', 'parfum', 'deodorant', 'déodorant',
  'lessive', 'detergent', 'détergent', 'javel', 'essuie', 'mouchoir', 'serviette hygienique',
  'serviette hygiénique', 'couche', 'lingette', 'papier toilette', 'poubelle', 'ampoule', 'pile',
  'chargeur', 'cable usb', 'câble usb', 'telephone', 'téléphone', 'maquillage', 'rasoir',
  'creme visage', 'crème visage', 'lotion', 'insecticide', 'repulsif', 'répulsif'
].join('|'), 'i');

const foodSignalPattern = new RegExp([
  'plat', 'menu', 'restaurant', 'boisson', 'drink', 'pizza', 'burger', 'sandwich', 'riz', 'poulet',
  'poisson', 'viande', 'sauce', 'salade', 'dessert', 'gâteau', 'gateau', 'glace', 'tarte', 'pâte',
  'pate', 'spaghetti', 'pasta', 'grill', 'braisé', 'braise', 'frit', 'frites', 'atti[eé]k[eé]',
  'alloco', 'garba', 'kedjenou', 'kédjénou', 'placali', 'foutou', 'igname', 'banane', 'bissap',
  'jus', 'coca', 'eau', 'café', 'cafe', 'vin', 'bi[eè]re', 'crêpe', 'crepe', 'kebab', 'tacos',
  'wrap', 'beignet', 'croissant', 'pain', 'sushi', 'ravioli', 'soupe', 'fromage', 'yaourt'
].join('|'), 'i');

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const seen = new Set();
  const foods = [];
  const abort = new AbortController();
  const stream = await openInputStream(input, abort.signal);

  let headers = null;
  await parseCsvStream(stream, (record) => {
    if (!headers) {
      headers = record;
      return true;
    }

    const row = toRow(headers, record);
    if (!matchesScope(row)) return true;

    const item = buildFoodItem(row);
    if (!item) return true;

    const key = normalizeKey(item.name);
    if (seen.has(key)) return true;

    seen.add(key);
    foods.push(item);

    if (limit > 0 && foods.length >= limit) {
      abort.abort();
      return false;
    }

    return true;
  });

  writeOutput(foods, output, { input, country, city, limit });
  console.log(`Generated ${foods.length} Glovo FooDI-ML entries in ${output}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function openInputStream(source, signal) {
  if (/^https?:\/\//i.test(source)) {
    return new Promise((resolve, reject) => {
      const client = source.startsWith('https:') ? https : http;
      const request = client.get(source, { signal }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          resolve(openInputStream(response.headers.location, signal));
          return;
        }
        if (response.statusCode !== 200 && response.statusCode !== 206) {
          reject(new Error(`HTTP ${response.statusCode} while reading ${source}`));
          return;
        }
        resolve(response);
      });
      request.on('error', (error) => {
        if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
          resolve(Readable.from([]));
          return;
        }
        reject(error);
      });
    });
  }

  return fs.createReadStream(source, { encoding: 'utf8' });
}

async function parseCsvStream(stream, onRecord) {
  let row = [];
  let field = '';
  let inQuotes = false;
  let pendingQuote = false;
  let shouldContinue = true;

  const endField = () => {
    row.push(field);
    field = '';
  };

  const endRecord = () => {
    endField();
    const current = row;
    row = [];
    if (current.length === 1 && current[0] === '') return;
    shouldContinue = onRecord(current) !== false;
  };

  try {
  for await (const chunk of stream) {
    if (!shouldContinue) break;
    const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    for (let i = 0; i < text.length; i += 1) {
      let char = text[i];
      let reprocess = true;
      while (reprocess) {
        reprocess = false;

        if (pendingQuote) {
          pendingQuote = false;
          if (char === '"') {
            field += '"';
            continue;
          }
          inQuotes = false;
          reprocess = true;
          continue;
        }

        if (inQuotes) {
          if (char === '"') {
            pendingQuote = true;
          } else {
            field += char;
          }
          continue;
        }

        if (char === '"' && field === '') {
          inQuotes = true;
        } else if (char === ',') {
          endField();
        } else if (char === '\n') {
          endRecord();
        } else if (char !== '\r') {
          field += char;
        }
      }

      if (!shouldContinue) break;
    }
  }

  } catch (error) {
    if (shouldContinue || !isAbortError(error)) {
      throw error;
    }
  }

  if (shouldContinue && (field || row.length)) {
    endRecord();
  }
}

function isAbortError(error) {
  return error && (error.name === 'AbortError' || error.code === 'ABORT_ERR' || error.code === 'ECONNRESET');
}

function toRow(headers, record) {
  return headers.reduce((acc, header, index) => {
    acc[header] = record[index] || '';
    return acc;
  }, {});
}

function matchesScope(row) {
  if (country !== 'ALL' && String(row.country_code || '').toUpperCase() !== country) return false;
  if (city && String(row.city_code || '').toUpperCase() !== city) return false;
  return true;
}

function buildFoodItem(row) {
  const name = cleanName(row.product_name);
  if (!name || name.length < 2 || name.length > 90) return null;

  const section = cleanText(row.collection_section);
  const description = cleanText(row.product_description);
  const storeName = cleanText(row.store_name);
  const productContext = `${name} ${section} ${description}`;
  const combined = `${productContext} ${storeName}`;

  if (nonFoodPattern.test(removeAccents(combined))) return null;
  if (!foodSignalPattern.test(combined) && row.HIER !== 'True') return null;

  const inferred = inferProfile(productContext);
  const aliases = unique([section, storeName].filter(Boolean)).slice(0, 3);

  return {
    name,
    calories: inferred.calories,
    protein: inferred.protein,
    carbs: inferred.carbs,
    fat: inferred.fat,
    category: 'glovo_food',
    categories: unique(['glovo_food', inferred.category]),
    unit: inferred.unit,
    aliases,
    source: 'glovo-foodi-ml',
    nutritionSource: 'estimated',
    countryCode: row.country_code || undefined,
    cityCode: row.city_code || undefined
  };
}

function inferProfile(value) {
  const text = removeAccents(value).toLowerCase();

  if (/\b(eau|water)\b/.test(text)) return withCategory('drinks', profiles.water);
  if (/\b(coca|fanta|sprite|soda|sucre|boisson gazeuse)\b/.test(text)) return withCategory('drinks', profiles.drinks);
  if (/\b(jus|smoothie|bissap|gingembre|gnamak|tamarin|corossol|baobab|bouye)\b/.test(text)) return withCategory('drinks', profiles.juice);
  if (/\b(vins?|biere|bière|champagne|whisky|rhum|vodka|tchapalo|bandji|cocktail)\b/.test(text)) return withCategory('alcohol', profiles.alcohol);
  if (/\b(cafe|coffee|latte|cappuccino|the |th[eé])\b/.test(text)) return withCategory('drinks', profiles.coffee);
  if (/\b(pizza)\b/.test(text)) return withCategory('fastfood', profiles.pizza);
  if (/\b(burger|cheeseburger)\b/.test(text)) return withCategory('fastfood', profiles.burger);
  if (/\b(sandwich|panini|wrap|tacos|kebab|shawarma|croque)\b/.test(text)) return withCategory('fastfood', profiles.sandwich);
  if (/\b(frite|frites|pomme de terre saute|potato)\b/.test(text)) return withCategory('fastfood', profiles.fries);
  if (/\b(spaghetti|pasta|pate|pates|lasagne|tagliatelle)\b/.test(text)) return withCategory('carbs', profiles.pasta);
  if (/\b(riz|rice)\b/.test(text)) return withCategory('carbs', profiles.rice);
  if (/\b(attieke|alloco|garba|placali|foutou|attieke|akpessi|kedjenou|kabato|igname|manioc)\b/.test(text)) return withCategory('ivorian', profiles.ivorian);
  if (/\b(poisson|thon|saumon|crevette|shrimp|fish)\b/.test(text)) return withCategory('fish_seafood', profiles.fish);
  if (/\b(poulet|chicken|dinde|pintade)\b/.test(text)) return withCategory('poultry', profiles.poultry);
  if (/\b(boeuf|bœuf|viande|steak|porc|agneau|saucisse|jambon|beef|meat)\b/.test(text)) return withCategory('meat', profiles.meat);
  if (/\b(vegan|vegetarien|legume|veg )\b/.test(text)) return withCategory('vegetables', profiles.vegetarian);
  if (/\b(salade|salad)\b/.test(text)) return withCategory('vegetables', profiles.salad);
  if (/\b(sauce|soupe|potage|soup)\b/.test(text)) return withCategory('condiments', profiles.sauce);
  if (/\b(crepe|gateau|cake|glace|ice cream|dessert|chocolat|tarte|donut)\b/.test(text)) return withCategory('snacks', profiles.dessert);
  if (/\b(pain|croissant|baguette|viennoiserie|brioche)\b/.test(text)) return withCategory('bread', profiles.bakery);
  if (/\b(chips|popcorn|bonbon|snack)\b/.test(text)) return withCategory('snacks', profiles.snack);
  if (/\b(fromage|cheese|yaourt|yogurt|lait)\b/.test(text)) return withCategory('dairy', profiles.dairy);

  return withCategory('meals', profiles.meal);
}

function withCategory(category, profile) {
  return { category, ...profile };
}

function cleanName(value) {
  return cleanText(value)
    .replace(/\s*\(\d{5,}\)\s*/g, ' ')
    .replace(/\b\d{6,}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanText(value) {
  return String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeKey(value) {
  return removeAccents(cleanText(value)).toLowerCase();
}

function removeAccents(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function writeOutput(foods, destination, meta) {
  const absolute = path.resolve(destination);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });

  const body = [
    '// Generated by scripts/import-glovo-foodi.js from Glovo FooDI-ML.',
    '// FooDI-ML provides product metadata, not nutrition facts; calories/macros here are heuristic estimates.',
    `// Source: ${meta.input}`,
    `// Filters: country=${meta.country}${meta.city ? ` city=${meta.city}` : ''} limit=${meta.limit}`,
    '',
    'export const glovoFoodDatabase =',
    JSON.stringify(foods, null, 2),
    ';',
    ''
  ].join('\n');

  fs.writeFileSync(absolute, body, 'utf8');
}
