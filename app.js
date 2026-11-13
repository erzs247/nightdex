// NightDex : suivi de collection Cyberpunk TCG (cartes, prix Cardmarket, courbes de prix), en français et en anglais.
// Aucune dépendance : HTML + CSS + ce module. Les données viennent de data/*.json.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDay = (s) => new Date(`${s}T00:00:00`);

// ---------- Textes FR / EN ----------
const plural = (n, one, many) => (n > 1 ? many : one);
const TEXT = {
  fr: {
    sealed: 'Scellé', setsTab: 'Séries', toggleView: 'Changer l\'affichage',
    cats: { booster: 'Boosters', box: 'Booster Box', case: 'Cases de 6 Booster Box', deck: 'Decks', kit: 'Kits & coffrets' },
    catOne: { booster: 'Booster', box: 'Booster Box', case: 'Case de 6 Booster Box', deck: 'Deck', kit: 'Kit' },
    sealedNote: (d) => `Prix tendance Cardmarket des produits scellés${d ? ` · mis à jour le ${d}` : ''}. Les produits sans prix n'ont pas encore de ventes.`,
    sealedCount: (n) => `${n} ${plural(n, 'produit scellé', 'produits scellés')}`,
    home: 'Accueil', collection: 'Collection', market: 'Cotes', wishlist: 'Souhaits', search: 'Recherche', searchCard: 'Rechercher une carte',
    settings: 'Réglages', list: 'Liste', grid: 'Grille', cards: 'Cartes', searchSet: 'Rechercher une série', noSet: 'Aucune série trouvée', favorites: 'Favoris',
    blocks: { wnc: 'Welcome to Night City', op: 'Jeu organisé & promos', beta: 'Bêta (Kickstarter, en anglais)', demo: 'Decks de démo (en anglais)', new: 'Nouvelles séries' },
    back: 'Retour', favSet: 'Série favorite', changeSort: 'Changer le tri', filters: 'Filtres',
    owned: (a, b) => `${a}/${b} possédées`, myValue: 'Ma valeur', pricesSoon: 'Prix Cardmarket à venir',
    sorts: { num: 'Numéro', 'price-desc': 'Prix décroissant', 'price-asc': 'Prix croissant', name: 'Nom' },
    ownF: { all: 'Toutes', owned: 'Possédées', missing: 'Manquantes' }, allRarities: 'Toutes raretés',
    noCards: 'Aucune carte', noCardsHint: 'Modifiez les filtres pour en voir davantage.',
    setNote: (sort, n, full) => `Tri : ${sort} · ${n} ${plural(n, 'carte affichée', 'cartes affichées')}${full ? ` · série complète ≈ ${full}` : ''}`,
    addedCol: 'Ajoutée à la collection', removedCol: 'Retirée de la collection', addedWish: 'Ajoutée aux souhaits', removedWish: 'Retirée des souhaits',
    favOn: 'Série ajoutée aux favoris', favOff: 'Série retirée des favoris', sortToast: (s) => `Tri : ${s}`,
    myCollection: 'Ma collection', emptyCol: 'Votre collection est vide', emptyColHint: 'Ouvrez une série et touchez l\'icône carte pour marquer celles que vous possédez.', browseSets: 'Voir les séries',
    kCards: 'Cartes', kUnique: 'Uniques', kValue: 'Valeur', all: 'Toutes',
    emptyWish: 'Aucune carte en souhait', emptyWishHint: 'Touchez le cœur d\'une carte pour l\'ajouter ici et suivre son prix.',
    wishBudget: 'Budget pour compléter mes souhaits', wishNote: (n, m) => `${n} ${plural(n, 'carte', 'cartes')} à acheter sur ${m}, au prix tendance Cardmarket.`,
    searchPh: 'Nom de carte ou numéro (ex. MS01 012)', searchHint: (n, m) => `${n} cartes dans ${m} séries. Tapez au moins 2 lettres.`,
    results: (n) => `${n} ${plural(n, 'résultat', 'résultats')}`, noResult: 'Aucune carte trouvée',
    colValue: 'Valeur de ma collection', colValueHint: 'Marquez des cartes comme possédées pour suivre la valeur de votre collection dans le temps.',
    pricesNote: (d) => `Prix Cardmarket (tendance, en euros) · mis à jour le ${d}`, noPricesNote: 'Les prix Cardmarket ne sont pas encore importés.',
    risers: 'Plus fortes hausses sur 7 jours', fallers: 'Plus fortes baisses sur 7 jours', priciest: 'Cartes les plus chères', noHistory: 'Pas encore assez d\'historique.',
    trend: 'Tendance Cardmarket', noPrice: 'Prix à venir', over30: 'sur 30 jours', removeCopy: 'Retirer un exemplaire', addCopy: 'Ajouter un exemplaire', copies: 'Exemplaires possédés',
    wishBtn: 'Liste de souhaits', ownBtn: 'Je possède cette carte', from: 'À partir de', avg7: 'Moy. 7 j', avg30: 'Moy. 30 j', foil: 'Foil',
    curve: 'Courbe de prix', seeded: 'Les premiers points sont les moyennes 30 j, 7 j et 1 j de Cardmarket ; ensuite un relevé par jour.',
    cmView: 'Voir sur Cardmarket', cmSearch: 'Rechercher sur Cardmarket', official: 'Fiche officielle (règles, versions)', art: (a) => `Illustration : ${a}`,
    worth: (q, v) => (q > 1 ? `Vos ${q} exemplaires valent ${v}` : `Votre exemplaire vaut ${v}`),
    cost: 'Coût', power: 'Puissance', ram: 'RAM', enOnly: 'Carte imprimée en anglais uniquement',
    chartWait: 'Pas encore assez d\'historique pour tracer une courbe. Le prix est relevé chaque jour.', chartNone: 'Pas de prix Cardmarket pour cette carte pour l\'instant.',
    ranges: ['7 J', '1 M', '3 M', '1 A', 'Tout'], chartAria: (a, b, c, d) => `Courbe du prix du ${a} au ${b}, de ${c} à ${d}`,
    language: 'Langue', langToast: 'Langue : français',
    disclaimer: 'NightDex est une appli de fan non officielle, sans lien avec CD Projekt ni WeirdCo. Cyberpunk est une marque de CD Projekt ; les images des cartes et des produits appartiennent à leurs ayants droit. Prix : Cardmarket (tendance, mis à jour chaque jour).',
    storage: (n, w) => `Votre collection est enregistrée sur cet appareil (${n} cartes possédées, ${w} souhaits). Exportez-la pour la sauvegarder ou la transférer sur un autre téléphone.`,
    export: 'Exporter ma collection (copier)', import: 'Importer un fichier de sauvegarde', dataLine: (n, m, d) => `Données : ${n} cartes, ${m} séries · prix Cardmarket du ${d}.`, close: 'Fermer',
    copied: 'Sauvegarde copiée', selectCopy: 'Sélectionnez le texte pour le copier', imported: 'Collection importée', badFile: 'Fichier invalide : choisissez un export NightDex',
    loadError: 'Impossible de charger les cartes', loadErrorHint: 'Vérifiez que les fichiers data/catalog.json et data/prices.json existent, puis rechargez la page.',
    rarity: { Common: 'Commune', Uncommon: 'Peu commune', Rare: 'Rare', Epic: 'Épique', 'Nova Rare': 'Nova Rare', 'Iconic Legend': 'Légende iconique', 'Iconic Other': 'Iconique', Secret: 'Secrète', 'Iconic Secret': 'Secrète iconique' },
    type: { Unit: 'Unité', Program: 'Programme', Legend: 'Légende', Gear: 'Équipement' },
    color: { Red: 'Rouge', Blue: 'Bleu', Green: 'Vert', Yellow: 'Jaune' },
  },
  en: {
    sealed: 'Sealed', setsTab: 'Sets', toggleView: 'Change view',
    cats: { booster: 'Boosters', box: 'Booster boxes', case: 'Cases of 6 booster boxes', deck: 'Decks', kit: 'Kits & box sets' },
    catOne: { booster: 'Booster', box: 'Booster box', case: 'Case of 6 booster boxes', deck: 'Deck', kit: 'Kit' },
    sealedNote: (d) => `Cardmarket trend prices for sealed products${d ? ` · updated ${d}` : ''}. Products without a price have no sales yet.`,
    sealedCount: (n) => `${n} sealed ${plural(n, 'product', 'products')}`,
    home: 'Home', collection: 'Collection', market: 'Market', wishlist: 'Wishlist', search: 'Search', searchCard: 'Search a card',
    settings: 'Settings', list: 'List', grid: 'Grid', cards: 'Cards', searchSet: 'Search a set', noSet: 'No set found', favorites: 'Favourites',
    blocks: { wnc: 'Welcome to Night City', op: 'Organised play & promos', beta: 'Beta (Kickstarter)', demo: 'Demo decks', new: 'New sets' },
    back: 'Back', favSet: 'Favourite set', changeSort: 'Change sort', filters: 'Filters',
    owned: (a, b) => `${a}/${b} owned`, myValue: 'My value', pricesSoon: 'Cardmarket prices coming soon',
    sorts: { num: 'Number', 'price-desc': 'Price high to low', 'price-asc': 'Price low to high', name: 'Name' },
    ownF: { all: 'All', owned: 'Owned', missing: 'Missing' }, allRarities: 'All rarities',
    noCards: 'No cards', noCardsHint: 'Change the filters to see more.',
    setNote: (sort, n, full) => `Sort: ${sort} · ${n} ${plural(n, 'card', 'cards')} shown${full ? ` · full set ≈ ${full}` : ''}`,
    addedCol: 'Added to collection', removedCol: 'Removed from collection', addedWish: 'Added to wishlist', removedWish: 'Removed from wishlist',
    favOn: 'Set added to favourites', favOff: 'Set removed from favourites', sortToast: (s) => `Sort: ${s}`,
    myCollection: 'My collection', emptyCol: 'Your collection is empty', emptyColHint: 'Open a set and tap the card icon to mark the cards you own.', browseSets: 'Browse sets',
    kCards: 'Cards', kUnique: 'Unique', kValue: 'Value', all: 'All',
    emptyWish: 'Your wishlist is empty', emptyWishHint: 'Tap the heart on a card to add it here and follow its price.',
    wishBudget: 'Budget to complete my wishlist', wishNote: (n, m) => `${n} ${plural(n, 'card', 'cards')} to buy out of ${m}, at Cardmarket trend price.`,
    searchPh: 'Card name or number (e.g. MS01 012)', searchHint: (n, m) => `${n} cards in ${m} sets. Type at least 2 letters.`,
    results: (n) => `${n} ${plural(n, 'result', 'results')}`, noResult: 'No card found',
    colValue: 'My collection value', colValueHint: 'Mark cards as owned to follow the value of your collection over time.',
    pricesNote: (d) => `Cardmarket prices (trend, in euros) · updated ${d}`, noPricesNote: 'Cardmarket prices have not been imported yet.',
    risers: 'Biggest risers over 7 days', fallers: 'Biggest fallers over 7 days', priciest: 'Most expensive cards', noHistory: 'Not enough history yet.',
    trend: 'Cardmarket trend', noPrice: 'No price yet', over30: 'over 30 days', removeCopy: 'Remove a copy', addCopy: 'Add a copy', copies: 'Copies owned',
    wishBtn: 'Wishlist', ownBtn: 'I own this card', from: 'From', avg7: '7-day avg', avg30: '30-day avg', foil: 'Foil',
    curve: 'Price history', seeded: 'The first points are Cardmarket\'s 30-day, 7-day and 1-day averages; after that, one reading per day.',
    cmView: 'View on Cardmarket', cmSearch: 'Search on Cardmarket', official: 'Official card page (rules, versions)', art: (a) => `Art: ${a}`,
    worth: (q, v) => (q > 1 ? `Your ${q} copies are worth ${v}` : `Your copy is worth ${v}`),
    cost: 'Cost', power: 'Power', ram: 'RAM', enOnly: 'Printed in English only',
    chartWait: 'Not enough history to draw a curve yet. Prices are recorded every day.', chartNone: 'No Cardmarket price for this card yet.',
    ranges: ['7D', '1M', '3M', '1Y', 'All'], chartAria: (a, b, c, d) => `Price from ${a} to ${b}, from ${c} to ${d}`,
    language: 'Language', langToast: 'Language: English',
    disclaimer: 'NightDex is an unofficial fan app, not affiliated with CD Projekt or WeirdCo. Cyberpunk is a trademark of CD Projekt; card and product images belong to their respective owners. Prices: Cardmarket (trend, updated daily).',
    storage: (n, w) => `Your collection is saved on this device (${n} cards owned, ${w} in wishlist). Export it to back it up or move it to another phone.`,
    export: 'Export my collection (copy)', import: 'Import a backup file', dataLine: (n, m, d) => `Data: ${n} cards, ${m} sets · Cardmarket prices from ${d}.`, close: 'Close',
    copied: 'Backup copied', selectCopy: 'Select the text to copy it', imported: 'Collection imported', badFile: 'Invalid file: choose a NightDex export',
    loadError: 'Could not load the cards', loadErrorHint: 'Check that data/catalog.json and data/prices.json exist, then reload the page.',
    rarity: {}, type: {}, color: {},
  },
};

