# NightDex – Collection Cyberpunk TCG

Appli web (installable sur téléphone) pour suivre sa collection du **Cyberpunk TCG**, sur le modèle de Pokecardex :

- **Accueil** : les séries avec la progression (cartes possédées / total, %), en liste ou en grille, avec favoris et recherche.
- **Série** : trois affichages (Cartes, Liste, Grille), tri (numéro, prix, nom), filtres (possédées, manquantes, rareté), valeur de la série.
- **Fiche carte** : image, prix tendance Cardmarket en euros (`12,34 €`), prix minimum, moyennes 7 j et 30 j, **courbe de prix** (7 J, 1 M, 3 M, 1 A, Tout) et bouton **Cardmarket**.
- **Collection** : cartes possédées, quantités, valeur totale.
- **Cotes** : valeur de la collection dans le temps, plus fortes hausses et baisses, cartes les plus chères.
- **Souhaits** : liste de souhaits et budget pour la compléter.
- Sauvegarde de la collection sur l'appareil, avec export et import (Réglages).

Aucune dépendance : HTML, CSS et JavaScript, plus trois scripts Node pour les données.

L'appli est disponible **en français et en anglais** (bouton FR/EN sur l'accueil) : textes, noms et images des cartes.
Chaque série affiche son code officiel imprimé sur les cartes (MS01, SD01, SD02, PRR02, NCB01…).

Le dépôt contient les **591 cartes** de la base officielle (cyberpunktcg.com) avec leurs images dans `images/`.
La version française est utilisée quand elle existe (Welcome to Night City, decks de démarrage, Brawl…), sinon l'anglaise (Bêta, decks de démo, promos).
Les prix arrivent avec l'import Cardmarket ci-dessous.

## Mettre à jour les cartes et les images

```bash
npm install
node scripts/import-officiel.mjs
```

Récupère les nouvelles cartes et télécharge les images manquantes (360 px de large, format WebP).
Les prix déjà relevés sont conservés. Derrière un proxy, ajouter `NODE_USE_ENV_PROXY=1` devant la commande.

## Lancer en local

```bash
npm start
```

Puis ouvrir http://localhost:8080.

## Comptes (collection synchronisée entre appareils)

Avec un compte (Google ou e-mail + mot de passe), la collection, les souhaits et les séries favorites sont enregistrés
en ligne et synchronisés entre tous les appareils. Sans compte, tout reste sur le téléphone, comme avant.
La collection reste aussi enregistrée sur le téléphone : l'appli marche hors ligne et envoie les changements au retour du réseau.
Au premier passage d'un appareil sur un compte, les deux collections sont réunies (quantité la plus haute gardée).
Le compte peut être supprimé depuis l'appli (exigé par Google Play).

Les comptes utilisent **Firebase** (gratuit à cette échelle). Mise en place, une seule fois :
1. https://console.firebase.google.com → *Créer un projet* (Google Analytics inutile).
2. *Authentication* → *Commencer* → *Sign-in method* : activer **Google** et **Adresse e-mail/Mot de passe**.
3. *Authentication* → *Paramètres* → *Domaines autorisés* : ajouter `erzs247.github.io`.
4. *Firestore Database* → *Créer une base de données* (mode production, région `eur3` Europe).
   Onglet *Règles* : coller le contenu de `firestore.rules`, puis *Publier*.
5. *Paramètres du projet* (roue dentée) → *Vos applications* → icône web `</>` → nom « NightDex » →
   copier l'objet `firebaseConfig` dans `data/firebase.json` (format JSON : `apiKey`, `authDomain`, `projectId`, `appId`…).
   Ces valeurs sont publiques par conception : la sécurité vient des règles Firestore.

Tant que `data/firebase.json` est vide (`{}`), l'appli fonctionne sans comptes.

## Produits scellés

L'onglet **Scellé** de l'accueil liste les boosters, booster box, cases de 6 booster box, decks et kits
(dont le set 2 « Edgerunners: Burn Bright »), avec prix, courbe, lien Cardmarket direct et suivi dans la collection.

```bash
node scripts/import-scelle.mjs
```

Récupère la liste des produits scellés publiée par Cardmarket et les visuels officiels (cyberpunktcg.com).
Les prix sont relevés chaque jour avec ceux des cartes.

## Prix Cardmarket et courbes

Cardmarket publie chaque nuit deux fichiers publics par jeu (Cyberpunk = jeu n° 23) : la liste des cartes et le guide des prix.

```bash
node scripts/update-prices.mjs
```

