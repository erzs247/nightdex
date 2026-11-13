// NightDex : suivi de collection Cyberpunk TCG (cartes, prix Cardmarket, courbes de prix).
// Aucune dépendance : HTML + CSS + ce module. Les données viennent de data/*.json.

// ---------- Formats français ----------
const fmtEur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const fmtPct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' });
const fmtDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const eur = (v) => (v == null ? '—' : fmtEur.format(v));
const pct = (v) => (v == null || !isFinite(v) ? '' : fmtPct.format(v));
const parseDay = (s) => new Date(`${s}T00:00:00`);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Icônes ----------
const I = {
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  sort: '<svg viewBox="0 0 24 24"><path d="M8 4v16"/><path d="m4 8 4-4 4 4"/><path d="M16 20V4"/><path d="m12 16 4 4 4-4"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  own: '<svg viewBox="0 0 24 24"><rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="m9.5 12 2 2 3.5-4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

// ---------- Raretés & couleurs ----------
const RARITIES = ['Commune', 'Peu commune', 'Rare', 'Épique', 'Légendaire', 'Secrète'];
const RARITY_VAR = { 'Commune': '--r-common', 'Peu commune': '--r-uncommon', 'Rare': '--r-rare', 'Épique': '--r-epic', 'Légendaire': '--r-legend', 'Secrète': '--r-secret' };
const rarityStyle = (r) => (RARITY_VAR[r] ? `style="--rc: var(${RARITY_VAR[r]})"` : '');
const FACTION = { Jaune: '#f5e50b', Rouge: '#ff4d5e', Bleu: '#3f7bff', Vert: '#2fd88a', Violet: '#a65cff' };

// ---------- Stockage local (collection, souhaits, préférences) ----------
const KEY = 'nightdex:v1';
const defaults = () => ({ owned: {}, wish: [], fav: [], prefs: { homeMode: 'list', setMode: 'cards', sort: 'num', own: 'all', rarity: null, valueRange: 90 } });
function loadUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const u = JSON.parse(raw);
    const d = defaults();
    return { ...d, ...u, prefs: { ...d.prefs, ...(u.prefs ?? {}) } };
  } catch { return defaults(); }
}
const user = loadUser();
const wish = new Set(user.wish);
const fav = new Set(user.fav);
function save() {
  user.wish = [...wish]; user.fav = [...fav];
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* stockage indisponible */ }
}

// ---------- Données ----------
let catalog = { sets: [], cards: [] };
let priceFile = { prices: {} };
let config = { cardmarket: { lang: 'fr', gameSlug: 'Cyberpunk' } };
const cardsById = new Map();
const cardsBySet = new Map();

