// Relève les prix Cardmarket du jour à partir des fichiers publics de Cardmarket
// (liste des produits + guide des prix, publiés chaque nuit pour chaque jeu ; Cyberpunk = jeu n° 23).
//
// Usage :
//   node scripts/update-prices.mjs              télécharge les fichiers et met à jour data/prices.json
//   node scripts/update-prices.mjs --dir ./cm   utilise des fichiers déjà téléchargés
//                                               (products_singles_23.json et price_guide_23.json)
// Derrière un proxy (ex. session cloud) : NODE_USE_ENV_PROXY=1 node scripts/update-prices.mjs
//
// Chaque exécution :
//  - rattache chaque carte à son produit Cardmarket (lien direct vers la carte exacte, versions V1/V2 comprises) ;
//  - ajoute le prix « tendance » du jour à l'historique : c'est ce qui dessine la courbe de prix.
// Lancez-le une fois par jour (la GitHub Action fournie le fait automatiquement).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };

const config = readJson('data/config.json');
const idGame = opt('game') ?? process.env.CM_GAME_ID ?? config.cardmarket.idGame;
const dir = opt('dir');

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

const deaccent = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => deaccent(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// « Sasha Yakovleva - Won't Let You Down » → « Sasha-Yakovleva-Wont-Let-You-Down »
const slug = (s) => deaccent(s).replace(/['’]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
function distance(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
  }
  return d[b.length];
}
const num = (v) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null);
const byNumber = (a, b) => a.number.replace(/^\D+/, '').localeCompare(b.number.replace(/^\D+/, ''), 'en', { numeric: true });
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const products = (await load('products')).products;
const guideFile = await load('guide');
const guideById = new Map(guideFile.priceGuides.map((g) => [g.idProduct, g]));
console.log(`Cardmarket : ${products.length} cartes, ${guideFile.priceGuides.length} prix (guide du ${guideFile.createdAt}).`);

const catalog = readJson('data/catalog.json');
const pricesFile = existsSync(join(root, 'data/prices.json')) ? readJson('data/prices.json') : { prices: {} };
if (pricesFile.demo) pricesFile.prices = {};

// 1. Rattachement carte ↔ produit Cardmarket, extension par extension.
//    Les versions d'une même carte (ex. V — Streetkid 005a, 005b, 144) sont appariées dans l'ordre :
//    numéro de collection croissant ↔ identifiant Cardmarket croissant (V1, V2, V3).
const expMap = config.expansions.map;
let linked = 0;
for (const [idExp, { set: code, slug: expSlug }] of Object.entries(expMap)) {
  const set = catalog.sets.find((s) => s.code === code);
  if (!set) continue;
  set.cardmarket = { idExpansion: Number(idExp), slug: expSlug };
  const groups = new Map();
  for (const p of products.filter((x) => x.idExpansion === Number(idExp)).sort((a, b) => a.idProduct - b.idProduct)) {
    const k = norm(p.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  }
  const cardGroups = new Map();
  for (const c of catalog.cards.filter((x) => x.set === code).sort(byNumber)) {
    const k = norm(c.nameEn ?? c.name);
    if (!cardGroups.has(k)) cardGroups.set(k, []);
    cardGroups.get(k).push(c);
  }
  // noms à une ou deux lettres près (ex. « Tetratronic » / « Tetratonic » chez Cardmarket)
  const leftovers = [...groups.keys()].filter((k) => !cardGroups.has(k));
  for (const [k, cs] of cardGroups) {
    let ps = groups.get(k);
    if (!ps) {
      const near = leftovers.find((l) => distance(l, k) <= 2);
      if (near) { ps = groups.get(near); leftovers.splice(leftovers.indexOf(near), 1); }
    }
    ps ??= [];
    if (ps.length !== cs.length) console.warn(`  ${code} « ${cs[0].nameEn} » : ${cs.length} carte(s), ${ps.length} produit(s) Cardmarket`);
    cs.forEach((c, i) => {
      const p = ps[i];
      if (!p) return;
      c.cardmarket = { idProduct: p.idProduct, path: `Products/Singles/${expSlug}/${slug(p.name)}${ps.length > 1 ? `-V${i + 1}` : ''}` };
      linked++;
    });
  }
}

// 2. Prix du jour + historique
const FOIL_RARITIES = new Set(['Nova Rare', 'Iconic Legend', 'Iconic Other', 'Secret', 'Iconic Secret']);
let priced = 0;
for (const c of catalog.cards) {
  const g = guideById.get(c.cardmarket?.idProduct);
  if (!g) continue;
  // prix foil pour les raretés imprimées en foil, et pour toute carte sans aucun prix en version normale
  const foilOnly = !!num(g['trend-foil']) && (FOIL_RARITIES.has(c.rarity) || (!num(g.trend) && !num(g.avg) && !num(g.low)));
  const f = (k) => num(foilOnly ? g[`${k}-foil`] : g[k]);
  const trend = f('trend') ?? f('avg') ?? f('low');
  if (trend == null) continue;
  priced++;
  const entry = pricesFile.prices[c.id] ?? { history: [] };
  Object.assign(entry, {
    trend, low: f('low'), avg: f('avg'), avg1: f('avg1'), avg7: f('avg7'), avg30: f('avg30'),
    foil: foilOnly || undefined,
    trendFoil: foilOnly ? undefined : num(g['trend-foil']) ?? undefined,
  });
  // Premier relevé : la courbe démarre avec les moyennes 30 j / 7 j / 1 j de Cardmarket
  if (entry.history.length === 0) {
    entry.seeded = true;
    if (entry.avg30) entry.history.push([daysAgo(30), entry.avg30]);
    if (entry.avg7) entry.history.push([daysAgo(7), entry.avg7]);
    if (entry.avg1) entry.history.push([daysAgo(1), entry.avg1]);
  }
  entry.history = entry.history.filter((h) => h[0] !== today);
  entry.history.push([today, trend]);
  pricesFile.prices[c.id] = entry;
}

// 3. Produits scellés (data/sealed.json, créé par scripts/import-scelle.mjs)
let sealedPriced = 0;
if (existsSync(join(root, 'data/sealed.json'))) {
  for (const it of readJson('data/sealed.json').items) {
    const g = guideById.get(it.cardmarket?.idProduct);
    const trend = g && (num(g.trend) ?? num(g.avg) ?? num(g.low));
    if (trend == null) continue;
    sealedPriced++;
    const entry = pricesFile.prices[it.id] ?? { history: [] };
    Object.assign(entry, { trend, low: num(g.low), avg: num(g.avg), avg1: num(g.avg1), avg7: num(g.avg7), avg30: num(g.avg30) });
    if (entry.history.length === 0 && (entry.avg30 || entry.avg7 || entry.avg1)) {
      entry.seeded = true;
      if (entry.avg30) entry.history.push([daysAgo(30), entry.avg30]);
      if (entry.avg7) entry.history.push([daysAgo(7), entry.avg7]);
      if (entry.avg1) entry.history.push([daysAgo(1), entry.avg1]);
    }
    entry.history = entry.history.filter((h) => h[0] !== today);
    entry.history.push([today, trend]);
    pricesFile.prices[it.id] = entry;
  }
}

writeFileSync(join(root, 'data/catalog.json'), JSON.stringify(catalog));
writeFileSync(join(root, 'data/prices.json'), JSON.stringify({
  demo: false, source: 'Cardmarket', currency: 'EUR', updatedAt: today,
  cardmarketCreatedAt: guideFile.createdAt ?? null, prices: pricesFile.prices,
}));
console.log(`${linked}/${catalog.cards.length} cartes rattachées à Cardmarket, ${priced} avec un prix au ${today} ; ${sealedPriced} produits scellés avec un prix.`);
