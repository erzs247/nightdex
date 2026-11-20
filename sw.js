// Cache hors ligne : l'interface et les images sont servies depuis le cache, les données sont rafraîchies dès que possible.
// Seules les réponses valides sont mises en cache : une erreur passagère (réseau coupé, mise à jour du site)
// n'est jamais mémorisée, la ressource est simplement redemandée la fois suivante.
const CACHE = 'nightdex-v51';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'data/config.json'];
const keep = (req, r) => { if (r && r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return r; };
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  // supprime les anciens caches (dont d'éventuelles réponses en erreur mémorisées par les versions précédentes)
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/data/')) {
    // données : réseau d'abord, cache si hors ligne
    e.respondWith(fetch(e.request).then((r) => keep(e.request, r)).catch(() => caches.match(e.request)));
  } else {
    // interface et images : cache d'abord (rapide, hors ligne), sinon réseau
    e.respondWith(caches.match(e.request).then((hit) => (hit && hit.ok ? hit : fetch(e.request).then((r) => keep(e.request, r)))));
  }
});

// ---------- Alertes prix en arrière-plan (synchronisation périodique, appli installée) ----------
// Les alertes sont copiées par l'appli dans IndexedDB (nightdex-sw / kv) : alerts {id: {t, n}}, seen, lang.
const swDb = () => new Promise((res, rej) => { const r = indexedDB.open('nightdex-sw', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const kv = async (key, val) => {
  const db = await swDb();
  return new Promise((res, rej) => { const t = db.transaction('kv', val === undefined ? 'readonly' : 'readwrite'); const st = t.objectStore('kv'); const q = val === undefined ? st.get(key) : st.put(val, key); t.oncomplete = () => res(q.result); t.onerror = () => rej(t.error); });
};
async function checkAlerts() {
  const alerts = (await kv('alerts').catch(() => null)) ?? {};
  if (!Object.keys(alerts).length) return;
  const r = await fetch('data/prices.json', { cache: 'no-store' });
  if (!r.ok) return;
  const pf = await r.json();
  const seen = (await kv('seen').catch(() => null)) ?? {};
  const fr = ((await kv('lang').catch(() => 'fr')) ?? 'fr') !== 'en';
  const eur = (v) => new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB', { style: 'currency', currency: 'EUR' }).format(v);
  let changed = false;
  for (const [id, a] of Object.entries(alerts)) {
    const p = pf.prices?.[id]?.trend;
    const mark = `${pf.updatedAt}|${a.t}`;
    if (p == null || p > a.t || seen[`n:${id}`] === mark) continue;
    seen[`n:${id}`] = mark; changed = true;
    await self.registration.showNotification(fr ? `${a.n} est à ${eur(p)}` : `${a.n} is at ${eur(p)}`, {
      body: fr ? `Ton alerte NightDex : sous ${eur(a.t)}. Touche pour voir tes souhaits.` : `Your NightDex alert: below ${eur(a.t)}. Tap to see your wishlist.`,
      tag: `alert-${id}`, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: './#wishlist' },
    });
  }
  if (changed) await kv('seen', seen);
}
self.addEventListener('periodicsync', (e) => { if (e.tag === 'nightdex-alerts') e.waitUntil(checkAlerts().catch(() => {})); });
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url ?? './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const w = list.find((c) => c.url.startsWith(self.registration.scope));
    if (w) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