- Chaque carte est rattachée à son produit Cardmarket : le bouton « Voir sur Cardmarket » ouvre **la carte exacte**
  (versions alternatives comprises : `-V1`, `-V2`…), filtrée sur la langue de la carte.
- Le prix « tendance » du jour est ajouté à l'historique : **une exécution par jour = un point de plus sur la courbe**.
  Au premier passage, la courbe démarre avec les moyennes 30 j, 7 j et 1 j de Cardmarket.
- Les raretés imprimées en foil (Nova Rare, iconiques, secrètes) utilisent le prix foil.
- La correspondance extension Cardmarket ↔ série est dans `data/config.json`.

## Images, raretés et liens exacts

Les fichiers Cardmarket ne contiennent ni images ni raretés. Pour les ajouter, remplir un CSV
(séparateur `;` ou `,`) puis l'importer :

```csv
set;number;name;rarity;type;image;cardmarket_url;cardmarket_id;set_name
WNC;001;Nom de la carte;Rare;Personnage;https://…/wnc-001.jpg;https://www.cardmarket.com/fr/…;123456;Welcome to Night City
```

```bash
node scripts/import-cards.mjs data/cards.csv
```

Raretés reconnues pour les couleurs : Commune, Peu commune, Rare, Épique, Légendaire, Secrète.
Sans `cardmarket_url`, le bouton ouvre une recherche Cardmarket sur le nom de la carte.
Sans image, l'appli affiche un visuel de remplacement.

## Mise en ligne et mises à jour automatiques (GitHub Pages)

Le workflow `.github/workflows/prix.yml` fait tout seul :

| Quand | Quoi |
|---|---|
| **Chaque jour** vers 7 h | relève les prix Cardmarket des cartes et du scellé, ajoute un point à chaque courbe, republie le site |
| **Chaque lundi** vers 6 h 45 | cherche les **nouvelles séries et cartes** (base officielle, images FR/EN comprises) et les **nouveaux produits scellés** (Cardmarket), puis relève les prix |
| À chaque envoi de code | republie le site |

Chaque lundi, **chaque carte et chaque produit est vérifié** :
- déjà dans l'appli (même identifiant ou même impression officielle) → rien n'est modifié, sauf pour compléter une image ou une langue manquante ;
- nouveau → ajouté avec ses images FR/EN ; une nouvelle série apparaît en tête de l'accueil dans « Nouvelles séries ».

Une nouvelle série est rattachée **automatiquement** à son extension Cardmarket (comparaison des noms des cartes) :
prix et courbes dès le premier relevé. Le nom de l'extension dans les adresses Cardmarket est déduit des produits scellés
de la même extension et du nom officiel de la série, puis vérifié sur Cardmarket : chaque carte reçoit son **lien direct**.
Le résumé de chaque passage (cartes et produits ajoutés) est visible dans l'onglet *Actions* de GitHub.
Seuls le code imprimé (MS02…) et le nom français de la série restent à préciser à la main dans `SETS` (`scripts/import-officiel.mjs`).

Le bouton *Actions → Run workflow* permet aussi de lancer la recherche de nouveautés à la main (case « nouveautés »).

Mise en place :
1. Pousser ce dossier sur un dépôt GitHub public.
2. *Settings → Pages* : source « GitHub Actions ».
3. Lancer une première fois le workflow (*Actions → Run workflow*).

Sur le téléphone, ouvrir l'adresse GitHub Pages puis « Ajouter à l'écran d'accueil ».

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `styles.css`, `app.js` | l'appli |
| `sw.js`, `manifest.webmanifest`, `icons/` | installation et usage hors ligne |
| `data/catalog.json` | séries et cartes |
| `data/prices.json` | prix et historique par carte |
| `data/config.json` | réglages Cardmarket (langue, idGame, correspondance des extensions) |
| `scripts/update-prices.mjs` | relevé quotidien des prix Cardmarket |
| `scripts/import-cards.mjs` | import CSV (images, raretés, liens) |
| `data/firebase.json`, `firestore.rules` | configuration Firebase des comptes et règles de sécurité |
| `data/sealed.json`, `images/sealed/` | produits scellés et leurs visuels |
| `scripts/import-scelle.mjs` | import des produits scellés depuis Cardmarket |
| `scripts/import-officiel.mjs` | import des cartes et images depuis la base officielle |
| `images/` | images des cartes, par série |
| `scripts/make-demo.mjs` | régénère les données de démonstration (cartes fictives) |
