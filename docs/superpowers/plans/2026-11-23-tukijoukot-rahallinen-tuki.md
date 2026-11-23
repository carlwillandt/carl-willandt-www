# Tukijoukot-sivu ja rahallinen tuki — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nostaa etusivun tukijoukko-CTA esittelyn alle, muuttaa Tukijoukot-sivun pääotsikoksi ”TUKIJOUKOT” ja lisätä sivulle Decap CMS:stä muokattava rahallisen tuen osio (MobilePay ja tilisiirto).

**Architecture:** Etusivulla vaihdetaan osioiden järjestys. `CTASection` saa valinnaisen `flushTop`-propsin, jotta välistys pysyy 4rem-rytmissä. Tukijoukot-sivun uudet tekstit ja maksutiedot luetaan `vapaaehtoiseksi.json`:ista samalla kuviolla kuin muut sivut lukevat omansa. Rahoitusosio on oma komponentti `DonationSection.astro`. Sen kopioi-napit ovat progressiivista parannusta: ne ovat HTML:ssä `hidden`, ja skripti paljastaa ne vain, jos Clipboard API on käytettävissä.

**Tech Stack:** Astro 6, Tailwind 4 (väritokenit `src/styles/global.css` → `@theme`), Decap CMS (`public/admin/config.yml`), Netlify (deploy `carl/main`-haarasta).

**Spec:** `docs/superpowers/specs/2026-11-23-tukijoukot-rahallinen-tuki-design.md`

## Global Constraints

- **Carlin tämänpäiväisiä CMS-muokkauksia ei ylikirjoiteta.** `main` tuodaan `carl/main`in tasolle (fast-forward) ennen kuin haara luodaan.
- **Muut sivut eivät saa muuttua.** Uudet propsit ovat valinnaisia, ja niiden oletusarvo tuottaa nykyisen lopputuloksen. Task 4 vertaa kaikkien muiden sivujen HTML:n lähtötasoon.
- **URL pysyy `/vapaaehtoiseksi`.** Linkkejä tai tiedostonimeä ei muuteta.
- **Maksutiedot sanatarkasti:** MobilePay/Vipps `45967`, saaja `Carl Willandtin Tukiyhdistys ry`, tilinumero `FI07 5730 0821 7235 96`, viesti `Vaalit 2027`.
- **Carlin tekstiin tehdään vain kaksi korjausta:** ”vaati” → ”vaatii” ja ”2000 €” → ”2 000 €”.
- **Ei uusia värejä eikä fontteja.** Käytetään `--color-*`-tokeneita ja Barlowia.
- **Ei testiframeworkia.** Tarkistukset ajetaan `curl`illa dev-palvelinta vasten (`npm run dev -- --port 4321`, ajetaan taustalla) ja Task 4:ssä tuotantobuildia vasten. `npm run build` kestää useita minuutteja, koska `public/medialle/` on noin 200 Mt. Sitä ei saa keskeyttää.
- **Commit-viestit suomeksi**, muodossa `feat:`, `fix:` tai `docs:`.
- **Työhaara:** `feature/tukijoukot-rahallinen-tuki`. Mergeä `main`iin ja pushia `carl`-remoteen ei tehdä ilman Samulin lupaa. Push julkaisee sivuston Netlifyssä.

## Review Focus

1. **Carl tyhjentää kentän CMS:ssä.** Kenttä voi olla `""` tai puuttua JSONista kokonaan. Odotus: tyhjän MobilePay-numeron kortti tai tyhjän tilinumeron kortti katoaa ilman tyhjiä rivejä. Jos molemmat ovat tyhjiä, katoavat sekä osio että ankkurilinkki, ja build menee silti läpi. → Task 3, Step 6.
2. **Selaimessa ei ole JavaScriptiä tai Clipboard APIa.** Odotus: kopioi-nappeja ei näy, ja numerot ovat tavallista valittavaa tekstiä. → Task 3, Step 5 (napit ovat HTML:ssä `hidden`).
3. **Ankkurilinkki kiinteän headerin alla.** Odotus: kun käyttäjä hyppää `#tue-kampanjaa`-ankkuriin, osion otsikko näkyy kokonaan headerin alapuolella sekä mobiilissa että työpöydällä. → Task 4, Step 3.
4. **Kapea puhelin (320px).** Odotus: tilinumero ja kopioi-nappi mahtuvat korttiin, eikä sivulle tule vaakavieritystä. → Task 4, Step 3.
5. **Carl kirjoittaa summat tavallisilla välilyönneillä** (”6 000 €”). Odotus: summa ei katkea rivin vaihtuessa, koska renderöinti vaihtaa välilyönnit sitoviksi. → Task 3, Step 5.