async function loadData() {
  // version autonome : données intégrées dans la page (<script type="application/json" id="data/…">)
  const embedded = (p) => { const el = document.getElementById(p); return el ? Promise.resolve(JSON.parse(el.textContent)) : null; };
  const get = (p) => embedded(p) ?? fetch(p, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
  [catalog, priceFile, config] = await Promise.all([get('data/catalog.json'), get('data/prices.json'), get('data/config.json').catch(() => config)]);
  for (const c of catalog.cards) {
    cardsById.set(c.id, c);
    if (!cardsBySet.has(c.set)) cardsBySet.set(c.set, []);
    cardsBySet.get(c.set).push(c);
  }
  for (const list of cardsBySet.values()) list.sort((a, b) => String(a.number).localeCompare(String(b.number), 'fr', { numeric: true }));
  document.getElementById('demoBanner').hidden = !catalog.demo;
}

const P = (id) => priceFile.prices[id];
const price = (id) => P(id)?.trend ?? null;
const qty = (id) => user.owned[id] ?? 0;
const setOf = (code) => catalog.sets.find((s) => s.code === code);
const setTotal = (s) => s.total ?? cardsBySet.get(s.code)?.length ?? 0;
const ownedIn = (code) => (cardsBySet.get(code) ?? []).filter((c) => qty(c.id) > 0).length;

function valueAt(hist, day) {
  // dernier prix connu à cette date (ou avant)
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
function cmUrl(card) {
  if (card.cardmarket?.url) return { url: card.cardmarket.url, exact: true };
  const { lang = 'fr', gameSlug = 'Cyberpunk' } = config.cardmarket ?? {};
  return { url: `https://www.cardmarket.com/${lang}/${gameSlug}/Products/Search?searchString=${encodeURIComponent(card.name)}`, exact: false };
}

// ---------- Visuel de remplacement (quand une carte n'a pas encore d'image) ----------
const artCache = new Map();
function placeholderArt(card) {
  if (artCache.has(card.id)) return artCache.get(card.id);
  const c1 = FACTION[card.color] ?? '#3ad8df';
  const rc = { 'Commune': '#8e96b2', 'Peu commune': '#3ad8df', 'Rare': '#5b8cff', 'Épique': '#b36bff', 'Légendaire': '#ff9f2e', 'Secrète': '#f5e50b' }[card.rarity] ?? '#8e96b2';
  const words = String(card.name).split(' ');
  const lines = [''];
  for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).trim().length > 16 && lines.length < 3) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset=".55" stop-color="#141826"/><stop offset="1" stop-color="#0b0d14"/></linearGradient>
<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 28 28 0" stroke="${c1}" stroke-opacity=".12" stroke-width="2"/></pattern></defs>
<rect width="630" height="880" rx="34" fill="#0b0d14"/><rect x="18" y="18" width="594" height="844" rx="22" fill="url(#g)"/>
<rect x="18" y="18" width="594" height="844" rx="22" fill="url(#p)"/>
<path d="M18 120h420l40-40h134" stroke="${c1}" stroke-width="4" fill="none"/>
<text x="46" y="78" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="40" fill="#eceef6">${esc(card.set)} · ${esc(card.number ?? '')}</text>
${lines.map((l, i) => `<text x="46" y="${200 + i * 64}" font-family="Chakra Petch, sans-serif" font-weight="700" font-size="56" fill="#eceef6">${esc(l)}</text>`).join('')}
<rect x="46" y="${236 + (lines.length - 1) * 64}" width="${Math.max(140, String(card.rarity ?? '').length * 22 + 50)}" height="50" rx="6" fill="${rc}"/>
<text x="66" y="${271 + (lines.length - 1) * 64}" font-family="Inter, sans-serif" font-weight="600" font-size="28" fill="#11131c">${esc(card.rarity ?? 'Carte')}</text>
<polygon points="315,420 405,472 405,576 315,628 225,576 225,472" fill="none" stroke="${rc}" stroke-width="6"/>
</svg>`;
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  artCache.set(card.id, uri);
  return uri;
}
function cardImg(card, eager = false) {
  const ph = placeholderArt(card);
  const src = card.image || ph;
  return `<img src="${esc(src)}" alt="${esc(card.name)}" ${eager ? '' : 'loading="lazy"'} decoding="async" data-ph="${esc(ph)}">`;
}
// image distante cassée → visuel de remplacement
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.ph && img.src !== img.dataset.ph) img.src = img.dataset.ph;
}, true);

// ---------- Rendu des cartes ----------
function cardTile(c) {
  const q = qty(c.id);
  return `<div class="card ${q ? 'owned' : 'missing'}" data-cid="${esc(c.id)}">
    <button class="card-img" data-open="${esc(c.id)}" aria-label="${esc(c.name)}, ${esc(c.set)} ${esc(c.number)}">${cardImg(c)}</button>
    <span class="price num">${eur(price(c.id))}</span>
    <div class="actions">
      <button class="mini-btn heart" data-wish="${esc(c.id)}" aria-pressed="${wish.has(c.id)}" aria-label="Liste de souhaits">${I.heart}</button>
      <button class="mini-btn own" data-own="${esc(c.id)}" aria-pressed="${q > 0}" aria-label="Je possède cette carte">${I.own}${q > 1 ? `<span class="qty">${q}</span>` : ''}</button>
    </div>
  </div>`;
}
function compactTile(c) {
  const q = qty(c.id);
  return `<div class="card ${q ? 'owned' : 'missing'}" data-cid="${esc(c.id)}" data-kind="compact">
    <button class="card-img" data-open="${esc(c.id)}" aria-label="${esc(c.name)}">${cardImg(c)}<span class="num-badge num">${esc(c.number)}</span></button>
  </div>`;
}
function cardRow(c, days = 30) {
  const q = qty(c.id);
  const ch = change(c.id, days);
  const s = setOf(c.set);
  return `<div class="row" data-cid="${esc(c.id)}" data-kind="row" data-days="${days}">
    <button class="thumb" data-open="${esc(c.id)}" aria-label="${esc(c.name)}">${cardImg(c)}</button>
    <button class="meta" data-open="${esc(c.id)}">
      <strong>${esc(c.name)}</strong>
      <span>${esc(s?.code ?? c.set)} · ${esc(c.number)}${c.rarity ? ` · <span class="rarity" ${rarityStyle(c.rarity)}>${esc(c.rarity)}</span>` : ''}</span>
    </button>
    <div class="rprice num">${eur(price(c.id))}${ch != null ? `<small class="${ch >= 0 ? 'up' : 'down'}">${pct(ch)} ${days} j</small>` : ''}</div>
    <button class="mini-btn own" data-own="${esc(c.id)}" aria-pressed="${q > 0}" aria-label="Je possède cette carte">${I.own}${q > 1 ? `<span class="qty">${q}</span>` : ''}</button>
  </div>`;
}
function refreshCard(id) {
  const c = cardsById.get(id);
  for (const el of document.querySelectorAll(`[data-cid="${CSS.escape(id)}"]`)) {
    const kind = el.dataset.kind;
    el.outerHTML = kind === 'row' ? cardRow(c, Number(el.dataset.days) || 30) : kind === 'compact' ? compactTile(c) : cardTile(c);
  }
}

// ---------- Vues ----------
const view = document.getElementById('view');
const topbar = document.getElementById('topbar');
let currentRender = () => {};

function setTopbar(html) { topbar.innerHTML = html; }
function seg(name, value, options) {
  return `<div class="seg" role="group">${options.map(([v, label]) => `<button data-seg="${name}" data-value="${v}" aria-pressed="${value === v}">${label}</button>`).join('')}</div>`;
}
function progressRow(s) {
  const total = setTotal(s); const own = ownedIn(s.code);
  const p = total ? own / total : 0;
  return `<a class="set-row" href="#set-${esc(s.code)}">
    <div class="set-head"><span class="set-code">${esc(s.code)}</span><span class="set-name">${esc(s.name)}</span>
    <span class="set-count num">${own}<small>/${total}</small><b>${Math.floor(p * 100)} %</b></span></div>
    <div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div>
  </a>`;
}
function progressTile(s) {
  const total = setTotal(s); const own = ownedIn(s.code);
  const p = total ? own / total : 0;
  return `<a class="set-tile" href="#set-${esc(s.code)}">
    <div class="set-head"><span class="set-code">${esc(s.code)}</span></div>
    <span class="set-name">${esc(s.name)}</span>
    <span class="big num">${Math.floor(p * 100)} %</span>
    <div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div>
    <span class="set-meta num"><span>${own}/${total}</span><span>${s.releaseDate ? fmtDate.format(parseDay(s.releaseDate)) : ''}</span></span>
  </a>`;
}

let homeQuery = '';
function renderHome() {
  setTopbar(`<h1>Accueil</h1><button class="icon-btn" data-action="settings" aria-label="Réglages">${I.gear}</button>`);
  const mode = user.prefs.homeMode;
  const q = homeQuery.trim().toLowerCase();
  const sets = [...catalog.sets]
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    .sort((a, b) => String(b.releaseDate ?? '').localeCompare(String(a.releaseDate ?? '')));
  const groups = new Map();
  const favSets = sets.filter((s) => fav.has(s.code));
  if (favSets.length) groups.set('Favoris', favSets);
  for (const s of sets) { const b = s.block ?? 'Séries'; if (!groups.has(b)) groups.set(b, []); groups.get(b).push(s); }
  const body = [...groups].map(([name, list]) => `<details class="block" open>
      <summary>${esc(name)}${I.chevron}</summary>
      ${mode === 'grid' ? `<div class="set-tiles">${list.map(progressTile).join('')}</div>` : `<div class="set-list">${list.map(progressRow).join('')}</div>`}
    </details>`).join('');
  view.innerHTML = `<div class="stack">
    ${seg('homeMode', mode, [['list', 'Liste'], ['grid', 'Grille']])}
    <input class="search" id="setSearch" type="search" placeholder="Rechercher une série" value="${esc(homeQuery)}" autocomplete="off">
    ${body || '<div class="empty"><strong>Aucune série trouvée</strong></div>'}
  </div>`;
}

let showFilters = false;
const SORTS = [['num', 'Numéro'], ['price-desc', 'Prix décroissant'], ['price-asc', 'Prix croissant'], ['name', 'Nom']];
function sortCards(list, sort) {
  const l = [...list];
  if (sort === 'price-desc') l.sort((a, b) => (price(b.id) ?? -1) - (price(a.id) ?? -1));
  else if (sort === 'price-asc') l.sort((a, b) => (price(a.id) ?? 1e9) - (price(b.id) ?? 1e9));
  else if (sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
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
    <div class="chips">${SORTS.map(([v, l]) => `<button class="chip" data-pref="sort" data-value="${v}" aria-pressed="${sort === v}">${l}</button>`).join('')}</div>
    <div class="chips">${[['all', 'Toutes'], ['owned', 'Possédées'], ['missing', 'Manquantes']].map(([v, l]) => `<button class="chip" data-pref="own" data-value="${v}" aria-pressed="${own === v}">${l}</button>`).join('')}</div>
    ${rs.length ? `<div class="chips"><button class="chip" data-pref="rarity" data-value="" aria-pressed="${!rarity}">Toutes raretés</button>${rs.map((r) => `<button class="chip" data-pref="rarity" data-value="${esc(r)}" aria-pressed="${rarity === r}"><span class="rarity" ${rarityStyle(r)}>${esc(r)}</span></button>`).join('')}</div>` : ''}
  </div>`;
}
function cardsBlock(list, mode) {
  if (!list.length) return '<div class="empty"><strong>Aucune carte</strong>Modifiez les filtres pour en voir davantage.</div>';
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
  setTopbar(`<a class="icon-btn" href="#home" aria-label="Retour">${I.back}</a>
    <h1 class="small">${esc(s.name)}</h1>
    <button class="icon-btn ${fav.has(code) ? 'on' : ''}" data-fav="${esc(code)}" aria-pressed="${fav.has(code)}" aria-label="Série favorite">${I.star}</button>
    <button class="icon-btn" data-action="cycle-sort" aria-label="Changer le tri">${I.sort}</button>
    <button class="icon-btn ${showFilters || isFiltered ? 'on' : ''}" data-action="filters" aria-label="Filtres" aria-expanded="${showFilters}">${I.filter}</button>`);
  view.innerHTML = `<div class="stack">
    ${seg('setMode', user.prefs.setMode, [['cards', 'Cartes'], ['list', 'Liste'], ['grid', 'Grille']])}
    ${showFilters ? filtersPanel(all) : ''}
    <div class="toolbar num">
      <span>${ownedIn(code)}/${setTotal(s)} possédées</span><span class="grow"></span>
      <span>Ma valeur : <b style="color:var(--fg)">${eur(value)}</b></span>
    </div>
    ${cardsBlock(list, user.prefs.setMode)}
    <p class="note num">Tri : ${SORTS.find(([v]) => v === user.prefs.sort)[1]} · ${list.length} carte${list.length > 1 ? 's' : ''} affichée${list.length > 1 ? 's' : ''} · série complète ≈ ${eur(full)}</p>
  </div>`;
}

