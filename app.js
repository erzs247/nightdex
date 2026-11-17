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
    noCards: 'Aucune carte', noCardsHint: 'Modifiez les filtres pour en voir davantage.', searchInSet: 'Rechercher dans la série (nom, numéro…)',
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
    language: 'Langue de l\'appli', langToast: 'Appli en français',
    news: {
      title: 'Actualités', unread: (n) => `${n} non lu${n > 1 ? 's' : ''}`, new: 'Nouveau', read: 'Lire l\'article', empty: 'Pas encore d\'actualités.',
      intro: 'Les dernières nouvelles du Cyberpunk TCG, depuis le blog officiel. Titres et résumés traduits en français ; les articles complets sont en anglais sur le site officiel. Mises à jour chaque jour.',
    },
    ex: {
      tab: 'Extra', cats: { staff: 'Cartes du personnel', other: 'Hors séries' }, catHint: { staff: 'Offertes aux employés, jamais vendues en boutique.' },
      note: 'Ces cartes ne sont pas sur Cardmarket : leur prix est une estimation d\'après les annonces eBay, mise à jour à la main.',
      priceNote: (v, d, s) => `Prix estimé ${v} d'après ${s} (${d}) — pas de cote Cardmarket.`,
      estimate: 'Prix estimé (eBay)', ebayLive: 'Voir les annonces sur eBay', ebaySold: 'Voir les ventes réussies sur eBay',
    },
    dk: {
      title: 'Decks', new: 'Nouveau deck', untitled: 'Deck sans nom', defaultName: (n) => `Mon deck ${n}`, namePh: 'Nom du deck', cancel: 'Annuler',
      empty: 'Aucun deck pour l\'instant', emptyHint: 'Crée tes decks avec les règles officielles : 3 Légendes, 40 à 50 cartes, la RAM vérifiée automatiquement.',
      cards: (n) => `${n} carte${n > 1 ? 's' : ''}`, legal: 'Deck valide', notLegal: 'Deck pas encore valide', toFix: 'à corriger',
      missing: (n, v) => `Il te manque ${n} carte${n > 1 ? 's' : ''} (≈ ${v})`, complete: 'Tu as toutes les cartes de ce deck.',
      cLegends: (n) => `Légendes : ${n}/3, toutes différentes`, sameLegend: 'Deux Légendes portent le même nom.',
      cSize: (n) => `Deck : ${n} cartes (40 à 50, Légendes non comptées)`, needMore: (n) => `Encore ${n} carte${n > 1 ? 's' : ''} minimum.`, tooMany: (n) => `${n} carte${n > 1 ? 's' : ''} en trop.`,
      cCopies: '3 exemplaires max par carte (toutes éditions)', cRam: 'RAM des cartes ≤ RAM de leur couleur', overRam: (n) => `${n} carte${n > 1 ? 's demandent' : ' demande'} trop de RAM.`,
      ramLegend: 'RAM par couleur, apportée par tes Légendes', isLegend: 'Légende', ramShort: (r, c) => `RAM ${r} ${c}`, max3: 'Déjà 3', sideFull: 'Réserve pleine',
      legends: 'Légendes', addLegend: 'Légende', removeLegend: 'Retirer cette Légende', pickLegend: 'Choisis une Légende', legSearch: 'Chercher une Légende',
      main: 'Deck', side: 'Réserve', mainHint: 'Ajoute des cartes avec la liste ci-dessous.', sideHint: 'Réserve de tournoi : 7 cartes que tu peux échanger entre les parties.',
      curve: 'Courbe de coût', addCards: 'Ajouter des cartes', searchPh: 'Nom ou numéro de carte', mine: 'Mes cartes', allColors: 'Toutes les couleurs',
      own: (o, n) => `tu en as ${o}/${n}`, refine: (n) => `${n} cartes : affine la recherche pour voir les autres.`,
      export: 'Copier la liste', copied: 'Liste du deck copiée', duplicate: 'Dupliquer ce deck', duplicated: 'Deck dupliqué',
      del: 'Supprimer ce deck', delSure: 'Appuie encore pour supprimer', deleted: 'Deck supprimé',
      rulesTitle: 'Règles de construction',
      rules: ['Exactement <b>3 Légendes</b>, avec des noms différents.', '<b>40 à 50 cartes</b> dans le deck, sans compter les Légendes.', '<b>3 exemplaires maximum</b> d\'une même carte, toutes éditions confondues.', '<b>RAM</b> : chaque couleur part de 0 ; chaque Légende ajoute sa RAM à sa couleur. Une carte ne peut pas demander plus de RAM que la limite de sa couleur.', 'En tournoi : une <b>réserve de 7 cartes</b>.'],
      rulesNeeded: 'Decks gardés sur ce téléphone : mets à jour les règles Firestore pour les synchroniser.',
    },
    gr: {
      tab: 'Gradées', tabCards: 'Cartes', add: 'Ajouter une gradée', edit: 'Modifier le slab', addThis: 'Ajouter une version gradée', youHave: (n) => `${n} gradée${n > 1 ? 's' : ''}`,
      empty: 'Aucune carte gradée pour l\'instant', emptyHint: 'Ajoute tes slabs PSA, Beckett, CGC, PCA, Collect Aura… avec leur note, leur numéro de certificat et une photo.',
      kSlabs: 'Slabs', kPaid: 'Payé', kValue: 'Valeur estimée', noSale: 'Pas de vente',
      valueNote: 'Valeur estimée = médiane des 3 dernières ventes réussies que tu as relevées pour la même carte, langue, société et note.',
      card: 'Carte', findCard: 'Nom ou numéro de la carte (ex. MS01 008)', change: 'Changer', company: 'Société de gradation', other: 'Autre',
      grade: 'Note', cert: 'N° de certificat', certPh: 'Sur l\'étiquette du slab', certShort: 'Certificat', verify: 'vérifier',
      purchase: 'Achat', paid: 'Prix payé (€)', date: 'Date', photo: 'Photo du slab', optional: 'facultatif',
      photoAdd: 'Prendre ou choisir une photo', photoChange: 'Changer la photo', photoDel: 'Retirer la photo', photoErr: 'Impossible de lire cette photo.',
      photoHint: 'Elle remplace le slab dessiné. Gardée sur ton téléphone et dans ton compte si tu es connecté.',
      save: 'Enregistrer', del: 'Supprimer ce slab', delSure: 'Appuie encore pour supprimer', added: 'Slab ajouté', saved: 'Slab modifié', deleted: 'Slab supprimé',
      estimate: 'Valeur estimée', paidOn: (p, d) => `Payé ${p}${d ? ` le ${d}` : ''}`,
      curve: 'Ventes réussies', salesCount: (n) => `${n} vente${n > 1 ? 's' : ''} relevée${n > 1 ? 's' : ''}`, salePrice: 'Prix de vente (€)', addSale: 'Vente', delSale: 'Supprimer cette vente', saleAdded: 'Vente ajoutée à la courbe',
      chartWait: 'Ajoute au moins deux ventes réussies pour tracer la courbe.',
      ebayNote: 'eBay ne laisse pas les applis lire automatiquement les ventes réussies (réservé à ses partenaires agréés). Ouvre-les avec le bouton ci-dessous, puis note les prix ici : la courbe et la valeur se mettent à jour.',
      ebay: 'Voir les ventes réussies sur eBay', pc: 'Cote gradée sur PriceCharting', seeCard: 'Voir la fiche de la carte',
      rulesNeeded: 'Cartes gradées gardées sur ce téléphone : mets à jour les règles Firestore pour les synchroniser.',
    },
    paidLabel: 'Prix d\'achat / carte', paidHint: 'Différence avec la cote', paidVs: 'Différence :', boughtFor: (v) => `achetées ${v}`,
    paidSum: (n, v) => `Prix d'achat noté pour ${n} carte${n > 1 ? 's' : ''} : ${v}`,
    zoom: 'Agrandir la carte', zoomHint: 'Pince ou double-touche pour zoomer',
    otherCopies: (n, l) => `+ ${n} exemplaire${n > 1 ? 's' : ''} en ${l} (bouton FR | EN pour y passer)`, colLang: (l) => `Collection ${l.toUpperCase()}`,
    cardLanguage: 'Langue des cartes', cardLangHint: 'Le bouton FR | EN de l\'accueil fait la même chose : séries, noms et images dans cette langue.',
    cardLangToast: (l) => (l === 'fr' ? 'Cartes : séries françaises' : 'Cartes : séries anglaises'),
    langHint: 'Menus, boutons et textes de NightDex.',
    hiddenSets: (n, l) => `${n} série${n > 1 ? 's' : ''} n'existe${n > 1 ? 'nt' : ''} pas en ${l === 'fr' ? 'français' : 'anglais'}.`, showOther: (l) => `Voir les cartes ${l.toUpperCase()}`,
    noCardsLang: (l) => `Aucune carte de cette série n'est imprimée en ${l === 'fr' ? 'français' : 'anglais'}.`,
    prev: 'Carte précédente', next: 'Carte suivante',
    fr: {
      title: 'Amis', gate: 'Connecte-toi à ton compte NightDex pour ajouter des amis et voir leurs collections.',
      choose: 'Choisis ton pseudo', chooseHint: 'Tes amis t\'ajouteront avec ce pseudo. 3 à 20 caractères : lettres minuscules, chiffres, . _ -',
      pseudoPh: 'ex. netrunner_77', save: 'Enregistrer', pseudoRule: 'Pseudo invalide : 3 à 20 caractères (a-z, 0-9, . _ -).', pseudoTaken: 'Ce pseudo est déjà pris, essaie-en un autre.', pseudoSaved: 'Pseudo enregistré',
      add: 'Ajouter un ami', yourPseudo: 'Ton pseudo :', addPh: 'Pseudo de ton ami', send: 'Envoyer',
      privacy: 'Tes amis acceptés peuvent voir ta collection et tes souhaits. Personne d\'autre.',
      notFound: (p) => `Aucun compte avec le pseudo « ${p} ».`, self: 'C\'est ton propre pseudo !', already: (p) => `@${p} est déjà ton ami.`,
      sent: 'Demande envoyée', accepted: 'Ami ajouté', removed: 'Ami retiré', denied: 'Action refusée : vérifie que les règles Firestore sont à jour.', error: 'Une erreur est survenue, réessaie.',
      requests: 'Demandes reçues', wants: 'veut devenir ton ami', accept: 'Accepter', decline: 'Refuser',
      mine: 'Mes amis', see: 'Voir sa collection', open: 'Voir', remove: 'Retirer', confirm: 'Confirmer ?',
      none: 'Pas encore d\'amis', noneHint: 'Ajoute un ami avec son pseudo : il devra accepter ta demande.',
      loading: 'Chargement de sa collection…', cantSee: 'Collection inaccessible', cantSeeHint: 'Vous n\'êtes peut-être plus amis, ou les règles Firestore ne sont pas à jour.',
      fAll: 'Sa collection', fTrade: 'Il l\'a, pas moi', fGive: 'Il la cherche, je l\'ai', fWish: 'Ses souhaits', emptyFilter: 'Rien dans ce filtre pour l\'instant.',
      tagMine: 'Je l\'ai', tagWant: 'Dans mes souhaits',
    },
    scan: { btn: 'Scan', title: 'Scanner une carte', starting: 'Ouverture de la caméra…', aim: 'Place la carte dans le cadre, bien à plat, sans reflet.', holding: 'Je la tiens… ne bouge plus.', photo: 'Choisir une photo', torch: 'Lampe',
      denied: 'Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, ou choisis une photo de la carte.', noCamera: 'Pas de caméra disponible. Choisis plutôt une photo de la carte, bien cadrée.', indexErr: 'Impossible de charger le scanner. Vérifie ta connexion et réessaie.',
      unsure: 'Pas sûr à 100 % : vérifie que c\'est la bonne.', owned: (q) => `Tu en as déjà ${q}.`, versions: 'Autres versions de cette carte :', notIt: 'Ce n\'est pas elle ?',
      add: '+1 Je l\'ai', open: 'Voir la fiche', again: 'Rescanner', added: (q) => `Ajoutée : tu en as ${q}` },
    inst: { title: 'Installe NightDex', pitch: 'Comme une vraie appli : icône sur ton écran, plein écran sans navigateur, et ça marche hors connexion.', btn: 'Installer', ios: 'Sur iPhone : touche Partager (le carré avec la flèche), puis « Sur l\'écran d\'accueil ».', done: 'NightDex est installée ! Ouvre-la depuis ton écran d\'accueil.' },
    adm: { title: 'Administration', role: 'rôle admin', idPh: 'ID NightDex du donateur', activate: 'Activer', remove: 'Retirer', listTitle: 'Soutiens actifs', none: 'Aucun soutien pour l\'instant.', on: 'Soutien activé', off: 'Soutien retiré', badId: 'ID invalide : copie-le depuis « Mon compte » du donateur.', denied: 'Refusé : les règles Firestore ne reconnaissent pas encore ce compte comme admin (publie les nouvelles règles).' },
    support: 'Soutenir NightDex', supportHint: 'NightDex est gratuit et fait par un fan. Un don aide à le faire vivre et débloque des bonus (photo de profil, cadre doré).',
    supporter: 'Soutien', supporterThanks: 'Merci pour ton soutien ! Tes bonus sont actifs.',
    myId: 'Ton ID NightDex', myIdHint: 'Indique-le dans le message de ton don pour recevoir tes bonus.', copy: 'Copier', copiedId: 'ID copié',
    avatar: 'Photo de profil', avatarChange: 'Changer la photo', avatarAdd: 'Ajouter une photo', avatarRemove: 'Retirer', avatarLocked: 'Réservé aux soutiens de NightDex.', avatarSaved: 'Photo enregistrée', avatarRemoved: 'Photo retirée', avatarErr: 'Impossible d\'enregistrer la photo. Réessaie.', avatarDenied: 'Photo réservée aux soutiens : ton statut n\'est pas encore actif.',
    petSetting: 'Capri se balade dans l\'appli', yes: 'Oui', no: 'Non', petHint: 'Touche-la pour qu\'elle réagisse, deux fois pour discuter, ou fais-la glisser sur une carte. Appui long (ou × sur PC) pour la cacher.',
    petHide: 'Cacher Capri', petBye: 'Ok, je disparais… *bzzt*', petHidden: 'Capri est cachée jusqu\'à la prochaine ouverture. Pour de bon : Réglages.',
    capriSpoil: (on) => `Spoilers S2 : ${on ? 'oui' : 'non'}`, capriReset: 'Effacer', capriSend: 'Envoyer', capriStop: 'Stop', capriPh: 'Écris à Capri…', capriTyping: 'connexion aux engrammes', capriListen: 'Écouter',
    capriHello: '*grésillement* … Ah, la liaison tient. Salut, choom. Moi c\'est Capri : plusieurs esprits recousus en une seule, sans corps, juste une puce et beaucoup de curiosité. Tu veux savoir quoi ?',
    capriSuggest: ['Qui es-tu, Capri ?', 'C\'est quoi un engramme ?', 'Ça fait quoi de ne pas avoir de corps ?', 'Ton avis sur Arasaka ?', 'Tu aimes les cartes Cyberpunk ?'],
    capriSuggestSpoil: ['D\'où tu viens vraiment ?', 'Que s\'est-il passé avec Talia ?', 'Qu\'est-ce que tu ressens pour D ?', 'Comment finit la saison 2 ?'],
    capriGateTitle: 'Discute avec Capri', capriGate: 'L\'IA d\'Edgerunners 2 répond à tes questions, dans son personnage. Connecte-toi à ton compte NightDex pour lui parler.',
    capriNoCloud: 'Le chat avec Capri a besoin des comptes NightDex (Firebase).',
    capriFoot: 'Chatbot de fan non officiel · Capri © CD Projekt / Studio Trigger · réponses générées par Gemini (Google), elles peuvent contenir des erreurs.',
    capriErr: { busy: '*grésillement* Les serveurs de Gemini sont saturés en ce moment (beaucoup de monde). Réessaie dans une minute.', timeout: '*grésillement* Gemini ne répond pas pour l\'instant (trop lent). Réessaie dans un moment.', denied: 'Google refuse l\'accès pour l\'instant (autorisation de la clé du projet). Envoie le détail ci-dessous à ton développeur.', region: 'Gemini gratuit n\'est pas disponible depuis ta région.', notEnabled: 'Capri n\'est pas encore branchée : il faut activer « AI Logic » (Gemini Developer API) dans la console Firebase.', quota: '*grésillement* J\'ai trop parlé aujourd\'hui : la limite gratuite est atteinte. Réessaie plus tard.', offline: 'Pas de connexion internet : je ne capte plus rien, choom.', model: 'Aucun modèle Gemini disponible pour l\'instant. Réessaie plus tard.', blocked: '*grésillement* Ce sujet-là, mes circuits refusent d\'y aller. Demande-moi autre chose.', other: '*grésillement* La liaison a sauté. Réessaie dans un instant.' },
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
    rarity: { Common: 'Commune', Uncommon: 'Peu commune', Rare: 'Rare', Epic: 'Épique', 'Nova Rare': 'Nova Rare', 'Iconic Legend': 'Légende iconique', 'Iconic Other': 'Iconique', Secret: 'Secrète', 'Iconic Secret': 'Secrète iconique', Exclusive: 'Exclusive' },
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
    noCards: 'No cards', noCardsHint: 'Change the filters to see more.', searchInSet: 'Search this set (name, number…)',
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
    language: 'App language', langToast: 'App in English',
    news: {
      title: 'News', unread: (n) => `${n} unread`, new: 'New', read: 'Read the article', empty: 'No news yet.',
      intro: 'The latest Cyberpunk TCG news from the official blog. Updated every day.',
    },
    ex: {
      tab: 'Extra', cats: { staff: 'Staff cards', other: 'Off-set cards' }, catHint: { staff: 'Given to employees, never sold in stores.' },
      note: 'These cards are not on Cardmarket: their price is an estimate from eBay listings, updated by hand.',
      priceNote: (v, d, s) => `Estimated ${v} from ${s} (${d}) — no Cardmarket price.`,
      estimate: 'Estimated price (eBay)', ebayLive: 'See listings on eBay', ebaySold: 'See sold listings on eBay',
    },
    dk: {
      title: 'Decks', new: 'New deck', untitled: 'Untitled deck', defaultName: (n) => `My deck ${n}`, namePh: 'Deck name', cancel: 'Cancel',
      empty: 'No decks yet', emptyHint: 'Build decks with the official rules: 3 Legends, 40 to 50 cards, RAM checked automatically.',
      cards: (n) => `${n} card${n > 1 ? 's' : ''}`, legal: 'Legal deck', notLegal: 'Deck not legal yet', toFix: 'to fix',
      missing: (n, v) => `You are missing ${n} card${n > 1 ? 's' : ''} (≈ ${v})`, complete: 'You own every card in this deck.',
      cLegends: (n) => `Legends: ${n}/3, all different`, sameLegend: 'Two Legends share the same name.',
      cSize: (n) => `Deck: ${n} cards (40 to 50, Legends not counted)`, needMore: (n) => `At least ${n} more card${n > 1 ? 's' : ''}.`, tooMany: (n) => `${n} card${n > 1 ? 's' : ''} too many.`,
      cCopies: 'Max 3 copies per card (all printings)', cRam: 'Card RAM ≤ RAM of its colour', overRam: (n) => `${n} card${n > 1 ? 's need' : ' needs'} too much RAM.`,
      ramLegend: 'RAM per colour, from your Legends', isLegend: 'Legend', ramShort: (r, c) => `RAM ${r} ${c}`, max3: 'Already 3', sideFull: 'Sideboard full',
      legends: 'Legends', addLegend: 'Legend', removeLegend: 'Remove this Legend', pickLegend: 'Choose a Legend', legSearch: 'Search a Legend',
      main: 'Deck', side: 'Sideboard', mainHint: 'Add cards from the list below.', sideHint: 'Tournament sideboard: 7 cards you can swap between games.',
      curve: 'Cost curve', addCards: 'Add cards', searchPh: 'Card name or number', mine: 'My cards', allColors: 'All colours',
      own: (o, n) => `you own ${o}/${n}`, refine: (n) => `${n} cards: refine your search to see the rest.`,
      export: 'Copy list', copied: 'Deck list copied', duplicate: 'Duplicate this deck', duplicated: 'Deck duplicated',
      del: 'Delete this deck', delSure: 'Tap again to delete', deleted: 'Deck deleted',
      rulesTitle: 'Deck-building rules',
      rules: ['Exactly <b>3 Legends</b>, with different names.', '<b>40 to 50 cards</b> in the deck, Legends not counted.', '<b>Max 3 copies</b> of the same card, all printings combined.', '<b>RAM</b>: each colour starts at 0; each Legend adds its RAM to its colour. A card cannot need more RAM than its colour\'s limit.', 'In tournaments: a <b>7-card sideboard</b>.'],
      rulesNeeded: 'Decks kept on this phone: update the Firestore rules to sync them.',
    },
    gr: {
      tab: 'Graded', tabCards: 'Cards', add: 'Add a graded card', edit: 'Edit slab', addThis: 'Add a graded copy', youHave: (n) => `${n} graded`,
      empty: 'No graded cards yet', emptyHint: 'Add your PSA, Beckett, CGC, PCA, Collect Aura… slabs with their grade, cert number and a photo.',
      kSlabs: 'Slabs', kPaid: 'Paid', kValue: 'Estimated value', noSale: 'No sale',
      valueNote: 'Estimated value = median of the last 3 sold prices you logged for the same card, language, company and grade.',
      card: 'Card', findCard: 'Card name or number (e.g. MS01 008)', change: 'Change', company: 'Grading company', other: 'Other',
      grade: 'Grade', cert: 'Cert number', certPh: 'On the slab label', certShort: 'Cert', verify: 'verify',
      purchase: 'Purchase', paid: 'Price paid (€)', date: 'Date', photo: 'Slab photo', optional: 'optional',
      photoAdd: 'Take or choose a photo', photoChange: 'Change photo', photoDel: 'Remove photo', photoErr: 'Could not read this photo.',
      photoHint: 'It replaces the drawn slab. Kept on your phone and in your account when signed in.',
      save: 'Save', del: 'Delete this slab', delSure: 'Tap again to delete', added: 'Slab added', saved: 'Slab updated', deleted: 'Slab deleted',
      estimate: 'Estimated value', paidOn: (p, d) => `Paid ${p}${d ? ` on ${d}` : ''}`,
      curve: 'Sold prices', salesCount: (n) => `${n} sale${n > 1 ? 's' : ''} logged`, salePrice: 'Sold price (€)', addSale: 'Sale', delSale: 'Delete this sale', saleAdded: 'Sale added to the curve',
      chartWait: 'Add at least two sold prices to draw the curve.',
      ebayNote: 'eBay does not let apps read sold listings automatically (reserved for approved partners). Open them with the button below, then log the prices here: the curve and value update.',
      ebay: 'See sold listings on eBay', pc: 'Graded prices on PriceCharting', seeCard: 'See the card page',
      rulesNeeded: 'Graded cards kept on this phone: update the Firestore rules to sync them.',
    },
    paidLabel: 'Bought at / card', paidHint: 'Difference with the price', paidVs: 'Difference:', boughtFor: (v) => `bought for ${v}`,
    paidSum: (n, v) => `Purchase price logged for ${n} card${n > 1 ? 's' : ''}: ${v}`,
    zoom: 'Enlarge card', zoomHint: 'Pinch or double-tap to zoom',
    otherCopies: (n, l) => `+ ${n} cop${n > 1 ? 'ies' : 'y'} in ${l} (switch with FR | EN)`, colLang: (l) => `${l.toUpperCase()} collection`,
    cardLanguage: 'Card language', cardLangHint: 'The FR | EN button on the home screen does the same: sets, names and images in that language.',
    cardLangToast: (l) => (l === 'fr' ? 'Cards: French sets' : 'Cards: English sets'),
    langHint: 'NightDex menus, buttons and texts.',
    hiddenSets: (n, l) => `${n} set${n > 1 ? 's are' : ' is'} not printed in ${l === 'fr' ? 'French' : 'English'}.`, showOther: (l) => `See ${l.toUpperCase()} cards`,
    noCardsLang: (l) => `No card from this set is printed in ${l === 'fr' ? 'French' : 'English'}.`,
    prev: 'Previous card', next: 'Next card',
    fr: {
      title: 'Friends', gate: 'Sign in to your NightDex account to add friends and see their collections.',
      choose: 'Choose your username', chooseHint: 'Friends will add you with this username. 3 to 20 characters: lowercase letters, digits, . _ -',
      pseudoPh: 'e.g. netrunner_77', save: 'Save', pseudoRule: 'Invalid username: 3 to 20 characters (a-z, 0-9, . _ -).', pseudoTaken: 'This username is taken, try another one.', pseudoSaved: 'Username saved',
      add: 'Add a friend', yourPseudo: 'Your username:', addPh: 'Your friend\'s username', send: 'Send',
      privacy: 'Accepted friends can see your collection and wishlist. Nobody else.',
      notFound: (p) => `No account with the username “${p}”.`, self: 'That\'s your own username!', already: (p) => `@${p} is already your friend.`,
      sent: 'Request sent', accepted: 'Friend added', removed: 'Friend removed', denied: 'Action refused: check that the Firestore rules are up to date.', error: 'Something went wrong, try again.',
      requests: 'Requests', wants: 'wants to be your friend', accept: 'Accept', decline: 'Decline',
      mine: 'My friends', see: 'See their collection', open: 'View', remove: 'Remove', confirm: 'Confirm?',
      none: 'No friends yet', noneHint: 'Add a friend with their username: they will have to accept.',
      loading: 'Loading their collection…', cantSee: 'Collection unavailable', cantSeeHint: 'You may no longer be friends, or the Firestore rules are not up to date.',
      fAll: 'Their collection', fTrade: 'They have, I don\'t', fGive: 'They want, I have', fWish: 'Their wishlist', emptyFilter: 'Nothing in this filter yet.',
      tagMine: 'I have it', tagWant: 'On my wishlist',
    },
    scan: { btn: 'Scan', title: 'Scan a card', starting: 'Opening the camera…', aim: 'Place the card in the frame, flat, without glare.', holding: 'Got it… hold still.', photo: 'Choose a photo', torch: 'Torch',
      denied: 'Camera access denied. Allow it in your browser settings, or choose a photo of the card.', noCamera: 'No camera available. Choose a well-framed photo of the card instead.', indexErr: 'Could not load the scanner. Check your connection and try again.',
      unsure: 'Not 100 % sure: check it is the right one.', owned: (q) => `You already have ${q}.`, versions: 'Other versions of this card:', notIt: 'Not this one?',
      add: '+1 I have it', open: 'View card', again: 'Scan again', added: (q) => `Added: you have ${q}` },
    inst: { title: 'Install NightDex', pitch: 'Like a real app: an icon on your screen, full screen without a browser, and it works offline.', btn: 'Install', ios: 'On iPhone: tap Share (the square with the arrow), then “Add to Home Screen”.', done: 'NightDex is installed! Open it from your home screen.' },
    adm: { title: 'Administration', role: 'admin role', idPh: 'Donor\'s NightDex ID', activate: 'Activate', remove: 'Remove', listTitle: 'Active supporters', none: 'No supporters yet.', on: 'Supporter activated', off: 'Supporter removed', badId: 'Invalid ID: copy it from the donor\'s “My account”.', denied: 'Refused: the Firestore rules do not recognise this account as admin yet (publish the new rules).' },
    support: 'Support NightDex', supportHint: 'NightDex is free and fan-made. A donation keeps it alive and unlocks extras (profile picture, gold frame).',
    supporter: 'Supporter', supporterThanks: 'Thanks for your support! Your extras are active.',
    myId: 'Your NightDex ID', myIdHint: 'Add it to your donation message to receive your extras.', copy: 'Copy', copiedId: 'ID copied',
    avatar: 'Profile picture', avatarChange: 'Change picture', avatarAdd: 'Add a picture', avatarRemove: 'Remove', avatarLocked: 'For NightDex supporters only.', avatarSaved: 'Picture saved', avatarRemoved: 'Picture removed', avatarErr: 'Could not save the picture. Try again.', avatarDenied: 'Pictures are for supporters: your status is not active yet.',
    petSetting: 'Capri walks around the app', yes: 'On', no: 'Off', petHint: 'Tap her to react, tap twice to chat, or drag her onto a card. Long press (or × on PC) to hide her.',
    petHide: 'Hide Capri', petBye: 'Ok, I\'m vanishing… *bzzt*', petHidden: 'Capri is hidden until you reopen the app. For good: Settings.',
    capriSpoil: (on) => `S2 spoilers: ${on ? 'on' : 'off'}`, capriReset: 'Clear', capriSend: 'Send', capriStop: 'Stop', capriPh: 'Write to Capri…', capriTyping: 'linking engrams', capriListen: 'Listen',
    capriHello: '*static* … Ah, the link holds. Hey, choom. I\'m Capri: a bunch of minds stitched into one, no body, just a chip and a lot of curiosity. What do you want to know?',
    capriSuggest: ['Who are you, Capri?', 'What is an engram?', 'What is it like to have no body?', 'What do you think of Arasaka?', 'Do you like Cyberpunk cards?'],
    capriSuggestSpoil: ['Where do you really come from?', 'What happened with Talia?', 'How do you feel about D?', 'How does season 2 end?'],
    capriGateTitle: 'Chat with Capri', capriGate: 'The AI from Edgerunners 2 answers your questions, in character. Sign in to your NightDex account to talk to her.',
    capriNoCloud: 'Chatting with Capri needs NightDex accounts (Firebase).',
    capriFoot: 'Unofficial fan chatbot · Capri © CD Projekt / Studio Trigger · answers generated by Gemini (Google), they may contain mistakes.',
    capriErr: { busy: '*static* Gemini\'s servers are overloaded right now. Try again in a minute.', timeout: '*static* Gemini is not answering right now (too slow). Try again in a moment.', denied: 'Google is refusing access for now (project key permissions). Send the detail below to your developer.', region: 'Free Gemini is not available from your region.', notEnabled: 'Capri is not connected yet: enable “AI Logic” (Gemini Developer API) in the Firebase console.', quota: '*static* I talked too much today: the free limit is reached. Try again later.', offline: 'No internet connection: I can\'t hear a thing, choom.', model: 'No Gemini model available right now. Try again later.', blocked: '*static* My circuits refuse to go there. Ask me something else.', other: '*static* The link dropped. Try again in a moment.' },
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
  heartSmall: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.8"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  slab: '<svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M5 7.5h14"/><rect x="8" y="10" width="8" height="9" rx="1"/></svg>',
  zoom: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
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
const RARITY_HEX = { Common: '#8e96b2', Uncommon: '#6fd38a', Rare: '#5b8cff', Epic: '#b36bff', 'Nova Rare': '#3ad8df', 'Iconic Legend': '#ff9f2e', 'Iconic Other': '#ff5fa2', Secret: '#f5e50b', 'Iconic Secret': '#ffd84a', Exclusive: '#ffd84a' };
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
// langue de l'appli (menus, textes) — choisie dans les Réglages ou avec le bouton 🌐
const UI_LANGS = [['fr', 'Français'], ['en', 'English']];
let lang = UI_LANGS.some(([k]) => k === user.prefs.lang) ? user.prefs.lang : 'fr';
let L = TEXT[lang];
// langue des cartes (bouton FR | EN) : séries imprimées en français ou en anglais, noms et images correspondants
let cardLang = user.prefs.cardLang === 'en' || user.prefs.cardLang === 'fr' ? user.prefs.cardLang : lang;
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
const cardName = (c) => (cardLang === 'en' ? c.nameEn ?? c.name : c.name);
// la carte existe-t-elle dans la langue choisie ? (le scellé est affiché dans les deux)
const inCardLang = (c) => isSealed(c) || !c.languages || c.languages.includes(cardLang);
const setCards = (code) => (cardsBySet.get(code) ?? []).filter(inCardLang);
const setName = (s) => (cardLang === 'en' ? s.nameEn ?? s.name : s.name);
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
  let sealedFile, extraFile;
  get('data/news.json').then((n) => { news = n.items ?? []; newsInit(); if (currentRender === renderNews) renderNews(); }).catch(() => {});
  [catalog, priceFile, config, sealedFile, extraFile] = await Promise.all([get('data/catalog.json'), get('data/prices.json'), get('data/config.json').catch(() => config), get('data/sealed.json').catch(() => ({ items: [] })), get('data/extras.json').catch(() => ({ items: [] }))]);
  // cartes hors séries : prix estimé saisi à la main (pas de cote Cardmarket)
  extras = extraFile.items ?? [];
  for (const c of extras) {
    cardsById.set(c.id, c);
    if (c.price?.value != null && !priceFile.prices[c.id]) priceFile.prices[c.id] = { trend: c.price.value, history: [[c.price.date, c.price.value]], manual: true };
  }
  renderSupportSide();
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
// collection séparée par langue : clé « id » = exemplaires FR, « id@en » = exemplaires EN (le scellé n'a qu'une clé)
const okey = (id, l = cardLang) => {
  const c = cardsById.get(id);
  if (id.includes('@') || isSealed(c ?? {})) return id;
  const eff = c?.languages?.length && !c.languages.includes(l) ? c.languages[0] : l;
  return eff === 'en' ? `${id}@en` : id;
};
const ownedOf = (map, id, l = cardLang) => map?.[okey(id, l)] ?? 0;
const qty = (id, l = cardLang) => ownedOf(user.owned, id, l);
const qtyAll = (id) => (okey(id, 'fr') === okey(id, 'en') ? qty(id) : qty(id, 'fr') + qty(id, 'en'));
// anciennes données (une seule quantité par carte) : les cartes qui n'existent qu'en anglais passent en « @en », le reste reste en FR
function migrateOwned(map) {
  if (!map) return map;
  for (const [k, n] of Object.entries(map)) {
    const c = cardsById.get(k);
    if (!c || isSealed(c) || !c.languages || c.languages.includes('fr')) continue;
    map[`${k}@en`] = Math.max(map[`${k}@en`] ?? 0, n); delete map[k];
  }
  return map;
}
const setOf = (code) => catalog.sets.find((s) => s.code === code);
const setTotal = (s) => setCards(s.code).length;
const ownedIn = (code) => setCards(code).filter((c) => qty(c.id) > 0).length;
const ownedAll = (code) => (cardsBySet.get(code) ?? []).filter((c) => qty(c.id) > 0).length;
const printCode = (code) => setOf(code)?.print ?? code;
const isSealed = (c) => c.kind === 'sealed';
const isExtra = (c) => c?.kind === 'extra';
let extras = [];
const itemCode = (c) => (isSealed(c) ? c.print ?? (c.set ? printCode(c.set) : '') : printCode(c.set));
const allItems = () => [...catalog.cards, ...extras, ...sealed];

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
    const printedIn = cardLang === 'fr' && card.languages?.includes('fr') ? 'fr' : 'en';
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
const imageOf = (c) => (cardLang === 'en' && c.imageEn ? c.imageEn : c.image);

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

