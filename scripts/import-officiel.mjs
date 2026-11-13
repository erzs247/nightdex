// Importe toutes les cartes depuis la base de cartes du site officiel (cyberpunktcg.com, fournie par Netdeck),
// avec leurs images. La version française d'une série est utilisée quand elle existe, sinon la version anglaise.
//
// Usage :
//   node scripts/import-officiel.mjs                 récupère les cartes et télécharge les images manquantes
//   node scripts/import-officiel.mjs --raw <dossier> réutilise des images déjà téléchargées (<id>.webp)
//
// Derrière un proxy (ex. session cloud) : NODE_USE_ENV_PROXY=1 node scripts/import-officiel.mjs
// Les prix déjà relevés (data/prices.json) sont conservés : seules les cartes et les images sont mises à jour.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const rawDir = opt('raw');
const API = 'https://api.netdeck.gg/api/cards/cyberpunk';
const WIDTH = 360;

// Séries connues : code court, nom affiché, bloc, ordre d'affichage, date de sortie (si connue)
const SETS = {
  'welcometonightcityretail-fr': { code: 'WNC', name: 'Welcome to Night City', block: 'Welcome to Night City', order: 1, releaseDate: '2026-11-06' },
  'embracingpowerretailstarterde-fr': { code: 'EMP', name: 'Embracing Power – Deck de démarrage', block: 'Welcome to Night City', order: 2, releaseDate: '2026-11-06' },
  'theheistretailstarterdeck-fr': { code: 'HST', name: 'The Heist – Deck de démarrage', block: 'Welcome to Night City', order: 3, releaseDate: '2026-11-06' },
  'prereleaseretail-FR': { code: 'PRE', name: 'Avant-première', block: 'Welcome to Night City', order: 4 },
  'boxtoppersretail-fr': { code: 'BTR', name: 'Box Toppers', block: 'Welcome to Night City', order: 5 },
  'nightcitybrawls1-FR': { code: 'NCB', name: 'Night City Brawl S1', block: 'Jeu organisé & promos', order: 10 },
  'nightcityshowdowns1-FR': { code: 'NCS', name: 'Night City Showdown S1', block: 'Jeu organisé & promos', order: 11 },
  'edgerunneropens1': { code: 'EOS', name: 'Edgerunner Open S1', block: 'Jeu organisé & promos', order: 12 },
  'PRM01': { code: 'PR1', name: 'Promos Set 1', block: 'Jeu organisé & promos', order: 13 },
  'judgepromos': { code: 'JDG', name: 'Promos Juge', block: 'Jeu organisé & promos', order: 14 },
  'welcometonightcitybeta': { code: 'WNB', name: 'Welcome to Night City – Bêta', block: 'Bêta (Kickstarter, en anglais)', order: 20 },
  'embracingpowerbetastarterdeck': { code: 'EMB', name: 'Embracing Power – Bêta', block: 'Bêta (Kickstarter, en anglais)', order: 21 },
  'theheistbetastarterdeck': { code: 'HSB', name: 'The Heist – Bêta', block: 'Bêta (Kickstarter, en anglais)', order: 22 },
  'prereleasebeta': { code: 'PRB', name: 'Avant-première Bêta', block: 'Bêta (Kickstarter, en anglais)', order: 23 },
  'boxtoppersbeta': { code: 'BTB', name: 'Box Toppers Bêta', block: 'Bêta (Kickstarter, en anglais)', order: 24 },
  'arasakademodeck': { code: 'ARA', name: 'Deck de démo Arasaka', block: 'Decks de démo (en anglais)', order: 30 },
  'mercdemodeck': { code: 'MRC', name: 'Deck de démo Mercs', block: 'Decks de démo (en anglais)', order: 31 },
};
const RARITY = {
  'Common': 'Commune', 'Uncommon': 'Peu commune', 'Rare': 'Rare', 'Epic': 'Épique', 'Nova Rare': 'Nova Rare',
  'Iconic Legend': 'Légende iconique', 'Iconic Other': 'Iconique', 'Secret': 'Secrète', 'Iconic Secret': 'Secrète iconique',
};
const TYPE = { Unit: 'Unité', Program: 'Programme', Legend: 'Légende', Gear: 'Équipement' };
const COLOR = { Red: 'Rouge', Blue: 'Bleu', Green: 'Vert', Yellow: 'Jaune' };
const base = (code) => code.toLowerCase().replace(/-fr$/, '');

// 1. Cartes
const items = [];
for (let o = 0; ; o += 100) {
  const r = await fetch(`${API}?limit=100&offset=${o}`);
  if (!r.ok) throw new Error(`Base de cartes : HTTP ${r.status}`);
  const d = await r.json();
  items.push(...d.items);
  if (!d.items.length || items.length >= d.total) break;
}
console.log(`${items.length} cartes dans la base officielle.`);

