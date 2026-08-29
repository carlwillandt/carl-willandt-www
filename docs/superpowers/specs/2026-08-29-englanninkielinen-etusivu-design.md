# Englanninkielinen etusivu (`/en`) — design

**Päivämäärä:** 2026-08-29
**Lähde:** `Materiaaleja/ENGLANNINKIELINEN SIVU.docx` (asiakkaan kirjoittamat sisällöt ja asetteluohje)

## Tavoite

Yksi staattinen englanninkielinen tiivistelmäsivu osoitteessa `/en`. Sivu on rakenteeltaan sama kuin suomenkielinen etusivu mutta tiivistetymmällä sisällöllä. Muuta sivustoa ei käännetä, eikä sivustolle rakenneta i18n-reititystä.

Sisältö on muokattavissa Decap CMS:stä, koska Carlin pitää pystyä päivittämään tekstit itse.

## Rajaukset

- Navigaatio pysyy suomeksi. Asiakkaan ohje: näin kukaan ei erehdy luulemaan, että muutkin sivut olisi käännetty.
- Sivustolle ei tule Astron i18n-reititystä eikä `/en/`-hakemistoa. `/en` on yksittäinen sivu.
- Blogilistausta ei tule englanninkieliselle sivulle. Asetteluohje ei mainitse sitä, ja sivu on tiivistelmä.
- Vihreää ilmoitusbanneria ei tule. Asetteluohje sanoo suoraan "vihreä palkki pois".
- Yhteystiedot-sivu (`/ota-yhteytta`) jää suomenkieliseksi. CTA-nappi vie sinne.

## Sivun rakenne

Järjestys on suoraan asetteluohjeesta.

| # | Osio | Komponentti | Huomiot |
|---|------|-------------|---------|
| 1 | Hero | `Hero` | Muuttumaton komponentti |
| 2 | — | — | Vihreä banneri jätetään pois |
| 3 | Kuva + teksti | `VideoSection` | Komponenttia laajennetaan |
| 4 | My priorities | `Accordion` | Muuttumaton komponentti |
| 5 | — | — | Blogilistaus jätetään pois |
| 6 | Ruskea CTA | `CTASection` | Komponenttia laajennetaan |

### 1. Hero

`Hero`-komponentti sellaisenaan, samoilla asetuksilla kuin suomenkielinen etusivu:

- `imageSrcs={["/hero-1.webp", "/hero-2.webp"]}` — samat master-kuvat ja ristihäivytys
- `imagePosition="65% 25%"`, `imagePositionDesktop="50% 25%"` — sama rajaus
- `showKokoomusLogo={true}`

Otsikko jaetaan kahdelle riville samalla logiikalla kuin suomenkielinen hero (lihava versaalirivi + kevyt rivi). `Hero` asettaa lihavalle riville `text-transform: uppercase`.

- Lihava rivi: `EDUCATION.`
- Kevyt rivi: `Realism. Courage.`

### 2. Vihreä banneri

Jätetään pois. `AnnouncementBanner`-komponenttia ei importoida `en.astro`:on.

### 3. Kuva ja esittelyteksti

Korvaa suomenkielisen etusivun videon. `VideoSection`-komponentti kuvatilassa:

- Kuva 4948 (Carl ja Uno metsässä) vasemmalla, kuvasuhde 3:2
- Esittelyteksti oikealla
- **Ei CTA-nappia** — asetteluohje ei mainitse sellaista, ja suomenkielisen version "Lue lisää" veisi suomenkieliselle Carl-sivulle

### 4. My priorities

Osio taustavärillä `var(--color-cream)`, sisältö rajattu `max-width: 56rem` kuten `carl.astro`:ssa.

Järjestys:

1. `<h2>` "My priorities"
2. Johdantokappale, tyyliteltynä kuten `carl.astro`:n `introParagraph`
3. `Accordion` neljällä osiolla

`Accordion`-komponentille **ei** anneta `sectionTitle`-propsia, koska otsikon ja johdantokappaleen järjestys on toisin päin kuin komponentti renderöisi.

Neljä osiota vastaavat 1:1 suomenkielisen Tavoitteeni-sivun teemoja, joten ne saavat samat ikonit:

| id | icon | Otsikko |
|----|------|---------|
| `education` | `graduation-cap` | Education: The Foundation of Finland |
| `security` | `shield` | Security Through Economic Strength and National Defence |
| `freedom` | `scale` | Freedom Comes with Responsibility |
| `nature` | `tree-pine` | Nature, Wellbeing, and Resilience |

Sisällöt ajetaan `marked`in läpi kuten `carl.astro`:ssa, koska ne tulevat CMS:n markdown-kentistä.

### 5. Blogilistaus

Jätetään pois.

### 6. Ruskea CTA-laatikko

`CTASection`-komponentti, sama visuaalinen ilme kuin suomenkielisellä etusivulla (tekstuuri + kultainen sävy).

- Lihava rivi: `CONTACT`
- Kevyt rivi: `and support`
- Nappi: "Get in touch" → `/ota-yhteytta`

