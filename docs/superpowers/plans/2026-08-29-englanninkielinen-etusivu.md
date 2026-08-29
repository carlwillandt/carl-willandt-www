# Englanninkielinen etusivu (`/en`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rakentaa yksittäinen englanninkielinen tiivistelmäsivu osoitteeseen `/en`, jonka sisältö on muokattavissa Decap CMS:stä.

**Architecture:** Sivu kootaan olemassa olevista komponenteista (`Hero`, `VideoSection`, `Accordion`, `CTASection`). `VideoSection`, `CTASection` ja `BaseLayout` saavat uusia **valinnaisia** propseja, joiden oletusarvot vastaavat nykyistä käytöstä — suomenkieliset sivut eivät saa muuttua. Sisältö luetaan `src/content/settings/en.json`:ista samalla kuviolla kuin `carl.astro` ja `tavoitteeni.astro` lukevat omansa.

**Tech Stack:** Astro 6, Tailwind 4, `marked` (markdown → HTML), Decap CMS (`public/admin/config.yml`), `cwebp` (kuvan pakkaus).

**Spec:** `docs/superpowers/specs/2026-08-29-englanninkielinen-etusivu-design.md`

## Global Constraints

- **Suomenkieliset sivut eivät saa muuttua.** Jokainen uusi propsi on valinnainen ja sen oletusarvo tuottaa nykyisen lopputuloksen. Task 2 sisältää tämän regressiotarkistuksen.
- **Navigaatio pysyy suomeksi.** Nav-linkkejä ei käännetä. Ainoa uusi headerin elementti on kielilinkki.
- **Heittomerkit ovat typografisia** (`’`, U+2019), eivät suoria (`'`). Asiakkaan Word-dokumentti tallensi ne suorina; ne normalisoidaan.
- **Englanti on brittienglantia** (*recognise*, *defence*, *Councillor*). `og:locale` on `en_GB`.
- **Tekstit ovat sanatarkasti asiakkaan dokumentista.** Niitä ei toimiteta eikä tiivistetä.
- **Ei automaattitestejä.** Repossa ei ole testiframeworkia. Varmistus tapahtuu komennolla `npm run build` ja tarkastamalla generoitu `dist/`-hakemisto `grep`illä. Jokainen task päättyy tähän sykliin.
- **Työhaara:** `feature/englanninkielinen-etusivu`.

---

### Task 1: Kuva-assetti `public/en-carl-uno.webp`

Master `public/medialle/CarlWillandt-4948.jpg` on 9504×6336 ja 39 Mt — sitä ei voi käyttää sivulla sellaisenaan.

**Files:**
- Create: `public/en-carl-uno.webp`

**Interfaces:**
- Consumes: ei mitään
- Produces: polku `/en-carl-uno.webp`, jota Task 4 käyttää `VideoSection`in `imageSrc`-propsina

- [ ] **Step 1: Varmista että lähdekuva ja työkalu löytyvät**

```bash
ls -la public/medialle/CarlWillandt-4948.jpg && which cwebp
```

Expected: tiedosto listautuu (n. 39 Mt) ja `cwebp` löytyy polusta `/opt/homebrew/bin/cwebp`.

Jos `cwebp` puuttuu, asenna: `brew install webp`.

- [ ] **Step 2: Pakkaa kuva**

`-resize 1400 0` skaalaa leveyden 1400 pikseliin ja laskee korkeuden kuvasuhteen mukaan (3:2 → 1400×934).

Kuva näytetään `VideoSection`in kaksipalstaisessa ruudukossa, jossa palstan leveys on noin 570 px — 1400 px riittää siis myös retinanäytöille. Leveämpi kuva vain kasvattaisi tiedostokokoa ilman näkyvää hyötyä: mitatut vaihtoehdot olivat 1600 px / q82 = 345 kt, 1600 px / q72 = 245 kt (näkyvää sumeutta lehvästössä) ja 1400 px / q78 = 235 kt.

```bash
cwebp -m 6 -sharp_yuv -q 78 -resize 1400 0 public/medialle/CarlWillandt-4948.jpg -o public/en-carl-uno.webp
```

- [ ] **Step 3: Varmista mitat ja tiedostokoko**

```bash
sips -g pixelWidth -g pixelHeight public/en-carl-uno.webp && stat -f%z public/en-carl-uno.webp
```

Expected: `pixelWidth: 1400`, `pixelHeight: 934`, koko alle 256000 tavua (mitattu tulos: 234778).

- [ ] **Step 4: Commit**

```bash
git add public/en-carl-uno.webp
git commit -m "feat: lisää optimoitu kuva englanninkieliselle sivulle"
```

---

### Task 2: Laajenna `VideoSection` ja `CTASection`

