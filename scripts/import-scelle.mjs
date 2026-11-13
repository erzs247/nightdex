// Importe les produits scellés (boosters, booster box, cases, decks, kits) depuis la liste publique de Cardmarket,
// avec les visuels officiels de cyberpunktcg.com quand ils existent.
//
// Usage : node scripts/import-scelle.mjs            (derrière un proxy : NODE_USE_ENV_PROXY=1 devant)
//         node scripts/import-scelle.mjs --dir ./cm (fichier products_nonsingles_23.json déjà téléchargé)
// Les prix sont ensuite relevés avec les cartes par scripts/update-prices.mjs.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'data/config.json'), 'utf8'));
const args = process.argv.slice(2);
const dir = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : null;
const idGame = config.cardmarket.idGame;

// Rubriques Cardmarket retenues → catégorie de l'appli et chemin dans les adresses Cardmarket
const CATEGORIES = {
  'Cyberpunk Booster': { category: 'booster', path: 'Boosters' },
  'Cyberpunk Booster Boxes': { category: 'box', path: 'Booster-Boxes' },
  'Cyberpunk Starter Decks': { category: 'deck', path: 'Starter-Decks' },
  'Cyberpunk Box Sets': { category: 'kit', path: 'Box-Sets' },
};
// Visuels officiels (images.ctfassets.net, utilisés par cyberpunktcg.com)
const CF = 'https://images.ctfassets.net/udihssg1zwbu';
const IMG = {
  beta_pack: `${CF}/7gRGYDYOSiUMFf74o34poo/0f4fd4d2c23252545061c2e59c8f9969/Beta_Booster_Pack.png`,
  retail_pack: `${CF}/fTjmzsipOKNhg46f45cwN/ca7b24f2c0678522acbb17028966ed8d/Retail_Booster_Pack.png`,
  set2_pack: `${CF}/7FQwjmfcj0yx9izemSjotg/46d1261eea23b222a2ab55484866dd89/Booster_Pack_Set_2.png`,
  beta_box: `${CF}/11kdYes6tJw5q0SMmSmXfR/9596e0eb09435b6f453298c5d2215092/Beta_Booster_Display_Booster_Box_1.png`,
  retail_box: `${CF}/BBsTkd8qsKK0YGjraM36S/3b42f85e716a8d2e3116d0d8b005e3f2/Retail_Booster_Display_Booster_Box_1.png`,
  set2_box: `${CF}/2ZmmyIhMGKnH0f5wyIrg1N/9a42559ff21229e730d60bf68f1c6ea1/Booster_Box_Set_2.png`,
  heist_retail: `${CF}/493Qs6fRyWGGvIU1SuI4ZA/6b9de675ad1814d2b6e1ee355f5bcb2e/Retail_Starter_Decks_The_Heist_Starter_Deck.png`,
  power_retail: `${CF}/23zXBJNC7OG3sRF6tNPE47/6f5e471eb95f25bd761a2f96fc989dd0/Retail_Starter_Decks_Embracing_Power_Starter_Deck.png`,
  heist_beta: `${CF}/3ZTGm830TbifMRllWbT8lX/23c344d909eaab636687c204b8c5c95d/Beta_Starter_Decks_The_Heist_Starter_Deck_Beta.png`,
  power_beta: `${CF}/rvNI4vIoWTzMOWNMSsNz2/40710042df83494f400b433d88a351f4/Beta_Starter_Decks_Embracing_Power_Starter_Deck_Beta.png`,
  prerelease_retail: `${CF}/7s4ZQ5KttPhFRhMdzxQorl/855bcc57520f50b2087689fa32e9ec21/Retail_Pre-release_Kit_Pre-release_Kit.png`,
  prerelease_beta: `${CF}/1FnaiUBYiwIe7tFSz456mx/74670ca00a249cd9545ca4e3e4af1424/Beta_Pre-release_Kit_Pre-release_Kit.png`,
  alpha: `${CF}/5Dwd2o2Rpda2E9vvGasHYt/dc05f238f339ff5d0078dfc6a151e625/Alpha_Kit_Box_Render_1.png`,
};
// Nom → visuel, série liée, nom français, ordre d'affichage
const RULES = [
  [/^Welcome to Night City - Beta Booster$/, { img: 'beta_pack', set: 'WNB', fr: 'Booster Welcome to Night City – Bêta' }],
  [/^Welcome to Night City - Retail Booster$/, { img: 'retail_pack', set: 'WNC', fr: 'Booster Welcome to Night City' }],
  [/^Edgerunners: Burn Bright Booster$/, { img: 'set2_pack', set: null, print: 'MS02', fr: 'Booster Edgerunners: Burn Bright' }],
  [/^Night City Brawl S1 Participation Pack$/, { set: 'NCB', fr: 'Pack de participation Night City Brawl S1' }],
  [/^Edgerunner Open S1 Braindance Pack$/, { set: 'EOS', fr: 'Pack Braindance Edgerunner Open S1' }],
  [/^Welcome to Night City - Beta Booster Box$/, { img: 'beta_box', set: 'WNB', fr: 'Booster Box Welcome to Night City – Bêta' }],
  [/^Welcome to Night City - Retail Booster Box$/, { img: 'retail_box', set: 'WNC', fr: 'Booster Box Welcome to Night City' }],
  [/^Edgerunners: Burn Bright Booster Box$/, { img: 'set2_box', set: null, print: 'MS02', fr: 'Booster Box Edgerunners: Burn Bright' }],
  [/^Welcome to Night City - Beta 6 Booster Box Case$/, { img: 'beta_box', set: 'WNB', fr: 'Case de 6 Booster Box Welcome to Night City – Bêta', pack: 6 }],
  [/^Welcome to Night City - Retail 6 Booster Box Case$/, { img: 'retail_box', set: 'WNC', fr: 'Case de 6 Booster Box Welcome to Night City', pack: 6 }],
  [/^Edgerunners: Burn Bright 6 Booster Box Case$/, { img: 'set2_box', set: null, print: 'MS02', fr: 'Case de 6 Booster Box Edgerunners: Burn Bright', pack: 6 }],
  [/^The Heist - Retail Starter Deck$/, { img: 'heist_retail', set: 'HST', fr: 'Deck de démarrage The Heist' }],
  [/^Embracing Power - Retail Starter Deck$/, { img: 'power_retail', set: 'EMP', fr: 'Deck de démarrage Embracing Power' }],
  [/^The Heist - Beta Starter Deck$/, { img: 'heist_beta', set: 'HSB', fr: 'Deck de démarrage The Heist – Bêta' }],
  [/^Embracing Power - Beta Starter Deck$/, { img: 'power_beta', set: 'EMB', fr: 'Deck de démarrage Embracing Power – Bêta' }],
  [/^The Heist - Demo Deck$/, { set: 'MRC', fr: 'Deck de démo The Heist' }],
  [/^Embracing Power - Demo Deck$/, { set: 'ARA', fr: 'Deck de démo Embracing Power' }],
  [/^Pre-Release Retail Kit$/, { img: 'prerelease_retail', set: 'PRE', fr: 'Kit d\'avant-première' }],
  [/^Pre-Release Beta Kit$/, { img: 'prerelease_beta', set: 'PRB', fr: 'Kit d\'avant-première – Bêta' }],
  [/^Alpha Kit$/, { img: 'alpha', set: null, print: 'Alpha', fr: 'Alpha Kit' }],
];
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

