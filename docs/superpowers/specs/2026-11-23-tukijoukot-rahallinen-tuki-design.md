# Tukijoukot-sivu ja rahallinen tuki — design

**Päivämäärä:** 2026-11-23
**Lähde:** Carlin viesti 2026-11-23 (taloudellinen tuki on nyt mahdollista tukiyhdistyksen kautta)
**Koko:** pieni muutos — lyhyt design, ei erillistä builder-tarkistusta

## Tavoite ja miksi

Carlin tukiyhdistys voi nyt ottaa vastaan rahallista tukea. Tieto pitää saada sivustolle niin, että tukija löytää maksutiedot helposti ja Carl pystyy jatkossa päivittämään ne itse sisältötyökalusta. Carl yritti lisätä tiedot itse, mutta Decap CMS:ssä ei ollut niille paikkaa.

Muutoksia on kolme:

1. **Etusivu:** ”Lähde mukaan tukijoukkoihin” -laatikko (`CTASection`) nostetaan esittelyn (`VideoSection`) alle, blogikorttien yläpuolelle.
2. **Tukijoukot-sivu (`/vapaaehtoiseksi`):** pääotsikko ”TUKIJOUKKOIHIN” → ”TUKIJOUKOT”.
3. **Tukijoukot-sivu:** uusi rahallisen tuen osio (MobilePay ja tilisiirto) vapaaehtoislomakkeen alle.

## Rajaukset (ei tehdä)

- URL pysyy muodossa `/vapaaehtoiseksi`. Blogipostaukset, footer ja headerin nappi linkittävät siihen, joten osoitteen vaihto rikkoisi linkkejä.
- Englanninkielistä sivua (`/en`) ei muuteta. Sen CTA mainitsee jo taloudellisen tuen ja vie yhteystietosivulle.
- Ei maksuintegraatiota, MobilePay-syvälinkkiä eikä QR-koodia. Sivulla näytetään vain tiedot ja kopioi-napit.
- Etusivun CTA-laatikon tekstejä ja linkkiä ei muuteta. Laatikko vain siirretään. Nykyinen teksti mainitsee jo ”tai tue kampanjaa”.
- Navigaatioon ei tule uusia kohtia.

## Epäonnistumisia, joita vältetään

- **Väärä tilinumero tai MobilePay-numero sivulla.** Arvot kopioidaan sanatarkasti Carlin viestistä. Tilinumeron IBAN-tarkistussumma on tarkistettu (mod 97 = 1).
- **Carl ei pysty muokkaamaan tietoja itse.** Kaikki uudet tekstit ja maksutiedot tulevat CMS-kenttiin.
- **Etusivun välistys rikkoutuu siirrossa** (ks. kohta 1).
- **Kiinteä header peittää ankkurilinkin kohteen** (ks. kohta 2).

## Lähestymistavat

| | Tapa | Hyvää | Huonoa |
|---|---|---|---|
| **A (valittu)** | Erilliset CMS-kentät `vapaaehtoiseksi.json`:iin + uusi `DonationSection`-komponentti | Siisti korttiasettelu, kopioi-napit, Carl muokkaa yksittäisiä arvoja turvallisesti | Uusia kenttiä on useita |
| B | Yksi markdown-kenttä koko osiolle | Carl voi muotoilla vapaasti | Ei kortteja eikä kopioi-nappeja, ulkoasu riippuu Carlin muotoiluista |
| C | Tekstit suoraan koodiin | Nopein | Toistaa juuri sen ongelman, jonka takia Carl otti yhteyttä |

Valinta on A. Toteutustapa oli Samulin minulle jättämä päätös. Sijoittelusta Samuli valitsi vaihtoehdon ”oma osio lomakkeen alle”.

## Muutokset

### 1. Etusivu (`src/pages/index.astro`)

Uusi järjestys: Hero → ilmoitusbanneri → `VideoSection` → **`CTASection`** → blogikortit.

