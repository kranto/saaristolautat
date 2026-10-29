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

## Kontitettu paikallisympäristö

Kokonaisuus sisältää erilliset tuotanto- ja testiwebit sekä jatkuvasti ajettavan
AIS-livepäivityksen. Molemmat webit tarjoavat host-koneen viereisen
`../saaristodata`-hakemiston polussa `/data/`. Livepäivittäjä säilyttää
SQLite-tietokannan ja julkaistavat JSON-tiedostot Docker-voluumissa.

Käynnistä ympäristö:

```sh
docker compose -f compose.yml -f compose.local.yml up --build -d
```

Palvelut ovat tämän jälkeen osoitteissa:

- tuotanto: <http://localhost:8080>
- testi: <http://localhost:8081>
- live-JSON: <http://localhost:8080/live/livedata.json>

Seuraa livepäivitystä ja tarkista palvelut:

```sh
docker compose -f compose.yml -f compose.local.yml logs -f liveupdate
curl --fail http://localhost:8080/data/index.json
curl --fail http://localhost:8080/live/livedata.json
```

Portit ja datahakemisto voi vaihtaa ympäristömuuttujilla
`PRODUCTION_PORT`, `TEST_PORT` ja `SAARISTODATA_PATH`. Kontit pysäytetään
komennolla:

```sh
docker compose -f compose.yml -f compose.local.yml down
```

`down` säilyttää livehistorian. Sen poistaminen erikseen vaatii valitsimen
`--volumes`.

## Hetzner-liitoksen periaate

Hetznerillä `production`, `test` ja nykyinen etunginx liitetään samaan ulkoiseen
Docker-verkkoon. Etunginx välittää `saaristolautat.fi`-liikenteen palveluun
`production:80` ja `test.saaristolautat.fi`-liikenteen palveluun `test:80`.
HTTP→HTTPS, `www`-ohjaus ja Let's Encrypt hoidetaan etunginxissä samalla tavalla
kuin nykyiselle `islanti.dy.fi`-palvelulle. Esimerkkikonfiguraatio on tiedostossa
`deploy/hetzner/saaristolautat.conf.example`.

Nykyisen Islanti-compose-projektin nginx ja tämän projektin palvelut täytyy
liittää samaan ennalta luotuun verkkoon, esimerkiksi:

```sh
docker network create public-web
WEB_NETWORK_NAME=public-web docker compose \
  -f compose.yml -f compose.hetzner.yml up --build -d
```

Saaristolauttojen compose ei julkaise host-portteja ilman paikallista
`compose.local.yml`-lisätiedostoa.

## Kartan täydentävät tiet

Ohjeet pohjakartan liian myöhään näyttämien tieosuuksien hakemiseen ja
lisäämiseen löytyvät tiedostosta [`docs/roads.md`](docs/roads.md). Työkalu tukee
OSM-pohjaista reititystä sekä valmiita GeoJSON- ja GPX-tiedostoja.

Vaikeasti toistettavat havainnot kirjataan tiedostoon
[`docs/known-issues.md`](docs/known-issues.md).