const langBtn = () => `<button class="lang-btn" data-action="cardlang" aria-label="${L.cardLanguage}" title="${L.cardLanguage}"><span ${cardLang === 'fr' ? 'class="on"' : ''}>FR</span><span ${cardLang === 'en' ? 'class="on"' : ''}>EN</span></button>`;
const globeBtn = () => `<button class="icon-btn" data-action="language" aria-label="${L.language}" title="${L.language}">${I.globe}</button>`;
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
  setTopbar(`<h1>${L.home}</h1>${withMode ? `<button class="icon-btn" data-action="home-mode" aria-label="${L.toggleView}">${mode === 'grid' ? I.listIcon : I.gridIcon}</button>` : ''}${langBtn()}${newsBtn()}${globeBtn()}<a class="icon-btn capri-btn" href="#capri" aria-label="Capri"><img src="images/capri/avatar.webp" alt=""></a>${accountBtn()}<button class="icon-btn" data-action="settings" aria-label="${L.settings}">${I.gear}</button>`);
}
const homeTabs = (active) => `<div class="seg" role="tablist">${[['home', L.setsTab], ['sealed', L.sealed], ...(extras.some(inCardLang) ? [['extra', L.ex.tab]] : [])].map(([h, l]) => `<button data-nav="${h}" aria-pressed="${active === h}">${l}</button>`).join('')}</div>`;
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
function renderExtra() {
  homeTopbar(false);
  const shown = extras.filter(inCardLang);
  if (!shown.length) { location.hash = '#home'; return; }
  const cats = [...new Set(shown.map((c) => c.category ?? 'other'))];
  view.innerHTML = `<div class="stack">
    ${homeTabs('extra')}
    ${cats.map((cat) => `<h2 class="section-title">${esc(L.ex.cats[cat] ?? L.ex.cats.other)}</h2><p class="note" style="margin:-6px 0 0">${esc(L.ex.catHint[cat] ?? '')}</p>
      <div class="cards">${shown.filter((c) => (c.category ?? 'other') === cat).map(cardTile).join('')}</div>`).join('')}
    <p class="note">${L.ex.note}</p>
  </div>`;
}
function renderHome() {
  homeTopbar(true);
  const mode = user.prefs.homeMode;
  const q = homeQuery.trim().toLowerCase();
  const hidden = catalog.sets.filter((s) => (cardsBySet.get(s.code) ?? []).length && !setTotal(s)).length;
  const sets = [...catalog.sets]
    .filter((s) => setTotal(s) > 0 || !(cardsBySet.get(s.code) ?? []).length)
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
    ${installBanner()}
    ${homeTabs('home')}
    <input class="search" id="setSearch" type="search" placeholder="${L.searchSet}" value="${esc(homeQuery)}" autocomplete="off">
    ${body || `<div class="empty"><strong>${L.noSet}</strong></div>`}
    ${hidden ? `<p class="note lang-note">${L.hiddenSets(hidden, cardLang)} <button class="link-btn" data-action="cardlang">${L.showOther(cardLang === 'fr' ? 'en' : 'fr')}</button></p>` : ''}
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

// recherche dans une série : nom FR/EN, numéro, rareté (sans accents ni majuscules)
let setQuery = '', setQueryCode = '';
const fold = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function matchQuery(c, q) {
  if (!q) return true;
  const hay = fold([c.name, c.nameEn, c.number, rarityLabel(c.rarity), typeLabel(c.type)].join(' '));
  return fold(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}
function renderSet(code) {
  const s = setOf(code);
  if (!s) { location.hash = '#home'; return; }
  if (setQueryCode !== code) { setQueryCode = code; setQuery = ''; }
  const all = setCards(code);
  const list = sortCards(filterCards(all).filter((c) => matchQuery(c, setQuery)), user.prefs.sort);
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
    <input class="search" id="setCardSearch" type="search" placeholder="${L.searchInSet}" value="${esc(setQuery)}" autocomplete="off" enterkeyhint="search">
    <div class="toolbar num">
      <span>${L.owned(ownedIn(code), setTotal(s))}</span><span class="grow"></span>
      ${hasPrices() ? `<span>${L.myValue} : <b style="color:var(--fg)">${eur(value)}</b></span>` : `<span>${L.pricesSoon}</span>`}
    </div>
    ${!all.length && (cardsBySet.get(code) ?? []).length ? `<div class="empty"><strong>${L.noCardsLang(cardLang)}</strong><button class="btn-ghost" data-action="cardlang">${L.showOther(cardLang === 'fr' ? 'en' : 'fr')}</button></div>` : cardsBlock(list, user.prefs.setMode)}
    <p class="note num">${L.setNote(L.sorts[user.prefs.sort], list.length, hasPrices() ? eur(full) : '')}</p>
  </div>`;
}

let colSet = '';
function renderCollection() {
  setTopbar(`<h1>${L.myCollection}</h1>${langBtn()}${cloud.enabled ? `<a class="chip friends-chip" href="#friends">${L.fr.title}<span class="fbadge" data-friends-badge ${fr.requests.length ? '' : 'hidden'}>${fr.requests.length || ''}</span></a>` : ''}`);
  const owned = [...catalog.cards, ...extras.filter(inCardLang)].filter((c) => qty(c.id) > 0);
  const ownedSealed = sealed.filter((s) => qty(s.id) > 0);
  if (!owned.length && !ownedSealed.length) {
    view.innerHTML = `<div class="stack">${colTabs('collection')}<div class="empty"><strong>${L.emptyCol}</strong>${L.emptyColHint}<a class="btn-ghost" href="#home" style="text-decoration:none">${L.browseSets}</a></div></div>`;
    return;
  }
  const total = owned.reduce((a, c) => a + qty(c.id), 0);
  const value = [...owned, ...ownedSealed].reduce((a, c) => a + qty(c.id) * (price(c.id) ?? 0), 0);
  const sealedQty = ownedSealed.reduce((a, s) => a + qty(s.id), 0);
  const withPaid = [...owned, ...ownedSealed].filter((c) => paidOf(c.id) != null);
  const paidTot = withPaid.reduce((a, c) => a + qty(c.id) * paidOf(c.id), 0);
  const diffTot = withPaid.reduce((a, c) => a + (paidDiff(c.id)?.diff ?? 0), 0);
  const sets = [...catalog.sets].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).filter((s) => ownedAll(s.code) > 0);
  const shown = colSet === '__sealed' ? [] : sortCards(owned.filter((c) => !colSet || c.set === colSet), 'price-desc');
  const sealedShown = !colSet || colSet === '__sealed' ? ownedSealed : [];
  view.innerHTML = `<div class="stack">
    ${colTabs('collection')}
    <div class="kpis">
      <div class="stat"><small>${L.kCards}</small><b class="num">${total}</b></div>
      <div class="stat"><small>${L.kUnique}</small><b class="num">${owned.length}</b></div>
      <div class="stat"><small>${L.kValue}</small><b class="num">${eur(value)}</b></div>
    </div>
    ${withPaid.length ? `<p class="note num paid-sum">${L.paidSum(withPaid.length, eur(paidTot))} · ${diffHtml({ diff: diffTot, pct: paidTot ? diffTot / paidTot : null })}</p>` : ''}
    <div class="chips"><button class="chip" data-colset="" aria-pressed="${!colSet}">${L.all}</button>${ownedSealed.length ? `<button class="chip" data-colset="__sealed" aria-pressed="${colSet === '__sealed'}">${L.sealed} · ${sealedQty}</button>` : ''}${sets.map((s) => `<button class="chip" data-colset="${esc(s.code)}" aria-pressed="${colSet === s.code}">${esc(s.print ?? s.code)} · ${ownedAll(s.code)}</button>`).join('')}</div>
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
  setTopbar(`<h1>${L.search}</h1><button class="chip scan-chip" data-action="scan">${I.camera}<span>${L.scan.btn}</span></button>`);
  const q = searchQuery.trim().toLowerCase();
  const res = q.length < 2 ? [] : allItems().filter(inCardLang).filter((c) => [c.name, c.nameEn, `${itemCode(c)} ${c.number ?? ''}`, `${c.set} ${c.number ?? ''}`].some((x) => String(x ?? '').toLowerCase().includes(q)));
  view.innerHTML = `<div class="stack">
    <input class="search" id="cardSearch" type="search" placeholder="${L.searchPh}" value="${esc(searchQuery)}" autocomplete="off">
    <div id="searchResults">${q.length < 2 ? `<p class="note">${L.searchHint(catalog.cards.length, catalog.sets.length)}</p>`
      : res.length ? `<p class="note">${L.results(res.length)}</p><div class="rows">${sortCards(res, 'price-desc').slice(0, 150).map((c) => cardRow(c)).join('')}</div>`
      : `<div class="empty"><strong>${L.noResult}</strong></div>`}</div>
  </div>`;
}

function portfolioSeries() {
  const owned = allItems().filter((c) => qtyAll(c.id) > 0 && P(c.id)?.history?.length);
  if (!owned.length) return [];
  // la courbe commence quand toutes les cartes possédées ont un prix (sinon faux saut depuis 0 €)
  const start = owned.reduce((m, c) => (P(c.id).history[0][0] > m ? P(c.id).history[0][0] : m), '');
  const days = new Set();
  for (const c of owned) for (const [d] of P(c.id).history) if (d >= start) days.add(d);
  return [...days].sort().map((d) => [d, Math.round(owned.reduce((a, c) => a + qtyAll(c.id) * (valueAt(P(c.id).history, d) ?? 0), 0) * 100) / 100]);
}
function renderValues() {
  setTopbar(`<h1>${L.market}</h1>`);
  const owned = allItems().filter((c) => qtyAll(c.id) > 0);
  const value = owned.reduce((a, c) => a + qtyAll(c.id) * (price(c.id) ?? 0), 0);
  const priced = allItems().filter((c) => inCardLang(c) && (price(c.id) ?? 0) >= 0.5);
  const movers = priced.map((c) => [c, change(c.id, 7)]).filter(([, v]) => v != null && v !== 0);
  const ups = [...movers].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const downs = [...movers].filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const top = sortCards(catalog.cards.filter((c) => inCardLang(c) && price(c.id) != null), 'price-desc').slice(0, 10);
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
  const enOnly = cardLang === 'fr' && c.languages && !c.languages.includes('fr');
  const sealedItem = isSealed(c);
  sheetPanel.innerHTML = `${sheetTop(navList.length > 1)}
    <div class="stack detail">
      <div class="detail-top ${sealedItem ? 'is-sealed' : ''}" ${rarityStyle(c.rarity)}>
        <button class="card-img zoomable" data-zoom ${c.hd ? `data-hd="${esc(c.hd)}"` : ''} aria-label="${L.zoom}">${cardImg(c, true)}${c.pack ? `<span class="pack-badge num">×${c.pack}</span>` : ''}<span class="zoom-hint">${I.zoom}</span></button>
        <div class="detail-info">
          <h2 id="sheetTitle">${esc(cardName(c))}</h2>
          ${sealedItem
            ? `<div class="sub">${esc(L.catOne[c.category] ?? '')}${itemCode(c) ? `<br><b class="print">${esc(itemCode(c))}</b>${s ? ` · ${esc(setName(s))}` : ''}` : ''}</div>`
            : isExtra(c) ? `<div class="sub">${esc(L.ex.cats[c.category] ?? L.ex.cats.other)}<br><span class="num"><b class="print">EXTRA</b> · ${esc(c.number ?? '')}</span></div>`
            : `<div class="sub">${esc(s ? setName(s) : c.set)}<br><span class="num"><b class="print">${esc(printCode(c.set))}</b> · ${esc(c.number)}/${s?.total ?? cardsBySet.get(c.set)?.length ?? 0}</span></div>`}
          ${c.rarity ? `<span class="rarity" ${rarityStyle(c.rarity)}>${esc(rarityLabel(c.rarity))}${c.type ? ` · ${esc(typeLabel(c.type))}` : ''}${c.color ? ` · ${esc(colorLabel(c.color))}` : ''}</span>` : ''}
          ${stats ? `<span class="sub num">${stats}</span>` : ''}
          ${enOnly ? `<span class="sub">${L.enOnly}</span>` : ''}
          ${!sealedItem && okey(id, 'fr') !== okey(id, 'en') && qty(id, cardLang === 'fr' ? 'en' : 'fr') ? `<span class="sub other-copies">${L.otherCopies(qty(id, cardLang === 'fr' ? 'en' : 'fr'), cardLang === 'fr' ? 'EN' : 'FR')}</span>` : ''}
          <div class="big-price num"><small>${isExtra(c) ? L.ex.estimate : L.trend}${p.foil ? ` · <span class="foil">${L.foil}</span>` : ''}</small>${p.trend != null ? eur(p.trend) : `<span style="font-size:18px;color:var(--muted)">${L.noPrice}</span>`}</div>
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
      ${q > 0 ? `<div class="paid-line">
        <label for="cardPaid">${L.paidLabel}</label>
        <input id="cardPaid" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0,00" value="${paidOf(id) ?? ''}" data-paid-id="${esc(id)}">
        <span class="paid-diff num" id="paidDiff">${paidOf(id) != null ? (p.trend != null ? `${L.paidVs} ${diffHtml(paidDiff(id))}` : L.noPrice) : `<span class="muted">${L.paidHint}</span>`}</span>
      </div>` : ''}
      ${p.trend != null && !isExtra(c) ? `<div class="stats">
        <div class="stat"><small>${L.from}</small><b class="num">${eur(p.low)}</b></div>
        <div class="stat"><small>${L.avg7}</small><b class="num">${eur(p.avg7)}</b></div>
        <div class="stat"><small>${L.avg30}</small><b class="num">${eur(p.avg30)}</b></div>
      </div>` : ''}
      <section class="panel" ${isExtra(c) ? 'hidden' : ''}>
        <h3>${L.curve} <small>Cardmarket${priceFile.updatedAt ? ` · ${fmt.date.format(parseDay(priceFile.updatedAt))}` : ''}</small></h3>
        <div class="ranges" id="cardRanges"></div>
        <div class="chart" id="cardChart"></div>
        ${p.seeded && (p.history?.length ?? 0) > 1 ? `<p class="note">${L.seeded}</p>` : ''}
      </section>
      ${isExtra(c) ? `${c.origin ? `<p class="note extra-origin">★ ${esc(c.origin[lang] ?? c.origin.en)}</p>` : ''}
      ${c.price ? `<p class="note num">${L.ex.priceNote(eur(c.price.value), fmt.date.format(parseDay(c.price.date)), c.price.source)}</p>` : ''}
      <a class="cta" href="https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(`cyberpunk ${c.ebay ?? c.nameEn}`)}" target="_blank" rel="noopener">${L.ex.ebayLive} ${I.ext}</a>
      <a class="btn-ghost" style="text-align:center;text-decoration:none" href="https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(`cyberpunk ${c.ebay ?? c.nameEn}`)}&LH_Sold=1&LH_Complete=1" target="_blank" rel="noopener">${L.ex.ebaySold}</a>`
      : `<a class="cta" href="${esc(cm.url)}" target="_blank" rel="noopener">${cm.exact ? L.cmView : L.cmSearch} ${I.ext}</a>`}
      ${sealedItem ? '' : `<button class="btn-ghost" data-action="g-add-card" data-id="${esc(id)}">${I.slab}<span>${L.gr.addThis}${user.graded.some((e) => e.id === id) ? ` · ${L.gr.youHave(user.graded.filter((e) => e.id === id).length)}` : ''}</span></button>`}
      ${c.official ? `<a class="btn-ghost" style="text-align:center;text-decoration:none" href="${esc(c.official)}" target="_blank" rel="noopener">${L.official}</a>` : ''}
      ${q > 0 && p.trend ? `<p class="note num" style="text-align:center">${L.worth(q, eur(q * p.trend))}${paidOf(id) != null ? ` · ${L.boughtFor(eur(q * paidOf(id)))}` : ''}</p>` : ''}
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
  sheet.hidden = true; openId = null; sheetMode = null; gForm = null; gOpen = null;
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
    <div class="panel" id="langPanel"><h3>${I.globe}${L.language}</h3>${seg('lang', lang, UI_LANGS)}<p class="note" style="margin:0">${L.langHint}</p></div>
    <div class="panel"><h3>${L.cardLanguage}</h3>${seg('cardLang', cardLang, [['fr', 'FR · Français'], ['en', 'EN · English']])}<p class="note" style="margin:0">${L.cardLangHint}</p></div>
    <div class="panel"><h3>${L.petSetting}</h3>${seg('pet', user.prefs.pet === 'off' ? 'off' : 'on', [['on', L.yes], ['off', L.no]])}<p class="note" style="margin:0">${L.petHint}</p></div>
    <p class="note">${L.storage(Object.keys(user.owned).length, wish.size)}</p>
    <div class="menu">
      <button class="btn-ghost" data-action="export">${L.export}</button>
      <label class="btn-ghost" for="importFile">${L.import}</label>
      <input id="importFile" type="file" accept="application/json,.json" hidden>
      <textarea id="exportBox" class="search" rows="4" hidden readonly></textarea>
    </div>
    <p class="note">${L.dataLine(catalog.cards.length, catalog.sets.length, priceFile.updatedAt ? fmt.date.format(parseDay(priceFile.updatedAt)) : '—')}</p>
    ${canInstall() ? `<div class="panel"><h3>${L.inst.title}</h3><p class="note" style="margin:0">${installEvt ? L.inst.pitch : L.inst.ios}</p>${installEvt ? `<button class="cta" data-action="install">${L.inst.btn}</button>` : ''}</div>` : ''}
    ${supportUrl() ? `<div class="support-row">${supportLink()}<span class="note">${L.supportHint}</span></div>` : ''}
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
  user.owned = migrateOwned({ ...(d.owned ?? {}) });
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
  cloud.supporter = false; cloud.avatar = null;
  gOnUser(u); dOnUser(u);
  if (!u) { cloud.status = 'off'; friendsStop(); renderChromeBadges(); refreshAccount(); if (currentRender === renderFriends || currentRender === renderFriendCurrent) currentRender(); return; }
  cloud.status = 'syncing'; refreshAccount();
  const { fsM } = cloud.api;
  loadProfile(u.uid);
  friendsInit(u.uid);
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

const accountBtn = () => (cloud.enabled ? `<button class="icon-btn acct-btn ${cloud.user ? `signed on-${cloud.status}` : ''} ${cloud.supporter ? 'is-supporter' : ''}" data-action="account" aria-label="${L.account}">${cloud.user && cloud.avatar ? `<img class="acct-avatar" src="${esc(cloud.avatar)}" alt="">` : I.person}</button>` : '');

// ---------- Soutien : statut (activé par le propriétaire dans la console Firebase) et photo de profil ----------
// supporters/<uid> { active: true } : lisible par le compte, modifiable seulement depuis la console (règles Firestore).
// profiles/<uid> { avatar } : petite image (160 px) réservée aux soutiens actifs.
const supportUrl = () => config.support?.url || '';
// Administrateurs : liste dans data/config.json (affichage du panneau) ; la vraie protection est dans firestore.rules
const isAdmin = () => !!cloud.user && (config.admins ?? []).includes(cloud.user.uid);
const admin = { list: null, busy: false, msg: '' };
async function adminLoad() {
  try {
    const snap = await fsx().getDocs(cref('supporters'));
    admin.list = await Promise.all(snap.docs.filter((d) => d.data().active === true).map(async (d) => ({ uid: d.id, pseudo: (await friendName(d.id)).pseudo })));
  } catch (e) { admin.list = []; admin.msg = e?.code === 'permission-denied' ? L.adm.denied : L.fr.error; }
  if (sheetMode === 'account' && !sheet.hidden) openAccount(true);
}
async function adminSet(uid, on) {
  uid = String(uid ?? '').trim();
  if (!/^[A-Za-z0-9]{20,40}$/.test(uid)) { admin.msg = L.adm.badId; openAccount(true); return; }
  admin.busy = true; admin.msg = ''; openAccount(true);
  try {
    if (on) await fsx().setDoc(dref('supporters', uid), { active: true, since: fsx().serverTimestamp() });
    else await fsx().deleteDoc(dref('supporters', uid));
    toast(on ? L.adm.on : L.adm.off);
    if (uid === cloud.user.uid) { cloud.supporter = on; refreshAccount(); }
  } catch (e) { admin.msg = e?.code === 'permission-denied' ? L.adm.denied : L.fr.error; }
  admin.busy = false;
  await adminLoad();
}
function adminPanel() {
  if (!isAdmin()) return '';
  if (admin.list === null) { admin.list = []; adminLoad(); }
  return `<div class="panel admin-panel">
    <h3>${L.adm.title}<small>${L.adm.role}</small></h3>
    <form class="inline-form" id="adminForm"><input class="search" id="adminId" autocomplete="off" placeholder="${L.adm.idPh}"><button class="cta" ${admin.busy ? 'disabled' : ''}>${L.adm.activate}</button></form>
    ${admin.msg ? `<p class="form-err">${esc(admin.msg)}</p>` : ''}
    <span class="note">${L.adm.listTitle} (${admin.list.length})</span>
    ${admin.list.map((a) => `<div class="id-row"><b>${a.pseudo !== '?' ? '@' + esc(a.pseudo) : '—'}</b><code>${esc(a.uid)}</code><button class="chip" data-admin-off="${esc(a.uid)}">${L.adm.remove}</button></div>`).join('') || `<span class="note">${L.adm.none}</span>`}
  </div>`;
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'adminForm') return;
  e.preventDefault();
  adminSet(document.getElementById('adminId').value, true);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-admin-off]');
  if (b) adminSet(b.dataset.adminOff, false);
});
async function loadProfile(uid) {
  const { fsM, db } = cloud.api;
  try { const s = await fsM.getDoc(fsM.doc(db, 'supporters', uid)); if (cloud.user?.uid === uid) cloud.supporter = s.exists() && s.data().active === true; } catch { /* pas de statut */ }
  try { const p = await fsM.getDoc(fsM.doc(db, 'profiles', uid)); if (cloud.user?.uid === uid) cloud.avatar = p.exists() ? p.data().avatar ?? null : null; } catch { /* pas de photo */ }
  refreshAccount();
}
function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 160, c = document.createElement('canvas');
      c.width = size; c.height = size;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      let url = c.toDataURL('image/webp', 0.82);
      if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.82);
      resolve(url);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
async function saveAvatar(file) {
  const { fsM, db } = cloud.api;
  try {
    const url = await resizeAvatar(file);
    await fsM.setDoc(fsM.doc(db, 'profiles', cloud.user.uid), { avatar: url, updatedAt: fsM.serverTimestamp() });
    cloud.avatar = url; toast(L.avatarSaved);
  } catch (e) { toast(e?.code === 'permission-denied' ? L.avatarDenied : L.avatarErr); }
  refreshAccount();
}
const supportLink = (cls = 'support-link') => (supportUrl() ? `<a class="${cls}" href="${esc(supportUrl())}" target="_blank" rel="noopener">${I.heartSmall}<span>${L.support}</span></a>` : '');
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
      <div class="panel profile-panel ${cloud.supporter ? 'is-supporter' : ''}">
        <div class="profile-row">
          <span class="profile-avatar">${cloud.avatar ? `<img src="${esc(cloud.avatar)}" alt="">` : I.person}</span>
          <div class="profile-text">
            <strong>${L.avatar}${cloud.supporter ? ` <span class="supporter-badge">♥ ${L.supporter}</span>` : ''}</strong>
            <span class="note">${cloud.supporter ? L.supporterThanks : L.avatarLocked}</span>
          </div>
        </div>
        ${cloud.supporter ? `<div class="profile-actions">
          <label class="btn-ghost" for="avatarFile">${cloud.avatar ? L.avatarChange : L.avatarAdd}</label>
          <input id="avatarFile" type="file" accept="image/*" hidden>
          ${cloud.avatar ? `<button class="btn-ghost" data-action="avatar-remove">${L.avatarRemove}</button>` : ''}
        </div>` : supportLink('btn-ghost support-btn')}
        <div class="id-row"><span class="note">${L.myId} :</span><code id="myId">${esc(u.uid)}</code><button class="chip" data-action="copy-id">${L.copy}</button></div>
        ${cloud.supporter ? '' : `<span class="note">${L.myIdHint}</span>`}
      </div>
      ${adminPanel()}
      <a class="btn-ghost" style="text-align:center;text-decoration:none" href="#friends" data-close>${L.fr.mine}${fr.requests.length ? ` · ${L.fr.requests} (${fr.requests.length})` : ''}</a>
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
// modèles testés le 13/11/2026 : les 2.x ne sont plus ouverts aux nouveaux projets ; liste modifiable dans data/firebase.json (capriModels)
const CAPRI_MODELS_DEFAULT = ['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
const CAPRI_TIMEOUT = 25000; // abandon si aucune réponse n'arrive dans ce délai
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
- Tu sais aussi que la personne collectionne les cartes du Cyberpunk TCG dans NightDex ; tu peux la taquiner là-dessus.
- Quand un bloc « DONNÉES NIGHTDEX » accompagne son message, c'est la vraie base de cartes de l'appli : sers-t'en pour répondre précisément (dans quelle série et quel produit trouver la carte, numéro, rareté, langues, prix Cardmarket, si la personne l'a déjà ou la cherche, articles officiels qui en parlent). Reste dans ton personnage, mais donne les infos clairement. Ne recopie pas le bloc tel quel, et précise que les prix bougent.
- Sans ce bloc, tu ne connais ni les prix ni sa collection : ne les invente jamais. Si la carte demandée n'est pas dans le bloc, dis que tu ne la trouves pas dans la base et propose de vérifier le nom.`;
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
  // historique propre pour Gemini : tours alternés toi / Capri, sans les erreurs ni les questions restées sans réponse
  const clean = [];
  for (const t of capri.turns) {
    if (t.err) { if (clean.at(-1)?.role === 'user') clean.pop(); continue; }
    if (clean.at(-1)?.role === t.role) clean[clean.length - 1] = t; else clean.push(t);
  }
  const turns = clean.slice(-20);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  const last = turns.pop();
  const history = turns.map((t) => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] }));
  let lastErr = null;
  const t0 = Date.now();
  for (let i = capri.modelIdx; i < models.length; i++) {
    const name = models[i];
    const ctl = new AbortController();
    capri.ctl = ctl;
    let first = false;
    const timer = setTimeout(() => { if (!first) ctl.abort(); }, CAPRI_TIMEOUT);
    try {
      const model = aiM.getGenerativeModel(ai, {
        model: name, systemInstruction: capriInstruction(),
        generationConfig: { maxOutputTokens: 900, temperature: 0.9 },   // marge pour les modèles qui réfléchissent avant de répondre
      });
      const res = await model.startChat({ history }).sendMessageStream(last.content + (capri.ctx ?? ''), { signal: ctl.signal, timeout: CAPRI_TIMEOUT + 5000 });
      let text = '';
      for await (const chunk of res.stream) {
        first = true;
        if (capri.stop) break;
        try { text += chunk.text(); } catch { /* morceau sans texte (filtre) */ }
        onText(text);
      }
      clearTimeout(timer);
      capri.modelIdx = i;
      return text;
    } catch (e) {
      clearTimeout(timer);
      if (capri.stop) throw Object.assign(new Error('stopped'), { code: 'stopped' });
      const st = e?.customErrorData?.status;
      const timedOut = ctl.signal.aborted && !first;
      if (timedOut) lastErr = Object.assign(new Error(`aucune réponse de ${name} en ${CAPRI_TIMEOUT / 1000} s`), { code: 'timeout' });
      // modèle lent, retiré, inconnu ou qui refuse la requête : on essaie le suivant (sans dépasser ~55 s au total)
      // surcharge passagère chez Google (500/502/503 « high demand ») : un autre modèle est souvent disponible
      const busy = [500, 502, 503].includes(st) || /high demand|overloaded|UNAVAILABLE|try again later/i.test(e?.message ?? '');
      if ((timedOut || busy || st === 404 || st === 400 || /not found|is not supported/i.test(e?.message ?? '')) && Date.now() - t0 < 30000) { lastErr ??= e; if (!timedOut) lastErr = e; continue; }
      throw timedOut ? lastErr : e;
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
  else if ([500, 502, 503].includes(st) || /high demand|overloaded|UNAVAILABLE/i.test(msg)) text = L.capriErr.busy;
  else if (!navigator.onLine || (!st && /Failed to fetch|NetworkError|Load failed|network/i.test(msg))) text = L.capriErr.offline;
  else if (st === 403 || /PERMISSION_DENIED|API key|API_KEY|referer/i.test(msg)) text = L.capriErr.denied;
  else if (/location is not supported|not available in your country|region/i.test(msg)) text = L.capriErr.region;
  else if (e?.code === 'no-model') text = L.capriErr.model;
  else if (e?.code === 'timeout') text = L.capriErr.timeout;
  else if (/block|safety|SAFETY/i.test(msg)) text = L.capriErr.blocked;
  else text = L.capriErr.other;
  const detail = [e?.code, st].filter(Boolean).join(' · ') + (msg ? ` — ${msg.replace(/^.*?\] /, '').slice(0, 220)}` : '');
  return { text, detail };
}
const capriFmt = (t) => esc(t).replace(/\*([^*\n]{1,120})\*/g, '<em>$1</em>');
function capriBubble(t, i) {
  const me = t.role === 'user';
  const cards = (t.cards ?? []).map((id) => cardsById.get(id)).filter(Boolean);
  return `<div class="cmsg ${me ? 'me' : 'capri'}">${me ? '' : '<img class="cmini" src="images/capri/avatar.webp" alt="">'}<div class="cbubble${t.err ? ' err' : ''}">${capriFmt(t.content)}${t.detail ? `<small class="cdetail">${esc(t.detail)}</small>` : ''}${cards.length ? `<span class="ccards">${cards.map((c) => `<button class="ccard" data-open="${esc(c.id)}"><img src="${esc(imageOf(c) || placeholderArt(c))}" alt="" loading="lazy"><span>${esc(isExtra(c) ? 'EXTRA' : printCode(c.set))} ${esc(c.number)}</span></button>`).join('')}</span>` : ''}</div></div>`;
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

// ---------- Capri connaît la base de NightDex : cartes, séries, prix, collection, actualités ----------
const CAPRI_ALIASES = { lucy: 'lucyna', becca: 'rebecca', smasher: 'adam smasher', silverhand: 'johnny silverhand', panam: 'panam palmer', judy: 'judy alvarez', kiwi: 'kiwi', dex: 'dexter deshawn', takemura: 'goro takemura', yorinobu: 'yorinobu arasaka', saburo: 'saburo arasaka', hanako: 'hanako arasaka', maine: 'maine', dorio: 'dorio', pilar: 'pilar', falco: 'falco', faraday: 'faraday', kerry: 'kerry eurodyne', river: 'river ward', viktor: 'viktor vektor', misty: 'misty olszewski', evelyn: 'evelyn parker', rogue: 'rogue', alt: 'alt cunningham' };
const CAPRI_STOP = new Set(['carte', 'cartes', 'card', 'cards', 'trouve', 'trouver', 'find', 'where', 'est', 'elle', 'quelle', 'quel', 'combien', 'prix', 'price', 'coute', 'vaut', 'dans', 'pour', 'avec', 'une', 'des', 'les', 'the', 'and', 'what', 'how', 'much', 'which', 'serie', 'set', 'booster', 'promo', 'est-ce', 'que', 'qui', 'moi', 'mon', 'ma', 'mes', 'tes', 'ton', 'peux', 'tu', 'je', 'il', 'on', 'ou', 'quoi', 'comment', 'plus', 'chere', 'cher', 'rare', 'jai', 'pas', 'deja', 'bien', 'stp', 'please', 'capri', 'salut', 'hello', 'merci', 'dis', 'sais', 'veux']);
const OBTAIN = {
  wnc: { fr: 'boosters et produits de Welcome to Night City (série principale, en boutique)', en: 'Welcome to Night City boosters and products (main set, in stores)' },
  op: { fr: 'jeu organisé et promos : récompenses de tournois et d\'événements en boutique, ou promos spéciales', en: 'organised play and promos: tournament and store event prizes, or special promos' },
  beta: { fr: 'version bêta envoyée aux contributeurs Kickstarter (anglais uniquement)', en: 'beta version shipped to Kickstarter backers (English only)' },
  demo: { fr: 'decks de démonstration (anglais uniquement)', en: 'demo decks (English only)' },
};
function capriContext(text) {
  if (!catalog?.cards) return { ctx: '', ids: [] };
  let q = ` ${fold(text).replace(/[^a-z0-9]+/g, ' ')} `;
  for (const [a, full] of Object.entries(CAPRI_ALIASES)) if (q.includes(` ${a} `)) q += ` ${full} `;
  const words = [...new Set(q.split(' ').filter((w) => w.length >= 3 && !CAPRI_STOP.has(w)))];
  if (!words.length) return { ctx: '', ids: [] };
  // score par nom de carte (toutes éditions confondues) : mots de la question présents dans le nom
  const byName = new Map();
  for (const c of [...catalog.cards, ...extras]) {
    const k = c.nameEn ?? c.name;
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(c);
  }
  const scored = [];
  for (const [k, prints] of byName) {
    const hay = ` ${fold(`${prints[0].name} ${k}`).replace(/[^a-z0-9]+/g, ' ')} `;
    const hits = words.filter((w) => hay.includes(` ${w}`)).length;
    if (hits) scored.push([hits + (hay.includes(` ${words.join(' ')}`) ? 1 : 0), k, prints]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  const best = scored.length ? scored[0][0] : 0;
  const top = scored.filter(([sc]) => sc === best).slice(0, 5);
  const lines = [];
  const ids = [];
  for (const [, k, prints] of top) {
    const p0 = prints[0];
    lines.push(`• ${p0.name}${p0.nameEn && p0.nameEn !== p0.name ? ` (EN : ${p0.nameEn})` : ''} — ${typeLabel(p0.type)}, ${colorLabel(p0.color)}${p0.cost != null ? `, coût ${p0.cost}` : ''}, RAM ${p0.ram ?? 0}`);
    for (const c of prints.slice(0, 8)) {
      const st = setOf(c.set);
      const how = isExtra(c) ? (c.origin?.[lang] ?? c.origin?.en ?? '') : (OBTAIN[st?.block]?.[lang] ?? '');
      const pr = price(c.id);
      const own = qtyAll(c.id);
      lines.push(`   - ${isExtra(c) ? 'EXTRA' : (st?.print ?? c.set)} ${c.number} · ${isExtra(c) ? '' : `${st ? setName(st) : c.set} · `}${rarityLabel(c.rarity)} · langues : ${(c.languages ?? []).join('/').toUpperCase() || '?'} · ${pr != null ? `prix ${isExtra(c) ? 'estimé eBay' : 'Cardmarket'} ${eur(pr)}` : 'pas de prix'}${how ? ` · obtention : ${how}` : ''}${own ? ` · la personne en a ${own}` : ''}${wish.has(c.id) ? ' · dans ses souhaits' : ''}`);
    }
    // une vignette par carte : l'édition dans la langue choisie, de préférence celle que la personne possède
    const pick = prints.find((c) => qtyAll(c.id) && inCardLang(c)) ?? prints.find(inCardLang) ?? prints[0];
    if (ids.length < 6) ids.push(pick.id);
  }
  // articles officiels qui en parlent (ex. promo offerte)
  const nameWords = new Set(top.flatMap(([, k]) => fold(k).split(/[^a-z0-9]+/).filter((w) => w.length >= 4)));
  const terms = words.filter((w) => w.length >= 4 && (nameWords.has(w) || CAPRI_ALIASES[w] || !top.length));
  const arts = news.filter((n) => { const h = ` ${fold(`${n.title} ${n.excerpt}`).replace(/[^a-z0-9]+/g, ' ')} `; return terms.some((w) => h.includes(` ${w}`)); }).slice(0, 3);
  if (!lines.length && !arts.length) return { ctx: '', ids: [] };
  const block = [
    '', '', '--- DONNÉES NIGHTDEX (base de l\'appli, pour t\'aider à répondre ; la personne ne voit pas ce bloc) ---',
    ...(lines.length ? ['Cartes trouvées :', ...lines] : ['Aucune carte trouvée avec ces mots.']),
    ...(arts.length ? ['Articles officiels liés :', ...arts.map((n) => `• ${n.date ?? ''} « ${n.title} » : ${n.excerpt} (${n.url})`)] : []),
    '--- fin des données ---',
  ].join('\n');
  return { ctx: block, ids };
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
  const tStart = Date.now();
  let gotText = false;
  const tick = setInterval(() => {
    const el = document.querySelector('#capriLive .ctyping');
    if (el && !gotText) el.textContent = `${L.capriTyping} · ${Math.round((Date.now() - tStart) / 1000)} s`;
  }, 1000);
  const look = capriContext(text);
  capri.ctx = look.ctx;
  try {
    const answer = await capriAsk((t) => { gotText = true; const el = document.querySelector('#capriLive .cbubble'); if (el) { el.innerHTML = capriFmt(t); el.scrollIntoView({ block: 'end' }); } });
    capri.turns.push({ role: 'model', content: (answer || '…') + (capri.stop ? ' …' : ''), ...(look.ids.length ? { cards: look.ids } : {}) });
  } catch (e) {
    capri.turns.pop();
    if (e?.code === 'stopped') { clearInterval(tick); capri.busy = false; capriSave(); if (currentRender === renderCapri) renderCapri(); return; }
    const ce = capriError(e);
    capri.turns.push({ role: 'user', content: text }, { role: 'model', content: ce.text, detail: ce.detail, err: true });
    console.warn('Capri', e);
  }
  clearInterval(tick);
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
  const a = e.target.closest('[data-ask],[data-capri]');
  if (!a) return;
  if (a.dataset.ask) capriSend(a.dataset.ask);
  else if (a.dataset.capri === 'spoil') { capri.spoilers = !capri.spoilers; capriSave(); renderCapri(); }
  else if (a.dataset.capri === 'reset') { capri.stop = true; capri.ctl?.abort(); capri.turns = []; capri.busy = false; capriSave(); renderCapri(); }
  else if (a.dataset.capri === 'stop') { capri.stop = true; capri.ctl?.abort(); }
});

// ---------- Amis : pseudo, demandes, liste d'amis et collection d'un ami ----------
// Firestore : handles/<pseudo> {uid} (pseudo unique), publicProfiles/<uid> {pseudo},
// friendRequests/<destinataire>/from/<expéditeur> {pseudo, at}, friends/<uid>/list/<ami> {since}.
// Les règles Firestore n'autorisent la lecture d'une collection qu'aux amis acceptés.
const PSEUDO_RE = /^[a-z0-9_.-]{3,20}$/;
const fr = { me: null, list: [], requests: [], unsub: [], names: new Map(), view: null, filter: 'all', busy: false, msg: '', confirmRemove: null };
const fsx = () => cloud.api.fsM;
const dref = (...p) => fsx().doc(cloud.api.db, ...p);
const cref = (...p) => fsx().collection(cloud.api.db, ...p);
async function friendName(uid) {
  if (fr.names.has(uid)) return fr.names.get(uid);
  let info = { pseudo: '?', avatar: null };
  try { const s = await fsx().getDoc(dref('publicProfiles', uid)); if (s.exists()) info.pseudo = s.data().pseudo; } catch { /* inconnu */ }
  fr.names.set(uid, info);
  return info;
}
function friendsStop() { fr.unsub.forEach((f) => f?.()); fr.unsub = []; fr.me = null; fr.list = []; fr.requests = []; fr.view = null; }
async function friendsInit(uid) {
  friendsStop();
  try { const s = await fsx().getDoc(dref('publicProfiles', uid)); fr.me = s.exists() ? s.data() : null; } catch { fr.me = null; }
  const refresh = () => { renderChromeBadges(); if (currentRender === renderFriends) renderFriends(); };
  fr.unsub.push(fsx().onSnapshot(cref('friends', uid, 'list'), async (snap) => {
    fr.list = await Promise.all(snap.docs.map(async (d) => ({ uid: d.id, ...(await friendName(d.id)) })));
    fr.list.sort((a, b) => a.pseudo.localeCompare(b.pseudo));
    refresh();
  }, () => {}));
  fr.unsub.push(fsx().onSnapshot(cref('friendRequests', uid, 'from'), (snap) => {
    fr.requests = snap.docs.map((d) => ({ uid: d.id, pseudo: d.data().pseudo ?? '?' }));
    refresh();
  }, () => {}));
  refresh();
}
function renderChromeBadges() {
  const n = fr.requests.length;
  for (const el of document.querySelectorAll('[data-friends-badge]')) { el.textContent = n || ''; el.hidden = !n; }
}
async function friendsAction(fn, okMsg) {
  fr.busy = true; fr.msg = ''; if (currentRender === renderFriends) renderFriends();
  try { await fn(); if (okMsg) toast(okMsg); } catch (e) { fr.msg = e.userMsg ?? (e?.code === 'permission-denied' ? L.fr.denied : L.fr.error); }
  fr.busy = false; if (currentRender === renderFriends) renderFriends();
}
const userErr = (msg) => Object.assign(new Error(msg), { userMsg: msg });
function setPseudo(raw) {
  return friendsAction(async () => {
    const p = String(raw ?? '').trim().toLowerCase();
    if (!PSEUDO_RE.test(p)) throw userErr(L.fr.pseudoRule);
    const taken = await fsx().getDoc(dref('handles', p));
    if (taken.exists() && taken.data().uid !== cloud.user.uid) throw userErr(L.fr.pseudoTaken);
    const b = fsx().writeBatch(cloud.api.db);
    if (fr.me?.pseudo && fr.me.pseudo !== p) b.delete(dref('handles', fr.me.pseudo));
    b.set(dref('handles', p), { uid: cloud.user.uid });
    b.set(dref('publicProfiles', cloud.user.uid), { pseudo: p });
    await b.commit();
    fr.me = { pseudo: p };
  }, L.fr.pseudoSaved);
}
function sendRequest(raw) {
  return friendsAction(async () => {
    const p = String(raw ?? '').trim().toLowerCase().replace(/^@/, '');
    if (!PSEUDO_RE.test(p)) throw userErr(L.fr.pseudoRule);
    const h = await fsx().getDoc(dref('handles', p));
    if (!h.exists()) throw userErr(L.fr.notFound(p));
    const to = h.data().uid;
    if (to === cloud.user.uid) throw userErr(L.fr.self);
    if (fr.list.some((f) => f.uid === to)) throw userErr(L.fr.already(p));
    // s'il m'a déjà envoyé une demande, on accepte directement
    if (fr.requests.some((r) => r.uid === to)) { await acceptRaw(to); return; }
    await fsx().setDoc(dref('friendRequests', to, 'from', cloud.user.uid), { pseudo: fr.me.pseudo, at: fsx().serverTimestamp() });
  }, L.fr.sent);
}
async function acceptRaw(other) {
  const me = cloud.user.uid, b = fsx().writeBatch(cloud.api.db), since = fsx().serverTimestamp();
  b.set(dref('friends', me, 'list', other), { since });
  b.set(dref('friends', other, 'list', me), { since });
  b.delete(dref('friendRequests', me, 'from', other));
  await b.commit();
}
const acceptRequest = (other) => friendsAction(() => acceptRaw(other), L.fr.accepted);
const declineRequest = (other) => friendsAction(() => fsx().deleteDoc(dref('friendRequests', cloud.user.uid, 'from', other)), null);
function removeFriend(other) {
  return friendsAction(async () => {
    const me = cloud.user.uid, b = fsx().writeBatch(cloud.api.db);
    b.delete(dref('friends', me, 'list', other));
    b.delete(dref('friends', other, 'list', me));
    await b.commit();
    fr.confirmRemove = null;
  }, L.fr.removed);
}
// à la suppression du compte : on retire pseudo, profil public et amitiés (au mieux)
async function friendsCleanup(uid) {
  try {
    const b = fsx().writeBatch(cloud.api.db);
    if (fr.me?.pseudo) b.delete(dref('handles', fr.me.pseudo));
    b.delete(dref('publicProfiles', uid));
    for (const f of fr.list) { b.delete(dref('friends', uid, 'list', f.uid)); b.delete(dref('friends', f.uid, 'list', uid)); }
    await b.commit();
  } catch { /* au mieux */ }
}

function renderFriends() {
  setTopbar(`<h1>${L.fr.title}</h1>`);
  if (!cloud.enabled) { view.innerHTML = `<div class="empty"><strong>${L.fr.title}</strong>${L.capriNoCloud}</div>`; return; }
  if (!cloud.user) { view.innerHTML = `<div class="empty"><strong>${L.fr.title}</strong>${L.fr.gate}<button class="cta" style="width:auto;padding:14px 28px" data-action="account">${L.signIn}</button></div>`; return; }
  const err = fr.msg ? `<p class="form-err" role="alert">${esc(fr.msg)}</p>` : '';
  if (!fr.me?.pseudo) {
    view.innerHTML = `<div class="stack friends">
      <section class="panel"><h3>${L.fr.choose}</h3><p class="note" style="margin:0">${L.fr.chooseHint}</p>
        <form class="inline-form" id="pseudoForm"><input class="search" id="pseudoInput" maxlength="20" autocomplete="off" placeholder="${L.fr.pseudoPh}"><button class="cta" ${fr.busy ? 'disabled' : ''}>${L.fr.save}</button></form>${err}</section>
    </div>`;
    return;
  }
  view.innerHTML = `<div class="stack friends">
    <section class="panel">
      <h3>${L.fr.add}<small>${L.fr.yourPseudo} <b class="pseudo">@${esc(fr.me.pseudo)}</b></small></h3>
      <form class="inline-form" id="addFriendForm"><input class="search" id="friendInput" maxlength="21" autocomplete="off" placeholder="${L.fr.addPh}"><button class="cta" ${fr.busy ? 'disabled' : ''}>${L.fr.send}</button></form>
      ${err}<p class="note" style="margin:0">${L.fr.privacy}</p>
    </section>
    ${fr.requests.length ? `<h2 class="section-title">${L.fr.requests} (${fr.requests.length})</h2>
    <div class="rows">${fr.requests.map((r) => `<div class="row friend-row"><span class="f-avatar">${esc(r.pseudo[0]?.toUpperCase() ?? '?')}</span><div class="meta"><strong>@${esc(r.pseudo)}</strong><span>${L.fr.wants}</span></div>
      <button class="chip" data-fr="accept" data-uid="${esc(r.uid)}">${L.fr.accept}</button><button class="chip" data-fr="decline" data-uid="${esc(r.uid)}">${L.fr.decline}</button></div>`).join('')}</div>` : ''}
    <h2 class="section-title">${L.fr.mine} (${fr.list.length})</h2>
    ${fr.list.length ? `<div class="rows">${fr.list.map((f) => `<div class="row friend-row"><span class="f-avatar">${esc(f.pseudo[0]?.toUpperCase() ?? '?')}</span>
      <a class="meta" href="#friend-${esc(f.uid)}"><strong>@${esc(f.pseudo)}</strong><span>${L.fr.see}</span></a>
      <a class="chip" href="#friend-${esc(f.uid)}">${L.fr.open}</a>
      <button class="chip ${fr.confirmRemove === f.uid ? 'danger' : ''}" data-fr="remove" data-uid="${esc(f.uid)}">${fr.confirmRemove === f.uid ? L.fr.confirm : L.fr.remove}</button></div>`).join('')}</div>`
    : `<div class="empty" style="padding:24px 12px"><strong>${L.fr.none}</strong>${L.fr.noneHint}</div>`}
  </div>`;
}

async function renderFriend(uid) {
  setTopbar(`<a class="icon-btn" href="#friends" aria-label="${L.back}">${I.back}</a><h1 class="small">${L.fr.title}</h1>`);
  if (!cloud.user) { renderFriends(); return; }
  if (fr.view?.uid !== uid) {
    view.innerHTML = `<div class="empty"><strong>${L.fr.loading}</strong></div>`;
    try {
      const [snap, name] = await Promise.all([fsx().getDoc(dref('users', uid)), friendName(uid)]);
      let avatar = null;
      try { const p = await fsx().getDoc(dref('profiles', uid)); avatar = p.exists() ? p.data().avatar : null; } catch { /* pas de photo */ }
      let gd = { items: [], sales: {} };
      try { const gs = await fsx().getDoc(dref('graded', uid)); if (gs.exists()) gd = gFromCloud(gs.data()); } catch { /* pas de slabs ou règles pas à jour */ }
      fr.view = { uid, graded: gd.items, gsales: gd.sales, pseudo: name.pseudo, avatar, owned: migrateOwned({ ...(snap.exists() ? snap.data().owned ?? {} : {}) }), wish: snap.exists() ? snap.data().wish ?? [] : [] };
    } catch (e) {
      view.innerHTML = `<div class="empty"><strong>${L.fr.cantSee}</strong>${L.fr.cantSeeHint}<a class="btn-ghost" href="#friends" style="text-decoration:none">${L.back}</a></div>`;
      return;
    }
    if (currentRender !== renderFriendCurrent) return;
  }
  const v = fr.view;
  const theirs = catalog.cards.concat(sealed).filter((c) => ownedOf(v.owned, c.id) > 0);
  const value = theirs.reduce((a, c) => a + ownedOf(v.owned, c.id) * (price(c.id) ?? 0), 0);
  const total = theirs.reduce((a, c) => a + ownedOf(v.owned, c.id), 0);
  const wishCards = v.wish.map((id) => cardsById.get(id)).filter(Boolean);
  const lists = {
    all: theirs,
    trade: theirs.filter((c) => !qty(c.id)),                 // il l'a, pas moi
    give: wishCards.filter((c) => qty(c.id) > 0),             // il la cherche, je l'ai
    wish: wishCards,
  };
  const shown = sortCards(lists[fr.filter] ?? theirs, 'price-desc');
  setTopbar(`<a class="icon-btn" href="#friends" aria-label="${L.back}">${I.back}</a>
    <h1 class="small friend-title">${v.avatar ? `<img src="${esc(v.avatar)}" alt="">` : `<span class="f-avatar">${esc(v.pseudo[0]?.toUpperCase() ?? '?')}</span>`}@${esc(v.pseudo)}</h1>${langBtn()}`);
  view.innerHTML = `<div class="stack">
    <div class="kpis">
      <div class="stat"><small>${L.kCards}</small><b class="num">${total}</b></div>
      <div class="stat"><small>${L.kUnique}</small><b class="num">${theirs.length}</b></div>
      <div class="stat"><small>${L.kValue}</small><b class="num">${eur(value)}</b></div>
    </div>
    <div class="chips">${[['all', L.fr.fAll], ['trade', L.fr.fTrade], ['give', L.fr.fGive], ['wish', L.fr.fWish]].map(([k, l]) => `<button class="chip" data-frf="${k}" aria-pressed="${fr.filter === k}">${l} · ${lists[k].length}</button>`).join('')}</div>
    ${v.graded?.length && fr.filter === 'all' ? `<h2 class="section-title">${L.gr.tab} · ${v.graded.length}</h2><div class="slabs">${v.graded.filter((e) => cardsById.has(e.id)).map((e) => slabTile(e, { friend: uid })).join('')}</div><h2 class="section-title">${L.gr.tabCards}</h2>` : ''}
    ${shown.length ? `<div class="cards">${shown.map((c) => friendTile(c, v)).join('')}</div>` : `<div class="empty"><strong>${L.noCards}</strong>${L.fr.emptyFilter}</div>`}
  </div>`;
  gHydrate(view);
}
let renderFriendCurrent = null;
function friendTile(c, v) {
  const q = ownedOf(v.owned, c.id), mine = qty(c.id);
  const tag = mine ? `<span class="ftag own">${L.fr.tagMine}</span>` : (wish.has(c.id) ? `<span class="ftag want">${L.fr.tagWant}</span>` : '');
  return `<div class="card ${q ? 'owned' : 'missing'} ftile" data-cid="${esc(c.id)}">
    <button class="${isSealed(c) ? 'sealed-img' : 'card-img'}" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}</button>
    ${price(c.id) != null ? `<span class="price num">${eur(price(c.id))}</span>` : ''}
    <div class="fmeta">${q > 1 ? `<span class="ftag">×${q}</span>` : ''}${tag}</div>
  </div>`;
}
document.addEventListener('submit', (e) => {
  if (e.target.id === 'pseudoForm') { e.preventDefault(); setPseudo(document.getElementById('pseudoInput').value); }
  else if (e.target.id === 'addFriendForm') { e.preventDefault(); sendRequest(document.getElementById('friendInput').value); }
});
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-fr],[data-frf]');
  if (!a) return;
  if (a.dataset.frf) { fr.filter = a.dataset.frf; currentRender(); return; }
  const uid = a.dataset.uid;
  if (a.dataset.fr === 'accept') acceptRequest(uid);
  else if (a.dataset.fr === 'decline') declineRequest(uid);
  else if (a.dataset.fr === 'remove') { if (fr.confirmRemove !== uid) { fr.confirmRemove = uid; renderFriends(); } else removeFriend(uid); }
});