// ---------- Icônes ----------
const I = {
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  sort: '<svg viewBox="0 0 24 24"><path d="M8 4v16"/><path d="m4 8 4-4 4 4"/><path d="M16 20V4"/><path d="m12 16 4 4 4-4"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  own: '<svg viewBox="0 0 24 24"><rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="m9.5 12 2 2 3.5-4"/></svg>',
  listIcon: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  gridIcon: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
};

// ---------- Raretés & couleurs (clés anglaises dans les données) ----------
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Nova Rare', 'Iconic Legend', 'Iconic Other', 'Secret', 'Iconic Secret'];
const RARITY_HEX = { Common: '#8e96b2', Uncommon: '#6fd38a', Rare: '#5b8cff', Epic: '#b36bff', 'Nova Rare': '#3ad8df', 'Iconic Legend': '#ff9f2e', 'Iconic Other': '#ff5fa2', Secret: '#f5e50b', 'Iconic Secret': '#ffd84a' };
const rarityStyle = (r) => (RARITY_HEX[r] ? `style="--rc: var(--r-${r.toLowerCase().replace(/[^a-z]+/g, '-')})"` : '');
const FACTION = { Yellow: '#f5e50b', Red: '#ff4d5e', Blue: '#3f7bff', Green: '#2fd88a' };

