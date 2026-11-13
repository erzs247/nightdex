// Importe toutes les cartes depuis la base de cartes du site officiel (cyberpunktcg.com, fournie par Netdeck),
// avec leurs images en français et en anglais.
//
// Usage :
//   node scripts/import-officiel.mjs                 récupère les cartes et télécharge les images manquantes
//   node scripts/import-officiel.mjs --raw <dossier> réutilise des images déjà téléchargées (<id>.webp)
//
// Derrière un proxy (ex. session cloud) : NODE_USE_ENV_PROXY=1 node scripts/import-officiel.mjs
// Les prix déjà relevés (data/prices.json) et les liens Cardmarket sont conservés.
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

// Séries : code interne (stable), code imprimé sur les cartes, noms FR/EN, bloc, ordre, date
const SETS = {
  'welcometonightcityretail': { code: 'WNC', print: 'MS01', fr: 'Welcome to Night City', en: 'Welcome to Night City', block: 'wnc', order: 1, releaseDate: '2026-11-06' },
  'embracingpowerretailstarterdeck': { code: 'EMP', print: 'SD02', fr: 'Embracing Power – Deck de démarrage', en: 'Embracing Power – Starter Deck', block: 'wnc', order: 2, releaseDate: '2026-11-06' },
  'theheistretailstarterdeck': { code: 'HST', print: 'SD01', fr: 'The Heist – Deck de démarrage', en: 'The Heist – Starter Deck', block: 'wnc', order: 3, releaseDate: '2026-11-06' },
  'prereleaseretail': { code: 'PRE', print: 'PRR02', fr: 'Avant-première', en: 'Pre-Release', block: 'wnc', order: 4 },
  'boxtoppersretail': { code: 'BTR', print: 'PRM-WNC', fr: 'Box Toppers', en: 'Box Toppers', block: 'wnc', order: 5 },
  'nightcitybrawls1': { code: 'NCB', print: 'NCB01', fr: 'Night City Brawl S1', en: 'Night City Brawl S1', block: 'op', order: 10 },
  'nightcityshowdowns1': { code: 'NCS', print: 'NCS01', fr: 'Night City Showdown S1', en: 'Night City Showdown S1', block: 'op', order: 11 },
  'edgerunneropens1': { code: 'EOS', print: 'EOR01', fr: 'Edgerunner Open S1', en: 'Edgerunner Open S1', block: 'op', order: 12 },
  'prm01': { code: 'PR1', print: 'PRM01', fr: 'Promos Set 1', en: 'Set 1 Promos', block: 'op', order: 13 },
  'judgepromos': { code: 'JDG', print: 'JDG', fr: 'Promos Juge', en: 'Judge Promos', block: 'op', order: 14 },
  'welcometonightcitybeta': { code: 'WNB', print: 'MS01 β', fr: 'Welcome to Night City – Bêta', en: 'Welcome to Night City – Beta', block: 'beta', order: 20 },
  'embracingpowerbetastarterdeck': { code: 'EMB', print: 'SD02 β', fr: 'Embracing Power – Bêta', en: 'Embracing Power – Beta', block: 'beta', order: 21 },
  'theheistbetastarterdeck': { code: 'HSB', print: 'SD01 β', fr: 'The Heist – Bêta', en: 'The Heist – Beta', block: 'beta', order: 22 },
  'prereleasebeta': { code: 'PRB', print: 'PRR01', fr: 'Avant-première Bêta', en: 'Pre-Release Beta', block: 'beta', order: 23 },
  'boxtoppersbeta': { code: 'BTB', print: 'PRM-WNC β', fr: 'Box Toppers Bêta', en: 'Box Toppers Beta', block: 'beta', order: 24 },
  'arasakademodeck': { code: 'ARA', print: 'DD2', fr: 'Deck de démo Embracing Power', en: 'Embracing Power – Demo Deck', block: 'demo', order: 30 },
  'mercdemodeck': { code: 'MRC', print: 'DD1', fr: 'Deck de démo The Heist', en: 'The Heist – Demo Deck', block: 'demo', order: 31 },
};
// identifiant de série officiel → clé commune FR/EN (« …-fr », « …-FR » et noms tronqués)
const KEYS = Object.keys(SETS);
const setKey = (code) => {
  const b = code.toLowerCase().replace(/-fr$/, '');
  return KEYS.find((k) => k === b) ?? KEYS.find((k) => b.length >= 28 && k.startsWith(b)) ?? b;
};

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

// 2. Une entrée par (série, numéro), avec la version FR et la version EN quand elles existent
// numéros sur 3 chiffres (la base contient parfois « 10 » au lieu de « 010 »)
const padNum = (n) => String(n).replace(/^(\D*)(\d+)/, (_, pre, d) => pre + d.padStart(3, '0'));
const entries = new Map();
for (const card of items) for (const p of card.printings) {
  const number = padNum(p.collector_number);
  const key = `${setKey(p.set.code)}|${number}`;
  const e = entries.get(key) ?? { card, setKey: setKey(p.set.code), number, setName: p.set.name };
  e[p.language === 'fr' ? 'fr' : 'en'] = p;
  entries.set(key, e);
}

// 3. Séries
const sets = new Map();
let auto = 0; // nouvelles séries inconnues : ordre négatif → affichées en tête de l'accueil
for (const e of entries.values()) {
  if (sets.has(e.setKey)) continue;
  const k = SETS[e.setKey];
  const code = k?.code ?? e.setName.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  sets.set(e.setKey, {
    code, print: k?.print ?? code, name: k?.fr ?? e.setName, nameEn: k?.en ?? e.setName,
    block: k?.block ?? 'new', order: k?.order ?? --auto, releaseDate: k?.releaseDate ?? null,
    source: { netdeck: e.setKey }, cardmarket: { idExpansion: null, slug: null },
  });
}

// 4. Images (360 px de large, WebP)
let downloaded = 0;
async function imageFor(p, setCode) {
  if (!p) return null;
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
const queue = [...entries.values()];
async function worker() {
  while (queue.length) {
    const e = queue.shift();
    const { card } = e;
    const set = sets.get(e.setKey);
    const main = e.fr ?? e.en;
    const nameEn = card.canonical_name || card.name;
    cards.push({
      id: `${set.code}-${e.number}`,
      set: set.code,
      number: e.number,
      name: e.fr?.localized_name || nameEn,
      nameEn,
      rarity: main.rarity,
      type: card.card_type,
      color: card.color,
      cost: card.cost, power: card.power, ram: card.ram,
      artist: main.artist ?? card.artist,
      image: await imageFor(e.fr ?? e.en, set.code),
      imageEn: e.fr && e.en ? await imageFor(e.en, set.code) : null,
      languages: [e.fr && 'fr', e.en && 'en'].filter(Boolean),
      official: `https://cyberpunktcg.com/cards/${card.slug}`,
      cardmarket: { idProduct: null, path: null },
    });
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
cards.sort((a, b) => a.set.localeCompare(b.set) || a.number.localeCompare(b.number, 'en', { numeric: true }));

// 5. Écriture (on garde les rattachements Cardmarket déjà faits)
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