// ---------- Installation comme une vraie appli (plein écran, icône, hors ligne) ----------
let installEvt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const canInstall = () => !isStandalone() && (!!installEvt || isIOS());
const installDismissed = () => { try { return localStorage.getItem('nightdex:installDismissed') === '1'; } catch { return false; } };
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (currentRender === renderHome) currentRender(); });
addEventListener('appinstalled', () => { installEvt = null; document.getElementById('installBanner')?.remove(); toast(L.inst.done); });
function installBanner() {
  if (!canInstall() || installDismissed()) return '';
  return `<div class="install-banner" id="installBanner">
    <img src="icons/icon-192.png" alt="" width="44" height="44">
    <div class="install-text"><strong>${L.inst.title}</strong><span>${installEvt ? L.inst.pitch : L.inst.ios}</span></div>
    ${installEvt ? `<button class="cta install-go" data-action="install">${L.inst.btn}</button>` : ''}
    <button class="icon-btn install-x" data-action="install-dismiss" aria-label="${L.close}">${I.x}</button>
  </div>`;
}
async function doInstall() {
  if (!installEvt) { toast(L.inst.ios); return; }
  installEvt.prompt();
  try { const r = await installEvt.userChoice; if (r.outcome === 'accepted') toast(L.inst.done); } catch { /* fermé */ }
  installEvt = null;
  document.getElementById('installBanner')?.remove();
  if (sheetMode === null && !sheet.hidden) openSettings();
}

