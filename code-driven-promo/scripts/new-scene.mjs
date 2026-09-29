#!/usr/bin/env node
// Create src/scenes/<id>.js from a recipe.
// Usage: node new-scene.mjs <projectDir> <sceneId> <recipe> [--force]
//   recipes: hook | hero | app | split | cards | cta
//   node new-scene.mjs . s03 split
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const RECIPES = join(here, '..', 'assets', 'recipes');
const recipes = readdirSync(RECIPES).map((f) => f.replace(/\.js$/, ''));
const [dir, id, recipe] = process.argv.slice(2);
const force = process.argv.includes('--force');
if (!dir || !id || !recipes.includes(recipe)) {
  console.error(`usage: new-scene.mjs <projectDir> <sceneId> <${recipes.join('|')}> [--force]`);
  process.exit(1);
}
const tl = JSON.parse(readFileSync(join(dir, 'src/timeline.json'), 'utf8'));
const scene = tl.scenes.find((s) => s.id === id);
if (!scene) { console.error(`${id} is not in src/timeline.json (have: ${tl.scenes.map((s) => s.id).join(', ')})`); process.exit(1); }
const out = join(dir, 'src/scenes', `${id}.js`);
if (existsSync(out) && !force) { console.error(`${out} exists (use --force to overwrite)`); process.exit(1); }
const src = readFileSync(join(RECIPES, recipe + '.js'), 'utf8').replaceAll('__ID__', id).replaceAll('__NAME__', `${scene.name} ${scene.start}–${scene.end}s`);
writeFileSync(out, src);
console.log(`✓ ${out}  (recipe: ${recipe}, ${scene.end - scene.start}s, bots: ${scene.bots.join(',') || '-'})`);
