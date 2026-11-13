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

OpenFreeMap-maastokartta käyttää täydentäviä KMTK- ja Syke-aineistoja.
Oletuskartta käyttää KMTK:n kevyttä rakennetun maan aineistoa. Täydentävän
maanpeitteen päälle/pois-valinta ja värisäätimet näytetään vain localhostilla;
testi- ja tuotantokäännöksissä aineisto on aina käytössä.

## Tuotantokäännös

```sh
npm run build
```

Valmis sivusto kirjoitetaan `build`-hakemistoon. `public/data` on paikallinen
symbolinen linkki erilliseen dataprojektiin, ja rakennuskomento jättää sen
tarkoituksella tuotantopaketin ulkopuolelle.

Hakukoneille tarkoitetut suomen-, ruotsin- ja englanninkieliset reittihakemistot
ja reittikohtaiset sivut generoidaan samasta dataprojektista. Päivitä ja versionoi
ne reittidatan muuttuessa:

```sh
npm run seo:update
```

## Julkaiseminen

Sovellus ajetaan kontitettuna Hetznerillä. Domainhotellin webhotellia tai
vanhoja `dh:test`- ja `dh:prod`-SCP-kohteita ei enää käytetä sovelluksen
julkaisemiseen; Domainhotellille jäävät vain domain ja nimipalvelu.

Tavallinen julkaisu tehdään Gitin kautta nykyiseltä julkaisuhaaralta:

```sh
git push origin contanerized-app
ssh islanti@het1
cd /home/islanti/services/saaristolautat
git status --short
git pull --ff-only
docker compose up --build -d test
```

Kun sama commit on tarkistettu osoitteessa <https://test.saaristolautat.fi/>,
se julkaistaan tuotantoon komennolla `docker compose up --build -d production`.
Yksityiskohtainen julkaisu- ja tarkistusohje on tiedostossa
[`docs/deployment.md`](docs/deployment.md).

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
liittää samaan ennalta luotuun verkkoon. Verkko luodaan palvelimelle vain
kerran:

```sh
docker network create public-web
```

Palvelimen projektihakemiston `.env` valitsee Hetznerin Compose-tiedostot ja
ulkoisen verkon:

```dotenv
COMPOSE_FILE=compose.yml:compose.hetzner.yml
WEB_NETWORK_NAME=public-web
```

Tämän jälkeen koko palvelu käynnistetään projektihakemistossa lyhyesti:

```sh
docker compose up --build -d
```

Saaristolauttojen compose ei julkaise host-portteja ilman paikallista
`compose.local.yml`-lisätiedostoa.

Tuotanto- ja testiympäristön asennus, tavallinen julkaisutyönkulku sekä
sovellus-, data- ja livepäivitysten erilliset ohjeet löytyvät tiedostosta
[`docs/deployment.md`](docs/deployment.md).

## Kartan täydentävät tiet

Ohjeet pohjakartan liian myöhään näyttämien tieosuuksien hakemiseen ja
lisäämiseen löytyvät tiedostosta [`docs/roads.md`](docs/roads.md). Työkalu tukee
OSM-pohjaista reititystä sekä valmiita GeoJSON- ja GPX-tiedostoja.

Vaikeasti toistettavat havainnot kirjataan tiedostoon
[`docs/known-issues.md`](docs/known-issues.md).