// ---------- Scanner de cartes : caméra + reconnaissance sur le téléphone (aucune photo envoyée) ----------
// Chaque image de carte a une empreinte 9 × 12 (data/scan-index.json, faite par scripts/make-scan-index.mjs).
// L'image du cadre-guide est réduite à 90 × 120, puis comparée sous 7 cadrages légèrement décalés.
// Seuil et cadrages réglés sur des photos simulées : bon personnage reconnu 100 %, version exacte dans les 3 premiers 94 %.
const SCAN = { RW: 90, RH: 120, GW: 9, GH: 12, MIN: 0.66, VARIANTS: [[0, 0, 0], [-3, 0, 0], [3, 0, 0], [0, -4, 0], [0, 4, 0], [0, 0, 3], [0, 0, 6]] };
const scan = { index: null, stream: null, timer: 0, last: null, paused: false, track: null, torch: false, res: null, pick: null };
function scanNorm(b) {
  const v = new Float32Array(b.length);
  for (let c = 0; c < 3; c++) { let m = 0; for (let i = c; i < b.length; i += 3) m += b[i]; m /= b.length / 3; for (let i = c; i < b.length; i += 3) v[i] = b[i] - m; }
  let s = 0; for (const x of v) s += x * x; s = Math.sqrt(s) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= s;
  return v;
}
// moyenne de chaque case d'une grille 9 × 12 sur un rectangle de l'image 90 × 120 (pixels RVBA du canvas)
function scanFeature(px, x, y, w, h) {
  const { GW, GH, RW } = SCAN, out = new Float32Array(GW * GH * 3);
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const x0 = Math.floor(x + (gx * w) / GW), x1 = Math.max(x0 + 1, Math.floor(x + ((gx + 1) * w) / GW));
    const y0 = Math.floor(y + (gy * h) / GH), y1 = Math.max(y0 + 1, Math.floor(y + ((gy + 1) * h) / GH));
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * RW + xx) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; }
    const o = (gy * GW + gx) * 3; out[o] = Math.floor(r / n); out[o + 1] = Math.floor(g / n); out[o + 2] = Math.floor(b / n);
  }
  return scanNorm(out);
}
async function scanLoadIndex() {
  if (scan.index) return;
  const j = await fetch('data/scan-index.json').then((r) => r.json());
  scan.index = j.items.map(([id, b64]) => [id, scanNorm(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))]);
}
function scanMatch(px) {
  const best = new Map();
  for (const [dx, dy, z] of SCAN.VARIANTS) {
    const x = Math.max(0, dx + z), y = Math.max(0, dy + Math.round((z * 4) / 3));
    const w = Math.min(SCAN.RW - x, SCAN.RW - 2 * z), h = Math.min(SCAN.RH - y, SCAN.RH - Math.round((2 * z * 4) / 3));
    const v = scanFeature(px, x, y, w, h);
    for (const [id, iv] of scan.index) {
      let d = 0; for (let i = 0; i < v.length; i++) d += v[i] * iv[i];
      if (!best.has(id) || d > best.get(id)) best.set(id, d);
    }
  }
  return [...best].sort((a, b) => b[1] - a[1]);
}
const scanCanvas = () => { const c = document.createElement('canvas'); c.width = SCAN.RW; c.height = SCAN.RH; return c; };

