# Tuotanto-, testi- ja päivitysohje

Tässä dokumentissa kuvataan Saaristolautat-sovelluksen paikallinen
konttiympäristö, Hetznerillä ajettavat testi- ja tuotantopalvelut sekä niiden
päivittäminen.

## Kokonaisuus

Hetznerillä palvelu koostuu kolmesta tämän projektin kontista:

- `production` palvelee osoitetta `https://saaristolautat.fi/`
- `test` palvelee osoitetta `https://test.saaristolautat.fi/`
- `liveupdate` hakee AIS-tiedot ja kirjoittaa julkaistavat JSON-tiedostot
  yhteiseen Docker-volyymiin

Nykyisen Islanti-palvelun nginx toimii julkisena edustapalvelimena. Se hoitaa
HTTPS:n, HTTP -> HTTPS -ohjauksen ja `www.saaristolautat.fi` ->
`saaristolautat.fi` -ohjauksen. Edustanginx sekä Saaristolauttojen `production`
ja `test` ovat samassa ulkoisessa Docker-verkossa `public-web`.

Molemmat web-kontit liittävät hostin `saaristodata`-hakemiston vain luettavaksi
polkuun `/srv/saaristodata` ja tarjoavat sen URL-polussa `/data/`. Testi ja
tuotanto käyttävät tällä hetkellä samaa datahakemistoa. Data voidaan myöhemmin
jakaa erillisiksi testi- ja tuotantohakemistoiksi muuttamalla niiden volume-
määrityksiä `compose.yml`:ssä.

## Paikallinen ympäristö

Projekti käyttää Node.js 24:ää. Tavallinen kehityspalvelin käynnistetään näin:

```sh
cd /Users/kranto/personal/saaristolautat
nvm use
npm install
npm start
```

Sovellus avautuu osoitteessa <http://localhost:5173>.

Tuotantokäännös tarkistetaan ennen konttitestausta:

```sh
npm run build
```

Paikalliset kontit käynnistetään tai rakennetaan uudelleen näin:

```sh
docker compose \
  -f compose.yml \
  -f compose.local.yml \
  up --build -d
```

Paikalliset osoitteet:

- tuotantorakennelma: <http://localhost:8080>
- testirakennelma: <http://localhost:8081>
- dataesimerkki: <http://localhost:8080/data/index.json>
- AIS-data: <http://localhost:8080/live/livedata.json>

Tarkistuksia ja lokien seurantaa:

```sh
curl --fail http://localhost:8080/data/index.json
curl --fail http://localhost:8080/live/livedata.json

docker compose \
  -f compose.yml \
  -f compose.local.yml \
  ps

docker compose \
  -f compose.yml \
  -f compose.local.yml \
  logs -f liveupdate
```

Kontit pysäytetään säilyttäen AIS-historia näin:

```sh
docker compose -f compose.yml -f compose.local.yml down
```

Älä käytä `down --volumes` -komentoa, ellet nimenomaan halua poistaa myös
livepäivittäjän SQLite-tietokantaa ja live-JSON-tiedostot sisältävää volyymia.

## Hetznerin hakemistot ja asetukset

Nykyiset hakemistot ovat:

```text
/home/islanti/services/saaristolautat
/home/islanti/services/saaristodata
```

Saaristolauttojen `.env` sisältää vähintään:

```dotenv
SAARISTODATA_PATH=/home/islanti/services/saaristodata
WEB_NETWORK_NAME=public-web
LIVE_POLL_SECONDS=30
```

Ulkoinen Docker-verkko luodaan palvelimelle vain kerran:

```sh
docker network create public-web
```

Islanti-palvelun edustanginx on liitetty samaan verkkoon. Sen aktiivinen
nginx-konfiguraatio perustuu tämän projektin tiedostoon
`deploy/hetzner/saaristolautat.conf.example`. Let's Encrypt -sertifikaatti
kattaa nimet:

```text
saaristolautat.fi
www.saaristolautat.fi
test.saaristolautat.fi
```

Koko Saaristolautat-kokonaisuus käynnistetään Hetznerillä näin:

```sh
cd /home/islanti/services/saaristolautat

docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  up --build -d
```

`compose.hetzner.yml` ei julkaise web-konttien portteja hostille. Julkinen
liikenne kulkee aina `public-web`-verkon ja edustanginxin kautta.

## Sovelluksen tavallinen päivitys

### 1. Kehitys ja testaus paikallisesti

1. Tee muutokset paikallisessa `saaristolautat`-repossa.
2. Testaa ne Vite-kehityspalvelimella osoitteessa
   <http://localhost:5173>.
