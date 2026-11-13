# Karttakuvien jakaminen etäkäyttäjälle

Karttakuvia ei pidä jättää vain selaintyökalun tulokseksi. Etäkäyttäjä saa ne
luotettavasti näkyviin vasta, kun kuvat on tallennettu työtilaan ja vastauksessa
on absoluuttiseen tiedostopolkuun osoittava Markdown-kuva sekä latauslinkki.

## Kuvien ottaminen

1. Käynnistä paikallinen kehityspalvelin porttiin 5173.
2. Selvitä keskipiste muodossa `pituusaste,leveysaste`.
3. Käytä Node 24:ää ja aja kuvausskripti repositorion juuressa:

   ```sh
   PATH=/Users/kranto/.nvm/versions/node/v24.21.0/bin:$PATH \
     node scripts/capture-map-screenshots.mjs \
       --name ruotsalainen \
       --center 21.75957,60.37053 \
       --zooms 11,13,15
   ```

Skripti käynnistää erillisen headless Chromen SwiftShader-WebGL-renderöinnillä,
avaa KMTK-tason, odottaa jokaisella zoomilla kahdeksan sekuntia ja tallentaa
1280 × 633 pikselin JPEG-kuvat `screenshots/`-hakemistoon. Väliaikainen Chrome-
profiili poistetaan lopuksi. Kuvausparametrit toimivat vain Viten kehitys- ja
testiympäristössä, eivät tuotannossa.

Jos portti 9223 on käytössä, anna skriptille toinen portti valitsimella
`--port`. Muuta odotusaikaa hitaalla yhteydellä valitsimella `--wait`.

## Tarkistaminen

Tarkista jokainen kuva visuaalisesti ennen jakamista. Pelkkä onnistunut
Chrome-prosessi ei riitä: liian aikainen kuva voi sisältää latausruudun tai
tyhjän kartan.

## Jakaminen keskustelussa

Upota kuva absoluuttisella paikallisella polulla ja lisää samaan tiedostoon
osoittava latauslinkki:

```md
![Ruotsalainen, zoom 11](/Users/kranto/personal/saaristolautat/screenshots/ruotsalainen-kmtk-z11.jpg)

[Lataa JPEG](/Users/kranto/personal/saaristolautat/screenshots/ruotsalainen-kmtk-z11.jpg)
```

Näin kuva renderöityy Codex-sovelluksessa ja käyttäjä voi myös avata tai ladata
alkuperäisen tiedoston. Kerro lisäksi käytetty keskipiste, zoomitasot ja kartan
aineistoversio.