Molemmat ovat pieniä, taaksepäin yhteensopivia propsilisäyksiä, ja molemmat varmistetaan samalla regressiotarkistuksella: suomenkielisen etusivun generoidun HTML:n pitää olla tavulleen sama muutosten jälkeen.

**Files:**
- Modify: `src/components/ui/VideoSection.astro`
- Modify: `src/components/ui/CTASection.astro`

**Interfaces:**
- Consumes: ei mitään
- Produces:
  - `VideoSection` uudet valinnaiset propsit: `imageSrc?: string` (oletus `'/hero-tavoitteeni.webp'`), `imageAlt?: string` (oletus `'Carl Willandt'`), `imagePosition?: string` (oletus `'50% 30%'`), `mediaAspect?: string` (oletus `'16/9'`)
  - `CTASection` uusi valinnainen propsi: `bodyHtml?: string`. Kun annettu, se renderöidään `bodyText`in sijaan.

- [ ] **Step 1: Ota regressiolinjaus talteen**

Rakenna sivusto nykyisellä koodilla ja ota etusivun HTML talteen.

> **Huom:** `npm run build` kestää tässä repossa useita minuutteja, koska `public/medialle/` sisältää suuria kuvatiedostoja jotka kopioidaan `dist/`:iin. Älä keskeytä sitä.

```bash
npm run build && cp dist/index.html /tmp/cw-index-baseline.html && echo "linjaus otettu"
```

Expected: build menee läpi ja tulostaa `linjaus otettu`.

- [ ] **Step 2: Laajenna `VideoSection` frontmatter**

Korvaa `src/components/ui/VideoSection.astro`:n frontmatter-lohko (tiedoston alun `---`-rajaama osa) kokonaan tällä:

```astro
---
interface Props {
  videoUrl?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
  mediaAspect?: string;
}
const {
  videoUrl,
  bodyHtml,
  ctaLabel,
  ctaHref,
  imageSrc = '/hero-tavoitteeni.webp',
  imageAlt = 'Carl Willandt',
  imagePosition = '50% 30%',
  mediaAspect = '16/9',
} = Astro.props;
---
```

- [ ] **Step 3: Käytä uusia propseja `VideoSection`in markupissa**

Korvaa mediapaikan `<div>` ja sen sisällä oleva fallback-`<img>`. Etsi rivi joka alkaa `<div style="aspect-ratio: 16/9;` ja korvaa koko `<div>`-elementti sulkevaan `</div>`-tagiin asti tällä:

```astro
    <div style={`aspect-ratio: ${mediaAspect}; background: rgba(13,27,42,0.08); border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative;`}>
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title="Carl Willandt video"
          style="width: 100%; height: 100%; border: none;"
          allowfullscreen
          loading="lazy"
        />
      ) : (
        <img
          src={imageSrc}
          alt={imageAlt}
          style={`width: 100%; height: 100%; object-fit: cover; object-position: ${imagePosition};`}
          loading="lazy"
        />
      )}
    </div>
```

- [ ] **Step 4: Laajenna `CTASection` frontmatter**

Korvaa `src/components/ui/CTASection.astro`:n frontmatter-lohko kokonaan tällä:

```astro
---
interface Props {
  titleBold: string;
  titleRegular: string;
  bodyText?: string;
  bodyHtml?: string;
  ctaLabel: string;
  ctaHref: string;
}
const { titleBold, titleRegular, bodyText, bodyHtml, ctaLabel, ctaHref } = Astro.props;
---
```

- [ ] **Step 5: Renderöi `bodyHtml` `CTASection`issa**

Etsi tämä lohko:

```astro
          {bodyText && (
            <p style="color: var(--color-footer-text); font-weight: 500; font-size: 1.125rem; line-height: 1.75; margin: 0;">{bodyText}</p>
          )}
```

Korvaa se tällä:

```astro
          {bodyHtml ? (
            <div class="cta-body" set:html={bodyHtml} />
          ) : bodyText && (
            <p style="color: var(--color-footer-text); font-weight: 500; font-size: 1.125rem; line-height: 1.75; margin: 0;">{bodyText}</p>
          )}
```

- [ ] **Step 6: Lisää `.cta-body`-tyylit**

Lisää `src/components/ui/CTASection.astro`:n `<style>`-lohkon alkuun, ennen `@media`-sääntöä:

```css
  .cta-body {
    color: var(--color-footer-text);
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.75;
  }
  .cta-body p { margin: 0; }
  .cta-body p + p { margin-top: 0.75rem; }
  .cta-body strong { font-weight: 700; color: var(--color-offwhite); }
```

- [ ] **Step 7: Aja regressiotarkistus**

