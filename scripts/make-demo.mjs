// Génère un jeu de données de DÉMONSTRATION (cartes et prix fictifs).
// Il sert uniquement à voir l'appli fonctionner avant le premier import réel.
// Usage : node scripts/make-demo.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Générateur pseudo-aléatoire déterministe (mêmes données à chaque exécution)
let seed = 2077;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];

const sets = [
  { code: 'WNC', name: 'Welcome to Night City', block: 'Saison 1', releaseDate: '2026-11-06', size: 140 },
  { code: 'WNB', name: 'Welcome to Night City – Bêta', block: 'Saison 1', releaseDate: '2026-09-15', size: 64 },
  { code: 'PR1', name: 'Promos Saison 1', block: 'Promos', releaseDate: '2026-11-06', size: 12 },
];

const roles = ['Netrunner', 'Solo', 'Fixer', 'Techie', 'Nomade', 'Corpo', 'Charcudoc', 'Rockerboy', 'Média', 'Agent de la NCPD', 'Mercenaire', 'Trafiquant'];
const places = ['Watson', 'Westbrook', 'Heywood', 'Pacifica', 'Santo Domingo', 'City Center', 'Badlands', 'Kabuki', 'Japantown', 'Northside', 'Little China', 'Vista del Rey'];
const hacks = ['Surchauffe', 'Court-circuit', 'Synapse grillée', 'Ping', 'Contagion', 'Cécité', 'Arrêt cardiaque', 'Requiem système', 'Brèche', 'Mur de glace'];
const gear = ['Pistolet intelligent', 'Fusil de précision', 'Implant optique', 'Lames mantes', 'Bras gorille', 'Deck de piratage', 'Katana thermique', 'Gilet balistique', 'Moto de course', 'Drone de surveillance'];
const factions = ['Jaune', 'Rouge', 'Bleu', 'Vert', 'Violet'];

const rarities = [
  { r: 'Commune', w: 0.42, min: 0.05, max: 0.5 },
  { r: 'Peu commune', w: 0.28, min: 0.2, max: 1.5 },
  { r: 'Rare', w: 0.17, min: 1, max: 8 },
  { r: 'Épique', w: 0.08, min: 5, max: 30 },
  { r: 'Légendaire', w: 0.04, min: 20, max: 150 },
  { r: 'Secrète', w: 0.01, min: 60, max: 400 },
];
const pickRarity = () => {
  let x = rand();
  for (const ra of rarities) { if ((x -= ra.w) <= 0) return ra; }
  return rarities[0];
};

const cards = [];
const prices = {};
const today = new Date('2026-11-13T00:00:00Z');
const DAYS = 150;
const iso = (d) => d.toISOString().slice(0, 10);

for (const s of sets) {
  for (let i = 1; i <= s.size; i++) {
    const kind = pick(['Personnage', 'Personnage', 'Programme', 'Équipement', 'Lieu']);
    const name =
      kind === 'Personnage' ? `${pick(roles)} de ${pick(places)}` :
      kind === 'Programme' ? `Piratage : ${pick(hacks)}` :
      kind === 'Équipement' ? pick(gear) : `Quartier : ${pick(places)}`;
    let ra = pickRarity();
    if (s.code === 'PR1') ra = rarities[3 + Math.floor(rand() * 2)];
    if (s.code === 'WNC' && i > 130) ra = rarities[5];
    const number = String(i).padStart(3, '0');
    const id = `${s.code}-${number}`;
    cards.push({
      id, set: s.code, number, name, rarity: ra.r, type: kind, color: pick(factions),
      image: null,
      cardmarket: { idProduct: null, url: null },
    });

    // Marche aléatoire des prix sur DAYS jours (jours avant la sortie exclus)
    const start = new Date(Math.max(new Date(s.releaseDate) - 20 * 864e5, today - DAYS * 864e5));
    let p = ra.min + (ra.max - ra.min) * Math.pow(rand(), 1.6);
    const drift = (rand() - 0.5) * 0.01;
    const history = [];
    for (let d = new Date(start); d <= today; d = new Date(+d + 864e5)) {
      p = Math.max(0.02, p * (1 + drift + (rand() - 0.5) * 0.06));
      history.push([iso(d), Math.round(p * 100) / 100]);
    }
    const last = history[history.length - 1][1];
    const avg = (n) => Math.round(history.slice(-n).reduce((a, h) => a + h[1], 0) / Math.min(n, history.length) * 100) / 100;
    prices[id] = {
      trend: last,
      low: Math.round(last * (0.75 + rand() * 0.2) * 100) / 100,
      avg1: avg(1), avg7: avg(7), avg30: avg(30),
      history,
    };
  }
}

const catalog = {
  demo: true,
  generatedAt: new Date().toISOString(),
  sets: sets.map(({ size, ...s }) => ({ ...s, total: size, cardmarket: { idExpansion: null } })),
  cards,
};
writeFileSync(join(root, 'data/catalog.json'), JSON.stringify(catalog));
writeFileSync(join(root, 'data/prices.json'), JSON.stringify({
  demo: true, source: 'Démonstration', currency: 'EUR', updatedAt: iso(today), prices,
}));
console.log(`Démo : ${cards.length} cartes, ${sets.length} séries.`);