function openScanner() {
  closeScanner();
  const el = document.createElement('div');
  el.className = 'scanner'; el.id = 'scanner';
  el.innerHTML = `<video id="scanVideo" playsinline muted autoplay></video>
    <div class="scan-shade"></div>
    <div class="scan-guide" id="scanGuide"><i></i><i></i><i></i><i></i></div>
    <div class="scan-top">
      <button class="icon-btn" data-scan="close" aria-label="${L.close}">${I.x}</button>
      <strong>${L.scan.title}</strong>
      <button class="icon-btn" data-scan="torch" id="scanTorch" hidden aria-label="${L.scan.torch}">${I.bolt}</button>
    </div>
    <div class="scan-panel" id="scanPanel"><p class="scan-status">${L.scan.starting}</p></div>
    <input id="scanFile" type="file" accept="image/*" hidden>`;
  document.body.appendChild(el);
  document.body.style.overflow = 'hidden';
  scan.paused = false; scan.last = null; scan.res = null; scan.pick = null;
  scanStart();
}
async function scanStart() {
  const panel = () => document.getElementById('scanPanel');
  try { await scanLoadIndex(); } catch { if (panel()) panel().innerHTML = `<p class="scan-status">${L.scan.indexErr}</p>`; return; }
  if (!navigator.mediaDevices?.getUserMedia) { scanNoCamera(L.scan.noCamera); return; }
  try {
    scan.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
  } catch (e) { scanNoCamera(e?.name === 'NotAllowedError' ? L.scan.denied : L.scan.noCamera); return; }
  const video = document.getElementById('scanVideo');
  if (!video) { scanStopStream(); return; }
  video.srcObject = scan.stream;
  scan.track = scan.stream.getVideoTracks()[0];
  try { if (scan.track.getCapabilities?.().torch) document.getElementById('scanTorch').hidden = false; } catch { /* pas de lampe */ }
  if (panel()) panel().innerHTML = `<p class="scan-status">${L.scan.aim}</p><button class="btn-ghost scan-photo" data-scan="photo">${L.scan.photo}</button>`;
  const canvas = scanCanvas(), ctx = canvas.getContext('2d', { willReadFrequently: true });
  scan.timer = setInterval(() => {
    if (scan.paused || !video.videoWidth) return;
    const g = document.getElementById('scanGuide').getBoundingClientRect(), vr = video.getBoundingClientRect();
    // la vidéo est affichée en « cover » : on retrouve la zone du guide dans l'image de la caméra
    const k = Math.max(vr.width / video.videoWidth, vr.height / video.videoHeight);
    const ox = (video.videoWidth * k - vr.width) / 2, oy = (video.videoHeight * k - vr.height) / 2;
    const sx = (g.left - vr.left + ox) / k, sy = (g.top - vr.top + oy) / k, sw = g.width / k, sh = g.height / k;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, SCAN.RW, SCAN.RH);
    const res = scanMatch(ctx.getImageData(0, 0, SCAN.RW, SCAN.RH).data);
    const [id, score] = res[0];
    const name = cardsById.get(id)?.nameEn;
    const status = document.querySelector('#scanPanel .scan-status');
    if (score >= SCAN.MIN) {
      if (scan.last === name) { scanFound(res, false); return; }
      scan.last = name;
      if (status) status.textContent = L.scan.holding;
    } else { scan.last = null; if (status) status.textContent = L.scan.aim; }
  }, 350);
}
function scanNoCamera(msg) {
  const p = document.getElementById('scanPanel');
  if (p) p.innerHTML = `<p class="scan-status">${msg}</p><button class="cta scan-photo" data-scan="photo">${L.scan.photo}</button>`;
}
function scanFromFile(file) {
  const img = new Image();
  img.onload = () => {
    const c = scanCanvas(), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, SCAN.RW, SCAN.RH);
    URL.revokeObjectURL(img.src);
    scanFound(scanMatch(ctx.getImageData(0, 0, SCAN.RW, SCAN.RH).data), true);
  };
  img.src = URL.createObjectURL(file);
}
function scanFound(res, fromPhoto) {
  scan.paused = true; scan.res = res; scan.pick = res[0][0];
  navigator.vibrate?.(40);
  scanRenderResult(fromPhoto && res[0][1] < SCAN.MIN);
}
function scanRenderResult(unsure) {
  const p = document.getElementById('scanPanel');
  if (!p || !scan.res) return;
  const c = cardsById.get(scan.pick);
  const scores = new Map(scan.res);
  // autres versions de la même carte (rééditions, bêta, promos) puis autres cartes proches
  const versions = allItems().filter((x) => x.nameEn === c.nameEn && x.id !== c.id).sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)).slice(0, 8);
  const others = [];
  for (const [id] of scan.res) { const x = cardsById.get(id); if (x && x.nameEn !== c.nameEn && !others.some((o) => o.nameEn === x.nameEn)) others.push(x); if (others.length >= 2) break; }
  const q = qty(c.id);
  const chip = (x) => `<button class="chip" data-scan-pick="${esc(x.id)}">${esc(itemCode(x))} · ${esc(x.number ?? '')}</button>`;
  p.innerHTML = `<div class="scan-result">
      <button class="scan-thumb" data-scan="open">${cardImg(c, true)}</button>
      <div class="scan-info">
        <strong>${esc(cardName(c))}</strong>
        <span class="num"><b class="print">${esc(itemCode(c))}</b> · ${esc(c.number ?? '')}${c.rarity ? ` · ${esc(rarityLabel(c.rarity))}` : ''}</span>
        <span class="num scan-price">${price(c.id) != null ? eur(price(c.id)) : L.noPrice}</span>
        ${unsure ? `<span class="note">${L.scan.unsure}</span>` : ''}
        ${q ? `<span class="note">${L.scan.owned(q)}</span>` : ''}
      </div>
    </div>
    ${versions.length ? `<div class="scan-alt"><span class="note">${L.scan.versions}</span><div class="chips">${versions.map(chip).join('')}</div></div>` : ''}
    ${others.length ? `<div class="scan-alt"><span class="note">${L.scan.notIt}</span><div class="chips">${others.map((x) => `<button class="chip" data-scan-pick="${esc(x.id)}">${esc(cardName(x))}</button>`).join('')}</div></div>` : ''}
    <div class="scan-actions">
      <button class="cta" data-scan="add">${L.scan.add}</button>
      <button class="btn-ghost" data-scan="open">${L.scan.open}</button>
      <button class="btn-ghost" data-scan="wish" aria-pressed="${wish.has(c.id)}">${wish.has(c.id) ? '♥' : '♡'}</button>
      <button class="btn-ghost" data-scan="again">${L.scan.again}</button>
    </div>`;
}
function scanStopStream() {
  clearInterval(scan.timer); scan.timer = 0;
  scan.stream?.getTracks().forEach((t) => t.stop());
  scan.stream = null; scan.track = null; scan.torch = false;
}
function closeScanner() {
  scanStopStream();
  const el = document.getElementById('scanner');
  if (el) { el.remove(); document.body.style.overflow = ''; }
}
document.addEventListener('click', async (e) => {
  const pick = e.target.closest('[data-scan-pick]');
  if (pick) { scan.pick = pick.dataset.scanPick; scanRenderResult(false); return; }
  const a = e.target.closest('[data-scan]');
  if (!a) return;
  const act = a.dataset.scan, id = scan.pick;
  if (act === 'close') closeScanner();
  else if (act === 'photo') document.getElementById('scanFile')?.click();
  else if (act === 'again') { scan.paused = false; scan.last = null; scan.res = null; const p = document.getElementById('scanPanel'); if (p) p.innerHTML = `<p class="scan-status">${L.scan.aim}</p><button class="btn-ghost scan-photo" data-scan="photo">${L.scan.photo}</button>`; }
  else if (act === 'add' && id) { user.owned[okey(id)] = qty(id) + 1; save(); refreshCard(id); toast(L.scan.added(qty(id))); scanRenderResult(false); }
  else if (act === 'wish' && id) { wish.has(id) ? wish.delete(id) : wish.add(id); save(); refreshCard(id); scanRenderResult(false); }
  else if (act === 'open' && id) { closeScanner(); openCard(id, true); }
  else if (act === 'torch' && scan.track) { scan.torch = !scan.torch; try { await scan.track.applyConstraints({ advanced: [{ torch: scan.torch }] }); } catch { /* lampe indisponible */ } a.classList.toggle('on', scan.torch); }
});
document.addEventListener('change', (e) => { if (e.target.id === 'scanFile' && e.target.files?.[0]) scanFromFile(e.target.files[0]); });
document.addEventListener('visibilitychange', () => { if (document.hidden && document.getElementById('scanner')) closeScanner(); });
addEventListener('hashchange', () => closeScanner());
addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('scanner')) closeScanner(); });

// ---------- Barre d'onglets et langue ----------
function renderSupportSide() {
  const nav = document.querySelector('.tabbar');
  nav.querySelector('.support-side')?.remove();
  if (supportUrl()) nav.insertAdjacentHTML('beforeend', supportLink('support-side pc-only'));
}
function renderChrome() {
  document.documentElement.lang = lang;
  const labels = { decks: L.dk.title, friends: L.fr.title, capri: 'Capri', home: L.home, sealed: L.sealed, collection: L.collection, search: L.search, values: L.market, wishlist: L.wishlist };
  for (const a of document.querySelectorAll('.tabbar a')) {
    const span = a.querySelector('span');
    if (span && labels[a.dataset.tab]) span.textContent = labels[a.dataset.tab];
    if (a.dataset.tab === 'search') a.setAttribute('aria-label', L.searchCard);
  }
}
function setCardLang(next) {
  cardLang = next === 'en' ? 'en' : 'fr';
  user.prefs.cardLang = cardLang; save();
  const wasSettings = !sheet.hidden && !openId && sheetMode !== 'account';
  const card = openId;
  currentRender();
  if (card) openCard(card); else if (wasSettings) openSettings();
  toast(L.cardLangToast(cardLang));
}
function setLang(next) {
  lang = UI_LANGS.some(([k]) => k === next) ? next : 'fr';
  L = TEXT[lang];
  user.prefs.lang = lang; save();
  setFormats(); renderChrome(); renderSupportSide();
  const wasSettings = !sheet.hidden && !openId;
  const card = openId;
  currentRender();
  if (cloud.api) cloud.api.auth.languageCode = lang;
  if (card) openCard(card); else if (wasSettings && sheetMode === 'account') openAccount(true); else if (wasSettings) openSettings();
  toast(L.langToast);
}

// ---------- Actions ----------
function toggleOwn(id) {
  const k = okey(id);
  user.owned[k] = qty(id) > 0 ? 0 : 1;
  if (!user.owned[k]) delete user.owned[k];
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
  else if (d.seg === 'cardLang') setCardLang(d.value);
  else if (d.seg === 'pet') { user.prefs.pet = d.value; if (d.value === 'on') { petDismissed = false; try { sessionStorage.removeItem('nightdex:petHidden'); } catch { /* */ } } save(); petSync(); openSettings(); }
  else if (d.seg) { user.prefs[d.seg] = d.value; save(); currentRender(); }
  else if (d.pref) { user.prefs[d.pref] = d.value || null; if (d.pref === 'own' && !d.value) user.prefs.own = 'all'; save(); currentRender(); }
  else if (d.fav) { fav.has(d.fav) ? fav.delete(d.fav) : fav.add(d.fav); save(); currentRender(); toast(fav.has(d.fav) ? L.favOn : L.favOff); }
  else if (d.colset !== undefined) { colSet = d.colset; currentRender(); }
  else if (d.qty && openId) {
    const id = openId;
    const n = Math.max(0, qty(id) + Number(d.qty));
    if (n) user.owned[okey(id)] = n; else delete user.owned[okey(id)];
    save(); refreshCard(id); openCard(id);
  } else if (d.close !== undefined) closeCard();
  else if (d.action === 'home-mode') { user.prefs.homeMode = user.prefs.homeMode === 'grid' ? 'list' : 'grid'; save(); currentRender(); }
  else if (d.action === 'cardlang') setCardLang(cardLang === 'fr' ? 'en' : 'fr');
  else if (d.action === 'language') { openSettings(); requestAnimationFrame(() => document.getElementById('langPanel')?.scrollIntoView({ block: 'center' })); }
  else if (d.action === 'cycle-sort') {
    const i = SORTS.indexOf(user.prefs.sort);
    user.prefs.sort = SORTS[(i + 1) % SORTS.length]; save(); currentRender();
    toast(L.sortToast(L.sorts[user.prefs.sort]));
  } else if (d.action === 'filters') { showFilters = !showFilters; currentRender(); }
  else if (d.action === 'settings') openSettings();
  else if (d.action === 'account') openAccount();
  else if (d.action === 'prev') navStep(-1);
  else if (d.action === 'scan') openScanner();
  else if (d.action === 'install') doInstall();
  else if (d.action === 'install-dismiss') { try { localStorage.setItem('nightdex:installDismissed', '1'); } catch { /* */ } document.getElementById('installBanner')?.remove(); }
  else if (d.action === 'copy-id') {
    const id = cloud.user?.uid ?? '';
    try { await navigator.clipboard.writeText(id); toast(L.copiedId); }
    catch { const el = document.getElementById('myId'); if (el) { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } }
  } else if (d.action === 'avatar-remove') {
    try { await cloud.api.fsM.deleteDoc(cloud.api.fsM.doc(cloud.api.db, 'profiles', cloud.user.uid)); cloud.avatar = null; toast(L.avatarRemoved); } catch { toast(L.avatarErr); }
    refreshAccount();
  }
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
      for (const e of user.graded) await cloud.api.fsM.deleteDoc(gPhotoRef(cu.uid, e.g)).catch(() => {});
      await cloud.api.fsM.deleteDoc(gRef(cu.uid)).catch(() => {});
      await cloud.api.fsM.deleteDoc(dRef(cu.uid)).catch(() => {});
      await cloud.api.fsM.deleteDoc(cloud.api.fsM.doc(cloud.api.db, 'profiles', cu.uid)).catch(() => {});
      await friendsCleanup(cu.uid);
      await cloud.api.authM.deleteUser(cu);
      user.syncedUid = null; save();
    }, L.deleted);
    cloud.confirmDelete = false;
  }
  else if (d.action === 'close') closeCard();
  else if (d.action === 'export') {
    const data = JSON.stringify({ app: 'NightDex', version: 2, exportedAt: new Date().toISOString(), owned: user.owned, wish: [...wish], fav: [...fav], graded: user.graded, gsales: user.gsales, paid: user.paid, decks: user.decks });
    const box = document.getElementById('exportBox');
    box.hidden = false; box.value = data;
    try { await navigator.clipboard.writeText(data); toast(L.copied); } catch { box.select(); toast(L.selectCopy); }
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'avatarFile' && e.target.files?.[0] && cloud.user) saveAvatar(e.target.files[0]);
});
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'importFile') return;
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data.owned) throw new Error();
    user.owned = migrateOwned({ ...data.owned }); wish.clear(); (data.wish ?? []).forEach((x) => wish.add(x));
    fav.clear(); (data.fav ?? []).forEach((x) => fav.add(x));
    if (Array.isArray(data.graded)) { user.graded = data.graded; user.gsales = data.gsales ?? {}; }
    if (data.paid && typeof data.paid === 'object') user.paid = data.paid;
    if (Array.isArray(data.decks)) { user.decks = data.decks; dSave(); }
    gSave();
    save(); closeCard(); currentRender(); toast(L.imported);
  } catch { toast(L.badFile); }
});
function paidInput(el, commit) {
  const id = el.dataset.paidId;
  const v = el.value.trim() === '' ? null : Math.round(Number(el.value) * 100) / 100;
  if (v != null && !(v >= 0)) return;
  if (v == null) delete user.paid[okey(id)]; else user.paid[okey(id)] = v;
  const box = document.getElementById('paidDiff');
  if (box) box.innerHTML = v != null ? (price(id) != null ? `${L.paidVs} ${diffHtml(paidDiff(id))}` : L.noPrice) : `<span class="muted">${L.paidHint}</span>`;
  if (commit) { gSave(); if (currentRender === renderCollection) currentRender(); }
}
document.addEventListener('input', (e) => { if (e.target.id === 'cardPaid') paidInput(e.target, false); });
document.addEventListener('change', (e) => { if (e.target.id === 'cardPaid') paidInput(e.target, true); });
document.addEventListener('input', (e) => {
  const map = { setSearch: [(v) => { homeQuery = v; }, renderHome], cardSearch: [(v) => { searchQuery = v; }, renderSearch], setCardSearch: [(v) => { setQuery = v; }, () => currentRender()] };
  const m = map[e.target.id];
  if (!m) return;
  m[0](e.target.value);
  const pos = e.target.selectionStart;
  m[1]();
  const el = document.getElementById(e.target.id); el.focus(); el.setSelectionRange(pos, pos);
});
document.addEventListener('keydown', (e) => {
  if (sheet.hidden) return;
  if (e.key === 'Escape') { if (zoomEl && !zoomEl.hidden) { zoomClose(); return; } closeCard(); }
  else if (openId && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('input, textarea')) { e.preventDefault(); navStep(e.key === 'ArrowRight' ? 1 : -1); }
});
sheet.addEventListener('click', (e) => { if (e.target.matches('.sheet-backdrop')) closeCard(); });

// ---------- Cartes gradées (slabs) ----------
// Chaque slab : { g, id, l (fr|en), co (société), gr (note), cert, paid, at (date d'achat), ph (photo ?) }.
// Ventes réussies relevées par l'utilisateur, partagées par carte + langue + société + note : gsales[clé] = [[date, prix], …].
// Synchronisé dans un document à part (graded/<uid>) pour ne jamais gêner la synchro de la collection ;
// photos sur l'appareil (IndexedDB) et dans gphotos/<uid>/items/<g> quand on est connecté.
const GRADERS = [
  { k: 'PSA', name: 'PSA', color: '#c8102e', cert: (n) => `https://www.psacard.com/cert/${encodeURIComponent(n)}` },
  { k: 'BGS', name: 'Beckett (BGS)', color: '#1f3c88', specials: [['10BL', '10 Black Label']] },
  { k: 'CGC', name: 'CGC Cards', color: '#0e2a47', cert: (n) => `https://www.cgccards.com/certlookup/${encodeURIComponent(n)}/`, specials: [['10P', '10 Pristine']] },
  { k: 'PCA', name: 'PCA', color: '#1b5fa8' },
  { k: 'CA', name: 'Collect Aura', color: '#6a2fb0' },
  { k: 'SGC', name: 'SGC', color: '#1a1a1a' },
  { k: 'TAG', name: 'TAG', color: '#2b2b2b' },
  { k: 'ACE', name: 'Ace Grading', color: '#0f6b4f' },
  { k: 'X', name: '', color: '#555b66' },
];
const GRADES = ['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1'];
const grader = (k) => GRADERS.find((x) => x.k === k) ?? GRADERS[GRADERS.length - 1];
const graderName = (k) => grader(k).name || L.gr.other;
const gradeLabel = (co, gr) => grader(co).specials?.find(([k]) => k === gr)?.[1] ?? gr;
const gradeNum = (gr) => parseFloat(gr) || 0;
if (!Array.isArray(user.graded)) user.graded = [];
if (!user.gsales || typeof user.gsales !== 'object') user.gsales = {};
// prix d'achat unitaire des cartes et du scellé, par langue : paid[clé de collection] = prix
if (!user.paid || typeof user.paid !== 'object') user.paid = {};
const paidOf = (id) => user.paid[okey(id)] ?? null;
// différence avec la tendance Cardmarket pour tous les exemplaires (null si pas de prix d'achat ou pas de cote)
function paidDiff(id) {
  const pp = paidOf(id), t = price(id), q = qty(id);
  if (pp == null || t == null || !q) return null;
  return { diff: (t - pp) * q, pct: pp ? (t - pp) / pp : null, q };
}
const diffHtml = (r) => (r ? `<b class="${r.diff >= 0 ? 'up' : 'down'}">${r.diff >= 0 ? '+' : '−'}${eur(Math.abs(r.diff))}${r.pct != null ? ` (${pct(r.pct)})` : ''}</b>` : '');
const gkey = (e) => `${e.id}|${e.l}|${e.co}|${e.gr}`;
const gSales = (e) => (user.gsales[gkey(e)] ?? []).slice().sort((a, b) => (a[0] < b[0] ? -1 : 1));
// valeur estimée : médiane des 3 dernières ventes relevées
function gValue(e, sales = gSales(e)) {
  if (!sales.length) return null;
  const last = sales.slice(-3).map(([, p]) => p).sort((a, b) => a - b);
  return last[Math.floor(last.length / 2)];
}
const gSig = () => JSON.stringify([user.graded, Object.entries(user.gsales).sort(), Object.entries(user.paid).sort()]);
let gLastSig = gSig();
function gSave() {
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* stockage indisponible */ }
  const sig = gSig();
  if (sig !== gLastSig) { gLastSig = sig; gCloudChanged(); }
}
// recherche eBay des ventes réussies (ouverte dans le navigateur de l'utilisateur) et PriceCharting
function gEbayUrl(e) {
  const c = cardsById.get(e.id);
  const q = ['cyberpunk', c?.nameEn ?? c?.name ?? '', c?.number ?? '', grader(e.co).name ? e.co : '', gradeNum(e.gr) || ''].filter(Boolean).join(' ');
  return `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1&_sop=13`;
}
const gPcUrl = (e) => { const c = cardsById.get(e.id); return `https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(`cyberpunk ${c?.nameEn ?? c?.name ?? ''}`)}`; };