Vertailu tehdään kahdessa osassa, koska Astro niputtaa komponentin koko scoped `<style>`-lohkon jokaiselle sivulle joka käyttää komponenttia — riippumatta siitä mikä haara renderöityy. Step 6:n `.cta-body`-säännöt päätyvät siis myös suomenkieliselle etusivulle, vaikka mikään elementti siellä ei käytä niitä. Se on odotettua eikä muuta sivun ulkoasua.

**A) Renderöity DOM on identtinen** — tämä on varsinainen vaatimus:

```bash
npm run build
perl -0pe 's|<style>.*?</style>||gs' /tmp/cw-index-baseline.html > /tmp/cw-a.html
perl -0pe 's|<style>.*?</style>||gs' dist/index.html > /tmp/cw-b.html
diff -B -w /tmp/cw-a.html /tmp/cw-b.html && echo "DOM IDENTTINEN"
```

Expected: `DOM IDENTTINEN`. Jos `diff` tulostaa eroja, jokin oletusarvo ei vastaa aiempaa käytöstä — korjaa oletusarvo ja aja uudelleen. **Älä löysennä vertailua.**

**B) Uusi CSS-luokka ei ole käytössä suomenkielisellä sivulla:**

```bash
grep -c 'class="cta-body"' dist/index.html
diff -B -w /tmp/cw-index-baseline.html dist/index.html | grep -c 'cta-body'
```

Expected: ensimmäinen tulostaa `0` (luokkaa ei renderöidä), toinen tulostaa nollaa suuremman luvun (säännöt ovat mukana tyylilohkossa). Jos ensimmäinen tulostaa muuta kuin `0`, `CTASection` on ottanut `bodyHtml`-haaran vahingossa käyttöön myös suomeksi.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/VideoSection.astro src/components/ui/CTASection.astro
git commit -m "feat: VideoSection ja CTASection tukevat kuvaa ja HTML-leipätekstiä"
```

---

### Task 3: `BaseLayout` tukemaan englantia

Tällä hetkellä `lang="fi"`, `og:locale` `fi_FI` ja JSON-LD:n `inLanguage` ovat kovakoodattuja.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: ei mitään
- Produces: `BaseLayout` uudet valinnaiset propsit `lang?: 'fi' | 'en'` (oletus `'fi'`) ja `hasTranslation?: boolean` (oletus `false`). Task 4 antaa molemmat.

- [ ] **Step 1: Ota regressiolinjaus talteen**

> **Huom:** `npm run build` kestää useita minuutteja. Älä keskeytä sitä.

```bash
npm run build && cp dist/index.html /tmp/cw-layout-index.html && cp dist/carl/index.html /tmp/cw-layout-carl.html && echo "linjaus otettu"
```

Expected: `linjaus otettu`.

- [ ] **Step 2: Laajenna frontmatter**

Korvaa `src/layouts/BaseLayout.astro`:n frontmatter-lohko kokonaan tällä:

```astro
---
import '../styles/global.css';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  lang?: 'fi' | 'en';
  hasTranslation?: boolean;
}

const {
  title,
  description = 'Carl Willandt — Eduskuntavaaliehdokas 2027, Kokoomus, Pirkanmaa. Sivistystä, realismia ja rohkeutta.',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  lang = 'fi',
  hasTranslation = false,
} = Astro.props;

const siteUrl = 'https://willandt.fi';
const canonicalUrl = new URL(Astro.url.pathname, siteUrl).href;
const ogImageUrl = new URL(ogImage, siteUrl).href;
const pageTitle = title === 'Etusivu'
  ? 'Carl Willandt — Eduskuntavaaliehdokas 2027 · Kokoomus · Pirkanmaa'
  : title.includes('—') ? title : `${title} — Carl Willandt`;

const ogLocale = lang === 'en' ? 'en_GB' : 'fi_FI';

// Sivustolla on täsmälleen yksi kieliversiopari: suomenkielinen etusivu ja /en.
const LANG_ALTERNATES = [
  { hreflang: 'fi', href: 'https://willandt.fi/' },
  { hreflang: 'en', href: 'https://willandt.fi/en' },
  { hreflang: 'x-default', href: 'https://willandt.fi/' },
];

const personDescription = lang === 'en'
  ? 'National Coalition Party candidate from Pirkanmaa in Finland’s 2027 parliamentary elections. Master of Arts, Communications Manager and Municipal Councillor in Hämeenkyrö.'
  : 'Kokoomuksen eduskuntavaaliehdokas Pirkanmaalta kevään 2027 vaaleissa. Filosofian maisteri, viestintäpäällikkö ja Hämeenkyrön kunnanvaltuutettu.';

const personJobTitle = lang === 'en'
  ? 'Candidate for the Finnish Parliament 2027'
  : 'Eduskuntavaaliehdokas 2027';