---

### Task 1: Synkronointi, työhaara ja etusivun järjestys

**Files:**
- Modify: `src/components/ui/CTASection.astro`
- Modify: `src/pages/index.astro`
- Add (commit): `docs/superpowers/specs/2026-11-23-tukijoukot-rahallinen-tuki-design.md`, `docs/superpowers/plans/2026-11-23-tukijoukot-rahallinen-tuki.md`

**Interfaces:**
- Consumes: —
- Produces:
  - `CTASection`: uusi valinnainen propsi `flushTop?: boolean`, oletus `false`. Kun `true`, `<section>`in padding on `0 0 4rem`. Muuten se on nykyinen `4rem 0`.
  - Lähtötaso `node_modules/.cache/cw-baseline/`: kaikki `dist/**/*.html` ennen muutoksia, Task 4:n regressiovertailua varten.

- [ ] **Step 1: Tuo `main` ajan tasalle ja luo haara**

```bash
git checkout main && git fetch carl && git merge --ff-only carl/main && git checkout -b feature/tukijoukot-rahallinen-tuki
```

Expected: merge on fast-forward. `git show HEAD:src/content/settings/vapaaehtoiseksi.json` näyttää Carlin version, jonka `introParagraph1` päättyy `\n`:ään eikä sisällä tekstiä ”Lämpimästi tervetuloa mukaan!”.

- [ ] **Step 2: Commitoi spec ja suunnitelma**

```bash
git add docs/superpowers/specs/2026-11-23-tukijoukot-rahallinen-tuki-design.md docs/superpowers/plans/2026-11-23-tukijoukot-rahallinen-tuki.md
git commit -m "docs: spec ja toteutussuunnitelma Tukijoukot-sivun rahalliselle tuelle"
```

- [ ] **Step 3: Ota regressiolähtötaso tuotantobuildista**

```bash
npm run build && rm -rf node_modules/.cache/cw-baseline && mkdir -p node_modules/.cache/cw-baseline && (cd dist && find . -name '*.html' -not -path '* 2*' -exec rsync -R {} ../node_modules/.cache/cw-baseline/ \;) && echo "lähtötaso otettu"
```

Expected: `lähtötaso otettu`. `dist/`issä on Finderin ” 2”-kaksoiskappaleita (tiedostoja ja hakemistoja), ja ne ohitetaan.

- [ ] **Step 4: Käynnistä dev-palvelin taustalle ja aja järjestystarkistus (odotetaan FAIL)**

```bash
npm run dev -- --port 4321
```

```bash
curl -s localhost:4321/ | grep -o -E 'video-grid"|LÄHDE MUKAAN|<article class="blog-card' | uniq
```

Expected nyt: `video-grid"`, `<article class="blog-card`, `LÄHDE MUKAAN`, eli CTA on viimeisenä. Tarkistus on siis FAIL.

- [ ] **Step 5: Lisää `flushTop` `CTASection`iin**

Lisää `flushTop?: boolean` Props-rajapintaan ja destrukturointiin (oletus `false`). `<section>`in `style` saa arvon `padding: 0 0 4rem;`, kun `flushTop` on tosi, ja muuten nykyisen `padding: 4rem 0;`. Taustaväri säilyy.

- [ ] **Step 6: Siirrä CTA etusivulla**

Siirrä `src/pages/index.astro`:ssa `<CTASection … />` heti `<VideoSection … />`in perään ja lisää sille `flushTop={true}`. Muut propsit säilyvät ennallaan. Vaihda blogiosion `<section>`in `padding: 0;` muotoon `padding: 0 0 4rem;`.

- [ ] **Step 7: Aja järjestystarkistus (odotetaan PASS)**

```bash
curl -s localhost:4321/ | grep -o -E 'video-grid"|LÄHDE MUKAAN|<article class="blog-card' | uniq
```

Expected: `video-grid"`, `LÄHDE MUKAAN`, `<article class="blog-card`, tässä järjestyksessä.

```bash
curl -s localhost:4321/ | grep -o 'padding: 0 0 4rem' | wc -l
```

