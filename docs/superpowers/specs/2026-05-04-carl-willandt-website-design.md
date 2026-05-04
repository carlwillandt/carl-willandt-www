# Carl Willandt — Kampanjasivusto: Design-dokumentti

**Päivämäärä:** 2026-05-04
**Versio:** 1.0
**Aikataulu:** ~2 viikkoa (valmis n. 18.5.2026)

---

## 1. Tavoite

Rakennetaan Carl Willandtin (Eduskuntavaaliehdokas 2027, Kokoomus) kampanjasivusto osoitteeseen `willandt.fi`. Sivusto esittelee Carlin ammattimaisesti äänestäjille, mahdollistaa bloggaamisen, vapaaehtoisten rekrytoinnin ja yhteydenoton.

---

## 2. Tekninen pino

| Teknologia | Rooli |
|---|---|
| **Astro** | Sivustogeneraattori (staattinen) |
| **Decap CMS** | Sisällönhallinta — Carl päivittää itse |
| **Netlify** | Hosting (ilmaisella tierillä) + lomakkeet (Netlify Forms) |
| **willandt.fi** | Domain (jo rekisteröity) |

**Kieli:** Suomi ainoastaan — ei monikielisyyttä.

---

## 3. Navigaatio

```
[Logo: Carl WILLANDT / Eduskuntavaaliehdokas 2027]
Etusivu · Carl · Tavoitteeni · Blogi / Ajankohtaista · Ota yhteyttä  [Tukijoukot →]
```

- Oikealla oleva **Tukijoukot**-nappi on vihreä CTA-nappi (sama tyyli kuin Figmassa oleva Lahjoitukset-nappi, mutta sisältö korvattu)
- Mobiilissa hamburger-menu

---

## 4. Sivurakenne

### 4.1 Etusivu (`/`)
**Figma-node:** `5884:58`

Osioiden järjestys:
1. **Hero** — Carlin kuva (oikea), iskulause "Sivistystä, realismia ja rohkeutta" (vasen), Kokoomus-logo
2. **Ilmoitusbanneri** — vihreä palkki hero-osion alla, CMS-muokattava teksti + "Lue lisää" -linkki
3. **Video + teksti** — video-soitin (iframe embed) vasemmalla, lyhyt esittelyteksti oikealla
4. **Bloginostot** — 4 uusinta blogipostausta 2×2-korttiruudukossa (kategoria, päivämäärä, otsikko, lyhenne, "Lue lisää")
5. **CTA** — "LÄHDE MUKAAN tukijoukkoihin!" -osio, tumma tausta, teksti + nappi
6. **Footer**

### 4.2 Carl (`/carl`)
**Figma-node:** `5927:4`

1. **Hero** — Carlin kuva + "CARL"-otsikko
2. **Intro-teksti** — lyhyt johdanto
3. **Accordion-osio** — otsikko "Elämäni eri osa-alueet", osiot:
   - Juurista
   - Oppimisesta
   - Kodista
   - Urheilusta
   - Metsästyksestä
   - Maanpuolustuksesta
4. **Footer**

### 4.3 Tavoitteeni (`/tavoitteeni`)
**Figma-node:** `5941:13`

1. **Hero** — Carlin kuva + "TAVOITTEENI"-otsikko
2. **Intro-teksti** — johdanto arvoihin ja poliittiseen linjaan
3. **Accordion-osio** — poliittiset teemat (esim. Sivistys, Turvallisuus, Vapaus) avattavina osioina, ikoneineen
4. **Footer**

### 4.4 Blogi / Ajankohtaista (`/blogi`)
**Figma-node:** `5915:15`

Kaksi näkymää:
- **Listausnäkymä** (`/blogi`) — kaikki artikkelit kortteina, kategoria + päivämäärä
- **Artikkelin detailnäkymä** (`/blogi/[slug]`) — "← Takaisin blogiin" -linkki, otsikko, kategoria, päivämäärä, artikkelin sisältö (rikkaat teksti + kuvat)

Carl kirjoittaa ja julkaisee blogit itse Decap CMS:n kautta.

### 4.5 Medialle (`/medialle`)
*Rakennetaan samaa tyyliä noudattaen (ei erillistä Figma-designia)*

1. Hero-otsikko
2. Lehdistötiedotteet (lista/kortit)
3. Kuvapankki — ladattavat kuvat
4. Toimittajan yhteystieto

### 4.6 Vapaaehtoiseksi (`/vapaaehtoiseksi`)
*Nav CTA-nappi otsikolla "Tukijoukot →" linkittää tänne. Footer-linkki nimellä "Vapaaehtoiseksi".*
*Rakennetaan samaa tyyliä noudattaen (ei erillistä Figma-designia)*

1. Hero-otsikko
2. Infotext — miksi liittyä, miten vapaaehtoistoiminta toimii
3. **Ilmoittautumislomake** (pääosassa) — nimi, sähköposti, puhelinnumero, vapaa kenttä (osaaminen/kiinnostus)
4. Footer