Leipätekstin ensimmäinen virke on lihavoitu asiakkaan dokumentissa, joten teksti tulee markdownina ja renderöidään HTML:ksi.

## Muutokset olemassa oleviin tiedostoihin

Jokainen muutos on taaksepäin yhteensopiva: uudet propsit ovat valinnaisia ja oletusarvot vastaavat nykyistä käytöstä, joten suomenkieliset sivut eivät muutu.

### `src/layouts/BaseLayout.astro`

Tällä hetkellä `lang="fi"`, `og:locale` `fi_FI` ja JSON-LD:n `inLanguage: "fi"` ovat kovakoodattuja.

- Uusi valinnainen propsi `lang: 'fi' | 'en'`, oletus `'fi'`
- `<html lang>` ja `og:locale` johdetaan siitä. Englanniksi `en_GB`, koska asiakkaan teksti on brittienglantia (*recognise*, *defence*, *Councillor*)
- JSON-LD: `inLanguage` seuraa `lang`-propsia, ja englanniksi `Person`-skeeman `jobTitle` ja `description` ovat englanniksi
- `hreflang`-linkit `fi`, `en` ja `x-default` (osoittaa suomenkieliseen) molemmilla etusivuilla. Reciprookkiset linkit tarvitaan, jotta hakukoneet ymmärtävät sivut kieliversioiksi toisistaan.

`pageTitle`-logiikka jää ennalleen: `en.astro` antaa täyden otsikon ajatusviivalla, jolloin `— Carl Willandt` -jälkiliitettä ei lisätä.

### `src/components/layout/Header.astro`

Pieni kielilinkki `Tukijoukot`-napin viereen desktop-navissa ja mobiilivalikkoon.

Linkki tyylitellään **tarkoituksella eri tavalla kuin nav-linkit**: ei versaalia, kevyempi fonttipaino, ei alareunan aktiivisuusviivaa. Näin se ei sekoitu suomenkieliseen navigaatioon.

Linkki on vastavuoroinen ja johdetaan nykyisestä polusta:

- Suomenkielisillä sivuilla: "In English" → `/en`
- `/en`-sivulla: "Suomeksi" → `/`

Väri seuraa headerin tilaa kuten nav-linkeilläkin (offwhite läpinäkyvänä, navy vieritettynä).

### `src/components/ui/VideoSection.astro`

Nyt fallback-kuva `/hero-tavoitteeni.webp` ja kuvasuhde `16/9` ovat kovakoodattuja. Kuva 4948 on 3:2, joten 16:9 leikkaisi sitä rajusti.

Uudet valinnaiset propsit:

| Propsi | Oletus | Käyttö |
|--------|--------|--------|
| `imageSrc` | `/hero-tavoitteeni.webp` | Näytetään kun `videoUrl` puuttuu |
| `imageAlt` | `Carl Willandt` | Kuvan vaihtoehtoinen teksti |
| `imagePosition` | `50% 30%` | `object-position` |
| `mediaAspect` | `16/9` | Mediapaikan kuvasuhde |

### `src/components/ui/CTASection.astro`

Uusi valinnainen propsi `bodyHtml`. Kun se on annettu, se renderöidään `set:html`illa nykyisen `<p>`-elementin tilalle samoilla tyyleillä. `bodyText` jää ennalleen, ja suomenkielinen etusivu käyttää sitä edelleen.

### `public/admin/config.yml`

Uusi tiedosto `asetukset`-kokoelmaan, otsikolla "Englanninkielinen sivu", tiedostona `src/content/settings/en.json`.

Haitariosioiden `list`-widget ikonivalitsimineen kopioidaan Tavoitteeni-sivun määrittelystä. CMS:n kenttäotsikot ovat suomeksi kuten muuallakin, vaikka sisältö on englantia.

## Uudet tiedostot

### `public/en-carl-uno.webp`

Kuva 4948 pakattuna sivukäyttöön. Master on `public/medialle/CarlWillandt-4948.jpg`, 9504×6336, 39 Mt — sitä ei voi käyttää sellaisenaan.

- Leveys noin 1600 px, kuvasuhde säilytetään (3:2 → 1600×1067)
- Tavoitekoko alle 250 kt

Mediapaketin thumbnail `public/medialle/thumbs/CarlWillandt-4948.webp` (1200×800) olisi teknisesti riittävä, mutta se kuuluu mediapakettiin eikä sitä pidä sitoa sivun ulkoasuun.

### `src/content/settings/en.json`

Sisältää kaikki sivun tekstit. Rakenne:

```json
{
  "metaTitle": "…",
  "metaDescription": "…",
  "heroTextBold": "…",
  "heroTextRegular": "…",
  "heroBodyText": "…",
  "introBodyText": "… (markdown)",
  "prioritiesTitle": "…",
  "prioritiesIntro": "…",
  "accordionItems": [
    { "id": "…", "icon": "…", "title": "…", "content": "… (markdown)" }
  ],
  "ctaTitleBold": "…",
  "ctaTitleRegular": "…",
  "ctaBodyText": "… (markdown)",
  "ctaLabel": "…",
  "ctaHref": "…"
}
```