// 2. Impressions retenues : FR, ou EN sans série FR équivalente
const frBases = new Set();
for (const i of items) for (const p of i.printings) if (p.language === 'fr') frBases.add(base(p.set.code));
const isTwinOfFr = (code) => [...frBases].some((f) => f === base(code) || (f.length >= 28 && base(code).startsWith(f)));
const printings = [];
for (const card of items) for (const p of card.printings) {
  if (p.language === 'fr' || !isTwinOfFr(p.set.code)) printings.push({ card, p });
}

// 3. Séries
const sets = new Map();
let auto = 50;
for (const { p } of printings) {
  if (sets.has(p.set.code)) continue;
  const known = SETS[p.set.code];
  const code = known?.code ?? p.set.name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  sets.set(p.set.code, {
    code, name: known?.name ?? p.set.name, block: known?.block ?? 'Nouvelles séries', order: known?.order ?? auto++,
    releaseDate: known?.releaseDate ?? null, language: p.language,
    source: { netdeck: p.set.code }, cardmarket: { idExpansion: null },
  });
}

// 4. Images (redimensionnées à 360 px de large)
mkdirSync(join(root, 'images'), { recursive: true });
let downloaded = 0;
async function imageFor(p, setCode) {
  const rel = `images/${setCode}/${p.id}.webp`;
  const out = join(root, rel);
  if (existsSync(out)) return rel;
  mkdirSync(dirname(out), { recursive: true });
  let buf;
  const cached = rawDir && join(rawDir, `${p.id}.webp`);
  if (cached && existsSync(cached)) buf = readFileSync(cached);
  else {
    const r = await fetch(p.image_url);
    if (!r.ok) { console.error(`Image indisponible : ${p.id} (HTTP ${r.status})`); return null; }
    buf = Buffer.from(await r.arrayBuffer());
    downloaded++;
  }
  await sharp(buf).resize({ width: WIDTH }).webp({ quality: 72 }).toFile(out);
  return rel;
}

const cards = [];
const queue = [...printings];
async function worker() {
  while (queue.length) {
    const { card, p } = queue.shift();
    const set = sets.get(p.set.code);
    const image = await imageFor(p, set.code);
    cards.push({
      id: `${set.code}-${p.collector_number}`,
      set: set.code,
      number: p.collector_number,
      name: p.localized_name || card.canonical_name || card.name,
      nameEn: card.canonical_name || card.name,
      rarity: RARITY[p.rarity] ?? p.rarity,
      type: TYPE[card.card_type] ?? card.card_type,
      color: COLOR[card.color] ?? card.color,
      cost: card.cost, power: card.power, ram: card.ram,
      artist: p.artist ?? card.artist,
      image,
      official: `https://cyberpunktcg.com/cards/${card.slug}`,
      cardmarket: { idProduct: null, url: null },
    });
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);

// Identifiants uniques (au cas où un numéro serait imprimé deux fois)
const seen = new Map();
for (const c of cards) { const n = (seen.get(c.id) ?? 0) + 1; seen.set(c.id, n); if (n > 1) c.id += `-${n}`; }

// 5. Écriture (on garde les liens Cardmarket déjà renseignés)
const catalogPath = join(root, 'data/catalog.json');
const old = existsSync(catalogPath) ? JSON.parse(readFileSync(catalogPath, 'utf8')) : null;
if (old && !old.demo) {
  const prev = new Map(old.cards.map((c) => [c.id, c]));
  for (const c of cards) if (prev.get(c.id)?.cardmarket?.idProduct) c.cardmarket = prev.get(c.id).cardmarket;
  for (const s of sets.values()) { const ps = old.sets.find((x) => x.code === s.code); if (ps?.cardmarket?.idExpansion) s.cardmarket = ps.cardmarket; }
}
const setList = [...sets.values()].map((s) => ({ ...s, total: cards.filter((c) => c.set === s.code).length })).sort((a, b) => a.order - b.order);
writeFileSync(catalogPath, JSON.stringify({ demo: false, source: 'cyberpunktcg.com', generatedAt: new Date().toISOString(), sets: setList, cards }));

const pricesPath = join(root, 'data/prices.json');
const prices = existsSync(pricesPath) ? JSON.parse(readFileSync(pricesPath, 'utf8')) : null;
if (!prices || prices.demo) {
  writeFileSync(pricesPath, JSON.stringify({ demo: false, source: 'Cardmarket', currency: 'EUR', updatedAt: null, prices: {} }));
}
console.log(`${cards.length} cartes dans ${setList.length} séries, ${downloaded} images téléchargées.`);
