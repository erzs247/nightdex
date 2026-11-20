// Decks de la communauté : decks publics du créateur de decks officiel (cyberpunktcg.com/decks, base api.netdeck.gg).
// Garde les decks valides les plus appréciés (j'aime, puis vues) et les plus récents, avec leurs cartes rattachées au catalogue.
// Decks de tournoi : decks publics dont le nom annonce un résultat (« Showdown Winner », « Top 8 »…), en attendant l'onglet officiel.
// Usage : node scripts/import-decks.mjs   (relancé chaque jour avec les prix)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.netdeck.gg/api/cyberpunk/decks';
const catalog = JSON.parse(readFileSync(join(root, 'data/catalog.json'), 'utf8'));
const order = new Map(catalog.sets.map((s) => [s.code, s.order ?? 999]));
// une carte du catalogue par nom anglais : de préférence imprimée en français, dans la série la plus ancienne
const byName = new Map();
for (const c of [...catalog.cards].sort((a, b) => (b.languages?.includes('fr') ?? 0) - (a.languages?.includes('fr') ?? 0) || (order.get(a.set) ?? 999) - (order.get(b.set) ?? 999))) {
  const k = c.nameEn ?? c.name;
  if (!byName.has(k)) byName.set(k, c.id);
}
const get = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`); return r.json(); };

const list = [];
for (let o = 0; o < 3000; o += 100) {
  const d = await get(`${API}/public?limit=100&offset=${o}&sort=recent`);
  list.push(...d.items);
  if (d.items.length < 100) break;
}
const good = list.filter((d) => d.is_valid && d.format?.code === 'standard' && !/^new deck$/i.test(d.name.trim()));
const score = (d) => (d.engagement?.like_count ?? 0) * 50 + (d.engagement?.view_count ?? 0);
// decks de tournoi : en attendant l'onglet officiel, les decks publics dont le nom indique un résultat de tournoi
const TOURNEY = /\b(winner|won|1st|2nd|3rd|4th|top ?(4|8|16|32)|undefeated|champion|showdown|brawl|regionals?|eor|edgerunner open|tournament|tournoi|store champ|x-\d|\d-\d record|place[d]?)\b/i;
const tourney = good.filter((d) => TOURNEY.test(d.name)).sort((a, b) => score(b) - score(a)).slice(0, 30);
const popular = good.filter((d) => !tourney.includes(d)).sort((a, b) => score(b) - score(a)).slice(0, 36);
const recent = good.filter((d) => !popular.includes(d) && !tourney.includes(d)).slice(0, 12);

const out = [];
for (const [kind, arr] of [['tourney', tourney], ['popular', popular], ['recent', recent]]) {
  for (const it of arr) {
    let d;
    try { d = await get(`${API}/${encodeURIComponent(it.id)}`); } catch { continue; }
    const deck = { id: it.id, kind, name: it.name.slice(0, 80), author: it.owner?.display_name ?? '', colors: it.preview?.colors ?? [],
      likes: d.engagement?.like_count ?? 0, views: d.engagement?.view_count ?? 0, updated: (it.updated_at ?? '').slice(0, 10),
      url: `https://cyberpunktcg.com/decks/${encodeURIComponent(it.id)}`, legends: [], main: {}, side: {} };
    let unknown = 0;
    for (const z of d.zones ?? []) {
      for (const e of z.cards ?? []) {
        const id = byName.get(e.card?.canonical_name);
        if (!id) { unknown++; continue; }
        if (z.zone_code === 'legends') deck.legends.push(id);
        else if (z.zone_code === 'sideboard') deck.side[id] = (deck.side[id] ?? 0) + e.quantity;
        else deck.main[id] = (deck.main[id] ?? 0) + e.quantity;
      }
    }
    if (unknown || deck.legends.length !== 3) continue;   // carte inconnue de l'appli : on attend la prochaine mise à jour
    out.push(deck);
  }
}
const path = join(root, 'data/community-decks.json');
const old = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
if (JSON.stringify(old?.decks) !== JSON.stringify(out)) writeFileSync(path, JSON.stringify({ source: 'cyberpunktcg.com/decks', updatedAt: new Date().toISOString(), totalPublic: list.length, decks: out }));
console.log(`Decks de la communauté : ${list.length} decks publics lus, ${out.length} gardés (${out.filter((d) => d.kind === 'tourney').length} de tournoi, ${out.filter((d) => d.kind === 'popular').length} populaires, ${out.filter((d) => d.kind === 'recent').length} récents).`);