let colSet = '';
function renderCollection() {
  setTopbar(`<h1>Ma collection</h1>`);
  const owned = catalog.cards.filter((c) => qty(c.id) > 0);
  if (!owned.length) {
    view.innerHTML = `<div class="empty"><strong>Votre collection est vide</strong>Ouvrez une série et touchez l'icône carte pour marquer celles que vous possédez.<a class="btn-ghost" href="#home" style="text-decoration:none">Voir les séries</a></div>`;
    return;
  }
  const total = owned.reduce((a, c) => a + qty(c.id), 0);
  const value = owned.reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const sets = catalog.sets.filter((s) => ownedIn(s.code) > 0);
  const shown = sortCards(owned.filter((c) => !colSet || c.set === colSet), 'price-desc');
  view.innerHTML = `<div class="stack">
    <div class="kpis">
      <div class="stat"><small>Cartes</small><b class="num">${total}</b></div>
      <div class="stat"><small>Uniques</small><b class="num">${owned.length}</b></div>
      <div class="stat"><small>Valeur</small><b class="num">${eur(value)}</b></div>
    </div>
    <div class="chips"><button class="chip" data-colset="" aria-pressed="${!colSet}">Toutes</button>${sets.map((s) => `<button class="chip" data-colset="${esc(s.code)}" aria-pressed="${colSet === s.code}">${esc(s.code)} · ${ownedIn(s.code)}</button>`).join('')}</div>
    ${seg('setMode', user.prefs.setMode, [['cards', 'Cartes'], ['list', 'Liste'], ['grid', 'Grille']])}
    ${cardsBlock(shown, user.prefs.setMode)}
  </div>`;
}