let file;
if (dir) file = JSON.parse(readFileSync(join(dir, readdirSync(dir).find((n) => n.startsWith('products_nonsingles'))), 'utf8'));
else {
  const r = await fetch(`https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_${idGame}.json`);
  if (!r.ok) throw new Error(`Cardmarket : HTTP ${r.status}`);
  file = await r.json();
}

const items = [];
let order = 0;
for (const [re, rule] of RULES) {
  const p = file.products.find((x) => re.test(x.name));
  if (!p) continue;
  const cat = CATEGORIES[p.categoryName];
  if (!cat) continue;
  let image = null;
  if (rule.img) {
    const rel = `images/sealed/${rule.img}.webp`;
    const out = join(root, rel);
    if (!existsSync(out)) {
      mkdirSync(dirname(out), { recursive: true });
      const r = await fetch(IMG[rule.img]);
      if (r.ok) await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 520, height: 520, fit: 'inside' }).webp({ quality: 78 }).toFile(out);
      else console.error(`Visuel indisponible : ${rule.img} (HTTP ${r.status})`);
    }
    if (existsSync(out)) image = rel;
  }
  items.push({
    id: `S-${p.idProduct}`, kind: 'sealed', category: rule.pack ? 'case' : cat.category, order: order++,
    name: rule.fr, nameEn: p.name, set: rule.set, print: rule.print ?? null, pack: rule.pack ?? null,
    image, cardmarket: { idProduct: p.idProduct, path: `Products/${cat.path}/${slug(p.name)}` },
  });
}
writeFileSync(join(root, 'data/sealed.json'), JSON.stringify({ generatedAt: new Date().toISOString(), items }));
console.log(`${items.length} produits scellés, ${items.filter((i) => i.image).length} avec visuel.`);