Välistys: nykyään `VideoSection`illa ja `CTASection`illa on kummallakin `padding: 4rem 0` ja blogiosiolla `padding: 0`. Pelkkä siirto tekisi videon ja laatikon väliin 8rem ja veisi blogikortit kiinni footeriin. Tavoiterytmi on noin 4rem joka välissä: video → laatikko, laatikko → blogit ja blogit → footer. `CTASection` saa **valinnaisen** propsin yläpaddingin poistamiseen. Oletusarvo säilyttää nykyisen käytöksen, jotta `/en` ei muutu. Blogiosio saa `padding-bottom: 4rem`.

### 2. Tukijoukot-sivu (`src/pages/vapaaehtoiseksi.astro`)

```
┌──────────────────────────────────────────────┐
│ TUKIJOUKOT                             (navy) │
├──────────────────────────────────────────────┤
│ Miksi liittyä…        │ [vapaaehtoislomake]   │
│ kappale 1             │                       │
│ kappale 2             │                       │
│ Voit tukea kampanjaa  │                       │
│ myös rahallisesti ↓   │                       │
├──────────────────────────────────────────────┤
│ Tue kampanjaa taloudellisesti   #tue-kampanjaa│
│ Onnistunut kampanja vaatii myös…              │
│ ┌ MobilePay / Vipps ─┐ ┌ Tilisiirto ────────┐ │
│ │ 45967       [⧉]    │ │ Saaja  Carl W… ry  │ │
│ └────────────────────┘ │ Tilinumero FI07…[⧉]│ │
│                        │ Viesti Vaalit 2027 │ │
│                        └────────────────────┘ │
│ Huomaathan, että 6 000 € on… (pienempi teksti)│
│ Kiitos tuestasi ja lämpimästi tervetuloa mukaan!│
└──────────────────────────────────────────────┘
```

- **Pääotsikko** luetaan kentästä `heroTitleBold` (oletus ”TUKIJOUKOT”). Nimi on sama kuin `carl.json`:issa ja `tavoitteeni.json`:issa.
- **Meta:** `title` ”Vapaaehtoiseksi” → ”Tukijoukot”. `description` mainitsee myös rahallisen tuen: ”Liity Carl Willandtin tukijoukkoihin vapaaehtoisena tai tue kampanjaa rahallisesti kevään 2027 eduskuntavaaleissa.”
- **Ankkurilinkki** esittelysarakkeen loppuun: ”Voit tukea kampanjaa myös rahallisesti ↓” → `#tue-kampanjaa`. Linkki näkyy vain, kun rahoitusosio näkyy. Puhelimella osio jää lomakkeen alle, joten linkki auttaa tukijaa löytämään sen.
- **Rahoitusosio** on oma komponentti `src/components/ui/DonationSection.astro`:
  - `<section id="tue-kampanjaa" aria-labelledby=…>` ja `scroll-margin-top: var(--header-h)`, ettei kiinteä header peitä otsikkoa.
  - Sisältö rajataan samaan `max-width: 64rem`:iin kuin yllä oleva `volunteer-grid`, jotta reunat linjautuvat.
  - Kaksi korttia rinnakkain (≥768px), puhelimella allekkain. Korttityyli on sama kuin sivuston nykyisissä korteissa (`--color-offwhite`, `border-radius: 1.25rem`, ks. `.blog-card`). Uusia värejä ei lisätä.
  - Tilinumero ja MobilePay-numero ovat `white-space: nowrap`, ja rivinvaihdot estetään myös `6 000 €`- ja `2 000 €`-summissa (sitova välilyönti).
  - **Kopioi-napit** MobilePay-numerolle ja tilinumerolle. `<button type="button">` saa aria-labelin, esim. ”Kopioi tilinumero”. Palaute ”Kopioitu” tulee `aria-live="polite"`-alueeseen. Tilinumero kopioidaan **ilman välilyöntejä** (`FI0757300821723596`), jotta se liittyy pankkisovellusten IBAN-kenttiin varmasti. Jos Clipboard API ei ole käytettävissä, nappi piilotetaan tai teksti valitaan. Arvot ovat joka tapauksessa tavallista valittavaa tekstiä.
  - **Tyhjät kentät piilottavat osat:** tyhjä `mobilepayNumber` piilottaa MobilePay-kortin, tyhjä `bankIban` tilisiirtokortin, ja jos molemmat ovat tyhjiä, piilossa on koko osio ja ankkurilinkki. Näin Carl voi vaalien jälkeen poistaa osion sisältötyökalusta.