// ---------- Stockage local (collection, souhaits, préférences) ----------
const KEY = 'nightdex:v1';
const defaults = () => ({ owned: {}, wish: [], fav: [], prefs: { lang: 'fr', homeMode: 'list', setMode: 'cards', sort: 'num', own: 'all', rarity: null, valueRange: 90 } });
function loadUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const u = JSON.parse(raw);
    const d = defaults();
    const prefs = { ...d.prefs, ...(u.prefs ?? {}) };
    if (prefs.rarity && !RARITIES.includes(prefs.rarity)) prefs.rarity = null;
    return { ...d, ...u, prefs };
  } catch { return defaults(); }
}
const user = loadUser();
const wish = new Set(user.wish);
const fav = new Set(user.fav);
function save() {
  user.wish = [...wish]; user.fav = [...fav];
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* stockage indisponible */ }
}

// ---------- Langue & formats ----------
let lang = user.prefs.lang === 'en' ? 'en' : 'fr';
let L = TEXT[lang];
let fmt;
function setFormats() {
  const loc = lang === 'en' ? 'en-GB' : 'fr-FR';
  fmt = {
    eur: new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }),
    pct: new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }),
    day: new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' }),
    date: new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric' }),
    loc,
  };
}
setFormats();
const eur = (v) => (v == null ? '—' : fmt.eur.format(v));
const pct = (v) => (v == null || !isFinite(v) ? '' : fmt.pct.format(v));
const rarityLabel = (r) => L.rarity[r] ?? r;
const typeLabel = (t) => L.type[t] ?? t;
const colorLabel = (c) => L.color[c] ?? c;
const cardName = (c) => (lang === 'en' ? c.nameEn ?? c.name : c.name);
const setName = (s) => (lang === 'en' ? s.nameEn ?? s.name : s.name);
const blockName = (b) => L.blocks[b] ?? b;

// ---------- Données ----------
let catalog = { sets: [], cards: [] };
let priceFile = { prices: {} };
let sealed = [];
let config = { cardmarket: { gameSlug: 'Cyberpunk', languageIds: { en: 1, fr: 2 } } };
const cardsById = new Map();
const cardsBySet = new Map();

async function loadData() {
  // version autonome : données intégrées dans la page (<script type="application/json" id="data/…">)
  const embedded = (p) => { const el = document.getElementById(p); return el ? Promise.resolve(JSON.parse(el.textContent)) : null; };
  const get = (p) => embedded(p) ?? fetch(p, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
  let sealedFile;
  [catalog, priceFile, config, sealedFile] = await Promise.all([get('data/catalog.json'), get('data/prices.json'), get('data/config.json').catch(() => config), get('data/sealed.json').catch(() => ({ items: [] }))]);
  sealed = sealedFile.items ?? [];
  for (const it of sealed) cardsById.set(it.id, it);
  for (const c of catalog.cards) {
    cardsById.set(c.id, c);
    if (!cardsBySet.has(c.set)) cardsBySet.set(c.set, []);
    cardsBySet.get(c.set).push(c);
  }
  const key = (n) => String(n).replace(/^\D+/, '');
  for (const list of cardsBySet.values()) list.sort((a, b) => key(a.number).localeCompare(key(b.number), 'en', { numeric: true }));
  document.getElementById('demoBanner').hidden = !catalog.demo;
}

const P = (id) => priceFile.prices[id];
const hasPrices = () => Object.keys(priceFile.prices ?? {}).length > 0;
const price = (id) => P(id)?.trend ?? null;
const qty = (id) => user.owned[id] ?? 0;
const setOf = (code) => catalog.sets.find((s) => s.code === code);
const setTotal = (s) => s.total ?? cardsBySet.get(s.code)?.length ?? 0;
const ownedIn = (code) => (cardsBySet.get(code) ?? []).filter((c) => qty(c.id) > 0).length;
const printCode = (code) => setOf(code)?.print ?? code;
const isSealed = (c) => c.kind === 'sealed';
const itemCode = (c) => (isSealed(c) ? c.print ?? (c.set ? printCode(c.set) : '') : printCode(c.set));
const allItems = () => [...catalog.cards, ...sealed];

function valueAt(hist, day) {
  let v = null;
  for (const [d, p] of hist) { if (d <= day) v = p; else break; }
  return v;
}
function change(id, days) {
  const h = P(id)?.history;
  if (!h || h.length < 2) return null;
  const last = h[h.length - 1];
  const from = new Date(parseDay(last[0]) - days * 864e5).toISOString().slice(0, 10);
  const before = valueAt(h, from) ?? h[0][1];
  return before ? last[1] / before - 1 : null;
}
// Lien Cardmarket : page exacte de la carte (avec filtre de langue), sinon recherche par nom
function cmUrl(card) {
  const { gameSlug = 'Cyberpunk', languageIds = { en: 1, fr: 2 } } = config.cardmarket ?? {};
  if (card.cardmarket?.path && isSealed(card)) return { url: `https://www.cardmarket.com/${lang}/${gameSlug}/${card.cardmarket.path}`, exact: true };
  if (card.cardmarket?.path) {
    const printedIn = lang === 'fr' && card.languages?.includes('fr') ? 'fr' : 'en';
    return { url: `https://www.cardmarket.com/${lang}/${gameSlug}/${card.cardmarket.path}?language=${languageIds[printedIn]}`, exact: true };
  }
  return { url: `https://www.cardmarket.com/${lang}/${gameSlug}/Products/Search?searchString=${encodeURIComponent(card.nameEn ?? card.name)}`, exact: false };
}

// ---------- Images ----------
const artCache = new Map();
function sealedArt(it) {
  const words = String(cardName(it)).split(' ');
  const lines = [''];
  for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).trim().length > 18 && lines.length < 4) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<polygon points="300,60 520,170 520,430 300,540 80,430 80,170" fill="#1d2337" stroke="#f5e50b" stroke-width="6"/>
