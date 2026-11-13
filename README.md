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

> Le dépôt contient au départ des **données de démonstration** (cartes et prix fictifs, signalés par un bandeau jaune).
> Elles sont remplacées dès le premier import Cardmarket.

## Lancer en local

```bash
npm start
```

Puis ouvrir http://localhost:8080.

## Brancher les vrais prix Cardmarket

Cardmarket publie chaque jour deux fichiers publics par jeu : la liste des produits et le guide des prix
(`products_singles_<idGame>.json` et `price_guide_<idGame>.json`).

1. Trouver l'`idGame` du Cyberpunk TCG sur Cardmarket. Il figure dans le nom de ces fichiers.
2. Premier import, qui construit la liste des cartes à partir de Cardmarket :

   ```bash
   node scripts/update-prices.mjs --game <idGame> --bootstrap
   ```

3. Dans `data/config.json`, associer chaque extension Cardmarket à un code de série (`"map": { "1234": "WNC" }`),
   puis relancer avec `--bootstrap`. Le nom de la série peut être modifié dans `data/catalog.json` ou par le CSV ci-dessous.
4. Ensuite, **une fois par jour** :

   ```bash
   node scripts/update-prices.mjs --game <idGame>
   ```

   Chaque exécution ajoute le prix du jour à l'historique. Ce sont ces relevés qui dessinent la courbe.
   Au tout premier passage, la courbe est amorcée avec les moyennes 30 j, 7 j et 1 j de Cardmarket.

Si les fichiers ont été téléchargés à la main : `node scripts/update-prices.mjs --dir <dossier>`.

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

## Mise en ligne automatique (GitHub Pages)

Le workflow `.github/workflows/prix.yml` relève les prix chaque matin, enregistre l'historique dans le dépôt
et publie l'appli sur GitHub Pages.

1. Pousser ce dossier sur un dépôt GitHub.
2. *Settings → Pages* : source « GitHub Actions ».
3. *Settings → Secrets and variables → Actions → Variables* : créer `CM_GAME_ID` avec l'idGame Cardmarket.
4. Lancer une première fois le workflow à la main (*Actions → Run workflow*).

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
| `scripts/make-demo.mjs` | régénère les données de démonstration |