3. Suorita `npm run build`.
4. Rakenna paikalliset kontit ja testaa ainakin osoitteet
   <http://localhost:8080> ja <http://localhost:8081>.
5. Commitoi ja pushaa muutos.

Esimerkiksi:

```sh
git status
git add <muutetut-tiedostot>
git commit -m "Kuvaava viesti"
git push
```

Julkaisuhaara on tällä hetkellä `contanerized-app`. Tarkista ennen julkaisua,
että paikallinen commit on pushattu juuri sille haaralle, jota Hetznerin
checkout seuraa.

### 2. Julkaisu Hetznerin testipalveluun

```sh
ssh islanti@het1
cd /home/islanti/services/saaristolautat

git status --short
git pull --ff-only

docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  up --build -d test
```

Jos `git status --short` näyttää palvelimella paikallisia muutoksia, älä aja
pullia ennen kuin muutosten alkuperä on selvitetty.

Tarkista osoite <https://test.saaristolautat.fi/> sekä tarvittaessa kontin tila
ja loki:

```sh
docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  ps test

docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  logs --tail=100 test
```

### 3. Julkaisu tuotantoon

Kun sama commit on hyväksytty testipalvelussa, rakenna ja käynnistä vain
tuotantopalvelu:

```sh
cd /home/islanti/services/saaristolautat

docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  up --build -d production
```

Tarkista julkaisun jälkeen:

```sh
curl --fail --head https://saaristolautat.fi/
curl --fail --head https://www.saaristolautat.fi/
curl --fail https://saaristolautat.fi/data/index.json
curl --fail https://saaristolautat.fi/live/livedata.json
```

Tee myös selaimessa hard reload. Staattisilla JavaScript- ja kuvatiedostoilla
on seitsemän vuorokauden välimuisti, vaikka Viten sisältötiivisteelliset
tiedostonimet normaalisti huolehtivat uuden version lataamisesta.

## Saaristodatan päivitys

`saaristodata` on oma Git-reponsa. Sen tavallinen työnkulku on:

1. Tee ja tarkista datamuutokset paikallisesti.
2. Tarkista sovellus hostin kehityspalvelimella tai paikallisissa konteissa.
3. Commitoi ja pushaa muutos `saaristodata`-repoon.
4. Vedä muutos Hetznerille.
5. Tarkista testi- ja tuotanto-osoitteet.

Hetznerillä riittää:

```sh
cd /home/islanti/services/saaristodata
git status --short
git pull --ff-only
```

Docker-buildia tai konttien uudelleenkäynnistystä ei tarvita, koska hakemisto
on bind mountattu suoraan molempiin web-kontteihin. Nykyisessä setupissa sama
pull päivittää testin ja tuotannon datan samanaikaisesti.

Dataa palvellaan viiden minuutin selain- ja välityspalvelinvälimuistilla.
Tuore tiedosto voidaan tarkistaa välimuistin ohittavalla kyselyparametrilla:

```sh
curl --fail \
  "https://test.saaristolautat.fi/data/index.json?v=$(date +%s)"

curl --fail \
  "https://saaristolautat.fi/data/index.json?v=$(date +%s)"
```

## Livepäivittäjän päivitys

Jos muutos koskee `scripts/liveupdate.py`:tä, sen riippuvuuksia tai
`docker/liveupdate.Dockerfile`-tiedostoa, rakenna Hetznerillä vain
`liveupdate`-palvelu uudelleen:

```sh
cd /home/islanti/services/saaristolautat
git pull --ff-only

docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  up --build -d liveupdate
```

Tarkista sen jälkeen loki ja julkaistu tiedosto:

```sh
docker compose \
  -f compose.yml \
  -f compose.hetzner.yml \
  logs --tail=100 liveupdate

curl --fail https://saaristolautat.fi/live/livedata.json
```

Testi ja tuotanto käyttävät samaa `live-data`-volyymia, joten erillistä AIS-
päivittäjää ei ajeta kummallekin ympäristölle.

## Nopeat tilanne- ja virhetarkistukset

Saaristolauttojen kontit:

```sh
cd /home/islanti/services/saaristolautat
docker compose -f compose.yml -f compose.hetzner.yml ps
docker compose -f compose.yml -f compose.hetzner.yml logs --tail=100
```

Julkinen edustanginx kuuluu Islanti-compose-projektiin. Sen tarkistus tehdään
siellä:

```sh
cd /home/islanti/islanti
docker compose ps nginx
docker compose logs --tail=100 nginx
docker compose exec nginx nginx -t
```

Sertifikaattien uusinnan kuivatesti:

```sh
cd /home/islanti/islanti

docker compose run --rm \
  --entrypoint certbot \
  certbot renew --dry-run
```

