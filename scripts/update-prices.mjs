// Met à jour les prix depuis les fichiers publics de Cardmarket
// (liste des produits + guide des prix, publiés chaque jour par Cardmarket).
//
// Usage :
//   node scripts/update-prices.mjs --game 99          télécharge et met à jour
//   node scripts/update-prices.mjs --dir ./cm         utilise des fichiers déjà téléchargés
//   node scripts/update-prices.mjs --game 99 --bootstrap
//        reconstruit la liste des cartes à partir des produits Cardmarket
//        (à faire une fois, ou quand une nouvelle série sort)
//
// Chaque exécution ajoute le prix « tendance » du jour à l'historique de chaque carte :
// c'est ce qui dessine la courbe de prix dans l'appli. Lancez-le une fois par jour
// (la GitHub Action fournie le fait automatiquement).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? (args[i + 1] ?? true) : undefined; };

const config = readJson('data/config.json');
const idGame = opt('game') ?? process.env.CM_GAME_ID ?? config.cardmarket.idGame;
const dir = opt('dir');
const bootstrap = args.includes('--bootstrap');

if (!idGame && !dir) {
  console.error('Indiquez l\'identifiant du jeu Cardmarket : --game <idGame> (ou "idGame" dans data/config.json), ou --dir <dossier>.');
  process.exit(1);
}

async function load(kind) {
  if (dir) {
    const prefix = kind === 'products' ? 'products_singles' : 'price_guide';
    const f = readdirSync(dir).find((n) => n.startsWith(prefix) && n.endsWith('.json'));
    if (!f) throw new Error(`Fichier ${prefix}_*.json introuvable dans ${dir}`);
    return JSON.parse(readFileSync(join(dir, f), 'utf8'));
  }
  const url = config.cardmarket[kind === 'products' ? 'productsUrl' : 'priceGuideUrl'].replace('{idGame}', idGame);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const num = (v) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null);
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const productsFile = await load('products');
const guideFile = await load('guide');
const products = productsFile.products ?? productsFile;
const guides = guideFile.priceGuides ?? guideFile;
const guideById = new Map(guides.map((g) => [g.idProduct, g]));
console.log(`Cardmarket : ${products.length} produits, ${guides.length} prix.`);

let catalog = existsSync(join(root, 'data/catalog.json')) ? readJson('data/catalog.json') : { sets: [], cards: [] };
let pricesFile = existsSync(join(root, 'data/prices.json')) ? readJson('data/prices.json') : { prices: {} };

// Le jeu de démonstration est remplacé dès le premier import réel
if (catalog.demo || bootstrap) {
  const map = config.expansions.map ?? {};
  const setsByExp = new Map();
  const counters = new Map();
  const cards = [];
  const old = new Map(catalog.demo ? [] : catalog.cards.map((c) => [c.cardmarket?.idProduct, c]));
  for (const p of [...products].sort((a, b) => a.idExpansion - b.idExpansion || a.idProduct - b.idProduct)) {
    const code = map[p.idExpansion] ?? `EXP${p.idExpansion}`;
    if (!setsByExp.has(p.idExpansion)) {
      // on garde le nom et la date d'une série déjà importée (jamais ceux de la démo)
      const prev = catalog.demo ? null : catalog.sets.find((s) => s.code === code);
      setsByExp.set(p.idExpansion, {
        code, name: prev?.name ?? `Extension ${p.idExpansion}`, block: prev?.block ?? 'Séries',
        releaseDate: prev?.releaseDate ?? p.dateAdded?.slice(0, 10) ?? null,
        cardmarket: { idExpansion: p.idExpansion },
      });
    }
    const n = (counters.get(code) ?? 0) + 1;
    counters.set(code, n);
    const keep = old.get(p.idProduct);
    cards.push(keep ?? {
      id: `${code}-${p.idProduct}`, set: code, number: String(n).padStart(3, '0'), name: p.name,
      rarity: null, type: null, color: null, image: null,
      cardmarket: { idProduct: p.idProduct, url: null },
    });
  }
  const sets = [...setsByExp.values()].map((s) => ({ ...s, total: counters.get(s.code) }));
  catalog = { demo: false, generatedAt: new Date().toISOString(), sets, cards };
  if (pricesFile.demo) pricesFile = { prices: {} };
  console.log(`Catalogue reconstruit : ${cards.length} cartes, ${sets.length} séries.`);
}

// Rattache chaque carte à son produit Cardmarket (par identifiant, sinon par nom dans la même extension)
const byName = new Map();
for (const p of products) byName.set(`${p.idExpansion}|${norm(p.name)}`, p);
let matched = 0;
for (const c of catalog.cards) {
  if (!c.cardmarket?.idProduct) {
    const set = catalog.sets.find((s) => s.code === c.set);
    const p = byName.get(`${set?.cardmarket?.idExpansion}|${norm(c.name)}`);
    if (p) c.cardmarket = { ...(c.cardmarket ?? {}), idProduct: p.idProduct };
  }
  const g = guideById.get(c.cardmarket?.idProduct);
  if (!g) continue;
  matched++;
  const trend = num(g.trend) ?? num(g.avg) ?? num(g.low);
  const entry = pricesFile.prices[c.id] ?? { history: [] };
  Object.assign(entry, {
    trend, low: num(g.low), avg: num(g.avg),
    avg1: num(g.avg1), avg7: num(g.avg7), avg30: num(g.avg30),
    trendFoil: num(g['trend-holo'] ?? g['trend-foil']),
  });
  // Premier passage : on amorce la courbe avec les moyennes 30 j / 7 j / 1 j de Cardmarket
  if (entry.history.length === 0) {
    entry.seeded = true;
    if (entry.avg30) entry.history.push([daysAgo(30), entry.avg30]);
    if (entry.avg7) entry.history.push([daysAgo(7), entry.avg7]);
    if (entry.avg1) entry.history.push([daysAgo(1), entry.avg1]);
  }
  if (trend != null) {
    entry.history = entry.history.filter((h) => h[0] !== today);
    entry.history.push([today, trend]);
  }
  pricesFile.prices[c.id] = entry;
}

pricesFile = {
  demo: false, source: 'Cardmarket', currency: 'EUR',
  updatedAt: today, cardmarketCreatedAt: guideFile.createdAt ?? null,
  prices: pricesFile.prices,
};
writeFileSync(join(root, 'data/catalog.json'), JSON.stringify(catalog));
writeFileSync(join(root, 'data/prices.json'), JSON.stringify(pricesFile));
console.log(`${matched}/${catalog.cards.length} cartes ont un prix Cardmarket au ${today}.`);
