// Fabrique l'index du scanner : une « empreinte » de 9 × 12 points de couleur pour chaque image de carte
// (versions FR et EN). L'appli compare l'image de la caméra à ces empreintes, sur le téléphone, sans serveur.
// Le calcul (moyenne par case sur une image ramenée à 90 × 120) est le même que dans app.js (scanFeature).
// Usage : node scripts/make-scan-index.mjs   (relancé automatiquement chaque semaine après l'import des nouveautés)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const GW = 9, GH = 12, RW = 90, RH = 120;

// image → pixels RVB 90 × 120 (fond sombre sous les coins transparents)
export const raw90 = (input) => sharp(input).flatten({ background: '#101014' }).resize(RW, RH, { fit: 'fill' }).raw().toBuffer();
// moyenne de chaque case d'une grille 9 × 12 sur un rectangle (x, y, w, h) de l'image 90 × 120 (3 canaux)
export function boxFeature(px, ch, x = 0, y = 0, w = RW, h = RH) {
  const out = new Uint8Array(GW * GH * 3);
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const x0 = Math.floor(x + (gx * w) / GW), x1 = Math.max(x0 + 1, Math.floor(x + ((gx + 1) * w) / GW));
    const y0 = Math.floor(y + (gy * h) / GH), y1 = Math.max(y0 + 1, Math.floor(y + ((gy + 1) * h) / GH));
    const s = [0, 0, 0]; let n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * RW + xx) * ch; s[0] += px[i]; s[1] += px[i + 1]; s[2] += px[i + 2]; n++; }
    const o = (gy * GW + gx) * 3; out[o] = s[0] / n; out[o + 1] = s[1] / n; out[o + 2] = s[2] / n;
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const catalog = JSON.parse(readFileSync(join(root, 'data/catalog.json'), 'utf8'));
  const items = [];
  for (const c of catalog.cards) {
    for (const img of [c.image, c.imageEn]) {
      if (!img || !existsSync(join(root, img))) continue;
      items.push([c.id, Buffer.from(boxFeature(await raw90(join(root, img)), 3)).toString('base64')]);
    }
  }
  const path = join(root, 'data/scan-index.json');
  const old = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
  const same = old && JSON.stringify(old.items) === JSON.stringify(items);
  if (!same) writeFileSync(path, JSON.stringify({ w: GW, h: GH, generatedAt: new Date().toISOString(), items }));   // réécrit seulement si ça change
  console.log(`Index du scanner : ${items.length} empreintes pour ${catalog.cards.length} cartes${same ? ' (inchangé)' : ''}.`);
}
