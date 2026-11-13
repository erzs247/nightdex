// Complète le catalogue à partir d'un fichier CSV (séparateur « ; » ou « , »).
// Colonnes reconnues (en-tête obligatoire, ordre libre) :
//   set ; number ; name ; rarity ; type ; color ; image ; cardmarket_url ; cardmarket_id ; set_name ; release_date
// Une ligne met à jour la carte de même série + numéro (ou de même cardmarket_id), sinon elle l'ajoute.
// Usage : node scripts/import-cards.mjs data/cards.csv
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file) { console.error('Usage : node scripts/import-cards.mjs <fichier.csv>'); process.exit(1); }

function parseCsv(text) {
  const sep = (text.split('\n')[0].match(/;/g) ?? []).length > (text.split('\n')[0].match(/,/g) ?? []).length ? ';' : ',';
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell); if (row.some((c) => c.trim())) rows.push(row);
  const head = rows.shift().map((h) => h.trim().toLowerCase());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const catalogPath = join(root, 'data/catalog.json');
const catalog = existsSync(catalogPath) ? JSON.parse(readFileSync(catalogPath, 'utf8')) : { sets: [], cards: [] };
if (catalog.demo) { catalog.demo = false; catalog.sets = []; catalog.cards = []; }

let added = 0, updated = 0;
for (const r of parseCsv(readFileSync(file, 'utf8'))) {
  if (!r.set || !r.name) continue;
  let set = catalog.sets.find((s) => s.code === r.set);
  if (!set) { set = { code: r.set, name: r.set_name || r.set, block: 'Séries', releaseDate: r.release_date || null, cardmarket: { idExpansion: null } }; catalog.sets.push(set); }
  if (r.set_name) set.name = r.set_name;
  if (r.release_date) set.releaseDate = r.release_date;
  const number = r.number ? r.number.padStart(3, '0') : null;
  const cmId = r.cardmarket_id ? Number(r.cardmarket_id) : null;
  let card = catalog.cards.find((c) => (cmId && c.cardmarket?.idProduct === cmId) || (number && c.set === r.set && c.number === number));
  if (!card) {
    card = { id: `${r.set}-${number ?? catalog.cards.length + 1}`, set: r.set, number, cardmarket: {} };
    catalog.cards.push(card); added++;
  } else updated++;
  card.name = r.name;
  if (number) card.number = number;
  for (const k of ['rarity', 'type', 'color', 'image']) if (r[k]) card[k] = r[k];
  card.cardmarket = { ...card.cardmarket, ...(cmId ? { idProduct: cmId } : {}), ...(r.cardmarket_url ? { url: r.cardmarket_url } : {}) };
}
for (const s of catalog.sets) s.total = catalog.cards.filter((c) => c.set === s.code).length;
catalog.generatedAt = new Date().toISOString();
writeFileSync(catalogPath, JSON.stringify(catalog));
console.log(`${added} cartes ajoutées, ${updated} mises à jour.`);