const siteDescription = lang === 'en'
  ? 'Carl Willandt — Candidate for the Finnish Parliament 2027, National Coalition Party, Pirkanmaa.'
  : 'Carl Willandt — Eduskuntavaaliehdokas 2027, Kokoomus, Pirkanmaa.';
---
```

- [ ] **Step 3: Käytä `lang`-propsia `<html>`-tagissa**

Korvaa rivi `<html lang="fi">` tällä:

```astro
<html lang={lang}>
```

- [ ] **Step 4: Lisää hreflang-linkit**

Etsi tämä rivi:

```astro
    <link rel="canonical" href={canonicalUrl} />
```

Lisää **heti sen jälkeen**:

```astro
    {hasTranslation && LANG_ALTERNATES.map(alt => (
      <link rel="alternate" hreflang={alt.hreflang} href={alt.href} />
    ))}
```

- [ ] **Step 5: Käytä `ogLocale`-muuttujaa**

Korvaa rivi `<meta property="og:locale" content="fi_FI" />` tällä:

```astro
    <meta property="og:locale" content={ogLocale} />
```

- [ ] **Step 6: Kielitä JSON-LD**

Korvaa `<script type="application/ld+json" ...>` -elementti kokonaan tällä:

```astro
    <script type="application/ld+json" set:html={JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://willandt.fi/#carl-willandt",
        "name": "Carl Willandt",
        "url": "https://willandt.fi",
        "image": "https://willandt.fi/og-image.jpg",
        "jobTitle": personJobTitle,
        "description": personDescription,
        "memberOf": {
          "@type": "Organization",
          "name": "Kansallinen Kokoomus",
          "url": "https://www.kokoomus.fi"
        },
        "sameAs": [
          "https://www.facebook.com/p/Carl-Willandt-61570290832156/",
          "https://instagram.com/carl.willandt",
          "https://x.com/carlwillandt"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://willandt.fi/#website",
        "url": "https://willandt.fi",
        "name": "Carl Willandt",
        "description": siteDescription,
        "inLanguage": lang,
        "publisher": {
          "@id": "https://willandt.fi/#carl-willandt"
        }
      }
    ])} />
```

- [ ] **Step 7: Aja regressiotarkistus**

Vertailu jättää huomiotta tyhjät rivit ja välilyöntien määrän (`-B -w`), koska hreflang-lohkon lisääminen templaattiin muuttaa rivinvaihtoja myös silloin kun `hasTranslation` on `false`.

```bash
npm run build \
  && diff -B -w /tmp/cw-layout-index.html dist/index.html \
  && diff -B -w /tmp/cw-layout-carl.html dist/carl/index.html \
  && echo "EI EROJA"
```

Expected: `EI EROJA`. Suomenkieliset sivut käyttävät oletusarvoja, joten sisältö ei saa muuttua. Erityisesti JSON-LD:n pitää olla identtinen: `personJobTitle`, `personDescription` ja `siteDescription` tuottavat suomeksi täsmälleen samat merkkijonot kuin aiemmat kovakoodatut arvot.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout tukee englanninkielistä sivua (lang, og:locale, hreflang, JSON-LD)"
```

---

### Task 4: Sisältötiedosto ja sivu

**Files:**
- Create: `src/content/settings/en.json`
- Create: `src/pages/en.astro`

**Interfaces:**
- Consumes:
  - `/en-carl-uno.webp` (Task 1)
  - `VideoSection` propsit `imageSrc`, `imageAlt`, `imagePosition`, `mediaAspect` (Task 2)
  - `CTASection` propsi `bodyHtml` (Task 2)
  - `BaseLayout` propsit `lang`, `hasTranslation` (Task 3)
- Produces: reitti `/en`, jonka Task 5 linkittää headeriin, ja tiedosto `src/content/settings/en.json`, jonka Task 6 kytkee CMS:ään

- [ ] **Step 1: Luo `src/content/settings/en.json`**

Tekstit ovat sanatarkasti asiakkaan dokumentista, heittomerkit typografisina.