### 3. Sisältö ja CMS

Uudet kentät tiedostoon `src/content/settings/vapaaehtoiseksi.json` ja Decap-konfiguraation `public/admin/config.yml` kohtaan ”Tukijoukot-sivu”. Kaikki rahoituskentät ovat `required: false`.

| Kenttä | Decap-widget | Alkuarvo |
|---|---|---|
| `heroTitleBold` | string | TUKIJOUKOT |
| `donationTitle` | string | Tue kampanjaa taloudellisesti |
| `donationIntro` | text | Onnistunut kampanja vaatii myös taloudellista selkänojaa. Voit tukea kampanjaani rahallisesti seuraavilla tavoilla: |
| `mobilepayNumber` | string | 45967 |
| `bankRecipient` | string | Carl Willandtin Tukiyhdistys ry |
| `bankIban` | string | FI07 5730 0821 7235 96 |
| `bankMessage` | string | Vaalit 2027 |
| `donationNote` | text | Huomaathan, että 6 000 € on enimmäismäärä, jonka eduskuntavaaliehdokas tai hänen tukiyhdistyksensä voi vastaanottaa samalta tukijalta. Mikäli yksittäisen tukijan antaman tuen arvo on vähintään 2 000 €, tukijan nimi ja tuen määrä ilmoitetaan vaalirahoitusilmoituksessa. |
| `donationThanks` | string | Kiitos tuestasi ja lämpimästi tervetuloa mukaan! |

Kenttien järjestys CMS:ssä: pääotsikko ensin, sitten nykyiset esittelykentät ja lopuksi rahoituskentät. Rahoituskentille selkeät suomenkieliset labelit ja vihjeet, esim. ”Tyhjä = kortti piilotetaan”.

**Tekstiin tehdyt korjaukset** (kerrotaan Carlille): ”vaati” → ”vaatii” ja ”2000 €” → ”2 000 €”. Muuten teksti on sanatarkasti Carlin viestistä.

## Rajoitteet

- **Paikallinen `main` on 4 committia jäljessä `carl/main`ia.** Carl muokkasi `vapaaehtoiseksi.json`:ia CMS:ssä 2026-11-23. Muutokset haetaan ennen työn aloittamista, eikä Carlin tekstejä ylikirjoiteta.
- Uudet propsit ovat valinnaisia, ja niiden oletusarvot tuottavat nykyisen lopputuloksen. `/en` ja muut sivut eivät muutu.
- Käytetään vain olemassa olevia väritokeneita (`global.css` → `@theme`) ja Barlow-fonttia.
- Repossa ei ole testiframeworkia. Varmistus: `npm run build`, generoidun `dist/`in tarkastus, `config.yml`:n YAML-jäsennys sekä silmämääräinen tarkistus selaimessa 375px- ja työpöytäleveydellä (ankkurihyppy, kopioi-napit, etusivun välit).

## Toteuttajalle jätetyt

- Korttien tarkka sisäasettelu, kuten tunniste–arvo-rivien typografia ja kopioi-napin ikoni tai teksti, nykyisen tyylin rajoissa. Ulkoasun hiomisessa käytetään `frontend-design`- tai `impeccable`-skilliä ja tekstien typografiassa `typography`-skilliä.
- Miten `CTASection`in yläpaddingin poisto toteutetaan (propsin nimi ja muoto).
- Osioiden välinen erotin (ohut viiva tai pelkkä väli).
