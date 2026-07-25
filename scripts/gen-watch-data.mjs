/**
 * Génère wear/app/src/main/assets/plan.json (version compacte de src/data.js)
 * pour l'application Wear OS (Pixel Watch).
 * Usage : node scripts/gen-watch-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// src/data.js est un module ESM dans un package CommonJS : copie en .mjs pour l'import.
const tmp = join(tmpdir(), `pfl-data-${Date.now()}.mjs`);
copyFileSync(join(root, 'src', 'data.js'), tmp);
const { days } = await import(pathToFileURL(tmp).href);

const compact = days.map((day) => ({
  title: day.title,
  rest: !!day.isRestDay,
  exercises: (day.exercises || []).map((ex) => ({
    name: ex.name,
    sets: ex.totalSets || 4,
    reps: ex.nbRep || 12,
    equip: ex.equip || '',
  })),
}));

const outDir = join(root, 'wear', 'app', 'src', 'main', 'assets');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'plan.json');
writeFileSync(outFile, JSON.stringify(compact));
console.log(`${compact.length} jours écrits dans ${outFile}`);
