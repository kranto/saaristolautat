# Tunnetut vaikeasti toistettavat ongelmat

## Kartan datakerrokset saattoivat kadota (korjattu)

- **Havaittu:** 8.10.2026 Safarissa ja Chromessa toistuvien uudelleenlatausten
  yhteydessä.
- **Oire:** Asetuksissa reittityypit olivat valittuina, mutta kartalla ei näkynyt
  reittejä, laitureita eikä sovelluksen omia paikannimilabeleita. Tasojen
  kytkeminen pois ja takaisin päälle ei auttanut.
- **Palautuminen:** Sivun lataaminen uudelleen tai kielen vaihtaminen palautti
  kerrokset. Kielenvaihto suoritti datakerrosten alustusefektin uudelleen.
- **Toistettavuus:** Satunnainen ajoituskilpa, joka ei liittynyt Safariin.
- **Syy:** Karttatyylin ja sovellusdatan rinnakkaisessa latauksessa oli
  ajoituskilpa. Datakerrosten alustus saattoi jäädä odottamaan jo tapahtunutta
  kertaluonteista `load`-tapahtumaa.
- **Korjaus:** Alustus tarkistaa `map.isStyleLoaded()`-tilan ja varmistaa puuttuvat
  kerrokset uudelleen sekä `styledata`- että `idle`-tapahtumissa. Latausnäkymää
  ei suljeta ennen kuin `saaristolautat`-lähde on varmasti lisätty karttaan.

Jos ongelma toistuu, ota ennen uudelleenlatausta talteen mahdollisuuksien mukaan:

1. Safarin konsolin virheet.
2. Network-välilehden epäonnistuneet data- ja karttapyynnöt.
3. Mitä tehtiin juuri ennen kerrosten katoamista, esimerkiksi karttapohjan tai
   tasojen vaihto, sovelluksen palaaminen taustalta tai näytön koon muuttuminen.
4. Näkyykö pohjakartta normaalisti ja toimivatko zoomaus sekä panorointi.

## Asetukset useassa välilehdessä

Sovelluksen asetukset tallennetaan selaimeen silloin, kun käyttäjä muuttaa
asetusta. Pelkkä välilehden lataaminen, käyttäminen tai sulkeminen ei kirjoita
sen muistissa olevaa asetustilaa uudelleen.

Jos sovellus on auki useassa välilehdessä, seuraavalla käynnistyskerralla
käytetään siksi viimeksi **muutettuja**, ei välttämättä viimeksi suljetun
välilehden asetuksia. Eri välilehdissä voi myös näkyä toisistaan poikkeava tila,
kunnes asetusta muutetaan tai välilehti ladataan uudelleen.