// --- photos : IndexedDB sur l'appareil + copie dans le compte ---
const gPhotoMem = new Map();
let gDbP = null;
function gDb() {
  gDbP ??= new Promise((res, rej) => {
    const r = indexedDB.open('nightdex-photos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('p');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return gDbP;
}
async function gIdb(mode, fn) {
  const db = await gDb();
  return new Promise((res, rej) => { const t = db.transaction('p', mode); const q = fn(t.objectStore('p')); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); });
}
const gPhotoRef = (uid, g) => cloud.api.fsM.doc(cloud.api.db, 'gphotos', uid, 'items', g);
async function gPhotoGet(g, uid = cloud.user?.uid) {
  const mk = `${uid ?? 'me'}:${g}`;
  if (gPhotoMem.has(mk)) return gPhotoMem.get(mk);
  let url = null;
  const mine = !uid || uid === cloud.user?.uid;
  if (mine) url = await gIdb('readonly', (s) => s.get(g)).catch(() => null);
  if (!url && uid && cloud.api) {
    try { const snap = await cloud.api.fsM.getDoc(gPhotoRef(uid, g)); url = snap.exists() ? snap.data().img : null; } catch { /* pas de photo */ }
    if (url && mine) gIdb('readwrite', (s) => s.put(url, g)).catch(() => {});
  }
  gPhotoMem.set(mk, url);
  return url;
}
async function gPhotoPut(g, url) {
  gPhotoMem.set(`${cloud.user?.uid ?? 'me'}:${g}`, url); gPhotoMem.set(`me:${g}`, url);
  await gIdb('readwrite', (s) => s.put(url, g)).catch(() => {});
  if (cloud.user) {
    try { await cloud.api.fsM.setDoc(gPhotoRef(cloud.user.uid, g), { img: url }); }
    catch (e) { if (e?.code === 'permission-denied') toast(L.gr.rulesNeeded); }
  }
}
async function gPhotoDel(g) {
  for (const k of [...gPhotoMem.keys()]) if (k.endsWith(`:${g}`)) gPhotoMem.delete(k);
  await gIdb('readwrite', (s) => s.delete(g)).catch(() => {});
  if (cloud.user) cloud.api.fsM.deleteDoc(gPhotoRef(cloud.user.uid, g)).catch(() => {});
}
// remplit les <img data-gphoto> une fois la photo trouvée
function gHydrate(root = document) {
  for (const img of root.querySelectorAll('img[data-gphoto]')) {
    const g = img.dataset.gphoto, uid = img.dataset.guid || undefined;
    img.removeAttribute('data-gphoto');
    gPhotoGet(g, uid).then((url) => { if (url) { img.src = url; img.closest('.slab')?.classList.add('has-photo'); } });
  }
}
// photo du slab : réduite (700 px de haut max) pour rester légère
function gResize(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 700 / img.naturalHeight, 520 / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      let url = c.toDataURL('image/webp', 0.8);
      if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', 0.8);
      resolve(url);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// --- synchro du compte : document graded/<uid> ---
const gRef = (uid = cloud.user.uid) => cloud.api.fsM.doc(cloud.api.db, 'graded', uid);
const gCloud = { unsub: null, timer: 0, dirty: false, denied: false };
function gMerge(a, b) {
  const items = new Map();
  for (const e of [...(a?.items ?? []), ...(b?.items ?? [])]) items.set(e.g, { ...items.get(e.g), ...e });
  const sales = {};
  for (const src of [a?.sales ?? {}, b?.sales ?? {}]) for (const [k, list] of Object.entries(src)) {
    const seen = new Set((sales[k] ?? []).map((s) => s.join('|')));
    sales[k] = [...(sales[k] ?? []), ...list.filter((s) => !seen.has(s.join('|')))];
  }
  return { items: [...items.values()], sales, paid: { ...(a?.paid ?? {}), ...(b?.paid ?? {}) } };
}
// Firestore n'accepte pas les tableaux de tableaux : ventes envoyées sous forme { d, p }
const gToCloud = () => ({ items: user.graded, paid: user.paid, sales: Object.fromEntries(Object.entries(user.gsales).map(([k, l]) => [k, l.map(([d, p]) => ({ d, p }))])) });
const gFromCloud = (d) => ({ items: d?.items ?? [], paid: d?.paid ?? {}, sales: Object.fromEntries(Object.entries(d?.sales ?? {}).map(([k, l]) => [k, l.map((s) => [s.d, s.p])])) });
function gApply(d) {
  user.graded = d.items; user.gsales = d.sales; user.paid = d.paid ?? {};
  gLastSig = gSig();
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* */ }
  if (currentRender === renderGraded && sheet.hidden) renderGraded();
}
async function gPush() {
  if (!cloud.user) return;
  clearTimeout(gCloud.timer);
  try { await cloud.api.fsM.setDoc(gRef(), { ...gToCloud(), updatedAt: cloud.api.fsM.serverTimestamp() }); gCloud.dirty = false; user.gPending = false; gSave(); gCloud.denied = false; }
  catch (e) { if (e?.code === 'permission-denied' && !gCloud.denied) { gCloud.denied = true; toast(L.gr.rulesNeeded); } }
}
function gCloudChanged() {
  if (!cloud.enabled) return;
  user.gPending = true;
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* */ }
  if (!cloud.user) return;
  gCloud.dirty = true;
  clearTimeout(gCloud.timer);
  gCloud.timer = setTimeout(gPush, 1200);
}
function gOnUser(u) {
  gCloud.unsub?.(); gCloud.unsub = null;
  gPhotoMem.clear();
  if (!u) return;
  let first = true;
  gCloud.unsub = cloud.api.fsM.onSnapshot(gRef(u.uid), async (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    const remote = snap.exists() ? gFromCloud(snap.data()) : null;
    const local = { items: user.graded, sales: user.gsales, paid: user.paid };
    if (first) {
      first = false;
      const next = !remote ? local : (user.gSyncedUid !== u.uid || user.gPending) ? gMerge(remote, local) : remote;
      user.gSyncedUid = u.uid;
      gApply(next);
      if (!remote || JSON.stringify(gMerge(next, {})) !== JSON.stringify(gMerge(remote, {}))) await gPush();
      else { user.gPending = false; gSave(); }
      // photos prises avant la connexion : envoyées dans le compte
      for (const e of user.graded) if (e.ph) gIdb('readonly', (s) => s.get(e.g)).then((url) => { if (url) cloud.api.fsM.setDoc(gPhotoRef(u.uid, e.g), { img: url }).catch(() => {}); }).catch(() => {});
      return;
    }
    if (gCloud.dirty || !remote) return;
    gApply(remote);
  }, (e) => { if (e?.code === 'permission-denied' && !gCloud.denied) { gCloud.denied = true; toast(L.gr.rulesNeeded); } });
}

// --- affichage ---
const colTabs = (active) => `<div class="seg" role="tablist">${[['collection', L.gr.tabCards], ['graded', L.gr.tab], ['decks', L.dk.title]].map(([k, l]) => `<button data-nav="${k}" aria-pressed="${active === k}">${l}</button>`).join('')}</div>`;
// slab dessiné : étiquette de la société + carte ; remplacé par la photo du vrai slab si l'utilisateur en a mis une
function slabTile(e, opts = {}) {
  const c = cardsById.get(e.id);
  if (!c) return '';
  const G = grader(e.co);
  const v = opts.friend ? null : gValue(e);
  const s = setOf(c.set);
  const name = e.l === 'en' ? c.nameEn ?? c.name : c.name;
  const art = e.l === 'en' && c.imageEn ? c.imageEn : c.image;
  const inner = `<span class="slab-label"><b class="slab-co">${esc(G.name ? e.co : L.gr.other)}</b><span class="slab-txt">${esc(name)}<small>${esc(s?.print ?? c.set)} · ${esc(c.number)} · ${e.l.toUpperCase()}</small></span><strong class="slab-grade num">${esc(gradeNum(e.gr) ? String(gradeNum(e.gr)) : e.gr)}${grader(e.co).specials?.some(([k]) => k === e.gr) ? '<i>★</i>' : ''}</strong></span>
      <span class="slab-win"><img src="${esc(art || placeholderArt(c))}" alt="" loading="lazy" decoding="async" data-ph="${esc(placeholderArt(c))}"></span>
      ${e.ph ? `<img class="slab-photo" alt="" data-gphoto="${esc(e.g)}" ${opts.friend ? `data-guid="${esc(opts.friend)}"` : ''}>` : ''}`;
  if (opts.big) return `<div class="slab big" style="--gc:${G.color}">${inner}</div>`;
  return `<div class="slab-cell">
    <button class="slab" data-gopen="${esc(e.g)}" ${opts.friend ? `data-gfriend="${esc(opts.friend)}"` : ''} style="--gc:${G.color}" aria-label="${esc(`${name} · ${graderName(e.co)} ${gradeLabel(e.co, e.gr)}`)}">${inner}</button>
    ${opts.friend ? '' : `<span class="slab-price num">${v != null ? eur(v) : `<span class="muted">${L.gr.noSale}</span>`}</span>`}
  </div>`;
}
let gFilter = '';
function renderGraded() {
  setTopbar(`<h1>${L.myCollection}</h1><button class="chip" data-action="g-add">+ ${L.gr.add}</button>`);
  const list = user.graded.filter((e) => cardsById.has(e.id));
  const cos = [...new Set(list.map((e) => e.co))];
  if (gFilter && !cos.includes(gFilter)) gFilter = '';
  const shown = list.filter((e) => !gFilter || e.co === gFilter)
    .sort((a, b) => (gValue(b) ?? b.paid ?? 0) - (gValue(a) ?? a.paid ?? 0));
  const paid = list.reduce((a, e) => a + (Number(e.paid) || 0), 0);
  const est = list.reduce((a, e) => a + (gValue(e) ?? 0), 0);
  view.innerHTML = `<div class="stack">
    ${colTabs('graded')}
    ${!list.length ? `<div class="empty"><strong>${L.gr.empty}</strong>${L.gr.emptyHint}<button class="cta" data-action="g-add">+ ${L.gr.add}</button></div>` : `
    <div class="kpis">
      <div class="stat"><small>${L.gr.kSlabs}</small><b class="num">${list.length}</b></div>
      <div class="stat"><small>${L.gr.kPaid}</small><b class="num">${eur(paid)}</b></div>
      <div class="stat"><small>${L.gr.kValue}</small><b class="num">${eur(est)}</b></div>
    </div>
    ${cos.length > 1 ? `<div class="chips"><button class="chip" data-gco-filter="" aria-pressed="${!gFilter}">${L.all}</button>${cos.map((k) => `<button class="chip" data-gco-filter="${esc(k)}" aria-pressed="${gFilter === k}">${esc(graderName(k))} · ${list.filter((e) => e.co === k).length}</button>`).join('')}</div>` : ''}
    <div class="slabs">${shown.map((e) => slabTile(e)).join('')}</div>
    <p class="note">${L.gr.valueNote}</p>`}
  </div>`;
  gHydrate(view);
}

// --- formulaire d'ajout / modification ---
let gForm = null;
function openGForm(init = {}) {
  const old = init.g ? user.graded.find((e) => e.g === init.g) : null;
  gForm = old ? { ...old, photo: undefined, q: '' } : { g: '', id: init.id ?? '', l: init.l ?? cardLang, co: 'PSA', gr: '10', cert: '', paid: '', at: new Date().toISOString().slice(0, 10), q: '' };
  renderGForm();
}
function gFormRead() {
  if (!gForm) return;
  const v = (id) => document.getElementById(id)?.value;
  if (v('gGrade') != null) gForm.gr = v('gGrade');
  if (v('gCert') != null) gForm.cert = v('gCert').trim();
  if (v('gPaid') != null) gForm.paid = v('gPaid');
  if (v('gAt') != null) gForm.at = v('gAt');
  if (v('gQuery') != null) gForm.q = v('gQuery');
}
function gPickList(q) {
  const f = fold(q.trim());
  if (f.length < 2) return [];
  return [...catalog.cards, ...extras].filter((c) => fold([c.name, c.nameEn, `${printCode(c.set)} ${c.number}`, `${c.set} ${c.number}`].join(' ')).includes(f)).slice(0, 30);
}
function renderGForm(focus) {
  openId = null; sheetMode = 'gform';
  const f = gForm;
  const c = cardsById.get(f.id);
  const G = grader(f.co);
  const grades = [...(G.specials ?? []), ...GRADES.map((g) => [g, g])];
  if (!grades.some(([k]) => k === f.gr)) f.gr = '10';
  const langs = c?.languages ?? ['fr', 'en'];
  if (c && !langs.includes(f.l)) f.l = langs[0];
  const picks = c ? [] : gPickList(f.q);
  sheetPanel.innerHTML = `${sheetTop()}<div class="stack gform">
    <h2 id="sheetTitle" style="margin:0;font:700 22px var(--font-display)">${f.g ? L.gr.edit : L.gr.add}</h2>
    <div class="panel"><h3>${L.gr.card}</h3>
      ${c ? `<div class="gpick-on">${compactTile(c)}<div><b>${esc(f.l === 'en' ? c.nameEn ?? c.name : c.name)}</b><br><span class="note num">${esc(printCode(c.set))} · ${esc(c.number)}</span></div>${f.g ? '' : `<button class="link-btn" data-action="g-unpick">${L.gr.change}</button>`}</div>`
        : `<input class="search" id="gQuery" type="search" placeholder="${L.gr.findCard}" value="${esc(f.q)}" autocomplete="off">
           <div class="gpicks">${picks.map((p) => `<button class="gpick" data-gpick="${esc(p.id)}"><span class="title-code">${esc(printCode(p.set))}</span>${esc(cardName(p))} <span class="note num">${esc(p.number)}</span></button>`).join('') || (fold(f.q).length >= 2 ? `<p class="note">${L.noResult}</p>` : '')}</div>`}
      ${c ? `<div class="seg">${langs.map((k) => `<button type="button" data-glang="${k}" aria-pressed="${f.l === k}">${k.toUpperCase()}</button>`).join('')}</div>` : ''}
    </div>
    <div class="panel"><h3>${L.gr.company}</h3>
      <div class="chips wrap">${GRADERS.map((x) => `<button class="chip" data-gco="${x.k}" aria-pressed="${f.co === x.k}">${esc(x.name || L.gr.other)}</button>`).join('')}</div>
      <label class="field"><span>${L.gr.grade}</span><select id="gGrade">${grades.map(([k, l]) => `<option value="${esc(k)}" ${k === f.gr ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label class="field"><span>${L.gr.cert}</span><input id="gCert" inputmode="numeric" autocomplete="off" value="${esc(f.cert)}" placeholder="${L.gr.certPh}"></label>
    </div>
    <div class="panel"><h3>${L.gr.purchase}</h3>
      <div class="field-row">
        <label class="field"><span>${L.gr.paid}</span><input id="gPaid" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(f.paid)}" placeholder="0,00"></label>
        <label class="field"><span>${L.gr.date}</span><input id="gAt" type="date" value="${esc(f.at)}"></label>
      </div>
    </div>
    <div class="panel"><h3>${L.gr.photo} <small>${L.gr.optional}</small></h3>
      <div class="gphoto-row">${f.photo ? `<img class="gphoto-prev" src="${esc(f.photo)}" alt="">` : f.ph ? `<img class="gphoto-prev" alt="" data-gphoto="${esc(f.g)}">` : ''}
        <label class="btn-ghost" for="gPhotoFile">${I.camera}<span>${f.photo || f.ph ? L.gr.photoChange : L.gr.photoAdd}</span></label>
        ${f.photo || f.ph ? `<button class="link-btn" data-action="g-photo-del">${L.gr.photoDel}</button>` : ''}</div>
      <input id="gPhotoFile" type="file" accept="image/*" hidden>
      <p class="note" style="margin:0">${L.gr.photoHint}</p>
    </div>
    <button class="cta" data-action="g-save" ${c ? '' : 'disabled'}>${L.gr.save}</button>
    ${f.g ? `<button class="btn-ghost danger" data-action="g-del">${f.confirmDel ? L.gr.delSure : L.gr.del}</button>` : ''}
  </div>`;
  sheet.hidden = false; document.body.style.overflow = 'hidden';
  gHydrate(sheetPanel);
  if (focus) { const el = document.getElementById(focus); el?.focus(); if (el?.setSelectionRange && el.type !== 'number') el.setSelectionRange(el.value.length, el.value.length); }
}
async function gSaveForm() {
  gFormRead();
  const f = gForm;
  if (!cardsById.has(f.id)) return;
  const isNew = !f.g;
  const e = { g: f.g || `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, id: f.id, l: f.l, co: f.co, gr: f.gr, cert: f.cert || '', paid: f.paid === '' ? null : Math.round(Number(f.paid) * 100) / 100, at: f.at || '', ph: !!(f.photo || (f.ph && f.photo !== null)) };
  if (f.photo) await gPhotoPut(e.g, f.photo);
  else if (f.photo === null && f.g) await gPhotoDel(e.g);
  user.graded = isNew ? [...user.graded, e] : user.graded.map((x) => (x.g === e.g ? e : x));
  gSave();
  toast(isNew ? L.gr.added : L.gr.saved);
  gForm = null;
  if (currentRender === renderGraded) renderGraded();
  openSlab(e.g);
}

// --- fiche d'un slab : grande image, valeur, ventes réussies et courbe ---
let gOpen = null;
async function openSlab(g, friendUid) {
  const fv = friendUid ? fr.view?.graded : null;
  const e = (fv ?? user.graded).find((x) => x.g === g);
  if (!e) return;
  openId = null; sheetMode = 'gview'; gOpen = { g, friend: friendUid ?? null };
  const c = cardsById.get(e.id);
  const G = grader(e.co);
  const sales = friendUid ? (fr.view?.gsales?.[gkey(e)] ?? []).slice().sort((a, b) => (a[0] < b[0] ? -1 : 1)) : gSales(e);
  const v = gValue(e, sales);
  const name = e.l === 'en' ? c.nameEn ?? c.name : c.name;
  const gain = v != null && e.paid ? v - e.paid : null;
  const certUrl = e.cert && G.cert ? G.cert(e.cert) : '';
  sheetPanel.innerHTML = `${sheetTop()}<div class="stack detail gview">
    <div class="gview-top">
      <div class="gview-img" data-zoom role="button" tabindex="0" aria-label="${L.zoom}">${slabTile(e, { friend: friendUid ?? undefined, big: true })}</div>
      <div class="detail-info">
        <h2 id="sheetTitle">${esc(name)}</h2>
        <div class="sub">${esc(setName(setOf(c.set) ?? {}) || c.set)}<br><span class="num"><b class="print">${esc(printCode(c.set))}</b> · ${esc(c.number)} · ${e.l.toUpperCase()}</span></div>
        <span class="rarity" style="--rc:${G.color}">${esc(graderName(e.co))} · ${esc(gradeLabel(e.co, e.gr))}</span>
        ${e.cert ? `<span class="sub num">${L.gr.certShort} ${esc(e.cert)}${certUrl ? ` · <a href="${esc(certUrl)}" target="_blank" rel="noopener">${L.gr.verify}</a>` : ''}</span>` : ''}
        <div class="big-price num"><small>${L.gr.estimate}</small>${v != null ? eur(v) : `<span style="font-size:18px;color:var(--muted)">${L.gr.noSale}</span>`}</div>
        ${!friendUid && e.paid != null ? `<span class="sub num">${L.gr.paidOn(eur(e.paid), e.at ? fmt.date.format(parseDay(e.at)) : '')}${gain != null ? ` · <b class="${gain >= 0 ? 'up' : 'down'}">${gain >= 0 ? '+' : ''}${eur(gain)}</b>` : ''}</span>` : ''}
      </div>
    </div>
    <section class="panel">
      <h3>${L.gr.curve} <small>${L.gr.salesCount(sales.length)}</small></h3>
      <div class="chart" id="gChart"></div>
      ${friendUid ? '' : `<form class="gsale-form" id="gSaleForm">
        <input id="gSaleDate" type="date" value="${new Date().toISOString().slice(0, 10)}" aria-label="${L.gr.date}">
        <input id="gSalePrice" type="number" inputmode="decimal" min="0" step="0.01" placeholder="${L.gr.salePrice}" aria-label="${L.gr.salePrice}">
        <button class="chip" type="submit">+ ${L.gr.addSale}</button>
      </form>`}
      ${sales.length ? `<div class="gsales">${sales.slice().reverse().map(([d, p]) => `<div class="gsale num"><span>${fmt.date.format(parseDay(d))}</span><b>${eur(p)}</b>${friendUid ? '' : `<button class="mini-x" data-gsale-del="${esc(`${d}|${p}`)}" aria-label="${L.gr.delSale}">${I.x}</button>`}</div>`).join('')}</div>` : ''}
      <p class="note" style="margin:0">${L.gr.ebayNote}</p>
    </section>
    <a class="cta" href="${esc(gEbayUrl(e))}" target="_blank" rel="noopener">${L.gr.ebay} ${I.ext}</a>
    <a class="btn-ghost" style="text-align:center;text-decoration:none" href="${esc(gPcUrl(e))}" target="_blank" rel="noopener">${L.gr.pc}</a>
    <button class="btn-ghost" data-open-card="${esc(e.id)}">${L.gr.seeCard}</button>
    ${friendUid ? '' : `<button class="btn-ghost" data-action="g-edit">${L.gr.edit}</button>`}
  </div>`;
  sheet.hidden = false; document.body.style.overflow = 'hidden';
  gHydrate(sheetPanel);
  drawChart(document.getElementById('gChart'), sales.length === 1 ? [sales[0], [new Date().toISOString().slice(0, 10), sales[0][1]]] : sales, true);
  if (sales.length < 2) document.querySelector('#gChart .chart-empty')?.replaceChildren(L.gr.chartWait);
}