```json
{
  "metaTitle": "Carl Willandt — Candidate for the Finnish Parliament 2027",
  "metaDescription": "Carl Willandt is a National Coalition Party candidate from Pirkanmaa in Finland’s 2027 parliamentary elections. Education, realism, and courage.",
  "heroTextBold": "EDUCATION.",
  "heroTextRegular": "Realism. Courage.",
  "heroBodyText": "Society does not simply change, it is shaped by those willing to act. Finland needs a collaborative bridge-builder, and Pirkanmaa needs a strong voice ready to take responsibility, now more than ever. Vote for me in the 2027 parliamentary elections and let us work together for an educated, safe, and sustainable Finland.",
  "introBodyText": "Hello! I’m Carl Willandt, a 43-year-old father, communications professional, and local decision-maker from Hämeenkyrö. Whether it’s communications, public speaking, knitting, or hunting, I’m someone who values both practical skills and lifelong learning. My family includes my wife Nina, our two school-aged children, and Uno, our five-year-old German Shorthaired Pointer. I hold a Master of Arts degree and work as a Communications Manager with a focus on sustainability and responsibility. Alongside my professional career, I serve as a Municipal Councillor in Hämeenkyrö, a member of the Education Committee, and Chair of the National Coalition Party Council Group. I believe Finland succeeds when we combine education, responsibility, and the courage to build solutions together.",
  "prioritiesTitle": "My priorities",
  "prioritiesIntro": "For me, politics is guided by responsibility, education, and pragmatic, values-based realism. Finland’s future depends on our ability to combine knowledge, courage, sustainability, and cooperation in order to build a stronger society for future generations.",
  "accordionItems": [
    {
      "id": "education",
      "icon": "graduation-cap",
      "title": "Education: The Foundation of Finland",
      "content": "Education is the cornerstone of Finland’s success. Every child and young person deserves a safe learning environment, high-quality teaching, and the opportunity to reach their full potential. I believe in evidence-based decision-making, respect for science, and equal access to education from early childhood to higher education."
    },
    {
      "id": "security",
      "icon": "shield",
      "title": "Security Through Economic Strength and National Defence",
      "content": "A secure Finland is built on a strong economy, sound public finances, and credible defence capabilities. Security requires preparedness, resilience, and responsible decision-making. Finland must strengthen its self-sufficiency, safeguard its defence capabilities, and ensure that future generations inherit both a safe country and a sustainable economy."
    },
    {
      "id": "freedom",
      "icon": "scale",
      "title": "Freedom Comes with Responsibility",
      "content": "Freedom allows people to work, build businesses, make choices, and live according to their own values. At the same time, freedom requires responsibility towards one another and society as a whole. I support entrepreneurship, individual liberty, and equal opportunities, while promoting a culture of respect, inclusion, and personal accountability."
    },
    {
      "id": "nature",
      "icon": "tree-pine",
      "title": "Nature, Wellbeing, and Resilience",
      "content": "A healthy relationship with nature strengthens both individual wellbeing and national resilience. Finland’s rich natural environment offers health benefits, supports biodiversity, and enhances preparedness in an uncertain world. We must protect and restore nature, strengthen carbon sinks, and recognise the value of outdoor traditions, hunting culture, and sustainable stewardship of our natural resources."
    }
  ],
  "ctaTitleBold": "CONTACT",
  "ctaTitleRegular": "and support",
  "ctaBodyText": "**Get involved. Make a difference.** You can support my campaign in many ways, whether by sharing my message, volunteering, or making a financial contribution. If you have any questions or would like to invite me to speak at your event, feel free to contact me.",
  "ctaLabel": "Get in touch",
  "ctaHref": "/ota-yhteytta"
}
```

- [ ] **Step 2: Varmista että JSON on validia**

```bash
node -e "const d=require('./src/content/settings/en.json'); console.log(d.accordionItems.length + ' osiota, ikonit: ' + d.accordionItems.map(i=>i.icon).join(', '))"
```

Expected: `4 osiota, ikonit: graduation-cap, shield, scale, tree-pine`

- [ ] **Step 3: Luo `src/pages/en.astro`**

Hero saa samat kuva-asetukset kuin suomenkielinen etusivu. `Accordion`ille **ei** anneta `sectionTitle`-propsia, koska otsikko ja johdantokappale renderöidään sivulta oikeassa järjestyksessä.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/ui/Hero.astro';
import VideoSection from '../components/ui/VideoSection.astro';
import Accordion from '../components/ui/Accordion.astro';
import type { AccordionItem } from '../components/ui/Accordion.astro';
import CTASection from '../components/ui/CTASection.astro';
import { marked } from 'marked';
import data from '../content/settings/en.json';

const accordionItems: AccordionItem[] = data.accordionItems.map(item => ({
  ...item,
  content: marked.parse(item.content) as string,
}));

const introHtml = marked.parse(data.introBodyText) as string;
const ctaBodyHtml = marked.parse(data.ctaBodyText) as string;
---
<BaseLayout
  title={data.metaTitle}
  description={data.metaDescription}
  lang="en"
  hasTranslation={true}
