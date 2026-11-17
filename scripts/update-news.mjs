// Actualités officielles du Cyberpunk TCG : lit la page du blog (cyberpunktcg.com/blog) et met à jour data/news.json.
// On garde le titre, le résumé publié par l'éditeur, la date, l'image d'en-tête et le lien vers l'article (pas le texte complet).
// Les anciens articles sont conservés ; « seen » = date à laquelle NightDex a vu l'article pour la première fois.
// Usage : node scripts/update-news.mjs [--html fichier.html]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://cyberpunktcg.com';
const args = process.argv.slice(2);
const htmlFile = args.includes('--html') ? args[args.indexOf('--html') + 1] : null;

const html = htmlFile ? readFileSync(htmlFile, 'utf8') : await (async () => {
  const r = await fetch(`${BASE}/blog`, { headers: { 'user-agent': 'NightDex news (collection app)' } });
  if (!r.ok) throw new Error(`Blog : HTTP ${r.status}`);
  return r.text();
})();

const decode = (s) => String(s ?? '').replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const MONTHS = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
const toDay = (t) => { const m = /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\.?\s+(\d{1,2}),\s*(\d{4})/i.exec(t); return m ? `${m[3]}-${String(MONTHS[m[1].toUpperCase()]).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null; };

const found = new Map();
// 1) données des articles intégrées à la page : {slug:"…",title:"…",excerpt:"…",heroImageUrl:"…",publishedAt:"…"}
const str = (block, key) => { const m = new RegExp(`[{,]${key}:"((?:[^"\\\\]|\\\\.)*)"`).exec(block); if (!m) return null; try { return JSON.parse(`"${m[1]}"`); } catch { return m[1]; } };
for (const m of html.matchAll(/\{slug:"([a-z0-9-]+)",/g)) {
  const block = html.slice(m.index, m.index + 1500).split('bodyMarkdown:')[0];
  const title = str(block, 'title');
  if (!title) continue;
  const published = str(block, 'publishedAt');
  const image = str(block, 'heroImageUrl');
  found.set(m[1], { id: m[1], title, excerpt: str(block, 'excerpt') ?? '', image: image?.startsWith('https://images.ctfassets.net/') ? image : null, date: published ? published.slice(0, 10) : null, url: `${BASE}/blog/${m[1]}` });
}
// 2) secours : cartes d'articles de la page (<a href="/blog/slug"> image, titre, résumé, date)
for (const m of html.matchAll(/<a\s+href="\/blog\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
  const [, slug, body] = m;
  const title = decode(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i.exec(body)?.[1]);
  if (!title) continue;
  const excerpt = decode(/<p[^>]*>([\s\S]*?)<\/p>/i.exec(body)?.[1]);
  const image = /<img[^>]+src="(https:\/\/images\.ctfassets\.net\/[^"]+)"/i.exec(body)?.[1] ?? null;
  const date = toDay(decode(body));
  if (!found.has(slug)) found.set(slug, { id: slug, title, excerpt, image, date, url: `${BASE}/blog/${slug}` });
}
if (!found.size) throw new Error('Aucun article trouvé : la page du blog a peut-être changé de présentation.');

const path = join(root, 'data/news.json');
const old = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { items: [] };
const today = new Date().toISOString().slice(0, 10);
const byId = new Map(old.items.map((x) => [x.id, x]));
let added = 0;
for (const it of found.values()) {
  const prev = byId.get(it.id);
  if (!prev) added++;
  byId.set(it.id, { ...prev, ...it, image: it.image ?? prev?.image ?? null, seen: prev?.seen ?? today });
}
const items = [...byId.values()].sort((a, b) => (b.date ?? b.seen).localeCompare(a.date ?? a.seen)).slice(0, 80);
const out = { source: `${BASE}/blog`, items };
if (JSON.stringify(old.items) !== JSON.stringify(items)) writeFileSync(path, `${JSON.stringify({ ...out, updatedAt: new Date().toISOString() }, null, 2)}\n`);
console.log(`Actualités : ${found.size} articles sur le blog, ${added} nouveau(x).`);