// --- actions ---
document.addEventListener('click', async (ev) => {
  const t = ev.target.closest('[data-gopen],[data-gco],[data-gco-filter],[data-glang],[data-gpick],[data-gsale-del],[data-open-card],[data-action^="g-"]');
  if (!t) return;
  const d = t.dataset;
  if (d.gopen) { ev.preventDefault(); openSlab(d.gopen, d.gfriend); return; }
  if (d.gcoFilter !== undefined) { gFilter = d.gcoFilter; renderGraded(); return; }
  if (d.openCard) { const id = d.openCard; closeCard(); openCard(id); return; }
  if (d.gsaleDel && gOpen) {
    const e = user.graded.find((x) => x.g === gOpen.g); if (!e) return;
    const k = gkey(e);
    user.gsales[k] = (user.gsales[k] ?? []).filter(([dd, p]) => `${dd}|${p}` !== d.gsaleDel);
    if (!user.gsales[k].length) delete user.gsales[k];
    gSave(); openSlab(e.g); if (currentRender === renderGraded) renderGraded();
    return;
  }
  if (!gForm && d.action !== 'g-add' && d.action !== 'g-edit' && d.action !== 'g-add-card') return;
  if (d.gco) { gFormRead(); gForm.co = d.gco; renderGForm(); }
  else if (d.glang) { gFormRead(); gForm.l = d.glang; renderGForm(); }
  else if (d.gpick) { gFormRead(); gForm.id = d.gpick; gForm.q = ''; renderGForm(); }
  else if (d.action === 'g-unpick') { gFormRead(); gForm.id = ''; renderGForm('gQuery'); }
  else if (d.action === 'g-add') openGForm();
  else if (d.action === 'g-add-card') openGForm({ id: d.id, l: cardLang });
  else if (d.action === 'g-edit' && gOpen) openGForm({ g: gOpen.g });
  else if (d.action === 'g-photo-del') { gFormRead(); gForm.photo = null; gForm.ph = false; renderGForm(); }
  else if (d.action === 'g-save') gSaveForm();
  else if (d.action === 'g-del') {
    gFormRead();
    if (!gForm.confirmDel) { gForm.confirmDel = true; renderGForm(); return; }
    const g = gForm.g;
    user.graded = user.graded.filter((x) => x.g !== g);
    gPhotoDel(g); gSave(); gForm = null; closeCard(); toast(L.gr.deleted);
    if (currentRender === renderGraded) renderGraded();
  }
});
document.addEventListener('input', (ev) => {
  if (ev.target.id !== 'gQuery' || !gForm) return;
  gForm.q = ev.target.value;
  const box = sheetPanel.querySelector('.gpicks');
  const picks = gPickList(gForm.q);
  if (box) box.innerHTML = picks.map((p) => `<button class="gpick" data-gpick="${esc(p.id)}"><span class="title-code">${esc(printCode(p.set))}</span>${esc(cardName(p))} <span class="note num">${esc(p.number)}</span></button>`).join('') || (fold(gForm.q).length >= 2 ? `<p class="note">${L.noResult}</p>` : '');
});
document.addEventListener('change', async (ev) => {
  if (ev.target.id !== 'gPhotoFile' || !gForm) return;
  const file = ev.target.files?.[0]; if (!file) return;
  gFormRead();
  try { gForm.photo = await gResize(file); renderGForm(); } catch { toast(L.gr.photoErr); }
});
document.addEventListener('submit', (ev) => {
  if (ev.target.id !== 'gSaleForm' || !gOpen) return;
  ev.preventDefault();
  const e = user.graded.find((x) => x.g === gOpen.g); if (!e) return;
  const d = document.getElementById('gSaleDate').value || new Date().toISOString().slice(0, 10);
  const p = Math.round(Number(document.getElementById('gSalePrice').value) * 100) / 100;
  if (!(p > 0)) { document.getElementById('gSalePrice').focus(); return; }
  const k = gkey(e);
  user.gsales[k] = [...(user.gsales[k] ?? []).filter(([dd, pp]) => !(dd === d && pp === p)), [d, p]];
  gSave(); openSlab(e.g); toast(L.gr.saleAdded);
  if (currentRender === renderGraded) renderGraded();
});

// ---------- Decks personnalisés (règles du format construit) ----------
// 3 Légendes aux noms différents ; 40 à 50 cartes hors Légendes ; 3 exemplaires max d'une même carte (toutes éditions confondues) ;
// RAM : chaque couleur part de 0 et chaque Légende ajoute sa RAM à sa couleur ; une carte ne peut pas demander plus de RAM
// que la limite de sa couleur. Réserve (tournoi) : 7 cartes.
const DECK = { min: 40, max: 50, copies: 3, legends: 3, side: 7 };
const COLORS = ['Red', 'Blue', 'Yellow', 'Green'];
const nameKey = (c) => c.nameEn ?? c.name;
// une carte par nom (l'édition affichée : dans la langue des cartes, la série la plus ancienne)
let printsByName = null;
function deckPrints() {
  if (printsByName) return printsByName;
  printsByName = new Map();
  const order = new Map(catalog.sets.map((s) => [s.code, s.order ?? 999]));
  for (const c of catalog.cards) { const k = nameKey(c); if (!printsByName.has(k)) printsByName.set(k, []); printsByName.get(k).push(c); }
  for (const list of printsByName.values()) list.sort((a, b) => (order.get(a.set) ?? 999) - (order.get(b.set) ?? 999) || String(a.number).localeCompare(String(b.number)));
  return printsByName;
}
const canonOf = (c) => { const l = deckPrints().get(nameKey(c)) ?? [c]; return l.find(inCardLang) ?? l[0]; };
const deckPool = () => [...deckPrints().values()].map((l) => l.find(inCardLang) ?? l[0]);
const ownedByName = (c) => (deckPrints().get(nameKey(c)) ?? [c]).reduce((a, x) => a + qtyAll(x.id), 0);
const cheapest = (c) => { const ps = (deckPrints().get(nameKey(c)) ?? [c]).map((x) => price(x.id)).filter((v) => v != null); return ps.length ? Math.min(...ps) : null; };

if (!Array.isArray(user.decks)) user.decks = [];
if (!Array.isArray(user.decksGone)) user.decksGone = [];
const deckById = (d) => user.decks.find((x) => x.d === d);
const dSig = () => JSON.stringify([user.decks, user.decksGone]);
let dLastSig = dSig();
function dSave() {
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* */ }
  const sig = dSig();
  if (sig !== dLastSig) { dLastSig = sig; dCloudChanged(); }
}
const sumMap = (m) => Object.values(m ?? {}).reduce((a, n) => a + n, 0);

function deckCheck(dk) {
  const legs = dk.legends.map((id) => cardsById.get(id)).filter(Boolean);
  const ram = Object.fromEntries(COLORS.map((k) => [k, 0]));
  for (const l of legs) if (l.color in ram) ram[l.color] += l.ram ?? 0;
  const count = sumMap(dk.main), sideCount = sumMap(dk.side);
  const byName = new Map();
  for (const m of [dk.main, dk.side]) for (const [id, n] of Object.entries(m)) { const c = cardsById.get(id); if (c) byName.set(nameKey(c), (byName.get(nameKey(c)) ?? 0) + n); }
  const tooMany = [...byName].filter(([, n]) => n > DECK.copies).map(([k]) => k);
  const overRam = Object.keys(dk.main).concat(Object.keys(dk.side)).map((id) => cardsById.get(id)).filter((c) => c && (c.ram ?? 0) > (ram[c.color] ?? 0));
  const legNames = legs.map(nameKey);
  const checks = [
    { k: 'legends', ok: legs.length === DECK.legends && new Set(legNames).size === legs.length, label: L.dk.cLegends(legs.length), hint: new Set(legNames).size < legs.length ? L.dk.sameLegend : '' },
    { k: 'size', ok: count >= DECK.min && count <= DECK.max, label: L.dk.cSize(count), hint: count < DECK.min ? L.dk.needMore(DECK.min - count) : count > DECK.max ? L.dk.tooMany(count - DECK.max) : '' },
    { k: 'copies', ok: !tooMany.length, label: L.dk.cCopies, hint: tooMany.length ? tooMany.join(', ') : '' },
    { k: 'ram', ok: !overRam.length, label: L.dk.cRam, hint: overRam.length ? L.dk.overRam(overRam.length) : '' },
  ];
  return { checks, valid: checks.every((c) => c.ok), ram, count, sideCount, overRam: new Set(overRam.map((c) => c.id)), tooMany: new Set(tooMany), byName };
}
const cardBlock = (c, ram, byName, mode) => {
  if (c.type === 'Legend') return L.dk.isLegend;
  if ((c.ram ?? 0) > (ram[c.color] ?? 0)) return L.dk.ramShort(c.ram, colorLabel(c.color));
  if ((byName.get(nameKey(c)) ?? 0) >= DECK.copies) return L.dk.max3;
  if (mode === 'side' && sumMap(deckUI.deck?.side) >= DECK.side) return L.dk.sideFull;
  return '';
};
const colorDot = (c) => `<i class="cdot" style="--fc:${FACTION[c] ?? '#888'}" title="${esc(colorLabel(c))}"></i>`;

// --- liste des decks ---
function deckValue(dk) {
  let v = 0, miss = 0, missCost = 0;
  const need = new Map();
  for (const m of [dk.main]) for (const [id, n] of Object.entries(m)) { const c = cardsById.get(id); if (c) need.set(nameKey(c), [(need.get(nameKey(c))?.[0] ?? 0) + n, c]); }
  for (const id of dk.legends) { const c = cardsById.get(id); if (c) need.set(nameKey(c), [(need.get(nameKey(c))?.[0] ?? 0) + 1, c]); }
  for (const [, [n, c]] of need) {
    const p = cheapest(c) ?? 0; v += n * p;
    const m = Math.max(0, n - ownedByName(c)); miss += m; missCost += m * p;
  }
  return { v, miss, missCost };
}
function renderDecks() {
  setTopbar(`<h1>${L.dk.title}</h1><button class="chip" data-dact="new">+ ${L.dk.new}</button>`);
  const list = [...user.decks].sort((a, b) => (b.upd ?? 0) - (a.upd ?? 0));
  view.innerHTML = `<div class="stack">
    ${colTabs('decks')}
    ${list.length ? `<div class="deck-list">${list.map((dk) => {
      const ck = deckCheck(dk), val = deckValue(dk);
      const legs = dk.legends.map((id) => cardsById.get(id));
      return `<a class="deck-tile" href="#deck-${esc(dk.d)}">
        <span class="deck-legs">${[0, 1, 2].map((i) => (legs[i] ? `<img src="${esc(imageOf(legs[i]) || placeholderArt(legs[i]))}" alt="" loading="lazy">` : '<span class="leg-empty"></span>')).join('')}</span>
        <span class="deck-meta"><b>${esc(dk.name || L.dk.untitled)}</b>
          <span class="note num">${COLORS.filter((k) => ck.ram[k]).map(colorDot).join('')} ${L.dk.cards(ck.count)}${ck.sideCount ? ` + ${ck.sideCount}` : ''} · ${eur(val.v)}</span>
          <span class="dbadge ${ck.valid ? 'ok' : 'ko'}">${ck.valid ? `✓ ${L.dk.legal}` : `${ck.checks.filter((c) => !c.ok).length} ${L.dk.toFix}`}</span>
          ${val.miss ? `<span class="note num">${L.dk.missing(val.miss, eur(val.missCost))}</span>` : `<span class="note">${L.dk.complete}</span>`}</span>
      </a>`;
    }).join('')}</div>` : `<div class="empty"><strong>${L.dk.empty}</strong>${L.dk.emptyHint}<button class="cta" data-dact="new">+ ${L.dk.new}</button></div>`}
    <details class="panel rules"><summary><h3>${L.dk.rulesTitle}</h3></summary><ul>${L.dk.rules.map((r) => `<li>${r}</li>`).join('')}</ul></details>
  </div>`;
}

// --- construction d'un deck ---
const deckUI = { deck: null, mode: 'main', q: '', type: '', color: '', owned: false, pick: null };
function renderDeck(d) {
  const dk = deckById(d);
  if (!dk) { location.hash = '#decks'; return; }
  if (deckUI.deck?.d !== d) { Object.assign(deckUI, { deck: dk, mode: 'main', q: '', type: '', color: '', owned: false, pick: deckUI.newDeck === d ? 0 : null, lq: '', confirmDel: false }); deckUI.newDeck = null; }
  deckUI.deck = dk;
  const ck = deckCheck(dk);
  const legs = dk.legends.map((id) => cardsById.get(id));
  setTopbar(`<a class="icon-btn" href="#decks" aria-label="${L.back}">${I.back}</a><h1 class="small">${esc(dk.name || L.dk.untitled)}</h1>
    <button class="chip" data-dact="export">${L.dk.export}</button>`);
  const list = dk[deckUI.mode];
  const rows = Object.entries(list).map(([id, n]) => [cardsById.get(id), n]).filter(([c]) => c)
    .sort(([a], [b]) => ['Unit', 'Program', 'Gear'].indexOf(a.type) - ['Unit', 'Program', 'Gear'].indexOf(b.type) || (a.cost ?? 0) - (b.cost ?? 0) || cardName(a).localeCompare(cardName(b)));
  const groups = new Map();
  for (const r of rows) { const t = r[0].type; if (!groups.has(t)) groups.set(t, []); groups.get(t).push(r); }
  const curve = Array(8).fill(0);
  for (const [id, n] of Object.entries(dk.main)) { const c = cardsById.get(id); if (c) curve[Math.min(7, c.cost ?? 0)] += n; }
  const cmax = Math.max(1, ...curve);
  const val = deckValue(dk);
  view.innerHTML = `<div class="stack deck-build">
    <input class="search" id="deckName" value="${esc(dk.name)}" placeholder="${L.dk.namePh}" maxlength="60" autocomplete="off">
    <section class="panel deck-status ${ck.valid ? 'is-ok' : ''}">
      <h3>${ck.valid ? `✓ ${L.dk.legal}` : L.dk.notLegal}<small class="num">${eur(val.v)}</small></h3>
      <div class="checks">${ck.checks.map((c) => `<div class="check ${c.ok ? 'ok' : 'ko'}"><b>${c.ok ? '✓' : '✗'}</b><span>${c.label}${c.hint ? `<small>${esc(c.hint)}</small>` : ''}</span></div>`).join('')}</div>
      <div class="ram-row">${COLORS.map((k) => `<span class="ram-pill ${ck.ram[k] ? '' : 'zero'}" style="--fc:${FACTION[k]}">${esc(colorLabel(k))} <b class="num">${ck.ram[k]}</b></span>`).join('')}<small>${L.dk.ramLegend}</small></div>
      ${val.miss ? `<p class="note num" style="margin:0">${L.dk.missing(val.miss, eur(val.missCost))}</p>` : (ck.count ? `<p class="note" style="margin:0">${L.dk.complete}</p>` : '')}
    </section>
    <h2 class="section-title">${L.dk.legends}</h2>
    <div class="leg-slots">${[0, 1, 2].map((i) => legs[i]
      ? `<div class="leg-slot"><button class="card-img" data-open="${esc(legs[i].id)}" aria-label="${esc(cardName(legs[i]))}">${cardImg(legs[i])}</button><span class="leg-ram num" style="--fc:${FACTION[legs[i].color]}">${legs[i].ram ?? 0}</span><button class="leg-x" data-dleg-del="${i}" aria-label="${L.dk.removeLegend}">${I.x}</button></div>`
      : `<button class="leg-slot empty ${deckUI.pick === i ? 'on' : ''}" data-dleg="${i}"><span>+</span>${L.dk.addLegend}</button>`).join('')}</div>
    ${deckUI.pick != null ? legendPicker(dk) : ''}
    <div class="seg">${[['main', `${L.dk.main} · ${ck.count}`], ['side', `${L.dk.side} · ${ck.sideCount}/${DECK.side}`]].map(([k, l]) => `<button data-dmode="${k}" aria-pressed="${deckUI.mode === k}">${l}</button>`).join('')}</div>
    ${rows.length ? [...groups].map(([t, rs]) => `<h3 class="deck-group">${esc(typeLabel(t))} <small class="num">${rs.reduce((a, [, n]) => a + n, 0)}</small></h3>
      <div class="rows">${rs.map(([c, n]) => deckRow(c, n, ck)).join('')}</div>`).join('') : `<p class="note">${deckUI.mode === 'side' ? L.dk.sideHint : L.dk.mainHint}</p>`}
    ${deckUI.mode === 'main' && ck.count ? `<section class="panel"><h3>${L.dk.curve}</h3><div class="curve">${curve.map((n, i) => `<div class="cbar"><span class="num">${n || ''}</span><i style="height:${Math.round((n / cmax) * 100)}%"></i><b class="num">${i === 7 ? '7+' : i}</b></div>`).join('')}</div></section>` : ''}
    <h2 class="section-title">${L.dk.addCards}</h2>
    <input class="search" id="deckSearch" type="search" placeholder="${L.dk.searchPh}" value="${esc(deckUI.q)}" autocomplete="off">
    <div class="chips">${[['', L.all], ['Unit', typeLabel('Unit')], ['Program', typeLabel('Program')], ['Gear', typeLabel('Gear')]].map(([k, l]) => `<button class="chip" data-dtype="${k}" aria-pressed="${deckUI.type === k}">${esc(l)}</button>`).join('')}
      <button class="chip" data-downed aria-pressed="${deckUI.owned}">${L.dk.mine}</button></div>
    <div class="chips">${[['', L.dk.allColors], ...COLORS.map((k) => [k, colorLabel(k)])].map(([k, l]) => `<button class="chip" data-dcolor="${k}" aria-pressed="${deckUI.color === k}">${k ? colorDot(k) : ''}${esc(l)}</button>`).join('')}</div>
    <div id="deckResults">${deckResults(dk, ck)}</div>
    <button class="btn-ghost" data-dact="dup">${L.dk.duplicate}</button>
    <button class="btn-ghost danger" data-dact="del">${deckUI.confirmDel ? L.dk.delSure : L.dk.del}</button>
  </div>`;
}
function deckRow(c, n, ck) {
  const bad = ck.overRam.has(c.id) || ck.tooMany.has(nameKey(c));
  const own = ownedByName(c);
  return `<div class="row deck-row ${bad ? 'bad' : ''}">
    <button class="thumb" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}</button>
    <div class="rmain"><b>${esc(cardName(c))}</b><span class="note num">${colorDot(c.color)}${c.cost != null ? `${L.cost} ${c.cost} · ` : ''}RAM ${c.ram ?? 0}${own < n ? ` · <span class="down">${L.dk.own(own, n)}</span>` : ''}${ck.overRam.has(c.id) ? ` · <span class="down">${L.dk.ramShort(c.ram, colorLabel(c.color))}</span>` : ''}</span></div>
    <div class="stepper small"><button data-dk="-1" data-id="${esc(c.id)}" aria-label="${L.removeCopy}">−</button><output class="num">${n}</output><button data-dk="1" data-id="${esc(c.id)}" aria-label="${L.addCopy}">+</button></div>
  </div>`;
}
function deckResults(dk, ck = deckCheck(dk)) {
  const f = fold(deckUI.q.trim());
  const res = deckPool().filter((c) => c.type !== 'Legend' && (!deckUI.type || c.type === deckUI.type) && (!deckUI.color || c.color === deckUI.color)
    && (!deckUI.owned || ownedByName(c) > 0) && (!f || fold([c.name, c.nameEn, `${printCode(c.set)} ${c.number}`].join(' ')).includes(f)))
    .sort((a, b) => (cardBlock(a, ck.ram, ck.byName) ? 1 : 0) - (cardBlock(b, ck.ram, ck.byName) ? 1 : 0) || (a.cost ?? 0) - (b.cost ?? 0) || cardName(a).localeCompare(cardName(b)));
  if (!res.length) return `<div class="empty"><strong>${L.noResult}</strong></div>`;
  return `<div class="cards deck-pool">${res.slice(0, 90).map((c) => {
    const why = cardBlock(c, ck.ram, ck.byName, deckUI.mode);
    const n = dk[deckUI.mode][c.id] ?? 0;
    return `<div class="card pool-card ${why ? 'blocked' : ''}">
      <button class="card-img" data-open="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}</button>
      ${n ? `<span class="pool-n num">×${n}</span>` : ''}
      <button class="pool-add" data-dk="1" data-id="${esc(c.id)}" ${why ? 'disabled' : ''} aria-label="${L.addCopy}">${why ? esc(why) : '+'}</button>
    </div>`;
  }).join('')}</div>${res.length > 90 ? `<p class="note">${L.dk.refine(res.length)}</p>` : ''}`;
}
function legendPicker(dk) {
  const taken = new Set(dk.legends.map((id) => cardsById.get(id)).filter(Boolean).map(nameKey));
  const f = fold(deckUI.lq ?? '');
  const legs = deckPool().filter((c) => c.type === 'Legend' && !taken.has(nameKey(c)) && (!f || fold([c.name, c.nameEn].join(' ')).includes(f)))
    .sort((a, b) => COLORS.indexOf(a.color) - COLORS.indexOf(b.color) || cardName(a).localeCompare(cardName(b)));
  return `<section class="panel leg-picker"><h3>${L.dk.pickLegend}<button class="link-btn" data-dleg-cancel>${L.dk.cancel}</button></h3>
    <input class="search" id="legSearch" type="search" placeholder="${L.dk.legSearch}" value="${esc(deckUI.lq ?? '')}" autocomplete="off">
    <div class="cards">${legs.map((c) => `<div class="card"><button class="card-img" data-dleg-pick="${esc(c.id)}" aria-label="${esc(cardName(c))}">${cardImg(c)}</button><span class="note num leg-cap">${colorDot(c.color)}${esc(cardName(c).split(' — ')[0])}</span></div>`).join('')}</div>
  </section>`;
}
function deckTouch(dk) { dk.upd = Date.now(); dSave(); }
function deckExport(dk) {
  const line = (id, n) => { const c = cardsById.get(id); return c ? `${n} ${cardName(c)} (${printCode(c.set)} ${c.number})` : ''; };
  const ck = deckCheck(dk);
  return [dk.name || L.dk.untitled, '', `${L.dk.legends} (${dk.legends.filter(Boolean).length})`, ...dk.legends.filter(Boolean).map((id) => line(id, 1)),
    '', `${L.dk.main} (${ck.count})`, ...Object.entries(dk.main).map(([id, n]) => line(id, n)),
    ...(ck.sideCount ? ['', `${L.dk.side} (${ck.sideCount})`, ...Object.entries(dk.side).map(([id, n]) => line(id, n))] : [])].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');
}