>
  <Hero
    titleBold={data.heroTextBold}
    titleRegular={data.heroTextRegular}
    imageSrcs={["/hero-1.webp", "/hero-2.webp"]}
    imageAlt="Carl Willandt"
    imagePosition="65% 25%"
    imagePositionDesktop="50% 25%"
    showKokoomusLogo={true}
    bodyText={data.heroBodyText}
  />

  <VideoSection
    bodyHtml={introHtml}
    imageSrc="/en-carl-uno.webp"
    imageAlt="Carl Willandt with his German Shorthaired Pointer Uno in the forest"
    imagePosition="50% 50%"
    mediaAspect="3/2"
  />

  <section style="padding: 0 0 4rem; background-color: var(--color-cream);">
    <div class="container-custom">
      <div style="max-width: 56rem; margin: 0 auto;">
        <h2 style="font-size: 1.625rem; font-weight: 700; color: var(--color-navy); line-height: 1.3; margin: 0 0 1rem;">
          {data.prioritiesTitle}
        </h2>
        <p style="font-size: 1.3125rem; font-weight: 400; color: var(--color-navy); line-height: 1.75; margin-bottom: 2.5rem;">
          {data.prioritiesIntro}
        </p>

        <Accordion items={accordionItems} />
      </div>
    </div>
  </section>

  <CTASection
    titleBold={data.ctaTitleBold}
    titleRegular={data.ctaTitleRegular}
    bodyHtml={ctaBodyHtml}
    ctaLabel={data.ctaLabel}
    ctaHref={data.ctaHref}
  />
</BaseLayout>
```

- [ ] **Step 4: Rakenna ja varmista että sivu syntyy**

```bash
npm run build && ls -la dist/en/index.html
```

Expected: build menee läpi ja `dist/en/index.html` on olemassa.

- [ ] **Step 5: Varmista sivun sisältö ja kieliattribuutit**

```bash
grep -c 'lang="en"' dist/en/index.html
grep -c 'content="en_GB"' dist/en/index.html
grep -o 'rel="alternate"' dist/en/index.html | wc -l
grep -o 'EDUCATION\.' dist/en/index.html | head -1
grep -o 'My priorities' dist/en/index.html | head -1
grep -o 'Get in touch' dist/en/index.html | head -1
grep -o '/en-carl-uno.webp' dist/en/index.html | head -1
grep -c 'aspect-ratio: 3/2' dist/en/index.html
grep -c '<strong>Get involved. Make a difference.</strong>' dist/en/index.html
```

Expected järjestyksessä: `1`, `1`, `3`, `EDUCATION.`, `My priorities`, `Get in touch`, `/en-carl-uno.webp`, `1`, `1`.

- [ ] **Step 6: Varmista että pois jätetyt osiot puuttuvat**

```bash
grep -c 'Sivistys. Turvallisuus. Vapaus. Kestävyys.' dist/en/index.html || echo "banneri puuttuu — oikein"
grep -c 'LÄHDE MUKAAN' dist/en/index.html || echo "suomenkielinen CTA puuttuu — oikein"
```

Expected: molemmat tulostavat `0` ja sitten vahvistusrivin. Vihreää banneria ja blogilistausta ei saa olla sivulla.

- [ ] **Step 7: Varmista että `/en` on sitemapissa**

```bash
grep -o 'https://willandt.fi/en' dist/sitemap-0.xml | head -1
```

Expected: `https://willandt.fi/en`

- [ ] **Step 8: Commit**

```bash
git add src/content/settings/en.json src/pages/en.astro
git commit -m "feat: lisää englanninkielinen etusivu /en"
```

---

### Task 5: Kielilinkki headeriin

Linkki tyylitellään tarkoituksella eri tavalla kuin nav-linkit — ei versaalia, kevyempi paino, ei aktiivisuusviivaa — jotta se ei sekoitu suomenkieliseen navigaatioon.

**Files:**
- Modify: `src/components/layout/Header.astro`

**Interfaces:**
- Consumes: reitti `/en` (Task 4)
- Produces: ei mitään myöhemmille taskeille

- [ ] **Step 1: Johda kielilinkki nykyisestä polusta**

Etsi `src/components/layout/Header.astro`:n frontmatterista tämä funktio:

```astro
function isActive(href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}
```

Lisää **heti sen jälkeen**, ennen sulkevaa `---`-riviä:

```astro
const isEnglish = currentPath === '/en' || currentPath === '/en/';
const langLink = isEnglish
  ? { href: '/', label: 'Suomeksi' }
  : { href: '/en', label: 'In English' };
```

- [ ] **Step 2: Lisää linkki desktop-naviin**

Etsi desktop-navista tämä lohko:

```astro
      <a href="/vapaaehtoiseksi" class="btn-primary nav-cta">
        Tukijoukot
      </a>
```

Lisää **heti sitä ennen**:

```astro
      <a href={langLink.href} class="lang-link">{langLink.label}</a>
```

- [ ] **Step 3: Lisää linkki mobiilivalikkoon**

Etsi mobiilivalikosta tämä lohko:

```astro
      <a href="/vapaaehtoiseksi" class="btn-primary" style="text-align: center; margin-top: 1rem; font-size: 0.875rem;">
        Tukijoukot
      </a>
```

Lisää **heti sitä ennen**:

```astro
      <a href={langLink.href} class="mobile-lang-link">{langLink.label}</a>
```

- [ ] **Step 4: Lisää tyylit**

Lisää `src/components/layout/Header.astro`:n `<style>`-lohkoon, heti `.nav-cta`-säännön jälkeen:

```css
  /* Kielilinkki: tarkoituksella eri tyyli kuin nav-linkeillä, jottei sekoitu naviin */
  .lang-link {
    display: flex;
    align-items: center;
    padding: 1.05rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: none;
    text-decoration: none;
    color: var(--color-offwhite);
    opacity: 0.75;
    white-space: nowrap;
    transition: opacity 0.15s, color 0.15s;
  }

  .lang-link:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .site-header.scrolled .lang-link {
    color: var(--color-navy);
  }

  .mobile-lang-link {
    color: var(--color-offwhite);
    opacity: 0.75;
    font-weight: 500;
    font-size: 0.875rem;
    padding: 0.75rem 0;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
```

- [ ] **Step 5: Rakenna ja varmista molemmat suunnat**

```bash
npm run build
echo "--- FI-sivut ---"
grep -o 'In English' dist/index.html | head -1
grep -o 'In English' dist/carl/index.html | head -1
echo "--- EN-sivu ---"
grep -o 'Suomeksi' dist/en/index.html | head -1
grep -c 'In English' dist/en/index.html
```

Expected: `In English` löytyy sekä etusivulta että Carl-sivulta; `Suomeksi` löytyy `/en`-sivulta; viimeinen komento tulostaa `0` (englanninkielisellä sivulla ei ole "In English" -linkkiä).

- [ ] **Step 6: Varmista että linkkejä on kaksi per sivu (desktop + mobiili)**

```bash
grep -c 'lang-link' dist/index.html
```

Expected: `2` — yksi `.lang-link` desktop-navissa ja yksi `.mobile-lang-link` mobiilivalikossa. (`grep -c` laskee rivit; jos molemmat ovat samalla rivillä minifioidussa HTML:ssä, käytä `grep -o 'lang-link' dist/index.html | wc -l` ja odota arvoa `2`.)

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Header.astro
git commit -m "feat: lisää kielilinkki headeriin (In English / Suomeksi)"
```

---

### Task 6: Decap CMS -kentät

Carlin pitää pystyä muokkaamaan kaikkia sivun tekstejä itse. Kenttäotsikot ovat suomeksi kuten muuallakin CMS:ssä, vaikka sisältö on englantia.

**Files:**
- Modify: `public/admin/config.yml`

**Interfaces:**
- Consumes: `src/content/settings/en.json` (Task 4)
- Produces: ei mitään myöhemmille taskeille

- [ ] **Step 1: Lisää tiedostomäärittely `asetukset`-kokoelmaan**

Lisää `public/admin/config.yml`:n loppuun, `- label: "Tukijoukot-sivu"` -lohkon jälkeen, samalla sisennyksellä (6 välilyöntiä `- label`-rivin edessä):

```yaml
      - label: "Englanninkielinen sivu"
        name: en
        file: src/content/settings/en.json
        fields:
          - { label: "Sivun otsikko (selaimen välilehti, hakukoneet)", name: metaTitle, widget: string }
          - { label: "Sivun kuvaus (hakukoneet, some)", name: metaDescription, widget: text }
          - { label: "Hero-otsikko (lihavoitu rivi, esim. EDUCATION.)", name: heroTextBold, widget: string }
          - { label: "Hero-otsikko (kevyt rivi, esim. Realism. Courage.)", name: heroTextRegular, widget: string }
          - { label: "Hero-leipäteksti", name: heroBodyText, widget: text }
          - { label: "Esittelyteksti kuvan vieressä", name: introBodyText, widget: markdown }
          - { label: "Teemaosion otsikko", name: prioritiesTitle, widget: string }
          - { label: "Teemaosion johdantokappale", name: prioritiesIntro, widget: text }
          - label: "Teemat (haitariosiot)"
            name: accordionItems
            widget: list
            fields:
              - { label: "Tunniste (älä muuta)", name: id, widget: string }
              - { label: "Otsikko", name: title, widget: string }
              - label: "Ikoni"
                name: icon
                widget: select
                options:
                  - { label: "Koti", value: home }
                  - { label: "Kirja", value: book-open }
                  - { label: "Trophy", value: trophy }
                  - { label: "Puu", value: tree-pine }
                  - { label: "Kilpi", value: shield }
                  - { label: "Lakki", value: graduation-cap }
                  - { label: "Vaaka", value: scale }
              - { label: "Sisältö", name: content, widget: markdown }
          - { label: "CTA-laatikko: otsikko (lihavoitu rivi)", name: ctaTitleBold, widget: string }
          - { label: "CTA-laatikko: otsikko (kevyt rivi)", name: ctaTitleRegular, widget: string }
          - { label: "CTA-laatikko: teksti", name: ctaBodyText, widget: markdown }
          - { label: "CTA-laatikko: napin teksti", name: ctaLabel, widget: string }
          - { label: "CTA-laatikko: napin linkki", name: ctaHref, widget: string }