function renderWishlist() {
  setTopbar(`<h1>Souhaits</h1>`);
  const list = sortCards([...wish].map((id) => cardsById.get(id)).filter(Boolean), 'price-desc');
  if (!list.length) {
    view.innerHTML = `<div class="empty"><strong>Aucune carte en souhait</strong>Touchez le cœur d'une carte pour l'ajouter ici et suivre son prix.</div>`;
    return;
  }
  const missing = list.filter((c) => !qty(c.id));
  const cost = missing.reduce((a, c) => a + (price(c.id) ?? 0), 0);
  view.innerHTML = `<div class="stack">
    <div class="hero-value"><small>Budget pour compléter mes souhaits</small><strong class="num">${eur(cost)}</strong>
    <span class="note">${missing.length} carte${missing.length > 1 ? 's' : ''} à acheter sur ${list.length}, au prix tendance Cardmarket.</span></div>
    <div class="rows">${list.map((c) => cardRow(c)).join('')}</div>
  </div>`;
}

let searchQuery = '';
function renderSearch() {
  setTopbar(`<h1>Recherche</h1>`);
  const q = searchQuery.trim().toLowerCase();
  const res = q.length < 2 ? [] : catalog.cards.filter((c) => c.name.toLowerCase().includes(q) || `${c.set} ${c.number}`.toLowerCase().includes(q));
  view.innerHTML = `<div class="stack">
    <input class="search" id="cardSearch" type="search" placeholder="Nom de carte ou numéro (ex. WNC 012)" value="${esc(searchQuery)}" autocomplete="off">
    <div id="searchResults">${q.length < 2 ? `<p class="note">${catalog.cards.length} cartes dans ${catalog.sets.length} séries. Tapez au moins 2 lettres.</p>`
      : res.length ? `<p class="note">${res.length} résultat${res.length > 1 ? 's' : ''}</p><div class="rows">${sortCards(res, 'price-desc').slice(0, 150).map((c) => cardRow(c)).join('')}</div>`
      : '<div class="empty"><strong>Aucune carte trouvée</strong></div>'}</div>
  </div>`;
}