Lomake → Netlify Forms → sähköpostiin

### 4.7 Ota yhteyttä (`/ota-yhteytta`)
*Rakennetaan samaa tyyliä noudattaen (ei erillistä Figma-designia)*

1. Hero-otsikko
2. **Yhteydenottolomake** — nimi, sähköposti, viesti
3. Somelinkit (X/Twitter, Instagram, Facebook)
4. Footer

Lomake → Netlify Forms → `info@willandt.fi`

---

## 5. Footer (joka sivulla)

```
[X] [Instagram] [Facebook]

Carl Willandt                    NAVIGOINTI          OTA YHTEYTTÄ
[tagline]                        Etusivu             info@willandt.fi
                                 Carl                Mediapaketti
                                 Teemat              Vapaaehtoiseksi
                                 Blogi / Ajankohtaista
                                 Ota yhteyttä

© 2026 CARL WILLANDT
```

---

## 6. Avainkomponentit

### Accordion
- Käytetään Carl- ja Tavoitteeni-sivuilla
- Yksi auki kerrallaan (tai useampi — selvitetään toteutuksessa)
- Ikonit otsikoissa
- Sisältö voi sisältää tekstiä ja kuvia

### Ilmoitusbanneri (etusivu)
- Vihreä palkki hero-osion alla
- Teksti + "Lue lisää" -linkki
- CMS-muokattava

### Blogikortti
- Kategoria (badge), päivämäärä, otsikko, lyhenne, "Lue lisää" -nappi
- Käytetään etusivulla (4 kpl) ja blogi-listaussivulla

### Hero-komponentti
- Uudelleenkäytettävä, käytössä usealla sivulla
- Carlin kuva (oikealla tai taustana) + otsikko

### Lomake (Netlify Forms)
- 2 lomaketta: Tukijoukot-ilmoittautuminen + Ota yhteyttä
- Netlify Forms hoitaa lähetyksen ja spam-suojauksen
- Kiitos-näkymä lähetyksen jälkeen

### Video-osio (etusivu)
- Iframe embed (YouTube tai muu)
- URL CMS-muokattava

---

## 7. Sisällönhallinta (Decap CMS)

Carl kirjautuu osoitteeseen `willandt.fi/admin` (GitHub-tili vaaditaan).

**CMS-muokattavat sisällöt:**

| Sisältö | Sivu |
|---|---|
| Blogipostaukset | Blogi |
| Hero-teksti ja iskulause | Etusivu |
| Ilmoitusbannerin teksti + linkki | Etusivu |
| Video-URL | Etusivu |
| Accordion-osioiden sisältö | Carl, Tavoitteeni |
| Somelinkit | Footer / Ota yhteyttä |
| Medialle-tiedotteet ja kuvat | Medialle |

---

## 8. Figma-designin viitetiedot

| Sivu | Figma-node |
|---|---|
| Yleisoverview + brand guidelines | `5873:5` |
| Etusivu | `5884:58` |
| Carl | `5927:4` |
| Tavoitteeni | `5941:13` |
| Blogi (artikkeli) | `5915:15` |

**Figma-tiedosto:** `rHvGckrAHeZd9sBEVzdM4Q` (Samuli Raappana)

**Brändiohjeet (Figmasta):**
- Värit: tumma laivastonsininen (#1B2D3E-tyyppinen), metsänvihreä, kulta/lämmin CTA
- Typografia: serif ("WILLANDT"-logo) + clean sans-serif leipätekstille
- Logo: "Carl WILLANDT" kahdessa rivissä, subtitle "EDUSKUNTAVAALIEHDOKAS 2027"

---

## 9. Kustannukset ja hosting

| Palvelu | Hinta |
|---|---|
| Netlify (hosting + lomakkeet) | 0 €/kk |
| willandt.fi (domain, jo rekisteröity) | 0 €/kk |
| **Yhteensä** | **0 €/kk** |

Netlify Forms ilmaistierillä: 100 lomakelähetystä/kk. Jos tarve kasvaa, Pro-tier ~15 €/kk.

---

## 10. Staattiset resurssit

Tiedostot kansiossa `Materiaaleja/`:

| Tiedosto | Käyttö |
|---|---|
| `carl-willandt-logo.svg` | Päälogo navigaatiossa ja footerissa (valkoinen, SVG) |
| `kokoomus-logo-valkoinen.png` | Kokoomus-logo etusivun hero-osiossa |

---

## 11. Avoimet kysymykset toteutusvaiheeseen

| Kysymys | Vastaus |
|---|---|
| Lomakkeiden sähköposti | `carl@willandt.fi` |
| Accordion-käyttäytyminen | Vain yksi osio auki kerrallaan |
| Video-URL | Ei vielä tiedossa — CMS-muokattava kenttä, täytetään myöhemmin |
| Medialle-sisältö | Ei vielä — lisätään ennen julkaisua CMS:n kautta |
| Blogi-kategoriat | Vapaa tekstikenttä per postaus (Carl kirjoittaa kategorian itse) |