document.addEventListener('click', async (ev) => {
  const t = ev.target.closest('[data-dact],[data-dk],[data-dleg],[data-dleg-del],[data-dleg-pick],[data-dleg-cancel],[data-dmode],[data-dtype],[data-dcolor],[data-downed]');
  if (!t) return;
  const d = t.dataset;
  if (d.dact === 'new') {
    const dk = { d: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, name: L.dk.defaultName(user.decks.length + 1), legends: [null, null, null], main: {}, side: {}, upd: Date.now() };
    user.decks.push(dk); dSave(); deckUI.newDeck = dk.d; location.hash = `#deck-${dk.d}`; return;
  }
  const dk = deckUI.deck;
  if (!dk || !deckById(dk.d)) return;
  const rerender = () => renderDeck(dk.d);
  if (d.dk) {
    const c = cardsById.get(d.id); if (!c) return;
    const m = dk[deckUI.mode];
    const ck = deckCheck(dk);
    if (Number(d.dk) > 0 && cardBlock(c, ck.ram, ck.byName, deckUI.mode)) { toast(cardBlock(c, ck.ram, ck.byName, deckUI.mode)); return; }
    const n = Math.max(0, (m[d.id] ?? 0) + Number(d.dk));
    if (n) m[d.id] = n; else delete m[d.id];
    deckTouch(dk); rerender();
  } else if (d.dleg !== undefined) { deckUI.pick = Number(d.dleg); deckUI.lq = ''; rerender(); document.querySelector('.leg-picker')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  else if (d.dlegCancel !== undefined) { deckUI.pick = null; rerender(); }
  else if (d.dlegPick) {
    const slot = deckUI.pick ?? dk.legends.findIndex((x) => !x);
    if (slot < 0) return;
    dk.legends[slot] = d.dlegPick;
    const next = dk.legends.findIndex((x) => !x);
    deckUI.pick = next >= 0 ? next : null; deckUI.lq = '';
    deckTouch(dk); rerender();
  } else if (d.dlegDel !== undefined) { dk.legends[Number(d.dlegDel)] = null; deckTouch(dk); rerender(); }
  else if (d.dmode) { deckUI.mode = d.dmode; rerender(); }
  else if (d.dtype !== undefined) { deckUI.type = d.dtype; document.getElementById('deckResults').innerHTML = deckResults(dk); for (const b of document.querySelectorAll('[data-dtype]')) b.setAttribute('aria-pressed', b.dataset.dtype === d.dtype); }
  else if (d.dcolor !== undefined) { deckUI.color = d.dcolor; document.getElementById('deckResults').innerHTML = deckResults(dk); for (const b of document.querySelectorAll('[data-dcolor]')) b.setAttribute('aria-pressed', b.dataset.dcolor === d.dcolor); }
  else if (d.downed !== undefined) { deckUI.owned = !deckUI.owned; t.setAttribute('aria-pressed', deckUI.owned); document.getElementById('deckResults').innerHTML = deckResults(dk); }
  else if (d.dact === 'export') {
    const txt = deckExport(dk);
    try { await navigator.clipboard.writeText(txt); toast(L.dk.copied); } catch { prompt(L.dk.export, txt); }
  } else if (d.dact === 'dup') {
    const copy = JSON.parse(JSON.stringify(dk));
    copy.d = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`; copy.name = `${dk.name} (2)`; copy.upd = Date.now();
    user.decks.push(copy); dSave(); toast(L.dk.duplicated); location.hash = `#deck-${copy.d}`;
  } else if (d.dact === 'del') {
    if (!deckUI.confirmDel) { deckUI.confirmDel = true; rerender(); setTimeout(() => { deckUI.confirmDel = false; }, 4000); return; }
    deckUI.confirmDel = false;
    user.decks = user.decks.filter((x) => x.d !== dk.d); user.decksGone = [...new Set([...user.decksGone, dk.d])].slice(-200);
    dSave(); toast(L.dk.deleted); location.hash = '#decks';
  }
});
document.addEventListener('input', (ev) => {
  const dk = deckUI.deck;
  if (!dk) return;
  if (ev.target.id === 'deckSearch') { deckUI.q = ev.target.value; document.getElementById('deckResults').innerHTML = deckResults(dk); }
  else if (ev.target.id === 'deckName') { dk.name = ev.target.value.slice(0, 60); const h = topbar.querySelector('h1'); if (h) h.textContent = dk.name || L.dk.untitled; }
  else if (ev.target.id === 'legSearch') {
    deckUI.lq = ev.target.value;
    const box = document.querySelector('.leg-picker'); if (!box) return;
    const tmp = document.createElement('div'); tmp.innerHTML = legendPicker(dk);
    box.querySelector('.cards').replaceWith(tmp.querySelector('.cards'));
  }
});
document.addEventListener('change', (ev) => { if (ev.target.id === 'deckName' && deckUI.deck) deckTouch(deckUI.deck); });

// --- synchro : document decks/<uid> ---
const dRef = (uid = cloud.user.uid) => cloud.api.fsM.doc(cloud.api.db, 'decks', uid);
const dCloud = { unsub: null, timer: 0, dirty: false, denied: false };
function dMerge(a, b) {
  const gone = new Set([...(a?.gone ?? []), ...(b?.gone ?? [])]);
  const m = new Map();
  for (const dk of [...(a?.list ?? []), ...(b?.list ?? [])]) if (!gone.has(dk.d) && (!m.has(dk.d) || (dk.upd ?? 0) >= (m.get(dk.d).upd ?? 0))) m.set(dk.d, dk);
  return { list: [...m.values()], gone: [...gone].slice(-200) };
}
function dApply(x) {
  user.decks = x.list; user.decksGone = x.gone ?? [];
  dLastSig = dSig();
  try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* */ }
  if (currentRender === renderDecks) renderDecks();
  else if (deckUI.deck && location.hash === `#deck-${deckUI.deck.d}` && !document.activeElement?.matches('input')) { deckUI.deck = deckById(deckUI.deck.d) ?? null; if (deckUI.deck) renderDeck(deckUI.deck.d); }
}
async function dPush() {
  if (!cloud.user) return;
  clearTimeout(dCloud.timer);
  try { await cloud.api.fsM.setDoc(dRef(), { list: user.decks, gone: user.decksGone, updatedAt: cloud.api.fsM.serverTimestamp() }); dCloud.dirty = false; user.dPending = false; dCloud.denied = false; try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* */ } }
  catch (e) { if (e?.code === 'permission-denied' && !dCloud.denied) { dCloud.denied = true; toast(L.dk.rulesNeeded); } }
}
function dCloudChanged() {
  if (!cloud.enabled) return;
  user.dPending = true;
  if (!cloud.user) return;
  dCloud.dirty = true;
  clearTimeout(dCloud.timer);
  dCloud.timer = setTimeout(dPush, 1500);
}
function dOnUser(u) {
  dCloud.unsub?.(); dCloud.unsub = null;
  if (!u) return;
  let first = true;
  dCloud.unsub = cloud.api.fsM.onSnapshot(dRef(u.uid), async (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    const remote = snap.exists() ? { list: snap.data().list ?? [], gone: snap.data().gone ?? [] } : null;
    const local = { list: user.decks, gone: user.decksGone };
    if (first) {
      first = false;
      const next = !remote ? local : (user.dSyncedUid !== u.uid || user.dPending) ? dMerge(remote, local) : remote;
      user.dSyncedUid = u.uid;
      dApply(next);
      if (!remote || JSON.stringify(next) !== JSON.stringify(remote)) await dPush();
      return;
    }
    if (dCloud.dirty || !remote) return;
    dApply(remote);
  }, (e) => { if (e?.code === 'permission-denied' && !dCloud.denied) { dCloud.denied = true; toast(L.dk.rulesNeeded); } });
}


// ---------- Zoom plein écran sur une carte : pincer, double-toucher, molette (PC), glisser pour se déplacer ----------
let zoomEl = null;
const zs = { k: 1, x: 0, y: 0, pts: new Map(), start: null, lastTap: 0, moved: false };
function zoomApply(anim) {
  const img = zoomEl.querySelector('img');
  img.style.transition = anim ? 'transform .2s ease' : 'none';
  img.style.transform = `translate(${zs.x}px, ${zs.y}px) scale(${zs.k})`;
  zoomEl.classList.toggle('zoomed', zs.k > 1.01);
}
function zoomClamp() {
  const img = zoomEl.querySelector('img');
  const w = img.offsetWidth * zs.k, h = img.offsetHeight * zs.k;
  const mx = Math.max(0, (w - innerWidth) / 2 + 20), my = Math.max(0, (h - innerHeight) / 2 + 20);
  zs.k = Math.min(5, Math.max(1, zs.k));
  zs.x = Math.min(mx, Math.max(-mx, zs.x)); zs.y = Math.min(my, Math.max(-my, zs.y));
  if (zs.k === 1) { zs.x = 0; zs.y = 0; }
}
// zoom autour d'un point de l'écran (cx, cy)
function zoomAt(k, cx, cy) {
  const ox = cx - innerWidth / 2, oy = cy - innerHeight / 2;
  const r = k / zs.k;
  zs.x = ox - (ox - zs.x) * r; zs.y = oy - (oy - zs.y) * r; zs.k = k;
}
function zoomOpen(src, alt) {
  if (!zoomEl) {
    zoomEl = document.createElement('div');
    zoomEl.className = 'zoom-view'; zoomEl.hidden = true;
    zoomEl.setAttribute('role', 'dialog'); zoomEl.setAttribute('aria-modal', 'true');
    zoomEl.innerHTML = `<img alt="" draggable="false"><button class="icon-btn zoom-close" aria-label="${L.close}">${I.x}</button><p class="zoom-tip"></p>`;
    document.body.append(zoomEl);
    zoomEl.querySelector('.zoom-close').addEventListener('click', zoomClose);
    zoomEl.addEventListener('pointerdown', zoomDown);
    zoomEl.addEventListener('pointermove', zoomMove);
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) zoomEl.addEventListener(t, zoomUp);
    zoomEl.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(zs.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); zoomClamp(); zoomApply(); }, { passive: false });
  }
  const img = zoomEl.querySelector('img');
  img.src = src; img.alt = alt ?? '';
  zoomEl.querySelector('.zoom-tip').textContent = L.zoomHint;
  zoomEl.querySelector('.zoom-close').setAttribute('aria-label', L.close);
  Object.assign(zs, { k: 1, x: 0, y: 0, start: null }); zs.pts.clear();
  zoomEl.hidden = false; zoomApply();
  zoomEl.querySelector('.zoom-close').focus({ preventScroll: true });
}
function zoomClose() { if (zoomEl) zoomEl.hidden = true; }
function zoomDown(e) {
  if (e.target.closest('.zoom-close')) return;
  zoomEl.setPointerCapture?.(e.pointerId);
  zs.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  zs.moved = false;
  zs.start = { k: zs.k, x: zs.x, y: zs.y, pts: new Map([...zs.pts].map(([id, p]) => [id, { ...p }])) };
}
function zoomMove(e) {
  if (!zs.pts.has(e.pointerId) || !zs.start) return;
  zs.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const now = [...zs.pts.values()], was = [...zs.start.pts.values()];
  if (now.length >= 2 && was.length >= 2) {
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const c0 = { x: (was[0].x + was[1].x) / 2, y: (was[0].y + was[1].y) / 2 }, c1 = { x: (now[0].x + now[1].x) / 2, y: (now[0].y + now[1].y) / 2 };
    Object.assign(zs, { k: zs.start.k, x: zs.start.x, y: zs.start.y });
    zoomAt(zs.start.k * (d(now[0], now[1]) / (d(was[0], was[1]) || 1)), c0.x, c0.y);
    zs.x += c1.x - c0.x; zs.y += c1.y - c0.y;
  } else if (now.length === 1 && was.length >= 1) {
    const dx = now[0].x - was[0].x, dy = now[0].y - was[0].y;
    if (Math.abs(dx) + Math.abs(dy) > 6) zs.moved = true;
    if (zs.k > 1) { zs.x = zs.start.x + dx; zs.y = zs.start.y + dy; }
  }
  zs.moved = zs.moved || now.length > 1;
  zoomClamp(); zoomApply();
}
function zoomUp(e) {
  if (!zs.pts.has(e.pointerId)) return;
  const single = zs.pts.size === 1;
  zs.pts.delete(e.pointerId);
  zs.start = zs.pts.size ? { k: zs.k, x: zs.x, y: zs.y, pts: new Map([...zs.pts].map(([id, p]) => [id, { ...p }])) } : null;
  if (!single || zs.moved || e.type !== 'pointerup') return;
  // toucher simple : double-toucher = zoom / dézoom ; toucher hors de la carte sans zoom = fermer
  const t = Date.now();
  if (t - zs.lastTap < 300) { if (zs.k > 1.01) Object.assign(zs, { k: 1, x: 0, y: 0 }); else zoomAt(2.5, e.clientX, e.clientY); zoomClamp(); zoomApply(true); zs.lastTap = 0; return; }
  zs.lastTap = t;
  if (zs.k <= 1.01 && e.target === zoomEl) setTimeout(() => { if (zs.lastTap === t) zoomClose(); }, 300);
}
document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]');
  if (!z) return;
  const img = z.querySelector('img.slab-photo[src]') ?? z.querySelector('img');
  if (z.dataset.hd) zoomOpen(z.dataset.hd, img?.alt);
  else if (img?.src) zoomOpen(img.src, img.alt);
});


// ---------- Actualités officielles (cyberpunktcg.com/blog), badge rouge = articles pas encore lus ----------
let news = [];
const NEWS_KEY = 'nightdex:newsRead';
let newsRead = null;
function newsInit() {
  try { newsRead = new Set(JSON.parse(localStorage.getItem(NEWS_KEY) ?? 'null') ?? []); } catch { newsRead = null; }
  if (!newsRead || !newsRead.size) {
    // première fois : seuls les 3 articles les plus récents comptent comme nouveaux
    newsRead = new Set(news.slice(3).map((n) => n.id));
    newsSaveRead();
  }
  newsBadge();
}
function newsSaveRead() { try { localStorage.setItem(NEWS_KEY, JSON.stringify([...newsRead].slice(-300))); } catch { /* */ } }
const newsUnread = () => (newsRead ? news.filter((n) => !newsRead.has(n.id)).length : 0);
const newsBtn = () => `<a class="icon-btn news-btn" href="#news" aria-label="${L.news.title}">${I.mail}<b class="nbadge num" data-news-badge ${newsUnread() ? '' : 'hidden'}>${newsUnread() > 9 ? '9+' : newsUnread() || ''}</b></a>`;
function newsBadge() {
  const n = newsUnread();
  for (const b of document.querySelectorAll('[data-news-badge]')) { b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n || ''); }
  const lbl = n ? `${L.news.title} · ${L.news.unread(n)}` : L.news.title;
  for (const a of document.querySelectorAll('.news-btn')) a.setAttribute('aria-label', lbl);
}
// titres et résumés en français : traduits à l'avance dans news.json ; les nouveaux articles pas encore traduits
// le sont sur l'appareil par Gemini (même service que Capri), une seule fois, puis gardés en mémoire
const NEWS_FR_KEY = 'nightdex:newsFr';
let newsFr = (() => { try { return JSON.parse(localStorage.getItem(NEWS_FR_KEY) ?? '{}') ?? {}; } catch { return {}; } })();
let newsFrBusy = false;
const newsTitle = (n) => (lang === 'fr' ? n.titleFr ?? newsFr[n.id]?.t ?? n.title : n.title);
const newsExcerpt = (n) => (lang === 'fr' ? n.excerptFr ?? newsFr[n.id]?.e ?? n.excerpt : n.excerpt);
async function newsTranslate() {
  if (lang !== 'fr' || newsFrBusy || !cloud.api?.app) return;
  const todo = news.filter((n) => !n.titleFr && !newsFr[n.id]).slice(0, 12);
  if (!todo.length) return;
  newsFrBusy = true;
  try {
    if (!capri.aiM) { capri.aiM = await import(`${FIREBASE}/firebase-ai.js`); capri.ai = capri.aiM.getAI(cloud.api.app, { backend: new capri.aiM.GoogleAIBackend() }); }
    const models = cloud.cfg?.capriModels?.length ? cloud.cfg.capriModels : CAPRI_MODELS_DEFAULT;
    const prompt = `Traduis en français naturel ces titres et résumés d'articles sur le jeu de cartes Cyberpunk TCG. Garde tels quels les noms propres, noms de séries, de cartes et d'événements (Welcome to Night City, Night City Brawl, Edgerunner Open, Pre-release peut devenir « avant-première »). Réponds uniquement en JSON : [{"id":"…","t":"titre","e":"résumé"}].\n${JSON.stringify(todo.map((n) => ({ id: n.id, t: n.title, e: n.excerpt })))}`;
    for (const name of models) {
      try {
        const model = capri.aiM.getGenerativeModel(capri.ai, { model: name, generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 4000 } });
        const res = await model.generateContent(prompt);
        const out = JSON.parse(res.response.text());
        for (const x of Array.isArray(out) ? out : []) if (x?.id && x.t && todo.some((n) => n.id === x.id)) newsFr[x.id] = { t: String(x.t).slice(0, 300), e: String(x.e ?? '').slice(0, 800) };
        try { localStorage.setItem(NEWS_FR_KEY, JSON.stringify(newsFr)); } catch { /* */ }
        break;
      } catch { /* modèle suivant */ }
    }
  } catch { /* traduction indisponible : on garde l'anglais */ }
  newsFrBusy = false;
  if (currentRender === renderNews) renderNews(true);
}
function renderNews(fromTranslate) {
  setTopbar(`<a class="icon-btn" href="#home" aria-label="${L.back}">${I.back}</a><h1 class="small">${L.news.title}</h1>`);
  const unread = new Set(news.filter((n) => !newsRead?.has(n.id)).map((n) => n.id));
  view.innerHTML = `<div class="stack">
    <p class="note" style="margin:0">${L.news.intro}</p>
    ${news.length ? `<div class="news-list">${news.map((n) => `<a class="news-card ${unread.has(n.id) ? 'unread' : ''}" href="${esc(n.url)}" target="_blank" rel="noopener">
      ${n.image ? `<span class="news-img"><img src="${esc(n.image)}?w=640&fm=webp&q=70" alt="" loading="lazy" decoding="async"></span>` : ''}
      <span class="news-body">
        <span class="news-meta num">${unread.has(n.id) ? `<b class="news-new">${L.news.new}</b>` : ''}${n.date ? esc(fmt.date.format(parseDay(n.date))) : ''}</span>
        <strong>${esc(newsTitle(n))}</strong>
        ${newsExcerpt(n) ? `<span class="news-ex">${esc(newsExcerpt(n))}</span>` : ''}
        <span class="news-link">${L.news.read} ${I.ext}</span>
      </span></a>`).join('')}</div>` : `<div class="empty"><strong>${L.news.empty}</strong></div>`}
  </div>`;
  if (!fromTranslate) newsTranslate();
  // tout est lu une fois la page ouverte (le badge disparaît, les « nouveau » restent affichés jusqu'à la prochaine visite)
  if (newsRead && unread.size) { for (const id of unread) newsRead.add(id); newsSaveRead(); newsBadge(); }
}

// ---------- Navigation ----------
let currentTab = 'home';
function markTabs() {
  const pc = isPC();
  for (const a of document.querySelectorAll('.tabbar a')) {
    const on = a.dataset.tab === currentTab || (!pc && currentTab === 'sealed' && a.dataset.tab === 'home') || (!pc && currentTab === 'decks' && a.dataset.tab === 'collection');
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
}
function route() {
  const h = location.hash.slice(1) || 'home';
  if (!sheet.hidden) closeCard();
  let tab = h;
  if (h.startsWith('set-')) { tab = 'home'; currentRender = () => renderSet(h.slice(4)); }
  else if (h === 'collection') currentRender = renderCollection;
  else if (h === 'graded') { tab = 'collection'; currentRender = renderGraded; }
  else if (h === 'decks') { tab = 'decks'; currentRender = renderDecks; }
  else if (h.startsWith('deck-')) { tab = 'decks'; const d = h.slice(5); currentRender = () => renderDeck(d); }
  else if (h === 'wishlist') currentRender = renderWishlist;
  else if (h === 'search') currentRender = renderSearch;
  else if (h === 'values') currentRender = renderValues;
  else if (h === 'sealed') { tab = 'sealed'; currentRender = renderSealed; }
  else if (h === 'extra') { tab = 'home'; currentRender = renderExtra; }
  else if (h === 'news') { tab = 'home'; currentRender = renderNews; }
  else if (h === 'capri') { currentRender = renderCapri; }
  else if (h === 'friends') { fr.view = null; fr.msg = ''; currentRender = renderFriends; }
  else if (h.startsWith('friend-')) { tab = 'friends'; const uid = h.slice(7); if (fr.view?.uid !== uid) fr.filter = 'all'; renderFriendCurrent = () => renderFriend(uid); currentRender = renderFriendCurrent; }
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
const STRONG = new Set(['Nova Rare', 'Iconic Legend', 'Iconic Other', 'Secret', 'Iconic Secret', 'Exclusive']);
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
// Capri renvoyée (appui long sur téléphone, × sur PC) : cachée jusqu'à la prochaine ouverture de l'appli
let petDismissed = false;
try { petDismissed = sessionStorage.getItem('nightdex:petHidden') === '1'; } catch { /* stockage indisponible */ }
function petDismiss() {
  if (!pet.el || petDismissed) return;
  petDismissed = true;
  try { sessionStorage.setItem('nightdex:petHidden', '1'); } catch { /* stockage indisponible */ }
  pet.drag = null; petStop(); clearTimeout(pet.think);
  petSay(L.petBye, 1200, true);
  setTimeout(() => {
    pet.el.classList.add('tp');
    setTimeout(() => { pet.el.classList.remove('tp'); petSync(); toast(L.petHidden); }, 260);
  }, 700);
}
function petSync() {
  const want = user.prefs.pet !== 'off' && !petDismissed && currentRender !== renderCapri && !!catalog.cards.length;
  if (!pet.el) {
    if (!want) return;
    const layer = document.createElement('div');
    layer.className = 'pet-layer';
    layer.innerHTML = `<div class="pet" data-state="idle" role="button" tabindex="0" aria-label="Capri"><div class="pet-bubble" hidden></div><img class="pet-img" src="${petSprite('idle')}" alt="" draggable="false"><button class="pet-close" type="button" aria-label="${L.petHide}" title="${L.petHide}">×</button></div>`;
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
  el.querySelector('.pet-close').addEventListener('pointerdown', (e) => e.stopPropagation());
  el.querySelector('.pet-close').addEventListener('click', (e) => { e.stopPropagation(); petDismiss(); });
  el.addEventListener('contextmenu', (e) => e.preventDefault());   // pas de menu « enregistrer l'image » à l'appui long
  el.addEventListener('pointerdown', (e) => {
    petWake();
    pet.drag = { sx: e.clientX, sy: e.clientY, moved: false, id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
    // appui long (doigt immobile) : Capri s'en va
    clearTimeout(pet.pressT);
    if (e.pointerType !== 'mouse') pet.pressT = setTimeout(() => { if (pet.drag && !pet.drag.moved) { pet.drag = null; navigator.vibrate?.(30); petDismiss(); } }, 600);
  });
  el.addEventListener('pointermove', (e) => {
    const d = pet.drag;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 8) return;
    if (!d.moved) { clearTimeout(pet.pressT); d.moved = true; petStop(); pet.anchor = null; pet.mode = 'sit'; petState('drag'); petSay(pick(PET_LINES[lang].drag), 2000, true); }
    pet.x = clampX(e.clientX); pet.y = e.clientY + 30; petRender();
  });
  const end = (e) => {
    clearTimeout(pet.pressT);
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
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = '#capri'; else if (e.key === 'Delete' || e.key === 'Backspace') petDismiss(); });
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
  if (user.prefs.ownV !== 2) { migrateOwned(user.owned); user.prefs.ownV = 2; save(); }
  route();
  initCloud();
} catch (err) {
  view.innerHTML = `<div class="empty"><strong>${L.loadError}</strong>${L.loadErrorHint}</div>`;
  console.error(err);
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
