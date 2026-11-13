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
const expMap = { ...config.expansions.map };
// Séries rattachées automatiquement lors d'un passage précédent (enregistrées dans le catalogue)
for (const s of catalog.sets) {
  if (s.cardmarket?.idExpansion && !expMap[s.cardmarket.idExpansion]) {
    const { slug: sl = null, slugTried, slugChecked } = s.cardmarket;
    expMap[s.cardmarket.idExpansion] = { set: s.code, slug: sl, slugTried, slugChecked };
  }
}
// Nouvelles séries : on cherche l'extension Cardmarket non attribuée dont les noms de cartes correspondent le mieux.
// (À noms égaux, une série « Beta » prend l'extension la plus ancienne, les autres la plus récente.)
{
  const taken = new Set(Object.keys(expMap).map(Number));
  const byExp = new Map();
  for (const p of products) {
    if (taken.has(p.idExpansion)) continue;
    if (!byExp.has(p.idExpansion)) byExp.set(p.idExpansion, { names: new Map(), date: p.dateAdded ?? '' });
    const e = byExp.get(p.idExpansion);
    e.names.set(norm(p.name), (e.names.get(norm(p.name)) ?? 0) + 1);
    if ((p.dateAdded ?? '') < e.date) e.date = p.dateAdded;
  }
  const mappedSets = new Set(Object.values(expMap).map((m) => m.set));
  for (const s of catalog.sets.filter((x) => !mappedSets.has(x.code))) {
    const names = new Map();
    for (const c of catalog.cards.filter((x) => x.set === s.code)) names.set(norm(c.nameEn ?? c.name), (names.get(norm(c.nameEn ?? c.name)) ?? 0) + 1);
    const total = [...names.values()].reduce((a, b) => a + b, 0);
    const beta = /beta|bêta/i.test(`${s.nameEn} ${s.name}`);
    const scored = [...byExp].map(([id, e]) => [id, [...names].reduce((a, [k, n]) => a + Math.min(n, e.names.get(k) ?? 0), 0), e.date])
      .filter(([, sc]) => total && sc / total >= 0.6)
      .sort((a, b) => b[1] - a[1] || (beta ? a[2].localeCompare(b[2]) : b[2].localeCompare(a[2])));
    if (!scored.length) continue;
    const [id] = scored[0];
    expMap[id] = { set: s.code, slug: null };
    byExp.delete(id);
    console.log(`  Nouvelle série ${s.code} « ${s.nameEn} » rattachée à l'extension Cardmarket ${id}.`);
  }
}
// Nom de l'extension dans les adresses Cardmarket (liens directs) pour les séries rattachées automatiquement.
// Candidats : noms des produits scellés de la même extension (« X Booster » → X) puis nom officiel de la série.
// Chaque candidat est vérifié en ouvrant la page Cardmarket ; une fois par semaine au plus par série.
async function loadNonSingles() {
  try {
    if (dir) {
      const f = readdirSync(dir).find((n) => n.startsWith('products_nonsingles') && n.endsWith('.json'));
      return f ? JSON.parse(readFileSync(join(dir, f), 'utf8')).products : [];
    }
    const r = await fetch(config.cardmarket.productsUrl.replace('products_singles', 'products_nonsingles').replace('{idGame}', idGame));
    return r.ok ? (await r.json()).products : [];
  } catch { return []; }
}
const SUFFIXES = [/ 6 Booster Box Case$/, / Booster Box$/, / Booster$/, / - (Retail |Beta )?Starter Deck$/, / - Demo Deck$/, / (Participation|Braindance) Pack$/, / Kit$/];
async function detectSlug(idExp, set, nonSingles) {
  const names = [];
  for (const p of nonSingles.filter((x) => x.idExpansion === Number(idExp))) {
    const re = SUFFIXES.find((r) => r.test(p.name));
    if (re) names.push(p.name.replace(re, ''));
  }
  names.push(String(set.nameEn ?? set.name).replace(/\s+[—–]\s+/g, ' - ').replace(/ - (FR|French)$/i, ''));
  let fallback = null;
  for (const sl of [...new Set(names.map(slug).filter(Boolean))]) {
    try {
      const r = await fetch(`https://www.cardmarket.com/en/${config.cardmarket.gameSlug}/Products/Singles/${sl}`, { method: 'HEAD', redirect: 'manual' });
      if (r.status === 200) return { slug: sl, checked: true };
      if (r.status !== 404 && !fallback) fallback = sl; // page protégée (anti-robots) : on garde la meilleure supposition
    } catch { fallback ??= sl; }
  }
  return fallback ? { slug: fallback, checked: false } : null;
}
let nonSingles = null;
for (const [idExp, m] of Object.entries(expMap)) {
  if (m.slug) continue;
  const set = catalog.sets.find((s) => s.code === m.set);
  if (!set || (m.slugTried && Date.now() - Date.parse(m.slugTried) < 7 * 864e5)) continue;
  nonSingles ??= await loadNonSingles();
  const found = await detectSlug(idExp, set, nonSingles);
  m.slugTried = today;
  if (found) {
    m.slug = found.slug; m.slugChecked = found.checked;
    console.log(`  Liens Cardmarket de ${m.set} : « ${found.slug} » (${found.checked ? 'page vérifiée' : 'non vérifiable, supposition'}).`);
  }
}

let linked = 0;
for (const [idExp, m] of Object.entries(expMap)) {
  const { set: code, slug: expSlug } = m;
  const set = catalog.sets.find((s) => s.code === code);
  if (!set) continue;
  // sans le nom d'extension Cardmarket (expSlug), les prix fonctionnent et le bouton fait une recherche par nom
  set.cardmarket = { idExpansion: Number(idExp), slug: expSlug, ...(m.slugTried ? { slugTried: m.slugTried, slugChecked: !!m.slugChecked } : {}) };
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
      c.cardmarket = { idProduct: p.idProduct, path: expSlug ? `Products/Singles/${expSlug}/${slug(p.name)}${ps.length > 1 ? `-V${i + 1}` : ''}` : null };
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