Expected: `2` (CTA-osio ja blogiosio).

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/CTASection.astro src/pages/index.astro
git commit -m "feat: nosta tukijoukko-CTA etusivulla esittelyn alle"
```

---

### Task 2: Tukijoukot-sivun pääotsikko ja meta

**Files:**
- Modify: `src/pages/vapaaehtoiseksi.astro`
- Modify: `src/content/settings/vapaaehtoiseksi.json`
- Modify: `public/admin/config.yml` (kohta `name: vapaaehtoiseksi`)

**Interfaces:**
- Consumes: —
- Produces: JSON-kenttä `heroTitleBold: string`. Sivu käyttää sitä muodossa `data.heroTitleBold || 'TUKIJOUKOT'`.

- [ ] **Step 1: Aja tarkistukset (odotetaan FAIL)**

```bash
P=$(curl -s localhost:4321/vapaaehtoiseksi/ | tr -s ' \n' ' '); grep -o -E '<title>[^<]*</title>|<h1[^>]*> ?[A-ZÄÖ]+ ?</h1>' <<<"$P" | sed -E 's/<h1[^>]*>/<h1>/'; grep -o 'Liity Carl Willandtin tukijoukkoihin vapaaehtoisena tai tue kampanjaa rahallisesti kevään 2027 eduskuntavaaleissa.' <<<"$P" | head -1
```

Expected nyt: `<title>Vapaaehtoiseksi — Carl Willandt</title>` ja `<h1> TUKIJOUKKOIHIN </h1>`, mutta ei kuvausriviä. Valmiina tulostuvat `<title>Tukijoukot — Carl Willandt</title>`, `<h1> TUKIJOUKOT </h1>` ja kuvausteksti.

- [ ] **Step 2: Lisää kenttä JSONiin ja CMS:ään**

- `vapaaehtoiseksi.json`: `"heroTitleBold": "TUKIJOUKOT"`.
- `config.yml`, Tukijoukot-sivun `fields`-listan **ensimmäiseksi**: `{ label: "Pääotsikko", name: heroTitleBold, widget: string }`.

- [ ] **Step 3: Päivitä sivu**

`vapaaehtoiseksi.astro`:
- `h1`:n sisältö: `{data.heroTitleBold || 'TUKIJOUKOT'}` (tyyli ennallaan).
- `BaseLayout`: `title="Tukijoukot"`, `description="Liity Carl Willandtin tukijoukkoihin vapaaehtoisena tai tue kampanjaa rahallisesti kevään 2027 eduskuntavaaleissa."`

- [ ] **Step 4: Aja tarkistukset (odotetaan PASS)**

Step 1:n komento → valmiin tilan kolme riviä. Lisäksi CMS-konfiguraatio jäsentyy:

```bash
node -e "const y=require('js-yaml'),f=require('fs');const c=y.load(f.readFileSync('public/admin/config.yml','utf8'));const p=c.collections.find(x=>x.name==='asetukset').files.find(x=>x.name==='vapaaehtoiseksi');console.log(p.fields.map(x=>x.name).join(','))"
```

Expected: `heroTitleBold,introTitle,introParagraph1,introParagraph2`

- [ ] **Step 5: Commit**

```bash
git add src/pages/vapaaehtoiseksi.astro src/content/settings/vapaaehtoiseksi.json public/admin/config.yml
git commit -m "feat: Tukijoukot-sivun pääotsikko TUKIJOUKOT ja muokattavaksi CMS:ään"
```

---

### Task 3: Rahallisen tuen osio

**Files:**
- Create: `src/components/ui/DonationSection.astro`
- Modify: `src/pages/vapaaehtoiseksi.astro`
- Modify: `src/content/settings/vapaaehtoiseksi.json`
- Modify: `public/admin/config.yml`

**Interfaces:**
- Consumes: Task 2:n jälkeinen `vapaaehtoiseksi.astro` (h1 ja meta valmiina) ja sivun `volunteer-grid` (`max-width: 64rem`).
- Produces: `DonationSection` (Props alla), osion `id="tue-kampanjaa"` ja sivun ankkurilinkki `href="#tue-kampanjaa"`. Task 4 testaa nämä selaimessa.

```ts
interface Props {
  title: string;
  intro?: string;
  mobilepayNumber?: string;
  bankRecipient?: string;
  bankIban?: string;
  bankMessage?: string;
  note?: string;
  thanks?: string;
}
```

- [ ] **Step 1: Aja sisältötarkistukset (odotetaan FAIL)**

```bash
P=$(curl -s localhost:4321/vapaaehtoiseksi/); for s in 'id="tue-kampanjaa"' 'href="#tue-kampanjaa"' 'Tue kampanjaa taloudellisesti' 'vaatii myös taloudellista selkänojaa' '45967' 'Carl Willandtin Tukiyhdistys ry' 'FI07 5730 0821 7235 96' 'Vaalit 2027' 'data-copy="45967"' 'data-copy="FI0757300821723596"' 'Kiitos tuestasi ja lämpimästi tervetuloa mukaan!' "$(printf '6\xc2\xa0000\xc2\xa0€')" "$(printf '2\xc2\xa0000\xc2\xa0€')"; do printf '%s\t%s\n' "$(grep -cF -- "$s" <<<"$P")" "$s"; done
```

Expected nyt: jokaisen rivin luku on `0`. Valmiina jokaisen on vähintään `1`. Jos Astro tuottaa sitovan välilyönnin muodossa `&nbsp;` eikä merkkinä U+00A0, hyväksy summarivit myös muodossa `6&nbsp;000&nbsp;€`.

- [ ] **Step 2: Lisää sisältö JSONiin**

`vapaaehtoiseksi.json`:iin (summissa tavalliset välilyönnit, sillä Step 5:n apufunktio hoitaa sitovuuden):

| Kenttä | Arvo |
|---|---|
| `donationTitle` | `Tue kampanjaa taloudellisesti` |
| `donationIntro` | `Onnistunut kampanja vaatii myös taloudellista selkänojaa. Voit tukea kampanjaani rahallisesti seuraavilla tavoilla:` |
| `mobilepayNumber` | `45967` |
| `bankRecipient` | `Carl Willandtin Tukiyhdistys ry` |
| `bankIban` | `FI07 5730 0821 7235 96` |
| `bankMessage` | `Vaalit 2027` |
| `donationNote` | `Huomaathan, että 6 000 € on enimmäismäärä, jonka eduskuntavaaliehdokas tai hänen tukiyhdistyksensä voi vastaanottaa samalta tukijalta. Mikäli yksittäisen tukijan antaman tuen arvo on vähintään 2 000 €, tukijan nimi ja tuen määrä ilmoitetaan vaalirahoitusilmoituksessa.` |
| `donationThanks` | `Kiitos tuestasi ja lämpimästi tervetuloa mukaan!` |

- [ ] **Step 3: Lisää CMS-kentät**

Lisää `config.yml`:n Tukijoukot-sivun `fields`-listan loppuun, tässä järjestyksessä ja kaikki `required: false`:

| name | widget | label |
|---|---|---|
| `donationTitle` | string | `Rahallinen tuki: otsikko` |
| `donationIntro` | text | `Rahallinen tuki: johdanto` |
| `mobilepayNumber` | string | `MobilePay/Vipps-numero` |
| `bankRecipient` | string | `Tilisiirto: saaja` |
| `bankIban` | string | `Tilisiirto: tilinumero` |
| `bankMessage` | string | `Tilisiirto: viesti` |
| `donationNote` | text | `Rahallinen tuki: huomautus vaalirahoitusrajoista` |
| `donationThanks` | string | `Rahallinen tuki: kiitosteksti` |

`mobilepayNumber`- ja `bankIban`-kentille lisätään `hint: "Tyhjä = kortti piilotetaan. Jos sekä MobilePay-numero että tilinumero ovat tyhjiä, koko rahallisen tuen osio piilotetaan."`

- [ ] **Step 4: Luo `DonationSection.astro`**

Props yllä. Rakenne:
- `<section id="tue-kampanjaa" aria-labelledby="tue-kampanjaa-otsikko">`, taustana `var(--color-cream)` ja `scroll-margin-top: var(--header-h)`. Sisällä `.container-custom`, ja sisältö rajataan `max-width: 64rem`.
- `<h2 id="tue-kampanjaa-otsikko">` samalla tyylillä kuin sivun ”Miksi liittyä tukijoukkoihin?” (`1.5rem`, `700`, `--color-navy`). Sen jälkeen `intro` kappaleena.
- Kaksi korttia: rinnakkain `min-width: 768px`, muuten allekkain. Kortin tyyli: `background: var(--color-offwhite)`, `border-radius: 1.25rem`.
  - **MobilePay-kortti**, vain jos `mobilepayNumber?.trim()`. Otsikko `MobilePay / Vipps`, numero näkyvästi.
  - **Tilisiirtokortti**, vain jos `bankIban?.trim()`. Otsikko `Tilisiirto`, ja `<dl>`-rivit `Saaja` (jos annettu), `Tilinumero` ja `Viesti` (jos annettu).
- `note` pienemmällä tekstillä (`--color-body-text`), sen jälkeen `thanks`.
- Numero ja tilinumero: `white-space: nowrap`.
- Ulkoasun hionnassa käytetään `frontend-design`-skilliä nykyisen tyylin rajoissa.

- [ ] **Step 5: Kopioi-napit ja sitovat välilyönnit**

- Funktio `keepAmountsTogether(text: string): string` komponentin frontmatteriin. Se vaihtaa sitovaksi (U+00A0) välilyönnin numeron ja kolminumeroisen ryhmän välissä (`/(\d) (?=\d{3}(?!\d))/g`) ja numeron ja €-merkin välissä (`/(\d) €/g`). Sitä käytetään `intro`-, `note`- ja `thanks`-teksteihin, ei tilinumeroon.
- Napit: `<button type="button" class="copy-btn" data-copy={arvo ilman välilyöntejä} data-copy-label=… aria-label=… hidden>Kopioi</button>`.
  - MobilePay: `data-copy-label="MobilePay-numero"`, `aria-label="Kopioi MobilePay-numero"`.
  - Tilinumero: `data-copy-label="Tilinumero"`, `aria-label="Kopioi tilinumero"`. `data-copy` on `bankIban.replace(/\s+/g, '')`.
- Osiossa on yksi `<p class="sr-only" role="status" aria-live="polite">`, joka on visuaalisesti piilotettu mutta ruudunlukijan luettavissa.
- Komponentin `<script>`: jos `navigator.clipboard?.writeText` on olemassa, poista nappien `hidden`. Klikkauksesta (kutsu `navigator.clipboard.writeText` vasta klikkaushetkellä, älä tallenna viittausta etukäteen, jotta Task 4:n testi voi korvata sen) kirjoitetaan `data-copy` leikepöydälle, napin teksti on `Kopioitu` 2000 ms ajan, ja live-alueeseen kirjoitetaan `${label} kopioitu`. Virheestä napin teksti palautuu, eikä mitään heitetä.

- [ ] **Step 6: Liitä sivuun ja aja tarkistukset (odotetaan PASS)**

`vapaaehtoiseksi.astro`:
- `const showDonation = Boolean(data.mobilepayNumber?.trim() || data.bankIban?.trim());`
- Esittelysarakkeen loppuun, `introParagraph2`:n jälkeen: kun `showDonation` on tosi, linkki `<a href="#tue-kampanjaa">Voit tukea kampanjaa myös rahallisesti ↓</a>`. Tyyli on sama kuin yhteystietosivun sähköpostilinkissä (`--color-green-brand`, `600`).
- `volunteer-grid`-osion jälkeen: kun `showDonation` on tosi, `<DonationSection title={data.donationTitle || 'Tue kampanjaa taloudellisesti'} intro={data.donationIntro} mobilepayNumber={data.mobilepayNumber} bankRecipient={data.bankRecipient} bankIban={data.bankIban} bankMessage={data.bankMessage} note={data.donationNote} thanks={data.donationThanks} />`.

Aja Step 1:n komento. Expected: jokainen luku on ≥ `1`. Lisäksi:

```bash
curl -s localhost:4321/vapaaehtoiseksi/ | grep -c -E '<button[^>]*class="copy-btn[^>]*hidden'
```

Expected: `2` (napit ovat HTML:ssä piilossa ennen skriptiä).

**Tyhjät kentät** (Review Focus 1). Ota kopio JSONista: `cp src/content/settings/vapaaehtoiseksi.json node_modules/.cache/vap.json`. Tee sitten seuraavat muutokset vuorotellen, jolloin dev-palvelin päivittyy. Tarkista kunkin jälkeen `curl -s -o /dev/null -w '%{http_code}' localhost:4321/vapaaehtoiseksi/`, jonka pitää olla `200`.
1. `bankIban` → `""`. Odotus: sivun HTML:ssä `grep -c 'Tilisiirto'` = `0` ja `grep -c 'data-copy="45967"'` = `1`.
2. Poista `bankIban`-avain kokonaan ja aseta `mobilepayNumber` → `""`. Odotus: `grep -c 'tue-kampanjaa'` = `0`, eli osio, otsikon id ja ankkurilinkki ovat kaikki poissa.

Palauta lopuksi: `cp node_modules/.cache/vap.json src/content/settings/vapaaehtoiseksi.json`. Expected: `grep -c '"bankIban": "FI07 5730 0821 7235 96"' src/content/settings/vapaaehtoiseksi.json` = `1`.

- [ ] **Step 7: CMS-konfiguraatio jäsentyy**

Task 2 Step 4:n `node`-komento. Expected: `heroTitleBold,introTitle,introParagraph1,introParagraph2,donationTitle,donationIntro,mobilepayNumber,bankRecipient,bankIban,bankMessage,donationNote,donationThanks`

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/DonationSection.astro src/pages/vapaaehtoiseksi.astro src/content/settings/vapaaehtoiseksi.json public/admin/config.yml
git commit -m "feat: rahallisen tuen osio Tukijoukot-sivulle (MobilePay ja tilisiirto)"
```