function portfolioSeries() {
  const owned = catalog.cards.filter((c) => qty(c.id) > 0 && P(c.id)?.history?.length);
  // la courbe commence quand toutes les cartes possédées ont un prix (sinon faux saut depuis 0 €)
  const start = owned.reduce((m, c) => (P(c.id).history[0][0] > m ? P(c.id).history[0][0] : m), '');
  const days = new Set();
  for (const c of owned) for (const [d] of P(c.id).history) if (d >= start) days.add(d);
  const sorted = [...days].sort();
  return sorted.map((d) => [d, Math.round(owned.reduce((a, c) => a + qty(c.id) * (valueAt(P(c.id).history, d) ?? 0), 0) * 100) / 100]);
}
function renderValues() {
  setTopbar(`<h1>Cotes</h1>`);
  const owned = catalog.cards.filter((c) => qty(c.id) > 0);
  const value = owned.reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const series = portfolioSeries();
  const priced = catalog.cards.filter((c) => (price(c.id) ?? 0) >= 0.5);
  const movers = priced.map((c) => [c, change(c.id, 7)]).filter(([, v]) => v != null);
  const ups = [...movers].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const downs = [...movers].sort((a, b) => a[1] - b[1]).slice(0, 5);
  const top = sortCards(catalog.cards, 'price-desc').slice(0, 10);
  const updated = priceFile.updatedAt ? fmtDate.format(parseDay(priceFile.updatedAt)) : '—';
  view.innerHTML = `<div class="stack">
    <section class="panel">
      <div class="hero-value"><small>Valeur de ma collection</small><strong class="num">${eur(value)}</strong></div>
      ${owned.length ? `<div class="ranges" id="pfRanges"></div><div class="chart" id="pfChart"></div>` : '<p class="note">Marquez des cartes comme possédées pour suivre la valeur de votre collection dans le temps.</p>'}
      <p class="note">Prix ${esc(priceFile.source ?? 'Cardmarket')} (tendance, en euros) · mis à jour le ${updated}</p>
    </section>
    <h2 class="section-title">Plus fortes hausses sur 7 jours</h2>
    <div class="rows">${ups.map(([c]) => cardRow(c, 7)).join('') || '<p class="note" style="padding:12px">Pas encore assez d\'historique.</p>'}</div>
    <h2 class="section-title">Plus fortes baisses sur 7 jours</h2>
    <div class="rows">${downs.map(([c]) => cardRow(c, 7)).join('') || '<p class="note" style="padding:12px">Pas encore assez d\'historique.</p>'}</div>
    <h2 class="section-title">Cartes les plus chères</h2>
    <div class="rows">${top.map((c) => cardRow(c)).join('')}</div>
  </div>`;
  if (owned.length) mountRangedChart(document.getElementById('pfRanges'), document.getElementById('pfChart'), series, 'valueRange');
}