<polygon points="300,60 520,170 300,280 80,170" fill="#2b3250"/><line x1="300" y1="280" x2="300" y2="540" stroke="#f5e50b" stroke-width="4" stroke-opacity=".5"/>
${lines.map((l, i) => `<text x="300" y="${340 + i * 40}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="30" fill="#eceef6">${esc(l)}</text>`).join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function placeholderArt(card) {
  const k = `${card.id}|${lang}`;
  if (artCache.has(k)) return artCache.get(k);
  if (isSealed(card)) { const u = sealedArt(card); artCache.set(k, u); return u; }
  const c1 = FACTION[card.color] ?? '#3ad8df';
  const rc = RARITY_HEX[card.rarity] ?? '#8e96b2';
  const lines = [''];
  for (const w of String(cardName(card)).split(' ')) { if ((lines[lines.length - 1] + ' ' + w).trim().length > 16 && lines.length < 3) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset=".55" stop-color="#141826"/><stop offset="1" stop-color="#0b0d14"/></linearGradient></defs>
<rect width="630" height="880" rx="34" fill="#0b0d14"/><rect x="18" y="18" width="594" height="844" rx="22" fill="url(#g)"/>
<text x="46" y="78" font-family="sans-serif" font-weight="700" font-size="40" fill="#eceef6">${esc(itemCode(card))} · ${esc(card.number ?? '')}</text>
${lines.map((l, i) => `<text x="46" y="${200 + i * 64}" font-family="sans-serif" font-weight="700" font-size="56" fill="#eceef6">${esc(l)}</text>`).join('')}
<polygon points="315,420 405,472 405,576 315,628 225,576 225,472" fill="none" stroke="${rc}" stroke-width="6"/></svg>`;
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  artCache.set(k, uri);
  return uri;
}
const imageOf = (c) => (lang === 'en' && c.imageEn ? c.imageEn : c.image);

// Version autonome : images regroupées par série et par langue dans packs/<nom>.json (chargées à la demande)
const packs = new Map();
function ensurePack(name) {
  if (packs.has(name)) return;
  packs.set(name, null);
  fetch(`packs/${name}.json`).then((r) => r.json()).then((map) => {
    packs.set(name, map);
    for (const img of document.querySelectorAll(`img[data-pack="${CSS.escape(name)}"]`)) if (map[img.dataset.key]) img.src = map[img.dataset.key];
  }).catch(() => packs.delete(name));
}
function cardImg(card, eager = false) {
  const ph = placeholderArt(card);
  const img = imageOf(card);
  let src = img || ph;
  let extra = '';
  if (img?.startsWith('pack:')) {
    const name = img.slice(5);
    const map = packs.get(name);
    src = map?.[card.id] ?? ph;
    if (!map) { extra = ` data-pack="${esc(name)}" data-key="${esc(card.id)}"`; ensurePack(name); }
  }
  return `<img src="${esc(src)}" alt="${esc(cardName(card))}" ${eager ? '' : 'loading="lazy"'} decoding="async" data-ph="${esc(ph)}"${extra}>`;
}
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.ph && img.src !== img.dataset.ph) img.src = img.dataset.ph;
}, true);

// ---------- Rendu des cartes ----------
function cardTile(c) {
  const q = qty(c.id);
  return `<div class="card ${q ? 'owned' : 'missing'}" data-cid="${esc(c.id)}">
    <button class="card-img" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}, ${esc(printCode(c.set))} ${esc(c.number)}">${cardImg(c)}</button>
    ${price(c.id) != null ? `<span class="price num">${eur(price(c.id))}</span>` : ''}
    <div class="actions">
      <button class="mini-btn heart" data-wish="${esc(c.id)}" aria-pressed="${wish.has(c.id)}" aria-label="${L.wishBtn}">${I.heart}</button>
      <button class="mini-btn own" data-own="${esc(c.id)}" aria-pressed="${q > 0}" aria-label="${L.ownBtn}">${I.own}${q > 1 ? `<span class="qty">${q}</span>` : ''}</button>
    </div>
  </div>`;
}
function sealedTile(it) {
  const q = qty(it.id);
  const code = itemCode(it);
  return `<div class="sealed ${q ? 'owned' : ''}" data-cid="${esc(it.id)}" data-kind="sealed">
    <button class="sealed-img" data-open="${esc(it.id)}" aria-label="${esc(cardName(it))}">${cardImg(it)}${it.pack ? `<span class="pack-badge num">×${it.pack}</span>` : ''}</button>
    <div class="sealed-info"><strong>${esc(cardName(it))}</strong><span>${code ? `<b class="print">${esc(code)}</b> · ` : ''}${esc(L.catOne[it.category] ?? '')}</span></div>
    <div class="sealed-foot">
      <span class="sprice num">${price(it.id) != null ? eur(price(it.id)) : `<small>${L.noPrice}</small>`}</span>
      <button class="mini-btn heart" data-wish="${esc(it.id)}" aria-pressed="${wish.has(it.id)}" aria-label="${L.wishBtn}">${I.heart}</button>
      <button class="mini-btn own" data-own="${esc(it.id)}" aria-pressed="${q > 0}" aria-label="${L.ownBtn}">${I.own}${q > 1 ? `<span class="qty">${q}</span>` : ''}</button>
    </div>
  </div>`;
}
function compactTile(c) {
  const q = qty(c.id);
  return `<div class="card ${q ? 'owned' : 'missing'}" data-cid="${esc(c.id)}" data-kind="compact">
    <button class="card-img" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}<span class="num-badge num">${esc(c.number)}</span></button>
  </div>`;
}
function cardRow(c, days = 30) {
  const q = qty(c.id);
  const ch = change(c.id, days);
  return `<div class="row" data-cid="${esc(c.id)}" data-kind="row" data-days="${days}">
    <button class="thumb ${isSealed(c) ? 'is-sealed' : ''}" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}</button>
    <button class="meta" data-open="${esc(c.id)}">
      <strong>${esc(cardName(c))}</strong>
      <span>${isSealed(c) ? `${itemCode(c) ? `${esc(itemCode(c))} · ` : ''}${esc(L.catOne[c.category] ?? '')}` : `${esc(printCode(c.set))} · ${esc(c.number)}${c.rarity ? ` · <span class="rarity" ${rarityStyle(c.rarity)}>${esc(rarityLabel(c.rarity))}</span>` : ''}`}</span>
    </button>
    <div class="rprice num">${eur(price(c.id))}${ch != null ? `<small class="${ch >= 0 ? 'up' : 'down'}">${pct(ch)} ${days} ${lang === 'en' ? 'd' : 'j'}</small>` : ''}</div>
    <button class="mini-btn own" data-own="${esc(c.id)}" aria-pressed="${q > 0}" aria-label="${L.ownBtn}">${I.own}${q > 1 ? `<span class="qty">${q}</span>` : ''}</button>
  </div>`;
}
function refreshCard(id) {
  const c = cardsById.get(id);
  for (const el of document.querySelectorAll(`[data-cid="${CSS.escape(id)}"]`)) {
    const kind = el.dataset.kind;
    el.outerHTML = kind === 'row' ? cardRow(c, Number(el.dataset.days) || 30) : kind === 'compact' ? compactTile(c) : kind === 'sealed' ? sealedTile(c) : cardTile(c);
  }
}

// ---------- Vues ----------
const view = document.getElementById('view');
const topbar = document.getElementById('topbar');
let currentRender = () => {};

const langBtn = () => `<button class="lang-btn" data-action="lang" aria-label="${L.language}"><span ${lang === 'fr' ? 'class="on"' : ''}>FR</span><span ${lang === 'en' ? 'class="on"' : ''}>EN</span></button>`;
function setTopbar(html) { topbar.innerHTML = html; }
function seg(name, value, options) {
  return `<div class="seg" role="group">${options.map(([v, label]) => `<button data-seg="${name}" data-value="${v}" aria-pressed="${value === v}">${label}</button>`).join('')}</div>`;
}
function progressRow(s) {
  const total = setTotal(s); const own = ownedIn(s.code);
  const p = total ? own / total : 0;
  return `<a class="set-row" href="#set-${esc(s.code)}">
    <div class="set-head"><span class="set-code">${esc(s.print ?? s.code)}</span><span class="set-name">${esc(setName(s))}</span>
    <span class="set-count num">${own}<small>/${total}</small><b>${Math.floor(p * 100)} %</b></span></div>
    <div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div>
  </a>`;
}
function progressTile(s) {
  const total = setTotal(s); const own = ownedIn(s.code);
  const p = total ? own / total : 0;
  return `<a class="set-tile" href="#set-${esc(s.code)}">
    <div class="set-head"><span class="set-code">${esc(s.print ?? s.code)}</span></div>
    <span class="set-name">${esc(setName(s))}</span>
    <span class="big num">${Math.floor(p * 100)} %</span>
    <div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div>
    <span class="set-meta num"><span>${own}/${total}</span><span>${s.releaseDate ? fmt.date.format(parseDay(s.releaseDate)) : ''}</span></span>
  </a>`;
}

let homeQuery = '';
function homeTopbar(withMode) {
  const mode = user.prefs.homeMode;
  setTopbar(`<h1>${L.home}</h1>${withMode ? `<button class="icon-btn" data-action="home-mode" aria-label="${L.toggleView}">${mode === 'grid' ? I.listIcon : I.gridIcon}</button>` : ''}${langBtn()}<button class="icon-btn" data-action="settings" aria-label="${L.settings}">${I.gear}</button>`);
}
const homeTabs = (active) => `<div class="seg" role="tablist">${[['home', L.setsTab], ['sealed', L.sealed]].map(([h, l]) => `<button data-nav="${h}" aria-pressed="${active === h}">${l}</button>`).join('')}</div>`;
function renderSealed() {
  homeTopbar(false);
  const updated = priceFile.updatedAt ? fmt.date.format(parseDay(priceFile.updatedAt)) : '';
  const cats = ['booster', 'box', 'case', 'deck', 'kit'];
  view.innerHTML = `<div class="stack">
    ${homeTabs('sealed')}
    ${cats.map((cat) => { const list = sealed.filter((s) => s.category === cat).sort((a, b) => a.order - b.order); return list.length ? `<h2 class="section-title">${L.cats[cat]}</h2><div class="sealed-grid">${list.map(sealedTile).join('')}</div>` : ''; }).join('')}
    <p class="note">${L.sealedNote(updated)}</p>
  </div>`;
}
function renderHome() {
  homeTopbar(true);
  const mode = user.prefs.homeMode;
  const q = homeQuery.trim().toLowerCase();
  const sets = [...catalog.sets]
    .filter((s) => !q || [s.name, s.nameEn, s.code, s.print].some((x) => String(x ?? '').toLowerCase().includes(q)))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const groups = new Map();
  const favSets = sets.filter((s) => fav.has(s.code));
  if (favSets.length) groups.set(L.favorites, favSets);
  for (const s of sets) { const b = blockName(s.block ?? 'new'); if (!groups.has(b)) groups.set(b, []); groups.get(b).push(s); }
  const body = [...groups].map(([name, list]) => `<details class="block" open>
      <summary>${esc(name)}${I.chevron}</summary>
      ${mode === 'grid' ? `<div class="set-tiles">${list.map(progressTile).join('')}</div>` : `<div class="set-list">${list.map(progressRow).join('')}</div>`}
    </details>`).join('');
  view.innerHTML = `<div class="stack">
    ${homeTabs('home')}
    <input class="search" id="setSearch" type="search" placeholder="${L.searchSet}" value="${esc(homeQuery)}" autocomplete="off">
    ${body || `<div class="empty"><strong>${L.noSet}</strong></div>`}
  </div>`;
}

let showFilters = false;
const SORTS = ['num', 'price-desc', 'price-asc', 'name'];
function sortCards(list, sort) {
  const l = [...list];
  if (sort === 'price-desc') l.sort((a, b) => (price(b.id) ?? -1) - (price(a.id) ?? -1));
  else if (sort === 'price-asc') l.sort((a, b) => (price(a.id) ?? 1e9) - (price(b.id) ?? 1e9));
  else if (sort === 'name') l.sort((a, b) => cardName(a).localeCompare(cardName(b), fmt.loc));
  return l;
}
function filterCards(list) {
  const { own, rarity } = user.prefs;
  return list.filter((c) => (own === 'all' || (own === 'owned') === qty(c.id) > 0) && (!rarity || c.rarity === rarity));
}
function filtersPanel(list) {
  const { own, rarity, sort } = user.prefs;
  const rs = RARITIES.filter((r) => list.some((c) => c.rarity === r));
  return `<div class="stack" style="gap:8px">
    <div class="chips">${SORTS.map((v) => `<button class="chip" data-pref="sort" data-value="${v}" aria-pressed="${sort === v}">${L.sorts[v]}</button>`).join('')}</div>
    <div class="chips">${['all', 'owned', 'missing'].map((v) => `<button class="chip" data-pref="own" data-value="${v}" aria-pressed="${own === v}">${L.ownF[v]}</button>`).join('')}</div>
    ${rs.length ? `<div class="chips"><button class="chip" data-pref="rarity" data-value="" aria-pressed="${!rarity}">${L.allRarities}</button>${rs.map((r) => `<button class="chip" data-pref="rarity" data-value="${esc(r)}" aria-pressed="${rarity === r}"><span class="rarity" ${rarityStyle(r)}>${esc(rarityLabel(r))}</span></button>`).join('')}</div>` : ''}
  </div>`;
}
function cardsBlock(list, mode) {
  if (!list.length) return `<div class="empty"><strong>${L.noCards}</strong>${L.noCardsHint}</div>`;
  if (mode === 'list') return `<div class="rows">${list.map((c) => cardRow(c)).join('')}</div>`;
  if (mode === 'grid') return `<div class="cards compact">${list.map(compactTile).join('')}</div>`;
  return `<div class="cards">${list.map(cardTile).join('')}</div>`;
}

function renderSet(code) {
  const s = setOf(code);
  if (!s) { location.hash = '#home'; return; }
  const all = cardsBySet.get(code) ?? [];
  const list = sortCards(filterCards(all), user.prefs.sort);
  const value = all.reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const full = all.reduce((a, c) => a + (price(c.id) ?? 0), 0);
  const isFiltered = user.prefs.own !== 'all' || user.prefs.rarity;
  setTopbar(`<a class="icon-btn" href="#home" aria-label="${L.back}">${I.back}</a>
    <h1 class="small"><span class="title-code">${esc(s.print ?? s.code)}</span>${esc(setName(s))}</h1>
    <button class="icon-btn ${fav.has(code) ? 'on' : ''}" data-fav="${esc(code)}" aria-pressed="${fav.has(code)}" aria-label="${L.favSet}">${I.star}</button>
    <button class="icon-btn" data-action="cycle-sort" aria-label="${L.changeSort}">${I.sort}</button>
    <button class="icon-btn ${showFilters || isFiltered ? 'on' : ''}" data-action="filters" aria-label="${L.filters}" aria-expanded="${showFilters}">${I.filter}</button>`);
  view.innerHTML = `<div class="stack">
    ${seg('setMode', user.prefs.setMode, [['cards', L.cards], ['list', L.list], ['grid', L.grid]])}
    ${showFilters ? filtersPanel(all) : ''}
    <div class="toolbar num">
      <span>${L.owned(ownedIn(code), setTotal(s))}</span><span class="grow"></span>
      ${hasPrices() ? `<span>${L.myValue} : <b style="color:var(--fg)">${eur(value)}</b></span>` : `<span>${L.pricesSoon}</span>`}
    </div>
    ${cardsBlock(list, user.prefs.setMode)}
    <p class="note num">${L.setNote(L.sorts[user.prefs.sort], list.length, hasPrices() ? eur(full) : '')}</p>
  </div>`;
}

let colSet = '';
function renderCollection() {
  setTopbar(`<h1>${L.myCollection}</h1>`);
  const owned = catalog.cards.filter((c) => qty(c.id) > 0);
  const ownedSealed = sealed.filter((s) => qty(s.id) > 0);
  if (!owned.length && !ownedSealed.length) {
    view.innerHTML = `<div class="empty"><strong>${L.emptyCol}</strong>${L.emptyColHint}<a class="btn-ghost" href="#home" style="text-decoration:none">${L.browseSets}</a></div>`;
    return;
  }
  const total = owned.reduce((a, c) => a + qty(c.id), 0);
  const value = [...owned, ...ownedSealed].reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const sealedQty = ownedSealed.reduce((a, s) => a + qty(s.id), 0);
  const sets = [...catalog.sets].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).filter((s) => ownedIn(s.code) > 0);
  const shown = colSet === '__sealed' ? [] : sortCards(owned.filter((c) => !colSet || c.set === colSet), 'price-desc');
  const sealedShown = !colSet || colSet === '__sealed' ? ownedSealed : [];
  view.innerHTML = `<div class="stack">
    <div class="kpis">
      <div class="stat"><small>${L.kCards}</small><b class="num">${total}</b></div>
      <div class="stat"><small>${L.kUnique}</small><b class="num">${owned.length}</b></div>
      <div class="stat"><small>${L.kValue}</small><b class="num">${eur(value)}</b></div>
    </div>
    <div class="chips"><button class="chip" data-colset="" aria-pressed="${!colSet}">${L.all}</button>${ownedSealed.length ? `<button class="chip" data-colset="__sealed" aria-pressed="${colSet === '__sealed'}">${L.sealed} · ${sealedQty}</button>` : ''}${sets.map((s) => `<button class="chip" data-colset="${esc(s.code)}" aria-pressed="${colSet === s.code}">${esc(s.print ?? s.code)} · ${ownedIn(s.code)}</button>`).join('')}</div>
    ${shown.length ? `${seg('setMode', user.prefs.setMode, [['cards', L.cards], ['list', L.list], ['grid', L.grid]])}${cardsBlock(shown, user.prefs.setMode)}` : ''}
    ${sealedShown.length ? `<h2 class="section-title">${L.sealed} · ${L.sealedCount(sealedQty)}</h2><div class="sealed-grid">${sealedShown.map(sealedTile).join('')}</div>` : ''}
  </div>`;
}

function renderWishlist() {
  setTopbar(`<h1>${L.wishlist}</h1>`);
  const list = sortCards([...wish].map((id) => cardsById.get(id)).filter(Boolean), 'price-desc');
  if (!list.length) {
    view.innerHTML = `<div class="empty"><strong>${L.emptyWish}</strong>${L.emptyWishHint}</div>`;
    return;
  }
  const missing = list.filter((c) => !qty(c.id));
  const cost = missing.reduce((a, c) => a + (price(c.id) ?? 0), 0);
  view.innerHTML = `<div class="stack">
    <div class="hero-value"><small>${L.wishBudget}</small><strong class="num">${eur(cost)}</strong>
    <span class="note">${L.wishNote(missing.length, list.length)}</span></div>
    <div class="rows">${list.map((c) => cardRow(c)).join('')}</div>
  </div>`;
}

let searchQuery = '';
function renderSearch() {
  setTopbar(`<h1>${L.search}</h1>`);
  const q = searchQuery.trim().toLowerCase();
  const res = q.length < 2 ? [] : allItems().filter((c) => [c.name, c.nameEn, `${itemCode(c)} ${c.number ?? ''}`, `${c.set} ${c.number ?? ''}`].some((x) => String(x ?? '').toLowerCase().includes(q)));
  view.innerHTML = `<div class="stack">
    <input class="search" id="cardSearch" type="search" placeholder="${L.searchPh}" value="${esc(searchQuery)}" autocomplete="off">
    <div id="searchResults">${q.length < 2 ? `<p class="note">${L.searchHint(catalog.cards.length, catalog.sets.length)}</p>`
      : res.length ? `<p class="note">${L.results(res.length)}</p><div class="rows">${sortCards(res, 'price-desc').slice(0, 150).map((c) => cardRow(c)).join('')}</div>`
      : `<div class="empty"><strong>${L.noResult}</strong></div>`}</div>
  </div>`;
}

function portfolioSeries() {
  const owned = allItems().filter((c) => qty(c.id) > 0 && P(c.id)?.history?.length);
  if (!owned.length) return [];
  // la courbe commence quand toutes les cartes possédées ont un prix (sinon faux saut depuis 0 €)
  const start = owned.reduce((m, c) => (P(c.id).history[0][0] > m ? P(c.id).history[0][0] : m), '');
  const days = new Set();
  for (const c of owned) for (const [d] of P(c.id).history) if (d >= start) days.add(d);
  return [...days].sort().map((d) => [d, Math.round(owned.reduce((a, c) => a + qty(c.id) * (valueAt(P(c.id).history, d) ?? 0), 0) * 100) / 100]);
}
function renderValues() {
  setTopbar(`<h1>${L.market}</h1>`);
  const owned = allItems().filter((c) => qty(c.id) > 0);
  const value = owned.reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const priced = allItems().filter((c) => (price(c.id) ?? 0) >= 0.5);
  const movers = priced.map((c) => [c, change(c.id, 7)]).filter(([, v]) => v != null && v !== 0);
  const ups = [...movers].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const downs = [...movers].filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const top = sortCards(catalog.cards.filter((c) => price(c.id) != null), 'price-desc').slice(0, 10);
  const updated = priceFile.updatedAt ? fmt.date.format(parseDay(priceFile.updatedAt)) : '—';
  const empty = `<p class="note" style="padding:12px">${L.noHistory}</p>`;
  view.innerHTML = `<div class="stack">
    <section class="panel">
      <div class="hero-value"><small>${L.colValue}</small><strong class="num">${eur(value)}</strong></div>
      ${owned.length ? '<div class="ranges" id="pfRanges"></div><div class="chart" id="pfChart"></div>' : `<p class="note">${L.colValueHint}</p>`}
      <p class="note">${hasPrices() ? L.pricesNote(updated) : L.noPricesNote}</p>
    </section>
    <h2 class="section-title">${L.risers}</h2>
    <div class="rows">${ups.map(([c]) => cardRow(c, 7)).join('') || empty}</div>
    <h2 class="section-title">${L.fallers}</h2>
    <div class="rows">${downs.map(([c]) => cardRow(c, 7)).join('') || empty}</div>
    <h2 class="section-title">${L.priciest}</h2>
    <div class="rows">${top.map((c) => cardRow(c)).join('') || empty}</div>
  </div>`;
  if (owned.length) mountRangedChart(document.getElementById('pfRanges'), document.getElementById('pfChart'), portfolioSeries(), 'valueRange', true);
}

// ---------- Graphique de prix ----------
const RANGE_DAYS = [7, 30, 90, 365, 0];
function mountRangedChart(rangesEl, chartEl, series, prefKey, hasData) {
  const draw = () => {
    const days = user.prefs[prefKey] ?? 90;
    rangesEl.innerHTML = RANGE_DAYS.map((d, i) => `<button type="button" data-days="${d}" aria-pressed="${days === d}">${L.ranges[i]}</button>`).join('');
    let pts = series;
    if (days && series.length) {
      const last = parseDay(series[series.length - 1][0]);
      const from = new Date(last - days * 864e5).toISOString().slice(0, 10);
      pts = series.filter(([d]) => d >= from);
      if (pts.length < 2) pts = series.slice(-2);
    }
    drawChart(chartEl, pts, hasData);
  };
  rangesEl.onclick = (e) => {
    const b = e.target.closest('[data-days]');
    if (!b) return;
    user.prefs[prefKey] = Number(b.dataset.days); save(); draw();
  };
  draw();
}

function niceTicks(min, max, count = 4) {
  if (min === max) { const d = Math.abs(min) * 0.1 || 1; min -= d; max += d; }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}
let chartSeq = 0;
function drawChart(el, pts, hasData) {
  if (!pts || pts.length < 2) {
    el.innerHTML = `<div class="chart-empty">${hasData ? L.chartWait : L.chartNone}</div>`;
    return;
  }
  const W = Math.max(260, el.clientWidth || 320), H = el.clientHeight || 210;
  const padL = 58, padR = 12, padT = 14, padB = 26;
  const xs = pts.map(([d]) => +parseDay(d));
  const ys = pts.map(([, v]) => v);
  const t0 = xs[0], t1 = xs[xs.length - 1];
  const ticks = niceTicks(Math.min(...ys), Math.max(...ys));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const X = (t) => padL + ((t - t0) / (t1 - t0 || 1)) * (W - padL - padR);
  const Y = (v) => padT + (1 - (v - y0) / (y1 - y0 || 1)) * (H - padT - padB);
  const line = pts.map((_, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join('');
  const area = `${line}L${X(t1).toFixed(1)},${Y(y0).toFixed(1)}L${X(t0).toFixed(1)},${Y(y0).toFixed(1)}Z`;
  const gid = `ga${++chartSeq}`;
  const xLabels = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  const tickFmt = new Intl.NumberFormat(fmt.loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: y1 - y0 < 5 ? 2 : 0 });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(L.chartAria(fmt.date.format(t0), fmt.date.format(t1), eur(ys[0]), eur(ys[ys.length - 1])))}">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".32"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <g class="grid">${ticks.map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${Y(t)}" y2="${Y(t)}"/>`).join('')}</g>
    <g class="axis">${ticks.map((t) => `<text x="${padL - 8}" y="${Y(t) + 4}" text-anchor="end">${tickFmt.format(t)}</text>`).join('')}
      ${xLabels.map((i, k, a) => `<text x="${X(xs[i])}" y="${H - 6}" text-anchor="${k === 0 ? 'start' : k === a.length - 1 ? 'end' : 'middle'}">${fmt.day.format(xs[i])}</text>`).join('')}</g>
    <path d="${area}" fill="url(#${gid})"/>
    <path class="line" d="${line}"/>
    ${pts.length <= 12 ? pts.map((_, i) => `<circle class="pt" cx="${X(xs[i])}" cy="${Y(ys[i])}" r="3.5"/>`).join('') : ''}
    <circle class="end" cx="${X(t1)}" cy="${Y(ys[ys.length - 1])}" r="5"/>
    <g class="hover" visibility="hidden"><line class="cross" y1="${padT}" y2="${H - padB}"/><circle class="dot" r="5"/></g>
  </svg><div class="tip num" hidden></div>`;
  const svg = el.querySelector('svg');
  const hover = svg.querySelector('.hover');
  const cross = hover.querySelector('line');
  const dot = hover.querySelector('circle');
  const tip = el.querySelector('.tip');
  const move = (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(X(xs[i]) - px) < Math.abs(X(xs[best]) - px)) best = i;
    const cx = X(xs[best]), cy = Y(ys[best]);
    hover.setAttribute('visibility', 'visible');
    cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
    tip.hidden = false;
    tip.innerHTML = `<b>${eur(ys[best])}</b>${fmt.date.format(xs[best])}`;
    const left = (cx / W) * r.width;
    const half = tip.offsetWidth / 2;
    tip.style.left = `${Math.min(r.width - half, Math.max(half, left))}px`;
    tip.style.top = `${Math.max(0, (cy / H) * r.height - 52)}px`;
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', () => { hover.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}

// ---------- Fiche carte ----------
const sheet = document.getElementById('sheet');
const sheetPanel = document.getElementById('sheetPanel');
let openId = null;
let lastFocus = null;

function openCard(id) {
  const c = cardsById.get(id);
  if (!c) return;
  if (!openId) lastFocus = document.activeElement;
  openId = id;
  const s = setOf(c.set);
  const p = P(id) ?? {};
  const ch = change(id, 30);
  const cm = cmUrl(c);
  const q = qty(id);
  const stats = [c.cost != null ? `${L.cost} ${c.cost}` : '', c.power != null ? `${L.power} ${c.power}` : '', c.ram != null ? `${L.ram} ${c.ram}` : ''].filter(Boolean).join(' · ');
  const enOnly = lang === 'fr' && c.languages && !c.languages.includes('fr');
  const sealedItem = isSealed(c);
  sheetPanel.innerHTML = `<div class="grab"></div>
    <div class="stack">
      <div class="detail-top ${sealedItem ? 'is-sealed' : ''}" ${rarityStyle(c.rarity)}>
        <div class="card-img">${cardImg(c, true)}${c.pack ? `<span class="pack-badge num">×${c.pack}</span>` : ''}</div>
        <div class="detail-info">
          <h2 id="sheetTitle">${esc(cardName(c))}</h2>
          ${sealedItem
            ? `<div class="sub">${esc(L.catOne[c.category] ?? '')}${itemCode(c) ? `<br><b class="print">${esc(itemCode(c))}</b>${s ? ` · ${esc(setName(s))}` : ''}` : ''}</div>`
            : `<div class="sub">${esc(s ? setName(s) : c.set)}<br><span class="num"><b class="print">${esc(printCode(c.set))}</b> · ${esc(c.number)}/${setTotal(s ?? {})}</span></div>`}
          ${c.rarity ? `<span class="rarity" ${rarityStyle(c.rarity)}>${esc(rarityLabel(c.rarity))}${c.type ? ` · ${esc(typeLabel(c.type))}` : ''}${c.color ? ` · ${esc(colorLabel(c.color))}` : ''}</span>` : ''}
          ${stats ? `<span class="sub num">${stats}</span>` : ''}
          ${enOnly ? `<span class="sub">${L.enOnly}</span>` : ''}
          <div class="big-price num"><small>${L.trend}${p.foil ? ` · <span class="foil">${L.foil}</span>` : ''}</small>${p.trend != null ? eur(p.trend) : `<span style="font-size:18px;color:var(--muted)">${L.noPrice}</span>`}</div>
          ${ch != null ? `<span class="delta num ${ch >= 0 ? 'up' : 'down'}">${pct(ch)} ${L.over30}</span>` : ''}
          <div class="detail-actions">
            <div class="stepper" role="group" aria-label="${L.copies}">
              <button data-qty="-1" aria-label="${L.removeCopy}">−</button>
              <output class="num" aria-live="polite">${q}</output>
              <button data-qty="1" aria-label="${L.addCopy}">+</button>
            </div>
            <button class="mini-btn heart" style="width:42px;height:42px" data-wish="${esc(id)}" aria-pressed="${wish.has(id)}" aria-label="${L.wishBtn}">${I.heart}</button>
          </div>
        </div>
      </div>
      ${p.trend != null ? `<div class="stats">
        <div class="stat"><small>${L.from}</small><b class="num">${eur(p.low)}</b></div>
        <div class="stat"><small>${L.avg7}</small><b class="num">${eur(p.avg7)}</b></div>
        <div class="stat"><small>${L.avg30}</small><b class="num">${eur(p.avg30)}</b></div>
      </div>` : ''}
      <section class="panel">
        <h3>${L.curve} <small>Cardmarket${priceFile.updatedAt ? ` · ${fmt.date.format(parseDay(priceFile.updatedAt))}` : ''}</small></h3>
        <div class="ranges" id="cardRanges"></div>
        <div class="chart" id="cardChart"></div>
        ${p.seeded ? `<p class="note">${L.seeded}</p>` : ''}
      </section>
      <a class="cta" href="${esc(cm.url)}" target="_blank" rel="noopener">${cm.exact ? L.cmView : L.cmSearch} ${I.ext}</a>
      ${c.official ? `<a class="btn-ghost" style="text-align:center;text-decoration:none" href="${esc(c.official)}" target="_blank" rel="noopener">${L.official}</a>` : ''}
      ${q > 0 && p.trend ? `<p class="note num" style="text-align:center">${L.worth(q, eur(q * p.trend))}</p>` : ''}
      ${c.artist ? `<p class="note" style="text-align:center">${esc(L.art(c.artist))}</p>` : ''}
    </div>`;
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  mountRangedChart(document.getElementById('cardRanges'), document.getElementById('cardChart'), p.history ?? [], 'cardRange', p.trend != null);
  sheetPanel.querySelector('.stepper button')?.focus({ preventScroll: true });
}
function closeCard() {
  sheet.hidden = true; openId = null;
  document.body.style.overflow = '';
  lastFocus?.focus?.({ preventScroll: true });
}

// ---------- Réglages ----------
function openSettings() {
  openId = null;
  sheetPanel.innerHTML = `<div class="grab"></div><div class="stack">
    <h2 id="sheetTitle" style="margin:0;font:700 22px var(--font-display)">${L.settings}</h2>
    <div class="panel"><h3>${L.language}</h3>${seg('lang', lang, [['fr', 'Français'], ['en', 'English']])}</div>
    <p class="note">${L.storage(Object.keys(user.owned).length, wish.size)}</p>
    <div class="menu">
      <button class="btn-ghost" data-action="export">${L.export}</button>
      <label class="btn-ghost" for="importFile">${L.import}</label>
      <input id="importFile" type="file" accept="application/json,.json" hidden>
      <textarea id="exportBox" class="search" rows="4" hidden readonly></textarea>
    </div>
    <p class="note">${L.dataLine(catalog.cards.length, catalog.sets.length, priceFile.updatedAt ? fmt.date.format(parseDay(priceFile.updatedAt)) : '—')}</p>
    <p class="note">${L.disclaimer}</p>
    <button class="btn-ghost" data-action="close">${L.close}</button>
  </div>`;
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
}

// ---------- Barre d'onglets et langue ----------
function renderChrome() {
  document.documentElement.lang = lang;
  const labels = { home: L.home, collection: L.collection, values: L.market, wishlist: L.wishlist };
  for (const a of document.querySelectorAll('.tabbar a')) {
    const span = a.querySelector('span');
    if (span && labels[a.dataset.tab]) span.textContent = labels[a.dataset.tab];
    if (a.dataset.tab === 'search') a.setAttribute('aria-label', L.searchCard);
  }
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'fr';
  L = TEXT[lang];
  user.prefs.lang = lang; save();
  setFormats(); renderChrome();
  const wasSettings = !sheet.hidden && !openId;
  const card = openId;
  currentRender();
  if (card) openCard(card); else if (wasSettings) openSettings();
  toast(L.langToast);
}

// ---------- Actions ----------
function toggleOwn(id) {
  user.owned[id] = qty(id) > 0 ? 0 : 1;
  if (!user.owned[id]) delete user.owned[id];
  save(); refreshCard(id);
  toast(qty(id) ? L.addedCol : L.removedCol);
}
function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  save(); refreshCard(id);
  for (const b of sheetPanel.querySelectorAll(`[data-wish="${CSS.escape(id)}"]`)) b.setAttribute('aria-pressed', wish.has(id));
  toast(wish.has(id) ? L.addedWish : L.removedWish);
}

document.addEventListener('click', async (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { location.hash = `#${nav.dataset.nav}`; return; }
  const t = e.target.closest('[data-open],[data-own],[data-wish],[data-seg],[data-pref],[data-fav],[data-action],[data-qty],[data-colset],[data-close]');
  if (!t) return;
  const d = t.dataset;
  if (d.open) openCard(d.open);
  else if (d.own) toggleOwn(d.own);
  else if (d.wish) toggleWish(d.wish);
  else if (d.seg === 'lang') setLang(d.value);
  else if (d.seg) { user.prefs[d.seg] = d.value; save(); currentRender(); }
  else if (d.pref) { user.prefs[d.pref] = d.value || null; if (d.pref === 'own' && !d.value) user.prefs.own = 'all'; save(); currentRender(); }
  else if (d.fav) { fav.has(d.fav) ? fav.delete(d.fav) : fav.add(d.fav); save(); currentRender(); toast(fav.has(d.fav) ? L.favOn : L.favOff); }
  else if (d.colset !== undefined) { colSet = d.colset; currentRender(); }
  else if (d.qty && openId) {
    const id = openId;
    const n = Math.max(0, qty(id) + Number(d.qty));
    if (n) user.owned[id] = n; else delete user.owned[id];
    save(); refreshCard(id); openCard(id);
  } else if (d.close !== undefined) closeCard();
  else if (d.action === 'home-mode') { user.prefs.homeMode = user.prefs.homeMode === 'grid' ? 'list' : 'grid'; save(); currentRender(); }
  else if (d.action === 'lang') setLang(lang === 'fr' ? 'en' : 'fr');
  else if (d.action === 'cycle-sort') {
    const i = SORTS.indexOf(user.prefs.sort);
    user.prefs.sort = SORTS[(i + 1) % SORTS.length]; save(); currentRender();
    toast(L.sortToast(L.sorts[user.prefs.sort]));
  } else if (d.action === 'filters') { showFilters = !showFilters; currentRender(); }
  else if (d.action === 'settings') openSettings();
  else if (d.action === 'close') closeCard();
  else if (d.action === 'export') {
    const data = JSON.stringify({ app: 'NightDex', version: 1, exportedAt: new Date().toISOString(), owned: user.owned, wish: [...wish], fav: [...fav] });
    const box = document.getElementById('exportBox');
    box.hidden = false; box.value = data;
    try { await navigator.clipboard.writeText(data); toast(L.copied); } catch { box.select(); toast(L.selectCopy); }
  }
});
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'importFile') return;
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data.owned) throw new Error();
    user.owned = data.owned; wish.clear(); (data.wish ?? []).forEach((x) => wish.add(x));
    fav.clear(); (data.fav ?? []).forEach((x) => fav.add(x));
    save(); closeCard(); currentRender(); toast(L.imported);
  } catch { toast(L.badFile); }
});
document.addEventListener('input', (e) => {
  const map = { setSearch: [(v) => { homeQuery = v; }, renderHome], cardSearch: [(v) => { searchQuery = v; }, renderSearch] };
  const m = map[e.target.id];
  if (!m) return;
  m[0](e.target.value);
  const pos = e.target.selectionStart;
  m[1]();
  const el = document.getElementById(e.target.id); el.focus(); el.setSelectionRange(pos, pos);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeCard(); });
sheet.addEventListener('click', (e) => { if (e.target.matches('.sheet-backdrop')) closeCard(); });

// ---------- Navigation ----------
function route() {
  const h = location.hash.slice(1) || 'home';
  if (!sheet.hidden) closeCard();
  let tab = h;
  if (h.startsWith('set-')) { tab = 'home'; currentRender = () => renderSet(h.slice(4)); }
  else if (h === 'collection') currentRender = renderCollection;
  else if (h === 'wishlist') currentRender = renderWishlist;
  else if (h === 'search') currentRender = renderSearch;
  else if (h === 'values') currentRender = renderValues;
  else if (h === 'sealed') { tab = 'home'; currentRender = renderSealed; }
  else { tab = 'home'; currentRender = renderHome; }
  for (const a of document.querySelectorAll('.tabbar a')) {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  currentRender();
  window.scrollTo(0, 0);
  if (h === 'search') document.getElementById('cardSearch')?.focus();
}
window.addEventListener('hashchange', route);

// ---------- Démarrage ----------
renderChrome();
try {
  await loadData();
  route();
} catch (err) {
  view.innerHTML = `<div class="empty"><strong>${L.loadError}</strong>${L.loadErrorHint}</div>`;
  console.error(err);
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