---

### Task 4: Selaintarkistus, regressio ja viimeistely

**Files:**
- Modify (vain jos tarkistus löytää korjattavaa): Task 1–3:n tiedostot

**Interfaces:**
- Consumes: lähtötaso `node_modules/.cache/cw-baseline/` (Task 1), `#tue-kampanjaa` ja `.copy-btn` (Task 3)
- Produces: valmis haara, jonka voi mergetä

- [ ] **Step 1: Tuotantobuild ja regressiovertailu**

```bash
npm run build && (cd node_modules/.cache/cw-baseline && find . -name '*.html') | grep -v -E '^\./(index\.html|vapaaehtoiseksi/index\.html)$' | while read f; do diff -q <(sed -E 's#/_astro/[^"]+##g' "node_modules/.cache/cw-baseline/$f") <(sed -E 's#/_astro/[^"]+##g' "dist/$f") >/dev/null || echo "MUUTTUI: $f"; done; echo valmis
```

Expected: pelkkä `valmis`, eikä yhtään `MUUTTUI`-riviä. Erityisesti `/en` säilyy ennallaan.

- [ ] **Step 2: Kopioi-napin toiminta selaimessa**

Avaa `http://localhost:4321/vapaaehtoiseksi/` selainpaneelissa. Korvaa leikepöytä JS:llä ennen klikkausta: `navigator.clipboard.writeText = v => (window.__copied = v, Promise.resolve())`. Klikkaa tilinumeron nappia.