// ---------- Graphique de prix ----------
const RANGES = [[7, '7 J'], [30, '1 M'], [90, '3 M'], [365, '1 A'], [0, 'Tout']];
function mountRangedChart(rangesEl, chartEl, series, prefKey) {
  const draw = () => {
    const days = user.prefs[prefKey] ?? 90;
    rangesEl.innerHTML = RANGES.map(([d, l]) => `<button type="button" data-days="${d}" aria-pressed="${days === d}">${l}</button>`).join('');
    let pts = series;
    if (days && series.length) {
      const last = parseDay(series[series.length - 1][0]);
      const from = new Date(last - days * 864e5).toISOString().slice(0, 10);
      pts = series.filter(([d]) => d >= from);
      if (pts.length < 2) pts = series.slice(-2);
    }
    drawChart(chartEl, pts);
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
function drawChart(el, pts) {
  if (!pts || pts.length < 2) {
    el.innerHTML = '<div class="chart-empty">Pas encore assez d\'historique pour tracer une courbe. Le prix est relevé chaque jour.</div>';
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
  const xLabels = [0, Math.floor((pts.length - 1) / 2), pts.length - 1];
  const tickFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: y1 - y0 < 5 ? 2 : 0 });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe du prix du ${fmtDate.format(xs[0])} au ${fmtDate.format(t1)}, de ${eur(ys[0])} à ${eur(ys[ys.length - 1])}">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".32"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <g class="grid">${ticks.map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${Y(t)}" y2="${Y(t)}"/>`).join('')}</g>
    <g class="axis">${ticks.map((t) => `<text x="${padL - 8}" y="${Y(t) + 4}" text-anchor="end">${tickFmt.format(t)}</text>`).join('')}
      ${xLabels.map((i, k) => `<text x="${X(xs[i])}" y="${H - 6}" text-anchor="${k === 0 ? 'start' : k === 2 ? 'end' : 'middle'}">${fmtDay.format(xs[i])}</text>`).join('')}</g>
    <path d="${area}" fill="url(#${gid})"/>
    <path class="line" d="${line}"/>
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
    tip.innerHTML = `<b>${eur(ys[best])}</b>${fmtDate.format(xs[best])}`;
    const left = (cx / W) * r.width;
    const half = tip.offsetWidth / 2;
    tip.style.left = `${Math.min(r.width - half, Math.max(half, left))}px`;
    tip.style.top = `${Math.max(0, (cy / H) * r.height - 52)}px`;
  };
  const leave = () => { hover.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', leave);
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
  sheetPanel.innerHTML = `<div class="grab"></div>
    <div class="stack">
      <div class="detail-top" ${rarityStyle(c.rarity)}>
        <div class="card-img">${cardImg(c, true)}</div>
        <div class="detail-info">
          <h2 id="sheetTitle">${esc(c.name)}</h2>
          <div class="sub">${esc(s?.name ?? c.set)}<br><span class="num">${esc(c.set)} · n° ${esc(c.number)}/${setTotal(s ?? {})}</span></div>
          ${c.rarity ? `<span class="rarity" ${rarityStyle(c.rarity)}>${esc(c.rarity)}${c.type ? ` · ${esc(c.type)}` : ''}</span>` : ''}
          <div class="big-price num"><small>Tendance Cardmarket</small>${eur(p.trend)}</div>
          ${ch != null ? `<span class="delta num ${ch >= 0 ? 'up' : 'down'}">${pct(ch)} sur 30 jours</span>` : ''}
          <div class="detail-actions">
            <div class="stepper" role="group" aria-label="Exemplaires possédés">
              <button data-qty="-1" aria-label="Retirer un exemplaire">−</button>
              <output class="num" aria-live="polite">${q}</output>
              <button data-qty="1" aria-label="Ajouter un exemplaire">+</button>
            </div>
            <button class="mini-btn heart" style="width:42px;height:42px" data-wish="${esc(id)}" aria-pressed="${wish.has(id)}" aria-label="Liste de souhaits">${I.heart}</button>
          </div>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><small>À partir de</small><b class="num">${eur(p.low)}</b></div>
        <div class="stat"><small>Moy. 7 j</small><b class="num">${eur(p.avg7)}</b></div>
        <div class="stat"><small>Moy. 30 j</small><b class="num">${eur(p.avg30)}</b></div>
      </div>
      <section class="panel">
        <h3>Courbe de prix <small>${esc(priceFile.source ?? 'Cardmarket')} · ${priceFile.updatedAt ? fmtDate.format(parseDay(priceFile.updatedAt)) : ''}</small></h3>
        <div class="ranges" id="cardRanges"></div>
        <div class="chart" id="cardChart"></div>
        ${p.seeded ? '<p class="note">Les premiers points sont les moyennes 30 j, 7 j et 1 j de Cardmarket ; ensuite un relevé par jour.</p>' : ''}
      </section>
      <a class="cta" href="${esc(cm.url)}" target="_blank" rel="noopener">${cm.exact ? 'Voir sur Cardmarket' : 'Rechercher sur Cardmarket'} ${I.ext}</a>
      ${q > 0 && p.trend ? `<p class="note num" style="text-align:center">${q > 1 ? `Vos ${q} exemplaires valent` : 'Votre exemplaire vaut'} ${eur(q * p.trend)}</p>` : ''}
    </div>`;
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  mountRangedChart(document.getElementById('cardRanges'), document.getElementById('cardChart'), p.history ?? [], 'cardRange');
  sheetPanel.querySelector('.stepper button')?.focus({ preventScroll: true });
}
function closeCard() {
  sheet.hidden = true; openId = null;
  document.body.style.overflow = '';
  lastFocus?.focus?.({ preventScroll: true });
}

// ---------- Réglages : sauvegarde / restauration ----------
function openSettings() {
  openId = null;
  const owned = Object.keys(user.owned).length;
  sheetPanel.innerHTML = `<div class="grab"></div><div class="stack">
    <h2 id="sheetTitle" style="margin:0;font:700 22px var(--font-display)">Réglages</h2>
    <p class="note">Votre collection est enregistrée sur cet appareil (${owned} cartes possédées, ${wish.size} souhaits). Exportez-la pour la sauvegarder ou la transférer sur un autre téléphone.</p>
    <div class="menu">
      <button class="btn-ghost" data-action="export">Exporter ma collection (copier)</button>
      <label class="btn-ghost" for="importFile">Importer un fichier de sauvegarde</label>
      <input id="importFile" type="file" accept="application/json,.json" hidden>
      <textarea id="exportBox" class="search" rows="4" hidden readonly></textarea>
    </div>
    <p class="note">Données : ${catalog.cards.length} cartes, ${catalog.sets.length} séries · prix ${esc(priceFile.source ?? '')} du ${priceFile.updatedAt ? fmtDate.format(parseDay(priceFile.updatedAt)) : '—'}.</p>
    <button class="btn-ghost" data-action="close">Fermer</button>
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

// ---------- Actions ----------
function toggleOwn(id) {
  user.owned[id] = qty(id) > 0 ? 0 : 1;
  if (!user.owned[id]) delete user.owned[id];
  save(); refreshCard(id);
  toast(qty(id) ? 'Ajoutée à la collection' : 'Retirée de la collection');
}
function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  save(); refreshCard(id);
  for (const b of sheetPanel.querySelectorAll(`[data-wish="${CSS.escape(id)}"]`)) b.setAttribute('aria-pressed', wish.has(id));
  toast(wish.has(id) ? 'Ajoutée aux souhaits' : 'Retirée des souhaits');
}

document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-open],[data-own],[data-wish],[data-seg],[data-pref],[data-fav],[data-action],[data-qty],[data-colset],[data-close]');
  if (!t) return;
  const d = t.dataset;
  if (d.open) openCard(d.open);
  else if (d.own) toggleOwn(d.own);
  else if (d.wish) toggleWish(d.wish);
  else if (d.seg) { user.prefs[d.seg] = d.value; save(); currentRender(); }
  else if (d.pref) { user.prefs[d.pref] = d.value || null; if (d.pref === 'own' && !d.value) user.prefs.own = 'all'; save(); currentRender(); }
  else if (d.fav) { fav.has(d.fav) ? fav.delete(d.fav) : fav.add(d.fav); save(); currentRender(); toast(fav.has(d.fav) ? 'Série ajoutée aux favoris' : 'Série retirée des favoris'); }
  else if (d.colset !== undefined) { colSet = d.colset; currentRender(); }
  else if (d.qty && openId) {
    const id = openId;
    const n = Math.max(0, qty(id) + Number(d.qty));
    if (n) user.owned[id] = n; else delete user.owned[id];
    save(); refreshCard(id); openCard(id);
  } else if (d.close !== undefined) closeCard();
  else if (d.action === 'cycle-sort') {
    const i = SORTS.findIndex(([v]) => v === user.prefs.sort);
    user.prefs.sort = SORTS[(i + 1) % SORTS.length][0]; save(); currentRender();
    toast(`Tri : ${SORTS.find(([v]) => v === user.prefs.sort)[1]}`);
  } else if (d.action === 'filters') { showFilters = !showFilters; currentRender(); }
  else if (d.action === 'settings') openSettings();
  else if (d.action === 'close') closeCard();
  else if (d.action === 'export') {
    const data = JSON.stringify({ app: 'NightDex', version: 1, exportedAt: new Date().toISOString(), owned: user.owned, wish: [...wish], fav: [...fav] });
    const box = document.getElementById('exportBox');
    box.hidden = false; box.value = data;
    try { await navigator.clipboard.writeText(data); toast('Sauvegarde copiée'); } catch { box.select(); toast('Sélectionnez le texte pour le copier'); }
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
    save(); closeCard(); currentRender(); toast('Collection importée');
  } catch { toast('Fichier invalide : choisissez un export NightDex'); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'setSearch') {
    homeQuery = e.target.value;
    const pos = e.target.selectionStart;
    renderHome();
    const el = document.getElementById('setSearch'); el.focus(); el.setSelectionRange(pos, pos);
  } else if (e.target.id === 'cardSearch') {
    searchQuery = e.target.value;
    const pos = e.target.selectionStart;
    renderSearch();
    const el = document.getElementById('cardSearch'); el.focus(); el.setSelectionRange(pos, pos);
  }
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
try {
  await loadData();
  route();
} catch (err) {
  view.innerHTML = `<div class="empty"><strong>Impossible de charger les cartes</strong>Vérifiez que les fichiers data/catalog.json et data/prices.json existent, puis rechargez la page.</div>`;
  console.error(err);
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
