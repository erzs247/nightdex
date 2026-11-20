// Factions, rôles et types d'équipement de chaque carte (« classifications » de la base officielle, api.netdeck.gg),
// pour les listes de l'accueil (Arasaka, Maelstrom, Merc, Netrunner, Cyberware…). Ajoute « classes » aux cartes de data/catalog.json.
// Usage : node scripts/import-tags.mjs   (relancé chaque lundi avec les nouveautés)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.netdeck.gg/api/cards/cyberpunk';
const items = [];
for (let o = 0; ; o += 100) {
  const r = await fetch(`${API}?limit=100&offset=${o}`);
  if (!r.ok) throw new Error(`Base de cartes : HTTP ${r.status}`);
  const d = await r.json();
  items.push(...d.items);
  if (!d.items.length || items.length >= d.total) break;
}
const byName = new Map(items.map((it) => [it.canonical_name, { classes: it.classifications ?? [], keywords: it.keywords ?? [] }]));
const path = join(root, 'data/catalog.json');
const catalog = JSON.parse(readFileSync(path, 'utf8'));
let set = 0, missing = 0;
for (const c of catalog.cards) {
  const t = byName.get(c.nameEn ?? c.name);
  if (!t) { missing++; continue; }
  const before = JSON.stringify([c.classes, c.keywords]);
  c.classes = t.classes; if (t.keywords.length) c.keywords = t.keywords; else delete c.keywords;
  if (JSON.stringify([c.classes, c.keywords]) !== before) set++;
}
if (set) writeFileSync(path, JSON.stringify(catalog));
console.log(`Classifications : ${items.length} cartes dans la base, ${set} carte(s) mise(s) à jour, ${missing} sans correspondance.`);
