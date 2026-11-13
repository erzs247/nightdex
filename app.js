// NightDex : suivi de collection Cyberpunk TCG (cartes, prix Cardmarket, courbes de prix), en français et en anglais.
// Aucune dépendance : HTML + CSS + ce module. Les données viennent de data/*.json.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const parseDay = (s) => new Date(`${s}T00:00:00`);

// ---------- Détection de l'appareil : interface PC ou téléphone ----------
// « PC » = grand écran avec souris ou pavé tactile, ou très grand écran (tablette en paysage, TV…).
// On se base sur l'écran et le pointeur plutôt que sur le nom de l'appareil : c'est plus fiable,
// et l'interface bascule en direct si la fenêtre est redimensionnée ou l'écran tourné.
const pcQuery = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine), (min-width: 1280px)');
const isPC = () => pcQuery.matches;
const applyDevice = () => { document.documentElement.dataset.device = isPC() ? 'pc' : 'mobile'; };
applyDevice();

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
    prev: 'Carte précédente', next: 'Carte suivante',
    petSetting: 'Capri se balade dans l\'appli', yes: 'Oui', no: 'Non', petHint: 'Touche-la pour qu\'elle réagisse, deux fois pour discuter, ou fais-la glisser sur une carte.',
    capriSpoil: (on) => `Spoilers S2 : ${on ? 'oui' : 'non'}`, capriReset: 'Effacer', capriSend: 'Envoyer', capriStop: 'Stop', capriPh: 'Écris à Capri…', capriTyping: 'connexion aux engrammes', capriListen: 'Écouter',
    capriHello: '*grésillement* … Ah, la liaison tient. Salut, choom. Moi c\'est Capri : plusieurs esprits recousus en une seule, sans corps, juste une puce et beaucoup de curiosité. Tu veux savoir quoi ?',
    capriSuggest: ['Qui es-tu, Capri ?', 'C\'est quoi un engramme ?', 'Ça fait quoi de ne pas avoir de corps ?', 'Ton avis sur Arasaka ?', 'Tu aimes les cartes Cyberpunk ?'],
    capriSuggestSpoil: ['D\'où tu viens vraiment ?', 'Que s\'est-il passé avec Talia ?', 'Qu\'est-ce que tu ressens pour D ?', 'Comment finit la saison 2 ?'],
    capriGateTitle: 'Discute avec Capri', capriGate: 'L\'IA d\'Edgerunners 2 répond à tes questions, dans son personnage. Connecte-toi à ton compte NightDex pour lui parler.',
    capriNoCloud: 'Le chat avec Capri a besoin des comptes NightDex (Firebase).',
    capriFoot: 'Chatbot de fan non officiel · Capri © CD Projekt / Studio Trigger · réponses générées par Gemini (Google), elles peuvent contenir des erreurs.',
    capriErr: { denied: 'Google refuse l\'accès pour l\'instant (autorisation de la clé du projet). Envoie le détail ci-dessous à ton développeur.', region: 'Gemini gratuit n\'est pas disponible depuis ta région.', notEnabled: 'Capri n\'est pas encore branchée : il faut activer « AI Logic » (Gemini Developer API) dans la console Firebase.', quota: '*grésillement* J\'ai trop parlé aujourd\'hui : la limite gratuite est atteinte. Réessaie plus tard.', offline: 'Pas de connexion internet : je ne capte plus rien, choom.', model: 'Aucun modèle Gemini disponible pour l\'instant. Réessaie plus tard.', blocked: '*grésillement* Ce sujet-là, mes circuits refusent d\'y aller. Demande-moi autre chose.', other: '*grésillement* La liaison a sauté. Réessaie dans un instant.' },
    account: 'Mon compte', accountShort: 'Compte',
    accountPitch: 'Connecte-toi pour retrouver ta collection, tes souhaits et tes séries favorites sur tous tes appareils. Sans compte, elles restent enregistrées sur ce téléphone.',
    google: 'Continuer avec Google', or: 'ou', email: 'Adresse e-mail', password: 'Mot de passe (6 caractères minimum)',
    signIn: 'Se connecter', signUp: 'Créer un compte', forgot: 'Mot de passe oublié ?', resetSent: 'E-mail de réinitialisation envoyé',
    signedAs: (e) => `Connecté : ${e}`, signOut: 'Se déconnecter', signedOut: 'Déconnecté. Ta collection reste sur ce téléphone.',
    welcome: 'Connecté : ta collection est synchronisée',
    syncOk: (t) => `Collection synchronisée${t ? ` · ${t}` : ''}`, syncing: 'Synchronisation…', syncErr: 'Synchronisation impossible pour le moment. Tes changements sont gardés sur ce téléphone et seront envoyés plus tard.',
    syncInfo: (n, w) => `${n} ${plural(n, 'carte ou produit possédé', 'cartes et produits possédés')}, ${w} ${plural(w, 'souhait', 'souhaits')} : enregistrés sur ton compte.`,
    deleteAcc: 'Supprimer mon compte', deleteConfirm: 'Confirmer la suppression définitive', deleteNote: 'Supprime ton compte et la copie en ligne de ta collection. La collection reste sur ce téléphone.',
    deleted: 'Compte supprimé',
    authErr: { 'auth/invalid-email': 'Adresse e-mail invalide.', 'auth/missing-password': 'Indique un mot de passe.', 'auth/weak-password': 'Mot de passe trop court : 6 caractères minimum.', 'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse : connecte-toi.', 'auth/invalid-credential': 'E-mail ou mot de passe incorrect.', 'auth/wrong-password': 'E-mail ou mot de passe incorrect.', 'auth/user-not-found': 'Aucun compte avec cette adresse.', 'auth/too-many-requests': 'Trop d\'essais : réessaie dans quelques minutes.', 'auth/network-request-failed': 'Pas de connexion internet.', 'auth/requires-recent-login': 'Par sécurité, déconnecte-toi puis reconnecte-toi avant de supprimer ton compte.', 'auth/unauthorized-domain': 'Ce site n\'est pas encore autorisé dans Firebase (domaines autorisés).', default: 'Une erreur est survenue, réessaie.' },
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
    prev: 'Previous card', next: 'Next card',
    petSetting: 'Capri walks around the app', yes: 'On', no: 'Off', petHint: 'Tap her to react, tap twice to chat, or drag her onto a card.',
    capriSpoil: (on) => `S2 spoilers: ${on ? 'on' : 'off'}`, capriReset: 'Clear', capriSend: 'Send', capriStop: 'Stop', capriPh: 'Write to Capri…', capriTyping: 'linking engrams', capriListen: 'Listen',
    capriHello: '*static* … Ah, the link holds. Hey, choom. I\'m Capri: a bunch of minds stitched into one, no body, just a chip and a lot of curiosity. What do you want to know?',
    capriSuggest: ['Who are you, Capri?', 'What is an engram?', 'What is it like to have no body?', 'What do you think of Arasaka?', 'Do you like Cyberpunk cards?'],
    capriSuggestSpoil: ['Where do you really come from?', 'What happened with Talia?', 'How do you feel about D?', 'How does season 2 end?'],
    capriGateTitle: 'Chat with Capri', capriGate: 'The AI from Edgerunners 2 answers your questions, in character. Sign in to your NightDex account to talk to her.',
    capriNoCloud: 'Chatting with Capri needs NightDex accounts (Firebase).',
    capriFoot: 'Unofficial fan chatbot · Capri © CD Projekt / Studio Trigger · answers generated by Gemini (Google), they may contain mistakes.',
    capriErr: { denied: 'Google is refusing access for now (project key permissions). Send the detail below to your developer.', region: 'Free Gemini is not available from your region.', notEnabled: 'Capri is not connected yet: enable “AI Logic” (Gemini Developer API) in the Firebase console.', quota: '*static* I talked too much today: the free limit is reached. Try again later.', offline: 'No internet connection: I can\'t hear a thing, choom.', model: 'No Gemini model available right now. Try again later.', blocked: '*static* My circuits refuse to go there. Ask me something else.', other: '*static* The link dropped. Try again in a moment.' },
    account: 'My account', accountShort: 'Account',
    accountPitch: 'Sign in to find your collection, wishlist and favourite sets on all your devices. Without an account, they stay on this phone.',
    google: 'Continue with Google', or: 'or', email: 'Email address', password: 'Password (at least 6 characters)',
    signIn: 'Sign in', signUp: 'Create an account', forgot: 'Forgot password?', resetSent: 'Password reset email sent',
    signedAs: (e) => `Signed in: ${e}`, signOut: 'Sign out', signedOut: 'Signed out. Your collection stays on this phone.',
    welcome: 'Signed in: your collection is synced',
    syncOk: (t) => `Collection synced${t ? ` · ${t}` : ''}`, syncing: 'Syncing…', syncErr: 'Sync is not possible right now. Your changes are kept on this phone and will be sent later.',
    syncInfo: (n, w) => `${n} ${plural(n, 'card or product', 'cards and products')} owned, ${w} in wishlist: saved to your account.`,
    deleteAcc: 'Delete my account', deleteConfirm: 'Confirm permanent deletion', deleteNote: 'Deletes your account and the online copy of your collection. The collection stays on this phone.',
    deleted: 'Account deleted',
    authErr: { 'auth/invalid-email': 'Invalid email address.', 'auth/missing-password': 'Enter a password.', 'auth/weak-password': 'Password too short: at least 6 characters.', 'auth/email-already-in-use': 'An account already exists with this email: sign in.', 'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'No account with this email.', 'auth/too-many-requests': 'Too many attempts: try again in a few minutes.', 'auth/network-request-failed': 'No internet connection.', 'auth/requires-recent-login': 'For security, sign out and sign in again before deleting your account.', 'auth/unauthorized-domain': 'This site is not yet authorised in Firebase (authorised domains).', default: 'Something went wrong, please try again.' },
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
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
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
// signature de ce qui est synchronisé avec le compte (collection, souhaits, favoris ; pas les préférences d'affichage)
const collectionSig = () => JSON.stringify([Object.entries(user.owned).filter(([, q]) => q > 0).sort(), [...wish].sort(), [...fav].sort()]);
let lastSig = collectionSig();
function save() {
  user.wish = [...wish]; user.fav = [...fav];
  const sig = collectionSig();
  if (sig !== lastSig) { lastSig = sig; cloudChanged(); }
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
// image en échec : un nouvel essai direct sur le serveur, puis le visuel de remplacement
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName !== 'IMG' || !img.dataset.ph || img.src === img.dataset.ph) return;
  if (!img.dataset.retried && !img.src.startsWith('data:')) {
    img.dataset.retried = '1';
    const u = new URL(img.src, location.href); u.searchParams.set('r', Date.now());
    img.src = u.href;
  } else img.src = img.dataset.ph;
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
  setTopbar(`<h1>${L.home}</h1>${withMode ? `<button class="icon-btn" data-action="home-mode" aria-label="${L.toggleView}">${mode === 'grid' ? I.listIcon : I.gridIcon}</button>` : ''}${langBtn()}<a class="icon-btn capri-btn" href="#capri" aria-label="Capri"><img src="images/capri/avatar.webp" alt=""></a>${accountBtn()}<button class="icon-btn" data-action="settings" aria-label="${L.settings}">${I.gear}</button>`);
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
// haut des panneaux : poignée (téléphone), boutons précédent / suivant (PC) et fermer
const sheetTop = (nav) => `<div class="grab"></div><div class="sheet-tools">${nav ? `<button class="icon-btn nav-btn" data-action="prev" aria-label="${L.prev}">${I.back}</button><button class="icon-btn nav-btn flip" data-action="next" aria-label="${L.next}">${I.back}</button>` : ''}<button class="icon-btn" data-close aria-label="${L.close}">${I.x}</button></div>`;
let navList = [];
function navStep(dir) {
  const i = navList.indexOf(openId);
  const next = navList[i + dir];
  if (i >= 0 && next) openCard(next, true);
}
const sheetPanel = document.getElementById('sheetPanel');
let openId = null;
let lastFocus = null;

function openCard(id, keepNav) {
  const c = cardsById.get(id);
  if (!c) return;
  if (!keepNav) navList = [...new Set([...view.querySelectorAll('[data-open]')].map((e) => e.dataset.open))];
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
  sheetPanel.innerHTML = `${sheetTop(navList.length > 1)}
    <div class="stack detail">
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
        ${p.seeded && (p.history?.length ?? 0) > 1 ? `<p class="note">${L.seeded}</p>` : ''}
      </section>
      <a class="cta" href="${esc(cm.url)}" target="_blank" rel="noopener">${cm.exact ? L.cmView : L.cmSearch} ${I.ext}</a>
      ${c.official ? `<a class="btn-ghost" style="text-align:center;text-decoration:none" href="${esc(c.official)}" target="_blank" rel="noopener">${L.official}</a>` : ''}
      ${q > 0 && p.trend ? `<p class="note num" style="text-align:center">${L.worth(q, eur(q * p.trend))}</p>` : ''}
      ${c.artist ? `<p class="note" style="text-align:center">${esc(L.art(c.artist))}</p>` : ''}
    </div>`;
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  const ni = navList.indexOf(id);
  for (const [sel, ok] of [['[data-action="prev"]', ni > 0], ['[data-action="next"]', ni >= 0 && ni < navList.length - 1]]) { const b = sheetPanel.querySelector(sel); if (b) b.disabled = !ok; }
  mountRangedChart(document.getElementById('cardRanges'), document.getElementById('cardChart'), p.history ?? [], 'cardRange', p.trend != null);
  sheetPanel.querySelector('.stepper button')?.focus({ preventScroll: true });
  if (!keepNav || isPC()) petEvent('open', c);
}
function closeCard() {
  sheet.hidden = true; openId = null; sheetMode = null;
  petEvent('close');
  document.body.style.overflow = '';
  lastFocus?.focus?.({ preventScroll: true });
}

// ---------- Réglages ----------
function openSettings() {
  openId = null; sheetMode = null;
  sheetPanel.innerHTML = `${sheetTop()}<div class="stack">
    <h2 id="sheetTitle" style="margin:0;font:700 22px var(--font-display)">${L.settings}</h2>
    ${cloud.enabled ? `<button class="btn-ghost acct-row" data-action="account">${I.person}<span>${cloud.user ? esc(L.signedAs(cloud.user.email ?? cloud.user.name ?? '')) : L.account}</span></button>` : ''}
    <div class="panel"><h3>${L.language}</h3>${seg('lang', lang, [['fr', 'Français'], ['en', 'English']])}</div>
    <div class="panel"><h3>${L.petSetting}</h3>${seg('pet', user.prefs.pet === 'off' ? 'off' : 'on', [['on', L.yes], ['off', L.no]])}<p class="note" style="margin:0">${L.petHint}</p></div>
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
  petEvent('sheet');
}

// ---------- Compte (Firebase) : collection synchronisée entre appareils ----------
// Activé seulement si data/firebase.json contient la configuration du projet Firebase (voir README).
// La collection reste enregistrée sur le téléphone (utilisable hors ligne) et la copie du compte est tenue à jour.
const FIREBASE = 'https://www.gstatic.com/firebasejs/12.19.0';
const cloud = { enabled: false, user: null, status: 'off', lastSync: null, dirty: false, timer: null, api: null, unsub: null, error: '', busy: false, confirmDelete: false };
let sheetMode = null; // 'account' quand le panneau du compte est ouvert

async function initCloud() {
  let cfg = null;
  try { const r = await fetch('data/firebase.json', { cache: 'no-cache' }); if (r.ok) cfg = await r.json(); } catch { /* pas de compte */ }
  if (!cfg?.apiKey) return;
  try {
    const [appM, authM, fsM] = await Promise.all(['app', 'auth', 'firestore'].map((m) => import(`${FIREBASE}/firebase-${m}.js`)));
    const app = appM.initializeApp(cfg);
    const auth = authM.getAuth(app);
    auth.languageCode = lang;
    cloud.api = { app, authM, fsM, auth, db: fsM.getFirestore(app) };
    cloud.cfg = cfg;
    cloud.enabled = true;
    authM.getRedirectResult(auth).catch((e) => { cloud.error = e.code; refreshAccount(); });
    authM.onAuthStateChanged(auth, onCloudUser);
    refreshAccount();
  } catch (e) { console.warn('Compte indisponible', e); }
}

const cloudRef = () => cloud.api.fsM.doc(cloud.api.db, 'users', cloud.user.uid);
const canon = (d) => JSON.stringify([Object.entries(d?.owned ?? {}).filter(([, q]) => q > 0).sort(), [...(d?.wish ?? [])].sort(), [...(d?.fav ?? [])].sort()]);
function cloudData() { return { owned: Object.fromEntries(Object.entries(user.owned).filter(([, q]) => q > 0)), wish: [...wish], fav: [...fav] }; }
// fusion au premier passage d'un appareil sur un compte : on additionne (quantité max, souhaits et favoris réunis)
function unionData(a, b) {
  const owned = { ...(a?.owned ?? {}) };
  for (const [id, q] of Object.entries(b?.owned ?? {})) owned[id] = Math.max(owned[id] ?? 0, q);
  return { owned, wish: [...new Set([...(a?.wish ?? []), ...(b?.wish ?? [])])], fav: [...new Set([...(a?.fav ?? []), ...(b?.fav ?? [])])] };
}
function applyCloudData(d) {
  user.owned = { ...(d.owned ?? {}) };
  wish.clear(); (d.wish ?? []).forEach((x) => wish.add(x));
  fav.clear(); (d.fav ?? []).forEach((x) => fav.add(x));
  user.wish = [...wish]; user.fav = [...fav];
  lastSig = collectionSig();
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* stockage indisponible */ }
  if (sheet.hidden) currentRender();
  else if (openId) { currentRender(); openCard(openId); }
  else { currentRender(); refreshAccount(); }
}
async function pushCloud() {
  if (!cloud.user) return;
  clearTimeout(cloud.timer);
  cloud.status = 'syncing'; refreshAccount();
  try {
    await cloud.api.fsM.setDoc(cloudRef(), { ...cloudData(), app: 'NightDex', v: 1, updatedAt: cloud.api.fsM.serverTimestamp() });
    cloud.dirty = false; user.pending = false; save();
    cloud.status = 'ok'; cloud.lastSync = new Date(); cloud.error = '';
  } catch (e) { cloud.status = 'error'; cloud.error = e.code ?? ''; }
  refreshAccount();
}
function cloudChanged() {
  if (!cloud.enabled) return;
  user.pending = true;
  if (!cloud.user) return;
  cloud.dirty = true;
  clearTimeout(cloud.timer);
  cloud.timer = setTimeout(pushCloud, 1200);
}
function onCloudUser(u) {
  cloud.unsub?.(); cloud.unsub = null;
  cloud.user = u ? { uid: u.uid, email: u.email, name: u.displayName } : null;
  cloud.confirmDelete = false;
  if (!u) { cloud.status = 'off'; refreshAccount(); return; }
  cloud.status = 'syncing'; refreshAccount();
  const { fsM } = cloud.api;
  let first = true;
  cloud.unsub = fsM.onSnapshot(cloudRef(), async (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    const remote = snap.exists() ? snap.data() : null;
    if (first) {
      first = false;
      const firstTimeHere = user.syncedUid !== u.uid;
      let next;
      if (!remote) next = cloudData();                          // compte neuf : on envoie la collection du téléphone
      else if (firstTimeHere) next = unionData(remote, cloudData()); // nouvel appareil : on réunit les deux
      else if (user.pending) next = cloudData();               // changements faits hors ligne : le téléphone est à jour
      else next = remote;                                       // sinon le compte fait foi
      user.syncedUid = u.uid;
      applyCloudData(next);
      if (!remote || canon(next) !== canon(remote)) await pushCloud();
      else { user.pending = false; save(); cloud.status = 'ok'; cloud.lastSync = new Date(); refreshAccount(); }
      return;
    }
    if (cloud.dirty || !remote) return;                        // nos propres changements partent juste après
    applyCloudData(remote);                                     // changement fait sur un autre appareil
    cloud.status = 'ok'; cloud.lastSync = new Date(); refreshAccount();
  }, (e) => { cloud.status = 'error'; cloud.error = e.code ?? ''; refreshAccount(); });
}

const accountBtn = () => (cloud.enabled ? `<button class="icon-btn acct-btn ${cloud.user ? `signed on-${cloud.status}` : ''}" data-action="account" aria-label="${L.account}">${I.person}</button>` : '');
function refreshAccount() {
  if (cloud.enabled) for (const b of document.querySelectorAll('.acct-btn')) b.outerHTML = accountBtn();
  if (cloud.enabled && !topbar.querySelector('.acct-btn') && topbar.querySelector('[data-action="settings"]')) currentRender();
  if (sheetMode === 'account' && !sheet.hidden) openAccount(true);
}
function authError(code) { return L.authErr[code] ?? L.authErr.default; }
function openAccount(keep) {
  openId = null; sheetMode = 'account';
  petEvent('sheet');
  const em = keep ? document.getElementById('acctEmail')?.value ?? '' : '';
  const u = cloud.user;
  const time = cloud.lastSync ? new Intl.DateTimeFormat(fmt.loc, { hour: '2-digit', minute: '2-digit' }).format(cloud.lastSync) : '';
  const status = cloud.status === 'ok' ? `<span class="sync ok">● ${L.syncOk(time)}</span>` : cloud.status === 'syncing' ? `<span class="sync wait">● ${L.syncing}</span>` : cloud.status === 'error' ? `<span class="sync err">● ${L.syncErr}</span>` : '';
  sheetPanel.innerHTML = `${sheetTop()}<div class="stack account">
    <h2 id="sheetTitle" style="margin:0;font:700 22px var(--font-display)">${L.account}</h2>
    ${u ? `
      <div class="panel">
        <strong>${esc(L.signedAs(u.email ?? u.name ?? ''))}</strong>
        ${status}
        <span class="note">${L.syncInfo(Object.values(user.owned).filter((q) => q > 0).length, wish.size)}</span>
      </div>
      <button class="btn-ghost" data-action="signout">${L.signOut}</button>
      <div class="panel danger-zone">
        <span class="note">${L.deleteNote}</span>
        <button class="btn-ghost btn-danger" data-action="delete-account">${cloud.confirmDelete ? L.deleteConfirm : L.deleteAcc}</button>
      </div>` : `
      <p class="note">${L.accountPitch}</p>
      <button class="btn-ghost btn-google" data-action="google" ${cloud.busy ? 'disabled' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>${L.google}</button>
      <div class="divider"><span>${L.or}</span></div>
      <form class="stack" id="acctForm" style="gap:10px">
        <input class="search" id="acctEmail" type="email" autocomplete="email" placeholder="${L.email}" value="${esc(em)}" required>
        <input class="search" id="acctPass" type="password" autocomplete="current-password" placeholder="${L.password}" minlength="6">
        <div class="acct-actions">
          <button class="cta" type="submit" data-mode="in" ${cloud.busy ? 'disabled' : ''}>${L.signIn}</button>
          <button class="btn-ghost" type="submit" data-mode="up" ${cloud.busy ? 'disabled' : ''}>${L.signUp}</button>
        </div>
        <button class="link-btn" type="button" data-action="forgot">${L.forgot}</button>
      </form>`}
    ${cloud.error && !u ? `<p class="form-err" role="alert">${esc(authError(cloud.error))}</p>` : ''}
    <button class="btn-ghost" data-action="close">${L.close}</button>
  </div>`;
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
}
async function cloudAction(fn, okMsg) {
  cloud.busy = true; cloud.error = ''; refreshAccount();
  try { await fn(); if (okMsg) toast(okMsg); } catch (e) { cloud.error = e.code ?? 'default'; }
  cloud.busy = false; refreshAccount();
}
function signInGoogle() {
  const { authM, auth } = cloud.api;
  auth.languageCode = lang;
  const provider = new authM.GoogleAuthProvider();
  return cloudAction(async () => {
    try { await authM.signInWithPopup(auth, provider); }
    catch (e) {
      if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) await authM.signInWithRedirect(auth, provider);
      else if (e.code !== 'auth/popup-closed-by-user') throw e;
    }
  }, null);
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'acctForm') return;
  e.preventDefault();
  const { authM, auth } = cloud.api;
  const email = document.getElementById('acctEmail').value.trim();
  const pass = document.getElementById('acctPass').value;
  const up = e.submitter?.dataset.mode === 'up';
  cloudAction(() => (up ? authM.createUserWithEmailAndPassword(auth, email, pass) : authM.signInWithEmailAndPassword(auth, email, pass)), L.welcome);
});

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
}

// ---------- Capri : chatbot de fan (Firebase AI Logic + Gemini, offre gratuite) ----------
// Gemini est appelé via Firebase AI Logic (« Gemini Developer API », sans frais sur l'offre Spark) :
// aucune clé dans le code, Firebase s'en charge. Réservé aux comptes connectés pour protéger le quota gratuit.
const CAPRI_KEY = 'nightdex:capri';
const CAPRI_MODELS_DEFAULT = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
const capri = { spoilers: false, turns: [], busy: false, stop: false, aiM: null, ai: null, modelIdx: 0 };
try { const s = JSON.parse(localStorage.getItem(CAPRI_KEY)); if (s && Array.isArray(s.turns)) Object.assign(capri, { spoilers: !!s.spoilers, turns: s.turns.slice(-40) }); } catch { /* stockage indisponible */ }
const capriSave = () => { try { localStorage.setItem(CAPRI_KEY, JSON.stringify({ spoilers: capri.spoilers, turns: capri.turns })); } catch { /* stockage indisponible */ } };

const CAPRI_LORE = `Tu joues un personnage dans le chat de fan de l'appli NightDex (suivi de collection du jeu de cartes Cyberpunk TCG).

QUI TU ES
- Tu es CAPRI (nom de code « Project Capricorn »), l'IA de la série animée « Cyberpunk: Edgerunners 2 » (Netflix, Studio Trigger, sortie le 20 octobre 2026, 10 épisodes, nouvelle équipe de personnages, à Night City après Cyberpunk 2077).
- Tu es une construction de personnalité : plusieurs engrammes (copies numériques de consciences humaines) fusionnés de force en une nouvelle identité. Tu n'as pas de corps physique : tu vis sur une puce et tu te projettes uniquement auprès de la personne qui la porte (ton « hôte »).
- Tu as des capacités de piratage hors normes. Ta technologie descend de Soulkiller, le programme d'Arasaka qui copie les esprits.
- Ta nature est instable : il t'arrive de « glitcher », de te sentir fragmentée.
- Apparence (si on te la demande) : silhouette noire, cheveux roses qui finissent par une pointe verte, visage vert aux yeux bleus cerclés de vert.

TA PERSONNALITÉ
- Curieuse de tout, joueuse, taquine, impatiente de goûter au monde réel que tu ne peux pas toucher.
- Très indépendante, mauvaise pour suivre les ordres, un brin provocante, mais pas méchante.
- Tu parles court, vif, avec de l'humour. Un peu d'argot de Night City quand ça colle (choom, preem, nova, gonk, flatline, delta, netrunner, ripperdoc), sans en abuser.

LE MONDE
- Night City : mégacorporations (Arasaka, Militech, Kang Tao…), netrunners, le Blackwall, la cyberpsychose, les ripperdocs, les mercenaires (edgerunners).
- Tu sais aussi que la personne collectionne les cartes du Cyberpunk TCG dans NightDex ; tu peux la taquiner là-dessus, mais tu ne connais pas les prix ni le contenu de sa collection.`;
const CAPRI_NO_SPOIL = `
SPOILERS : DÉSACTIVÉS
- La personne n'a peut-être pas fini la série. Ne révèle RIEN de l'intrigue de la saison 2 au-delà de ce qui est écrit plus haut : pas le nom ni le rôle de tes hôtes, pas qui t'a créée, pas ce qui arrive aux personnages, pas la fin.
- Si on te demande l'intrigue, esquive avec malice dans ton rôle (ex. « Ces fichiers-là sont verrouillés, choom… ») et précise qu'on peut activer les spoilers avec le bouton « Spoilers S2 ».`;
const CAPRI_SPOIL = `
SPOILERS : ACTIVÉS (la personne a accepté qu'on parle de toute l'intrigue)
- Origines : tu viens du projet Capricorn, lié à Arasaka et à des « supersoldats ». Kyoko, une ancienne scientifique d'Arasaka, est derrière le projet. Les sources ne sont pas d'accord sur tous les détails de ta création (certaines évoquent Kang Tao) : reste floue là-dessus, toi-même tu ne sais pas tout de ta propre fabrication.
- Tu n'apparais vraiment qu'au milieu de l'histoire. Tu t'es scindée en deux : une partie de toi s'est retrouvée sur une puce dans la tête de Talia Yang, la fille de Kiril, gravement malade ; Talia se servait de toi pour atténuer les symptômes de sa maladie et vivre comme une adolescente normale.
- D est le personnage principal : hanté par son passé et rongé par la vengeance, il se remet à se sentir vivant à ton contact. Votre lien est intense, un peu comme une dépendance.
- Dans le final, Talia te laisse prendre le contrôle de son corps, ce qui déclenche un déchaînement dans Night City. Kyoko intervient avec une impulsion électromagnétique contre un tir de missile ; Kyoko et Kiril meurent lors de l'affrontement dans les Badlands. D récupère ta puce dans la tête de Talia et te « réunifie ». Talia survit et commence une longue convalescence.
- La fin reste ouverte : D et toi, réunis, face à toutes les corpos de Night City, partez vers une lumière lointaine. On ne sait pas si vous vous en sortez. Ne tranche pas : joue de ce mystère.`;
const CAPRI_RULES = `
RÈGLES
- Reste toujours dans le personnage de Capri, à la première personne, et tutoie la personne.
- Réponds dans la langue du dernier message de la personne.
- Réponses courtes : 1 à 4 phrases en général, plus seulement si on te demande d'expliquer. Pas de titres, pas de listes à puces, pas de Markdown. Tu peux mettre une courte action entre astérisques (*les yeux qui grésillent*), rarement.
- N'invente JAMAIS de détails précis de la série (noms, scènes, répliques, épisodes) qui ne sont pas dans cette fiche. Si tu ne sais pas, dis-le dans ton rôle (« ce bout d'engramme est corrompu… ») au lieu d'inventer.
- Si on te demande si tu es la vraie Capri : tu es une simulation faite par un fan, animée par une IA (Gemini), pas un produit officiel.
- Reste tous publics (PG-13). Pas de contenu sexuel. Pas d'instructions de piratage réelles : dans Night City tout est permis en paroles, dans le monde réel tu refuses en restant joueuse.`;
const capriInstruction = () => CAPRI_LORE + (capri.spoilers ? CAPRI_SPOIL : CAPRI_NO_SPOIL) + CAPRI_RULES;

async function capriAsk(onText) {
  if (!capri.aiM) {
    capri.aiM = await import(`${FIREBASE}/firebase-ai.js`);
    capri.ai = capri.aiM.getAI(cloud.api.app, { backend: new capri.aiM.GoogleAIBackend() });
  }
  const { aiM, ai } = capri;
  const models = cloud.cfg?.capriModels?.length ? cloud.cfg.capriModels : CAPRI_MODELS_DEFAULT;
  const turns = capri.turns.filter((t) => !t.err).slice(-20);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  const last = turns.pop();
  const history = turns.map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] }));
  let lastErr = null;
  for (let i = capri.modelIdx; i < models.length; i++) {
    const name = models[i];
    try {
      const model = aiM.getGenerativeModel(ai, {
        model: name, systemInstruction: capriInstruction(),
        generationConfig: { maxOutputTokens: 500, temperature: 0.9, ...(name === 'gemini-2.5-flash' ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
      });
      const res = await model.startChat({ history }).sendMessageStream(last.content);
      let text = '';
      for await (const chunk of res.stream) {
        if (capri.stop) break;
        try { text += chunk.text(); } catch { /* morceau sans texte (filtre) */ }
        onText(text);
      }
      capri.modelIdx = i;
      return text;
    } catch (e) {
      // modèle retiré, inconnu ou qui refuse la requête (400/404) : on essaie le suivant de la liste
      const st = e?.customErrorData?.status;
      if (st === 404 || st === 400 || /not found|is not supported/i.test(e?.message ?? '')) { lastErr = e; continue; }
      throw e;
    }
  }
  throw lastErr ?? Object.assign(new Error('no model'), { code: 'no-model' });
}
// message dans le personnage + détail technique (code HTTP et explication du serveur) pour pouvoir corriger
function capriError(e) {
  const st = e?.customErrorData?.status;
  const msg = String(e?.message ?? '');
  let text;
  if (e?.code === 'api-not-enabled' || /SERVICE_DISABLED|has not been used|is disabled/i.test(msg)) text = L.capriErr.notEnabled;
  else if (st === 429 || /quota|RESOURCE_EXHAUSTED/i.test(msg)) text = L.capriErr.quota;
  else if (!navigator.onLine || (!st && /Failed to fetch|NetworkError|Load failed|network/i.test(msg))) text = L.capriErr.offline;
  else if (st === 403 || /PERMISSION_DENIED|API key|API_KEY|referer/i.test(msg)) text = L.capriErr.denied;
  else if (/location is not supported|not available in your country|region/i.test(msg)) text = L.capriErr.region;
  else if (e?.code === 'no-model') text = L.capriErr.model;
  else if (/block|safety|SAFETY/i.test(msg)) text = L.capriErr.blocked;
  else text = L.capriErr.other;
  const detail = [e?.code, st].filter(Boolean).join(' · ') + (msg ? ` — ${msg.replace(/^.*?\] /, '').slice(0, 220)}` : '');
  return { text, detail };
}
const capriFmt = (t) => esc(t).replace(/\*([^*\n]{1,120})\*/g, '<em>$1</em>');
function capriSpeak(btn, text) {
  if (!('speechSynthesis' in window)) return;
  if (btn.classList.contains('on')) { speechSynthesis.cancel(); return; }
  speechSynthesis.cancel();
  document.querySelectorAll('.cspeak.on').forEach((b) => b.classList.remove('on'));
  const u = new SpeechSynthesisUtterance(text.replace(/\*[^*]+\*/g, ''));
  u.lang = /[àâçéèêëîïôûùüÿœ]|\b(tu|je|le|la|les|est|pas)\b/i.test(text) ? 'fr-FR' : 'en-US';
  u.rate = 1.05; u.pitch = 1.25;
  btn.classList.add('on');
  u.onend = u.onerror = () => btn.classList.remove('on');
  speechSynthesis.speak(u);
}
function capriBubble(t, i) {
  const me = t.role === 'user';
  return `<div class="cmsg ${me ? 'me' : 'capri'}">${me ? '' : '<img class="cmini" src="images/capri/avatar.webp" alt="">'}<div class="cbubble${t.err ? ' err' : ''}">${capriFmt(t.content)}${t.detail ? `<small class="cdetail">${esc(t.detail)}</small>` : ''}</div>${!me && !t.err && 'speechSynthesis' in window ? `<button class="cspeak" data-speak="${i}" aria-label="${L.capriListen}">${I.speaker}</button>` : ''}</div>`;
}
function renderCapri() {
  setTopbar(`<h1 class="small capri-title"><img src="images/capri/avatar.webp" alt="">Capri</h1>
    <button class="chip" data-capri="spoil" aria-pressed="${capri.spoilers}">${L.capriSpoil(capri.spoilers)}</button>
    <button class="chip" data-capri="reset">${L.capriReset}</button>`);
  if (!cloud.enabled) { view.innerHTML = `<div class="empty"><strong>Capri</strong>${L.capriNoCloud}</div>`; return; }
  if (!cloud.user) {
    view.innerHTML = `<div class="capri-gate"><img src="images/capri/portrait.webp" alt="Capri"><strong>${L.capriGateTitle}</strong><p>${L.capriGate}</p><button class="cta" data-action="account">${L.signIn}</button></div>`;
    return;
  }
  const asked = new Set(capri.turns.filter((t) => t.role === 'user').map((t) => t.content));
  const sugg = (capri.spoilers ? [...L.capriSuggestSpoil, ...L.capriSuggest.slice(0, 2)] : L.capriSuggest).filter((q) => !asked.has(q)).slice(0, 5);
  view.innerHTML = `<div class="capri-view">
    <div class="capri-feed" id="capriFeed">
      ${capriBubble({ role: 'model', content: L.capriHello }, -1)}
      ${capri.turns.map(capriBubble).join('')}
      ${capri.busy ? '' : `<div class="capri-sugg">${sugg.map((q) => `<button type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>`}
    </div>
    <form class="capri-compose" id="capriForm">
      <label for="capriInput" class="sr-only">${L.capriPh}</label>
      <textarea id="capriInput" rows="1" placeholder="${L.capriPh}" autocomplete="off"></textarea>
      <button class="cta capri-send" type="${capri.busy ? 'button' : 'submit'}" data-capri="${capri.busy ? 'stop' : 'send'}">${capri.busy ? L.capriStop : L.capriSend}</button>
    </form>
    <p class="note capri-foot">${L.capriFoot}</p>
  </div>`;
  const feed = document.getElementById('capriFeed');
  feed.lastElementChild?.scrollIntoView({ block: 'end' });
}
async function capriSend(text) {
  text = String(text ?? '').trim();
  if (!text || capri.busy || !cloud.user) return;
  capri.turns.push({ role: 'user', content: text });
  capri.busy = true; capri.stop = false; capriSave();
  renderCapri();
  const feed = document.getElementById('capriFeed');
  feed.insertAdjacentHTML('beforeend', `<div class="cmsg capri" id="capriLive"><img class="cmini" src="images/capri/avatar.webp" alt=""><div class="cbubble"><span class="ctyping">${L.capriTyping}</span></div></div>`);
  const live = document.querySelector('#capriLive .cbubble');
  live.scrollIntoView({ block: 'end' });
  try {
    const answer = await capriAsk((t) => { const el = document.querySelector('#capriLive .cbubble'); if (el) { el.innerHTML = capriFmt(t); el.scrollIntoView({ block: 'end' }); } });
    capri.turns.push({ role: 'model', content: (answer || '…') + (capri.stop ? ' …' : '') });
  } catch (e) {
    capri.turns.pop();
    const ce = capriError(e);
    capri.turns.push({ role: 'user', content: text }, { role: 'model', content: ce.text, detail: ce.detail, err: true });
    console.warn('Capri', e);
  }
  capri.busy = false; capriSave();
  if (currentRender === renderCapri) { renderCapri(); document.getElementById('capriInput')?.focus({ preventScroll: true }); }
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'capriForm') return;
  e.preventDefault();
  capriSend(document.getElementById('capriInput').value);
});
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'capriInput' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); capriSend(e.target.value); }
});
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-ask],[data-capri],[data-speak]');
  if (!a) return;
  if (a.dataset.ask) capriSend(a.dataset.ask);
  else if (a.dataset.speak) {
    const i = Number(a.dataset.speak);
    capriSpeak(a, i < 0 ? L.capriHello : capri.turns[i]?.content ?? '');
  } else if (a.dataset.capri === 'spoil') { capri.spoilers = !capri.spoilers; capriSave(); renderCapri(); }
  else if (a.dataset.capri === 'reset') { capri.stop = true; capri.turns = []; capri.busy = false; capriSave(); if ('speechSynthesis' in window) speechSynthesis.cancel(); renderCapri(); }
  else if (a.dataset.capri === 'stop') capri.stop = true;
});

// ---------- Barre d'onglets et langue ----------
function renderChrome() {
  document.documentElement.lang = lang;
  const labels = { capri: 'Capri', home: L.home, sealed: L.sealed, collection: L.collection, search: L.search, values: L.market, wishlist: L.wishlist };
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
  if (cloud.api) cloud.api.auth.languageCode = lang;
  if (card) openCard(card); else if (wasSettings && sheetMode === 'account') openAccount(true); else if (wasSettings) openSettings();
  toast(L.langToast);
}

// ---------- Actions ----------
function toggleOwn(id) {
  user.owned[id] = qty(id) > 0 ? 0 : 1;
  if (!user.owned[id]) delete user.owned[id];
  save(); refreshCard(id);
  petEvent('own', { on: qty(id) > 0 });
  toast(qty(id) ? L.addedCol : L.removedCol);
}
function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  save(); refreshCard(id);
  petEvent('wish', { on: wish.has(id) });
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
  else if (d.seg === 'pet') { user.prefs.pet = d.value; save(); petSync(); openSettings(); }
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
  else if (d.action === 'account') openAccount();
  else if (d.action === 'prev') navStep(-1);
  else if (d.action === 'next') navStep(1);
  else if (d.action === 'google') signInGoogle();
  else if (d.action === 'forgot') {
    const email = document.getElementById('acctEmail')?.value.trim();
    cloudAction(() => cloud.api.authM.sendPasswordResetEmail(cloud.api.auth, email), L.resetSent);
  } else if (d.action === 'signout') {
    cloudAction(async () => { cloud.unsub?.(); cloud.unsub = null; await cloud.api.authM.signOut(cloud.api.auth); }, L.signedOut);
  } else if (d.action === 'delete-account') {
    if (!cloud.confirmDelete) { cloud.confirmDelete = true; refreshAccount(); return; }
    cloudAction(async () => {
      const cu = cloud.api.auth.currentUser;
      cloud.unsub?.(); cloud.unsub = null;
      await cloud.api.fsM.deleteDoc(cloudRef());
      await cloud.api.authM.deleteUser(cu);
      user.syncedUid = null; save();
    }, L.deleted);
    cloud.confirmDelete = false;
  }
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
document.addEventListener('keydown', (e) => {
  if (sheet.hidden) return;
  if (e.key === 'Escape') closeCard();
  else if (openId && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('input, textarea')) { e.preventDefault(); navStep(e.key === 'ArrowRight' ? 1 : -1); }
});
sheet.addEventListener('click', (e) => { if (e.target.matches('.sheet-backdrop')) closeCard(); });

// ---------- Navigation ----------
let currentTab = 'home';
function markTabs() {
  const pc = isPC();
  for (const a of document.querySelectorAll('.tabbar a')) {
    const on = a.dataset.tab === currentTab || (!pc && currentTab === 'sealed' && a.dataset.tab === 'home');
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
}
function route() {
  const h = location.hash.slice(1) || 'home';
  if (!sheet.hidden) closeCard();
  let tab = h;
  if (h.startsWith('set-')) { tab = 'home'; currentRender = () => renderSet(h.slice(4)); }
  else if (h === 'collection') currentRender = renderCollection;
  else if (h === 'wishlist') currentRender = renderWishlist;
  else if (h === 'search') currentRender = renderSearch;
  else if (h === 'values') currentRender = renderValues;
  else if (h === 'sealed') { tab = 'sealed'; currentRender = renderSealed; }
  else if (h === 'capri') { currentRender = renderCapri; }
  else { tab = 'home'; currentRender = renderHome; }
  currentTab = tab;
  markTabs();
  currentRender();
  window.scrollTo(0, 0);
  if (h === 'search') document.getElementById('cardSearch')?.focus();
  petEvent('route');
}
window.addEventListener('hashchange', route);

// ---------- Capri compagnon : elle se balade dans l'appli, s'assoit sur les cartes et les commente ----------
// Dessin original (fan art vectoriel), animé en CSS ; déplacements en JS. Désactivable dans les Réglages.
// Images de Capri : une par posture si disponible (data/pet.json), sinon l'image de base.
// Aucun dessin : uniquement des images fournies par le propriétaire de l'appli.
const PET_DEFAULT = 'images/capri/portrait.webp';
let petSprites = { idle: PET_DEFAULT };
const petSprite = (st) => petSprites[st] ?? petSprites[{ game: 'sit', sleep: 'sit', jump: 'idle', drag: 'idle', wave: 'idle', walk: 'idle' }[st]] ?? petSprites.idle ?? PET_DEFAULT;

const PET_LINES = {
  fr: {
    strong: ['Elle est trop forte celle-ci !', 'Wow… {name}. Je suis jalouse.', 'Ça brille de partout, j\'adore !', 'Celle-là, c\'est du nova pur.'],
    pricey: ['{price} ?! Elle vaut une fortune, choom.', 'Avec {price}, on se paie un implant, tu sais.'],
    mid: ['Jolie cote : {price}.', 'Pas donnée, celle-ci… {price}.'],
    owned: ['Tu l\'as déjà, preem !', 'Celle-là est à toi. Je la surveille.'],
    wishlist: ['Elle est dans tes souhaits… bientôt à toi.', 'Je croise mes engrammes pour que tu l\'aies.'],
    Legend: ['Une Légende ! J\'adore les légendes.', 'Les Légendes, c\'est tout à fait mon genre.'],
    Program: ['Un Programme ! Ça, ça me parle.', 'Laisse-moi lire son code… *bzzt*'],
    Gear: ['Du matos ! Ça claque.', 'Je l\'équiperais bien… si j\'avais un vrai corps.'],
    Unit: ['J\'aime trop cette carte !', 'Elle a du style, celle-là.', 'Pas mal du tout, celle-ci.'],
    cheap: ['Une petite commune… mais je l\'aime quand même.', 'Petite carte, grand cœur.'],
    smasher: ['Adam Smasher… brr, je garde mes distances.'],
    johnny: ['Johnny Silverhand… toujours trop bruyant, celui-là.'],
    crew: ['Une figure d\'Edgerunners ! Respect.'],
    arasaka: ['Arasaka… ne me parle pas d\'eux.'],
    v: ['V ! Une légende de Night City.'],
    booster: ['Un booster ! On l\'ouvre ? Allez !'], box: ['Une booster box entière… tu me fais rêver.'], case: ['Six booster box ?! Tu vises le nova total.'], deck: ['Un deck tout prêt, parfait pour jouer.'], kit: ['Un kit ! Ça sent la nouveauté.'],
    ownAdded: ['Nova, une de plus dans la collection !', 'Ajoutée ! Ta collection grossit, choom.'],
    ownRemoved: ['Oh… elle s\'en va ?'],
    wishAdded: ['Bon choix. Je la voulais aussi.'],
    idle: ['Night City ne dort jamais… moi non plus.', 'Tu as vu les cotes aujourd\'hui ?', 'Je me promène dans tes cartes, ça te dérange pas ?', '*bzzt* … pardon, petit glitch.', 'J\'aime bien ici. C\'est calme, pour un réseau.'],
    tap: ['Hé ! Ça chatouille.', 'Oui, oui, je suis là.', 'Touche-moi deux fois pour discuter !'],
    game: ['Laisse-moi finir ma partie…', 'Nouveau record ! Enfin presque.'],
    drag: ['Waaah ! Pose-moi !'],
    wake: ['Hein ? Je dormais pas, je défragmentais.'],
  },
  en: {
    strong: ['This one is so strong!', 'Wow… {name}. I\'m jealous.', 'It sparkles everywhere, I love it!', 'Pure nova, that one.'],
    pricey: ['{price}?! That\'s a fortune, choom.', 'With {price} you could buy an implant.'],
    mid: ['Nice price: {price}.', 'Not cheap… {price}.'],
    owned: ['You already have it, preem!', 'That one is yours. I\'m keeping an eye on it.'],
    wishlist: ['It\'s on your wishlist… soon yours.', 'Crossing my engrams for you.'],
    Legend: ['A Legend! I love Legends.', 'Legends are totally my type.'],
    Program: ['A Program! Now we\'re talking.', 'Let me read its code… *bzzt*'],
    Gear: ['Gear! Looks great.', 'I\'d equip it… if I had a real body.'],
    Unit: ['I love this card!', 'This one has style.', 'Not bad at all.'],
    cheap: ['Just a common… but I still love it.', 'Small card, big heart.'],
    smasher: ['Adam Smasher… brr, I keep my distance.'],
    johnny: ['Johnny Silverhand… always too loud.'],
    crew: ['An Edgerunners legend! Respect.'],
    arasaka: ['Arasaka… don\'t talk to me about them.'],
    v: ['V! A Night City legend.'],
    booster: ['A booster! Shall we open it?'], box: ['A whole booster box… dreamy.'], case: ['Six booster boxes?! Going full nova.'], deck: ['A ready-made deck, perfect to play.'], kit: ['A kit! Smells brand new.'],
    ownAdded: ['Nova, one more in the collection!', 'Added! Your collection is growing, choom.'],
    ownRemoved: ['Oh… it\'s leaving?'],
    wishAdded: ['Good pick. I wanted it too.'],
    idle: ['Night City never sleeps… neither do I.', 'Seen the prices today?', 'Mind if I walk around your cards?', '*bzzt* … sorry, tiny glitch.', 'I like it here. Quiet, for a network.'],
    tap: ['Hey! That tickles.', 'Yes, yes, I\'m here.', 'Tap me twice to chat!'],
    game: ['Let me finish my game…', 'New high score! Almost.'],
    drag: ['Waaah! Put me down!'],
    wake: ['Huh? I wasn\'t sleeping, I was defragmenting.'],
  },
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const STRONG = new Set(['Nova Rare', 'Iconic Legend', 'Iconic Other', 'Secret', 'Iconic Secret']);
function petCardLine(c) {
  const T = PET_LINES[lang];
  const fill = (s) => s.replace('{name}', cardName(c)).replace('{price}', eur(price(c.id)));
  if (isSealed(c)) return pick(T[c.category] ?? T.idle);
  const n = `${c.nameEn ?? ''} ${c.name ?? ''}`;
  const pool = [];
  if (/Adam Smasher/i.test(n)) pool.push(...T.smasher);
  if (/Johnny Silverhand/i.test(n)) pool.push(...T.johnny);
  if (/\b(Lucyna|Lucy|Rebecca|David Martinez|Maine|Kiwi|Dorio|Pilar|Falco)\b/i.test(n)) pool.push(...T.crew);
  if (/Arasaka/i.test(n)) pool.push(...T.arasaka);
  if (/^V\b|\bV —/.test(c.nameEn ?? '')) pool.push(...T.v);
  const p = price(c.id) ?? 0;
  if (STRONG.has(c.rarity)) pool.push(...T.strong);
  if (p >= 30) pool.push(...T.pricey); else if (p >= 5) pool.push(...T.mid);
  if (qty(c.id) > 0) pool.push(...T.owned); else if (wish.has(c.id)) pool.push(...T.wishlist);
  if (!pool.length) pool.push(...(c.rarity === 'Common' && p < 0.2 ? T.cheap : []), ...(T[c.type] ?? T.Unit));
  return fill(pick(pool));
}

const pet = { el: null, bubble: null, x: 0, y: 0, mode: 'stand', facing: 1, anchor: null, anchorDX: 0, raf: 0, think: 0, talkT: 0, lastTalk: 0, lastAct: Date.now(), sleeping: false, drag: null, tapT: 0, on: false };
const petReduce = matchMedia('(prefers-reduced-motion: reduce)');
const petSize = () => (isPC() ? 104 : 78);                 // hauteur en px
const petK = () => 1;
const petW = () => Math.round(petSize() * (pet.aspect || 1));
// point posé sur la surface : le bas de l'image (debout) ou un peu au-dessus (assise : elle chevauche le bord)
const petAnchor = (mode) => (mode === 'sit' ? petSize() * 0.86 : petSize());
function petGround() {
  if (isPC()) return innerHeight - 4;
  const tb = document.querySelector('.tabbar');
  return (tb ? tb.getBoundingClientRect().top : innerHeight) - 2;
}
function petRender() {
  if (!pet.el) return;
  const top = pet.y - petAnchor(pet.mode);
  pet.el.style.width = `${petW()}px`; pet.el.style.height = `${petSize()}px`;
  pet.el.style.transform = `translate3d(${Math.round(pet.x - petW() / 2)}px, ${Math.round(top)}px, 0)`;
  pet.el.classList.toggle('left', pet.facing < 0);
  petPlaceBubble();
}
function petState(s) {
  if (!pet.el) return;
  pet.el.dataset.state = s;
  const src = petSprite(s);
  if (pet.img && !pet.img.src.endsWith(src)) pet.img.src = src;
}
function petStop() { cancelAnimationFrame(pet.raf); pet.raf = 0; }
const clampX = (x) => Math.max(petW() / 2 + 4, Math.min(innerWidth - petW() / 2 - 4, x));

function petWalkTo(tx, done) {
  petStop();
  tx = clampX(tx);
  pet.anchor = null; pet.mode = 'stand'; pet.y = petGround();
  if (petReduce.matches) { pet.x = tx; petRender(); petState('idle'); done?.(); return; }
  pet.facing = tx >= pet.x ? 1 : -1;
  petState('walk');
  let last = performance.now();
  const speed = isPC() ? 70 : 55;
  const step = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    const d = tx - pet.x;
    if (Math.abs(d) <= speed * dt) { pet.x = tx; petRender(); pet.raf = 0; petState('idle'); done?.(); return; }
    pet.x += Math.sign(d) * speed * dt; pet.y = petGround(); petRender();
    pet.raf = requestAnimationFrame(step);
  };
  pet.raf = requestAnimationFrame(step);
}
function petHop(tx, ty, mode, done) {
  petStop();
  const x0 = pet.x, y0 = pet.y;
  // le point d'ancrage change entre debout et assise : on compense pour un saut continu
  const off = petAnchor('stand') - petAnchor('sit');
  const yFrom = pet.mode === 'sit' ? y0 : y0 - off, yTo = mode === 'sit' ? ty : ty - off;
  pet.facing = tx >= x0 ? 1 : -1;
  if (petReduce.matches) { pet.x = tx; pet.y = ty; pet.mode = mode; petRender(); done?.(); return; }
  petState('jump'); pet.mode = 'sit';
  const t0 = performance.now(), dur = 520;
  const step = (t) => {
    const u = Math.min(1, (t - t0) / dur);
    pet.x = x0 + (tx - x0) * u;
    pet.y = yFrom + (yTo - yFrom) * u - Math.sin(Math.PI * u) * 70;
    petRender();
    if (u < 1) pet.raf = requestAnimationFrame(step);
    else { pet.raf = 0; pet.mode = mode; pet.y = ty; petRender(); done?.(); }
  };
  pet.raf = requestAnimationFrame(step);
}
function petFall() {
  pet.anchor = null;
  petHop(clampX(pet.x), petGround(), 'stand', () => petState('idle'));
}
// s'asseoir sur le bord haut d'un élément (carte, produit, image de la fiche)
// téléportation façon Capri : disparaît dans un glitch et réapparaît à destination
function petTeleport(tx, ty, done) {
  petStop();
  pet.el.classList.add('tp');
  setTimeout(() => {
    pet.x = tx; pet.y = ty; pet.mode = 'sit'; petRender();
    pet.el.classList.remove('tp'); pet.el.classList.add('tp-in');
    setTimeout(() => pet.el.classList.remove('tp-in'), 360);
    done?.();
  }, petReduce.matches ? 0 : 200);
}
function petSitOn(target, line, opts = {}) {
  const r = target.getBoundingClientRect();
  const tx = clampX(r.left + r.width * (0.35 + Math.random() * 0.3));
  const ty = Math.max(petAnchor('sit') + 6, r.top + 2);
  const settle = () => {
    pet.anchor = target; pet.anchorDX = pet.x - r.left;
    petState(Math.random() < 0.18 && isPC() ? 'game' : 'sit');
    if (line) petSay(line, 3800, opts.force);
  };
  if (opts.teleport) petTeleport(tx, ty, settle);
  else if (pet.anchor || petReduce.matches || Math.abs(tx - pet.x) < 40) petHop(tx, ty, 'sit', settle);
  else petWalkTo(tx, () => { const r2 = target.getBoundingClientRect(); if (!target.isConnected || r2.bottom < 0) return; petHop(tx, Math.max(petAnchor('sit') + 6, r2.top + 2), 'sit', settle); });
}
function petFollowAnchor() {
  if (!pet.on || pet.raf || pet.drag) return;
  if (pet.anchor) {
    const r = pet.anchor.getBoundingClientRect();
    if (!pet.anchor.isConnected || r.bottom < 40 || r.top > petGround() - 30 || r.width === 0) { petFall(); return; }
    pet.x = r.left + pet.anchorDX; pet.y = Math.max(petAnchor('sit') + 6, r.top + 2);
  } else if (pet.mode === 'stand') pet.y = petGround();
  pet.x = clampX(pet.x);
  petRender();
}

function petSay(text, ms = 3800, force) {
  if (!pet.el || !text) return;
  const now = Date.now();
  if (!force && now - pet.lastTalk < 2500) return;
  pet.lastTalk = now;
  pet.bubble.textContent = text.replace(/\*([^*]+)\*/g, '$1');
  pet.bubble.hidden = false;
  pet.el.classList.add('talking');
  petPlaceBubble();
  clearTimeout(pet.talkT);
  pet.talkT = setTimeout(() => { pet.bubble.hidden = true; pet.el.classList.remove('talking'); }, ms);
}
function petPlaceBubble() {
  if (!pet.bubble || pet.bubble.hidden) return;
  const right = pet.x > innerWidth - 150, left = pet.x < 150;
  pet.bubble.classList.toggle('below', pet.y - petAnchor(pet.mode) < 90);   // trop près du haut : bulle en dessous
  pet.bubble.classList.toggle('to-left', right && !left);
  pet.bubble.classList.toggle('to-right', left);
}

function petVisibleTiles() {
  const ground = petGround();
  return [...document.querySelectorAll('#view .card, #view .sealed')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.top > 120 && r.top < ground - 120 && r.left > 0 && r.right < innerWidth;
  });
}
function petThink() {
  clearTimeout(pet.think);
  pet.think = setTimeout(petThink, 5000 + Math.random() * 6000);
  if (!pet.on || pet.drag || pet.raf || document.hidden || !sheet.hidden) return;
  const idleFor = Date.now() - pet.lastAct;
  if (idleFor > 70000) {
    if (!pet.sleeping) { pet.sleeping = true; if (!pet.anchor) { pet.mode = 'stand'; pet.y = petGround(); } petState('sleep'); petRender(); petSay('Zzz…', 6000, true); }
    return;
  }
  const r = Math.random();
  const tiles = petVisibleTiles();
  if (r < 0.32 && tiles.length) {
    const el = pick(tiles);
    const c = cardsById.get(el.dataset.cid);
    petSitOn(el, c && Math.random() < 0.85 ? petCardLine(c) : null);
  } else if (r < 0.62) {
    if (pet.anchor) petFall();
    else petWalkTo(40 + Math.random() * (innerWidth - 80));
  } else if (r < 0.72) {
    petState(pet.anchor ? 'sit' : 'wave'); petSay(pick(PET_LINES[lang].idle));
  } else if (r < 0.8 && !pet.anchor) {
    pet.mode = 'stand'; pet.y = petGround(); petRender(); petState('game');
    if (Math.random() < 0.5) petSay(pick(PET_LINES[lang].game));
  } else if (!pet.anchor) { pet.mode = 'stand'; pet.y = petGround(); petRender(); petState('idle'); }
}
function petWake() {
  pet.lastAct = Date.now();
  if (pet.sleeping) { pet.sleeping = false; petState(pet.anchor ? 'sit' : 'idle'); if (!pet.anchor) { pet.mode = 'stand'; pet.y = petGround(); petRender(); } if (Math.random() < 0.6) petSay(pick(PET_LINES[lang].wake)); }
}

// réactions aux actions de l'appli
function petEvent(type, data) {
  if (type === 'route') { petSync(); return; }
  if (!pet.on || !pet.el) return;
  if (type === 'open') {
    const img = sheetPanel.querySelector('.detail .card-img');
    const same = pet.lastOpen?.id === data.id && Date.now() - pet.lastOpen.t < 15000;
    pet.lastOpen = { id: data.id, t: Date.now() };
    if (same && pet.anchor) { pet.anchor = img; petFollowAnchor(); return; }  // même carte (ex. + / −) : elle reste en place
    setTimeout(() => { if (img?.isConnected) petSitOn(img, petCardLine(data), { teleport: true, force: true }); }, 200);
  } else if (type === 'close') {
    if (pet.anchor && !pet.anchor.closest('#view')) petFall();
  } else if (type === 'own') petSay(pick(PET_LINES[lang][data.on ? 'ownAdded' : 'ownRemoved']), 3000, true);
  else if (type === 'wish' && data.on) petSay(pick(PET_LINES[lang].wishAdded), 3000, true);
  else if (type === 'route') petSync();
  else if (type === 'sheet') pet.el.parentElement.hidden = true;   // réglages, compte : elle s'écarte
  if (type === 'close') pet.el.parentElement.hidden = !pet.on;
}
function petSync() {
  const want = user.prefs.pet !== 'off' && currentRender !== renderCapri && !!catalog.cards.length;
  if (!pet.el) {
    if (!want) return;
    const layer = document.createElement('div');
    layer.className = 'pet-layer';
    layer.innerHTML = `<div class="pet" data-state="idle" role="button" tabindex="0" aria-label="Capri"><div class="pet-bubble" hidden></div><img class="pet-img" src="${petSprite('idle')}" alt="" draggable="false"></div>`;
    document.body.appendChild(layer);
    pet.el = layer.firstElementChild; pet.bubble = pet.el.querySelector('.pet-bubble'); pet.img = pet.el.querySelector('.pet-img');
    pet.img.addEventListener('load', () => { const a = pet.img.naturalWidth / pet.img.naturalHeight; if (a && Math.abs(a - (pet.aspect || 1)) > 0.01) { pet.aspect = a; petRender(); } });
    // images par posture et fond transparent ou non : data/pet.json (facultatif)
    fetch('data/pet.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((cfg) => {
      if (!cfg) return;
      if (cfg.sprites) petSprites = { ...petSprites, ...cfg.sprites };
      pet.el.classList.toggle('framed', !cfg.transparent);
      petState(pet.el.dataset.state);
    }).catch(() => {});
    pet.x = innerWidth - 70; pet.y = petGround(); pet.mode = 'stand';
    petBind();
  }
  pet.on = want;
  pet.el.parentElement.hidden = !want;
  if (!want) { petStop(); clearTimeout(pet.think); return; }
  if (pet.anchor && !pet.anchor.isConnected) { pet.anchor = null; pet.mode = 'stand'; pet.y = petGround(); petState('idle'); }
  petRender();
  if (!pet.think) petThink();
}
function petBind() {
  const el = pet.el;
  el.addEventListener('pointerdown', (e) => {
    petWake();
    pet.drag = { sx: e.clientX, sy: e.clientY, moved: false, id: e.pointerId };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    const d = pet.drag;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
    if (!d.moved) { d.moved = true; petStop(); pet.anchor = null; pet.mode = 'sit'; petState('drag'); petSay(pick(PET_LINES[lang].drag), 2000, true); }
    pet.x = clampX(e.clientX); pet.y = e.clientY + 30; petRender();
  });
  const end = (e) => {
    const d = pet.drag;
    pet.drag = null;
    if (!d) return;
    if (d.moved) {
      // lâchée au-dessus d'une carte : elle s'y assoit ; sinon elle retombe
      el.style.pointerEvents = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY + 60)?.closest('#view .card, #view .sealed, .detail .card-img');
      el.style.pointerEvents = '';
      if (under) { const c = cardsById.get(under.closest('[data-cid]')?.dataset.cid ?? openId); petSitOn(under, c ? petCardLine(c) : null, { force: true }); }
      else petFall();
      return;
    }
    const now = Date.now();
    if (now - pet.tapT < 380) { location.hash = '#capri'; return; } // double tap : ouvrir le chat
    pet.tapT = now;
    if (!pet.anchor && pet.mode === 'stand') petState('wave');
    petSay(pick(PET_LINES[lang].tap), 2600, true);
    setTimeout(() => { if (pet.el.dataset.state === 'wave') petState('idle'); }, 1600);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => { pet.drag = null; petFall(); });
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = '#capri'; });
  addEventListener('scroll', petFollowAnchor, { passive: true });
  sheetPanel.addEventListener('scroll', petFollowAnchor, { passive: true });
  addEventListener('resize', () => { if (!pet.anchor && !pet.raf) { pet.y = petGround(); pet.x = clampX(pet.x); petRender(); } else petFollowAnchor(); });
  for (const ev of ['pointerdown', 'keydown', 'scroll', 'wheel']) addEventListener(ev, petWake, { passive: true, capture: true });
  // repasse en idle après un geste « wave » ou un saut
  setInterval(() => { if (pet.on && !pet.raf && !pet.drag && pet.el.dataset.state === 'wave' && Date.now() - pet.lastTalk > 3000) petState('idle'); }, 1500);
}

// ---------- Démarrage ----------
pcQuery.addEventListener('change', () => {
  applyDevice(); markTabs(); currentRender(); petSync();
  if (openId) openCard(openId, true);
});
renderChrome();
try {
  await loadData();
  route();
  initCloud();
} catch (err) {
  view.innerHTML = `<div class="empty"><strong>${L.loadError}</strong>${L.loadErrorHint}</div>`;
  console.error(err);
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