### `src/pages/en.astro`

Lukee `en.json`:in, ajaa markdown-kentät `marked`in läpi ja kokoaa sivun yllä kuvatuista komponenteista. Antaa `BaseLayout`ille `lang="en"`.

## Sisältö

Tekstit ovat asiakkaan dokumentista sanatarkasti. Heittomerkit normalisoidaan typografisiksi (`’`), koska Word tallensi ne suorina.

**Hero, leipäteksti:**

> Society does not simply change, it is shaped by those willing to act. Finland needs a collaborative bridge-builder, and Pirkanmaa needs a strong voice ready to take responsibility, now more than ever. Vote for me in the 2027 parliamentary elections and let us work together for an educated, safe, and sustainable Finland.

**Esittelyteksti kuvan vieressä:**

> Hello! I’m Carl Willandt, a 43-year-old father, communications professional, and local decision-maker from Hämeenkyrö. Whether it’s communications, public speaking, knitting, or hunting, I’m someone who values both practical skills and lifelong learning. My family includes my wife Nina, our two school-aged children, and Uno, our five-year-old German Shorthaired Pointer. I hold a Master of Arts degree and work as a Communications Manager with a focus on sustainability and responsibility. Alongside my professional career, I serve as a Municipal Councillor in Hämeenkyrö, a member of the Education Committee, and Chair of the National Coalition Party Council Group. I believe Finland succeeds when we combine education, responsibility, and the courage to build solutions together.

**My priorities, johdanto:**

> For me, politics is guided by responsibility, education, and pragmatic, values-based realism. Finland’s future depends on our ability to combine knowledge, courage, sustainability, and cooperation in order to build a stronger society for future generations.

**Education: The Foundation of Finland**

> Education is the cornerstone of Finland’s success. Every child and young person deserves a safe learning environment, high-quality teaching, and the opportunity to reach their full potential. I believe in evidence-based decision-making, respect for science, and equal access to education from early childhood to higher education.

**Security Through Economic Strength and National Defence**

> A secure Finland is built on a strong economy, sound public finances, and credible defence capabilities. Security requires preparedness, resilience, and responsible decision-making. Finland must strengthen its self-sufficiency, safeguard its defence capabilities, and ensure that future generations inherit both a safe country and a sustainable economy.

**Freedom Comes with Responsibility**

> Freedom allows people to work, build businesses, make choices, and live according to their own values. At the same time, freedom requires responsibility towards one another and society as a whole. I support entrepreneurship, individual liberty, and equal opportunities, while promoting a culture of respect, inclusion, and personal accountability.

**Nature, Wellbeing, and Resilience**

> A healthy relationship with nature strengthens both individual wellbeing and national resilience. Finland’s rich natural environment offers health benefits, supports biodiversity, and enhances preparedness in an uncertain world. We must protect and restore nature, strengthen carbon sinks, and recognise the value of outdoor traditions, hunting culture, and sustainable stewardship of our natural resources.

**CTA-laatikko:**

> **Get involved. Make a difference.** You can support my campaign in many ways, whether by sharing my message, volunteering, or making a financial contribution. If you have any questions or would like to invite me to speak at your event, feel free to contact me.

**Meta:**

- `metaTitle`: Carl Willandt — Candidate for the Finnish Parliament 2027
- `metaDescription`: Carl Willandt is a National Coalition Party candidate from Pirkanmaa in Finland’s 2027 parliamentary elections. Education, realism, and courage.

## Testaus

Sivustolla ei ole automaattitestejä, joten varmistus tehdään rakentamalla ja katsomalla.

1. `npm run build` menee läpi ilman virheitä
2. `/en` renderöityy: hero, kuva + teksti, My priorities neljällä toimivalla haitarilla, CTA-laatikko
3. Suomenkielinen etusivu `/` on visuaalisesti muuttumaton — erityisesti `VideoSection` ja `CTASection`
4. `/en`-sivun lähdekoodissa on `lang="en"`, `og:locale` `en_GB` ja kolme `hreflang`-linkkiä
5. Kielilinkki näkyy headerissa molempiin suuntiin ja toimii sekä desktopilla että mobiilivalikossa
6. `public/en-carl-uno.webp` on alle 250 kt
7. `/en` löytyy generoidusta `sitemap-index.xml`:stä

## Avoimet asiat, jotka eivät kuulu tähän toteutukseen

- **Ikäero:** englanninkielinen teksti sanoo "43-year-old", suomenkielinen `site.json`:in `heroBodyText` sanoo "42-vuotias". Englanninkielinen sivu käyttää dokumentin lukua. Suomenkielinen teksti kannattaa päivittää erikseen.
- **Yhteystiedot-sivu on suomeksi.** "Get in touch" vie suomenkieliselle sivulle. Tämä on linjassa rajauksen kanssa, että navigaatiota ja muita sivuja ei käännetä.
