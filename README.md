# Saaristolautat

React-sovellus Turun saariston ja Ahvenanmaan lauttareiteille ja aikatauluille.

## Kehitysympäristö

Projekti käyttää Node.js 24:ää. Jos käytössä on nvm:

```sh
nvm use
npm install
```

Käynnistä paikallinen Vite-kehityspalvelin:

```sh
npm start
```

Sovellus avautuu oletuksena osoitteessa <http://localhost:5173>.

## Tuotantokäännös

```sh
npm run build
```

Valmis sivusto kirjoitetaan `build`-hakemistoon. `public/data` on paikallinen
symbolinen linkki erilliseen dataprojektiin, ja rakennuskomento jättää sen
tarkoituksella tuotantopaketin ulkopuolelle.

## Julkaiseminen

Olemassa olevat julkaisemiskomennot käyttävät `build`-hakemistoa:

```sh
npm run copytest
npm run copystaging
npm run copyprod
```

## Kartan täydentävät tiet

Ohjeet pohjakartan liian myöhään näyttämien tieosuuksien hakemiseen ja
lisäämiseen löytyvät tiedostosta [`docs/roads.md`](docs/roads.md). Työkalu tukee
OSM-pohjaista reititystä sekä valmiita GeoJSON- ja GPX-tiedostoja.

Vaikeasti toistettavat havainnot kirjataan tiedostoon
[`docs/known-issues.md`](docs/known-issues.md).