Expected: `window.__copied === 'FI0757300821723596'`, napin teksti on `Kopioitu` ja palautuu tekstiksi `Kopioi` noin 2 sekunnin kuluttua, live-alueessa lukee `Tilinumero kopioitu`, eikä konsolissa ole virheitä. Toista MobilePay-napille (`'45967'`).

- [ ] **Step 3: Ankkuri ja kapeat näytöt (Review Focus 3 ja 4)**

Leveyksillä 320, 375 ja 1280 px:
- Avaa `/vapaaehtoiseksi/` ja klikkaa ”Voit tukea kampanjaa myös rahallisesti ↓”. Expected: `document.getElementById('tue-kampanjaa-otsikko').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom`.
- Expected: `document.documentElement.scrollWidth <= window.innerWidth`.
- Avaa `/` ja ota kuvakaappaus. Expected: välit video → CTA-laatikko → blogikortit → footer ovat silmämääräisesti yhtä suuret (noin 4rem).

- [ ] **Step 4: Ulkoasun ja tekstien katselmointi**

Ota kuvakaappaukset `/vapaaehtoiseksi/`-sivusta (375 ja 1280 px) ja käy ne läpi `frontend-design`-skillillä nykyisen tyylin rajoissa sekä `typography`-skillillä (lainausmerkit, sitovat välilyönnit, nuoli). Korjaa löydökset ja aja Task 3 Step 1 uudelleen.

```bash
git add -A src public/admin && git commit -m "fix: rahoitusosion viimeistely katselmoinnin perusteella"
```

(Vain jos jotain korjattiin.)

- [ ] **Step 5: Viimeistely**

Pysäytä dev-palvelin ja käytä `superpowers:finishing-a-development-branch`-skilliä. Merge `main`iin ja push `carl`-remoteen tehdään vain Samulin luvalla, koska push julkaisee muutokset willandt.fi:hin. Muistuta Samulia kertomaan Carlille kahdesta tekstikorjauksesta (”vaatii” ja ”2 000 €”).