```

- [ ] **Step 2: Varmista että YAML on validia**

```bash
node_modules/.bin/js-yaml public/admin/config.yml > /dev/null && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Step 3: Varmista että kentät vastaavat JSON:in avaimia**

Tämä on tärkein tarkistus: jos kentän `name` ei vastaa JSON:in avainta, Carlin tallennus pyyhkii sisällön.

```bash
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const cfg = yaml.load(fs.readFileSync('public/admin/config.yml', 'utf8'));
const files = cfg.collections.find(c => c.name === 'asetukset').files;
const en = files.find(f => f.name === 'en');
const cmsKeys = en.fields.map(f => f.name).sort();
const jsonKeys = Object.keys(require('./src/content/settings/en.json')).sort();
const missing = jsonKeys.filter(k => !cmsKeys.includes(k));
const extra = cmsKeys.filter(k => !jsonKeys.includes(k));
console.log('Puuttuu CMS:stä:', missing.length ? missing : 'ei mitään');
console.log('Ylimääräisiä CMS:ssä:', extra.length ? extra : 'ei mitään');
const sub = en.fields.find(f => f.name === 'accordionItems').fields.map(f => f.name).sort();
console.log('Haitarin alikentät:', sub.join(', '));
"
```

Expected:
```
Puuttuu CMS:stä: ei mitään
Ylimääräisiä CMS:ssä: ei mitään
Haitarin alikentät: content, icon, id, title
```

- [ ] **Step 4: Commit**

```bash
git add public/admin/config.yml
git commit -m "feat: lisää englanninkielisen sivun kentät Decap CMS:ään"
```

---

## Lopputarkistus

Kun kaikki taskit on tehty, aja koko varmistuslista kerralla.

- [ ] **Step 1: Puhdas build**

```bash
rm -rf dist && npm run build
```

Expected: build menee läpi ilman virheitä tai varoituksia.

- [ ] **Step 2: Aja spec:in testauslista**

```bash
echo "1. /en syntyy:"        && test -f dist/en/index.html && echo "   OK"
echo "2. lang ja locale:"     && grep -c 'lang="en"' dist/en/index.html && grep -c 'content="en_GB"' dist/en/index.html
echo "3. hreflang-linkkejä:"  && grep -o 'rel="alternate"' dist/en/index.html | wc -l
echo "4. neljä haitaria:"     && grep -o 'data-accordion-trigger' dist/en/index.html | wc -l
echo "5. kuvan koko:"         && ls -l public/en-carl-uno.webp | awk '{print "   " $5 " tavua"}'
echo "6. /en sitemapissa:"    && grep -c 'willandt.fi/en' dist/sitemap-0.xml
echo "7. kielilinkki FI:ssä:" && grep -o 'In English' dist/index.html | head -1
echo "8. kielilinkki EN:ssä:" && grep -o 'Suomeksi' dist/en/index.html | head -1
```

Expected: `1`, `1`, `3`, `4`, alle `256000` tavua, `1`, `In English`, `Suomeksi`.

- [ ] **Step 3: Katso sivu selaimessa**

```bash
npm run dev
```

Avaa `http://localhost:4321/en` ja tarkista silmämääräisesti:

- Hero: kuvat vaihtuvat ristihäivytyksellä, otsikko kahdella rivillä, Kokoomus-logo oikeassa alanurkassa
- Vihreää banneria **ei ole**
- Kuva Unosta ei ole rumasti rajattu (3:2 pitäisi näyttää koko kuvan)
- Neljä haitariosiota avautuvat ja sulkeutuvat, ikonit näkyvät
- Ruskea CTA-laatikko: "Get involved. Make a difference." on lihavoitu, nappi vie Yhteystiedot-sivulle
- Kielilinkki näkyy headerissa sekä läpinäkyvänä että vieritettynä (väri vaihtuu)
- Kavenna ikkuna alle 1280 px: kielilinkki löytyy hampurilaisvalikosta

Tarkista myös `http://localhost:4321/` — suomenkielisen etusivun pitää näyttää täysin ennallaan.
