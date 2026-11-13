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

Une nouvelle série apparaît en tête de l'accueil dans « Nouvelles séries ». Elle est rattachée automatiquement à son
extension Cardmarket en comparant les noms des cartes : les prix et les courbes fonctionnent tout de suite, et le bouton
Cardmarket fait une recherche par nom. Pour avoir les liens directs, son code imprimé (MS02…) et son nom français,
ajouter une ligne dans `SETS` (`scripts/import-officiel.mjs`) et dans `data/config.json` (nom de l'extension dans les adresses Cardmarket).

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
| `data/sealed.json`, `images/sealed/` | produits scellés et leurs visuels |
| `scripts/import-scelle.mjs` | import des produits scellés depuis Cardmarket |
| `scripts/import-officiel.mjs` | import des cartes et images depuis la base officielle |
| `images/` | images des cartes, par série |
| `scripts/make-demo.mjs` | régénère les données de démonstration (cartes fictives) |
