# Carl Willandt Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Carl Willandt's campaign website at willandt.fi — 7 pages matching approved Figma designs, with Decap CMS for self-managed content and Netlify Forms for contact/volunteer submissions.

**Architecture:** Static Astro 5 site with Tailwind CSS. Astro Content Collections power the blog, press releases, and site settings. Decap CMS provides a browser-based editor at `/admin` backed by GitHub. Netlify hosts the site for free and handles form submissions, routing them to `carl@willandt.fi`. Three pages not in Figma (Medialle, Vapaaehtoiseksi, Ota yhteyttä) follow the same design system as the four Figma-designed pages.

**Tech Stack:** Astro 5, Tailwind CSS + @tailwindcss/typography, Decap CMS 3, Netlify (hosting + Forms), TypeScript strict

**Figma file:** `rHvGckrAHeZd9sBEVzdM4Q` — nodes: Etusivu `5884:58`, Carl `5927:4`, Tavoitteeni `5941:13`, Blogi `5915:15`, Brand guidelines `5873:5`

---

## File Structure

```
/                                   ← repo root (existing)
├── public/
│   ├── admin/
│   │   ├── index.html              ← Decap CMS admin UI
│   │   └── config.yml              ← Decap CMS collection config
│   ├── uploads/                    ← CMS-managed media (gitignored initially)
│   ├── carl-willandt-logo.svg      ← copied from Materiaaleja/
│   ├── kokoomus-logo.png           ← copied from Materiaaleja/
│   ├── hero-carl.jpg               ← Carl's photo (placeholder → real)
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro        ← nav + mobile hamburger
│   │   │   └── Footer.astro        ← social icons + nav + contact links
│   │   └── ui/
│   │       ├── Hero.astro          ← reusable hero (image + title + CTA)
│   │       ├── Accordion.astro     ← single-open accordion
│   │       ├── BlogCard.astro      ← category + date + excerpt + link
│   │       ├── AnnouncementBanner.astro ← green banner below hero
│   │       ├── VideoSection.astro  ← iframe embed + text column
│   │       ├── CTASection.astro    ← "LÄHDE MUKAAN" dark section
│   │       └── ContactForm.astro   ← Netlify Forms wrapper
│   ├── layouts/
│   │   └── BaseLayout.astro        ← HTML shell + Header + Footer
│   ├── pages/
│   │   ├── index.astro             ← Etusivu
│   │   ├── carl.astro              ← Carl bio + accordion
│   │   ├── tavoitteeni.astro       ← Goals + accordion
│   │   ├── blogi/
│   │   │   ├── index.astro         ← Blog listing
│   │   │   └── [slug].astro        ← Blog article detail
│   │   ├── medialle.astro          ← Press page
│   │   ├── vapaaehtoiseksi.astro   ← Volunteer sign-up + form
│   │   └── ota-yhteytta.astro      ← Contact form
│   ├── content/
│   │   ├── config.ts               ← Astro content collection schemas
│   │   ├── blogi/                  ← Markdown blog posts
│   │   │   └── ensimmainen-postaus.md
│   │   ├── medialle/               ← Markdown press releases
│   │   └── settings/
│   │       └── site.json           ← CMS-editable site settings
│   └── styles/
│       └── global.css              ← font imports + Tailwind + base styles
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── netlify.toml
└── package.json
```

---

### Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `src/env.d.ts`

- [ ] **Step 1: Initialize Astro in repo root**

Run from `/Users/samuliraappana/Documents/GitHub/Carl-Willandt/`:
```bash
npm create astro@latest . -- --template minimal --typescript strictest --install --no-git
```
When prompted, confirm overwriting existing files (only `docs/` and `Materiaaleja/` exist — safe to proceed).

Expected output: `✓ Dependencies installed` and `✓ Astro installed`

- [ ] **Step 2: Add Tailwind, MDX, and sitemap integrations**
```bash
npx astro add tailwind mdx sitemap --yes
```
Expected: `tailwind.config.mjs` created, packages installed.

- [ ] **Step 3: Install typography plugin**
```bash
npm install @tailwindcss/typography
```

- [ ] **Step 4: Verify dev server starts**
```bash
npm run dev
```
Expected: `Local: http://localhost:4321/` — open browser, minimal page renders without errors.

Stop with Ctrl+C.

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json tailwind.config.mjs src/ public/
git commit -m "feat: initialize Astro project with Tailwind, MDX, and sitemap"
```

---

### Task 2: Design Tokens and Global Styles

**Files:**
- Modify: `tailwind.config.mjs`
- Create: `src/styles/global.css`

- [ ] **Step 1: Configure Tailwind with brand colors and fonts**

Replace entire `tailwind.config.mjs`:
```js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1F2D',
          light: '#1B2D3E',
        },
        'green-brand': '#3A7A4F',
        'green-banner': '#2D5A3D',
        cream: '#F5F3F0',
        'cta-dark': '#1C2B1E',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [typography],
};
```

> ⚠️ **Verify colors against Figma node `5873:5` (Värit section) before finalizing.** These are estimates from screenshots. Update hex values if they differ.
> ⚠️ **Verify font families against Figma node `5873:5` (Typografia section).** Replace `DM Sans`/`Lora` if different fonts are used.

- [ ] **Step 2: Create global CSS**

Create `src/styles/global.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Lora:wght@700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-gray-900 font-sans antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-green-brand text-white px-6 py-3 rounded-full font-semibold
           hover:bg-green-700 transition-colors duration-200 inline-block;
  }
  .btn-outline {
    @apply border-2 border-cream text-cream px-6 py-3 rounded-full font-semibold
           hover:bg-cream hover:text-navy transition-colors duration-200 inline-block;
  }
  .container-custom {
    @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add tailwind.config.mjs src/styles/global.css
git commit -m "feat: add brand design tokens and global styles"
```

---

### Task 3: Static Assets and Base Layout

**Files:**
- Create: `public/favicon.svg`
- Copy: `public/carl-willandt-logo.svg`, `public/kokoomus-logo.png`, `public/hero-carl.jpg`
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Copy logo assets from Materiaaleja**
```bash
cp Materiaaleja/carl-willandt-logo.svg public/carl-willandt-logo.svg
cp "Materiaaleja/kokoomus-logo-valkoinen.png" public/kokoomus-logo.png
```

- [ ] **Step 2: Create favicon**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0D1F2D"/>
  <text x="16" y="22" text-anchor="middle" fill="#F5F3F0"
        font-size="16" font-family="serif" font-weight="bold">W</text>
</svg>
```

- [ ] **Step 3: Add placeholder hero image**

Download a dark placeholder (replace with Carl's actual photo before launch):
```bash
curl -o public/hero-carl.jpg \
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
```

If curl fails, create an empty placeholder and note that the real photo is needed:
```bash
touch public/hero-carl.jpg
echo "NOTE: Replace public/hero-carl.jpg with Carl's professional photo before launch"
```

- [ ] **Step 4: Create BaseLayout**

Create `src/layouts/BaseLayout.astro`:
```astro
---
import '../styles/global.css';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = 'Carl Willandt — Eduskuntavaaliehdokas 2027, Kokoomus',
} = Astro.props;
---
<!doctype html>
<html lang="fi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title} — Carl Willandt</title>
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Commit**
```bash
git add public/ src/layouts/BaseLayout.astro
git commit -m "feat: add static assets and base layout"
```

---

### Task 4: Header Component

**Files:**
- Create: `src/components/layout/Header.astro`

Figma reference: Navigation bar visible on all pages. Nav links: Etusivu · Carl · Tavoitteeni · Blogi/Ajankohtaista · Ota yhteyttä + green "Tukijoukot →" CTA button.

- [ ] **Step 1: Create Header**

Create `src/components/layout/Header.astro`:
```astro
---
const navLinks = [
  { href: '/', label: 'Etusivu' },
  { href: '/carl', label: 'Carl' },
  { href: '/tavoitteeni', label: 'Tavoitteeni' },
  { href: '/blogi', label: 'Blogi / Ajankohtaista' },
  { href: '/ota-yhteytta', label: 'Ota yhteyttä' },
];

const currentPath = Astro.url.pathname;

function isActive(href: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath.startsWith(href);
}
---
<header class="bg-navy sticky top-0 z-50">
  <div class="container-custom flex items-center justify-between py-4">
    <!-- Logo -->
    <a href="/" class="flex-shrink-0" aria-label="Carl Willandt — etusivu">
      <img src="/carl-willandt-logo.svg" alt="Carl Willandt" class="h-12" />
    </a>

    <!-- Desktop nav -->
    <nav class="hidden lg:flex items-center gap-6" aria-label="Päänavigaatio">
      {navLinks.map(link => (
        <a
          href={link.href}
          class:list={[
            'text-sm font-semibold tracking-wide uppercase transition-colors',
            isActive(link.href)
              ? 'text-cream border-b-2 border-green-brand pb-0.5'
              : 'text-cream/70 hover:text-cream',
          ]}
        >
          {link.label}
        </a>
      ))}
      <a href="/vapaaehtoiseksi" class="btn-primary text-sm ml-2">
        Tukijoukot →
      </a>
    </nav>

    <!-- Mobile hamburger button -->
    <button
      id="menu-toggle"
      class="lg:hidden text-cream p-2"
      aria-label="Avaa valikko"
      aria-expanded="false"
      aria-controls="mobile-menu"
    >
      <svg id="icon-hamburger" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg id="icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden lg:hidden bg-navy-light border-t border-white/10">
    <nav class="container-custom py-4 flex flex-col gap-1" aria-label="Mobiilinavigaatio">
      {navLinks.map(link => (
        <a
          href={link.href}
          class="text-cream/80 hover:text-cream font-semibold py-3 border-b border-white/10 text-sm"
        >
          {link.label}
        </a>
      ))}
      <a href="/vapaaehtoiseksi" class="btn-primary text-center mt-4 text-sm">
        Tukijoukot →
      </a>
    </nav>
  </div>
</header>

<script>
  const toggle = document.getElementById('menu-toggle')!;
  const menu = document.getElementById('mobile-menu')!;
  const iconHamburger = document.getElementById('icon-hamburger')!;
  const iconClose = document.getElementById('icon-close')!;

  toggle.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
    iconHamburger.classList.toggle('hidden', !isOpen);
    iconClose.classList.toggle('hidden', isOpen);
  });
</script>
```

- [ ] **Step 2: Create placeholder Footer so BaseLayout compiles**

Create `src/components/layout/Footer.astro` (temporary):
```astro
<footer class="bg-navy-light text-cream py-8">
  <div class="container-custom text-center text-sm text-cream/50">
    © {new Date().getFullYear()} Carl Willandt
  </div>
</footer>
```

- [ ] **Step 3: Update index.astro to use BaseLayout and verify**

Replace `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Etusivu">
  <div class="py-32 text-center">
    <h1 class="text-4xl font-bold">Sivusto rakenteilla</h1>
  </div>
</BaseLayout>
```

Run `npm run dev` and open http://localhost:4321. Verify:
- Header renders with logo and nav links
- Mobile hamburger shows at < 1024px width and toggles the menu

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/Header.astro src/components/layout/Footer.astro src/pages/index.astro
git commit -m "feat: add Header component with responsive mobile menu"
```

---

### Task 5: Footer Component

**Files:**
- Modify: `src/components/layout/Footer.astro`

Figma reference: Footer in Carl page (5927:4) and Etusivu (5884:58). Structure: social icons row → 3-column grid (brand / navigointi / ota yhteyttä) → copyright.

- [ ] **Step 1: Replace footer with full implementation**

Replace `src/components/layout/Footer.astro`:
```astro
---
const navLinks = [
  { href: '/', label: 'Etusivu' },
  { href: '/carl', label: 'Carl' },
  { href: '/tavoitteeni', label: 'Teemat' },
  { href: '/blogi', label: 'Blogi / Ajankohtaista' },
  { href: '/ota-yhteytta', label: 'Ota yhteyttä' },
];

const contactLinks = [
  { href: 'mailto:info@willandt.fi', label: 'info@willandt.fi' },
  { href: '/medialle', label: 'Mediapaketti' },
  { href: '/vapaaehtoiseksi', label: 'Vapaaehtoiseksi' },
];
---
<footer class="bg-navy-light text-cream">
  <!-- Social icons -->
  <div class="container-custom pt-10 pb-2">
    <div class="flex gap-5 mb-10">
      <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
         class="text-cream/50 hover:text-cream transition-colors">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
         class="text-cream/50 hover:text-cream transition-colors">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      </a>
      <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
         class="text-cream/50 hover:text-cream transition-colors">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
      <!-- Brand -->
      <div>
        <img src="/carl-willandt-logo.svg" alt="Carl Willandt" class="h-10 mb-3" />
        <p class="text-cream/50 text-sm leading-relaxed">
          Eduskuntavaaliehdokas 2027 · Kokoomus
        </p>
      </div>
      <!-- Nav -->
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-cream/40 mb-4">Navigointi</p>
        <ul class="space-y-2">
          {navLinks.map(link => (
            <li>
              <a href={link.href} class="text-cream/60 hover:text-cream text-sm transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <!-- Contact -->
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-cream/40 mb-4">Ota yhteyttä</p>
        <ul class="space-y-2">
          {contactLinks.map(link => (
            <li>
              <a href={link.href} class="text-cream/60 hover:text-cream text-sm transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <p class="text-cream/30 text-xs py-6">© {new Date().getFullYear()} Carl Willandt</p>
  </div>
</footer>
```

- [ ] **Step 2: Verify footer renders**

Open http://localhost:4321. Footer should show logo, 3-column grid, and copyright.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/Footer.astro
git commit -m "feat: build full Footer component"
```

---

### Task 6: Hero Component

**Files:**
- Create: `src/components/ui/Hero.astro`

Figma reference: Used on Etusivu (5884:58), Carl (5927:4), Tavoitteeni (5941:13), Blogi (5915:15). Dark overlay on photo, large title, optional body text and CTA.

- [ ] **Step 1: Create Hero**

Create `src/components/ui/Hero.astro`:
```astro
---
interface Props {
  title: string;
  subtitle?: string;
  bodyText?: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref?: string;
  showKokoomusLogo?: boolean;
}

const {
  title,
  subtitle,
  bodyText,
  imageSrc,
  imageAlt,
  ctaLabel,
  ctaHref,
  showKokoomusLogo = false,
} = Astro.props;
---
<section class="relative bg-navy min-h-[65vh] flex items-end overflow-hidden">
  <!-- Background photo -->
  <div class="absolute inset-0">
    <img
      src={imageSrc}
      alt={imageAlt}
      class="w-full h-full object-cover object-center"
      loading="eager"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-transparent"></div>
    <div class="absolute inset-0 bg-navy/30"></div>
  </div>

  <!-- Content -->
  <div class="relative container-custom py-16 md:py-24 w-full">
    <div class="max-w-lg">
      {subtitle && (
        <p class="text-green-brand text-xs font-bold uppercase tracking-widest mb-3">
          {subtitle}
        </p>
      )}
      <h1 class="text-5xl md:text-7xl font-bold text-cream leading-none mb-4 uppercase">
        {title}
      </h1>
      {bodyText && (
        <p class="text-cream/80 text-base md:text-lg leading-relaxed mb-8 max-w-sm">
          {bodyText}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <a href={ctaHref} class="btn-primary">{ctaLabel}</a>
      )}
    </div>

    {showKokoomusLogo && (
      <div class="absolute bottom-8 right-8 hidden md:block">
        <img src="/kokoomus-logo.png" alt="Kokoomus" class="h-8 opacity-70" />
      </div>
    )}
  </div>
</section>
```

- [ ] **Step 2: Verify Hero renders on home page**

Update `src/pages/index.astro` temporarily:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/ui/Hero.astro';
---
<BaseLayout title="Etusivu">
  <Hero
    title="SIVISTYSTÄ, realismia ja rohkeutta"
    imageSrc="/hero-carl.jpg"
    imageAlt="Carl Willandt"
    showKokoomusLogo={true}
    bodyText="Maailma muuttuu. Sitä muutetaan."
    ctaLabel="Lue lisää"
    ctaHref="/carl"
  />
</BaseLayout>
```

Open http://localhost:4321 — dark hero with title and gradient overlay renders.

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/Hero.astro src/pages/index.astro
git commit -m "feat: add reusable Hero component"
```

---

### Task 7: Accordion Component

**Files:**
- Create: `src/components/ui/Accordion.astro`

Figma reference: Carl (5927:4) — "Elämäni eri osa-alueet" with chevron toggles. Tavoitteeni (5941:13) — political themes. **Only one item open at a time.** Items have icons.

- [ ] **Step 1: Create Accordion**

Create `src/components/ui/Accordion.astro`:
```astro
---
export interface AccordionItem {
  id: string;
  title: string;
  icon?: string;
  content: string; // HTML string
}

interface Props {
  items: AccordionItem[];
  sectionTitle?: string;
}

const { items, sectionTitle } = Astro.props;
const groupId = `acc-${Math.random().toString(36).slice(2, 7)}`;
---
<div>
  {sectionTitle && (
    <h2 class="text-2xl font-bold text-gray-900 mb-6">{sectionTitle}</h2>
  )}
  <div class="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden"
       data-accordion-group={groupId}>
    {items.map((item, i) => (
      <div>
        <button
          class="w-full flex items-center justify-between px-6 py-5 text-left
                 hover:bg-gray-50 transition-colors bg-white"
          aria-expanded="false"
          aria-controls={`${groupId}-panel-${i}`}
          id={`${groupId}-btn-${i}`}
          data-accordion-trigger
        >
          <span class="flex items-center gap-3 font-semibold text-gray-900 text-base">
            {item.icon && (
              <span class="text-navy" aria-hidden="true">{item.icon}</span>
            )}
            {item.title}
          </span>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 accordion-chevron"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          id={`${groupId}-panel-${i}`}
          role="region"
          aria-labelledby={`${groupId}-btn-${i}`}
          class="hidden bg-white px-6 pb-6 pt-3 prose prose-sm max-w-none border-t border-gray-100"
          set:html={item.content}
        />
      </div>
    ))}
  </div>
</div>

<script>
  document.querySelectorAll<HTMLElement>('[data-accordion-group]').forEach(group => {
    const triggers = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger]')
    );

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const isAlreadyOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Close all items in this group
        triggers.forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          const panelId = t.getAttribute('aria-controls');
          if (panelId) document.getElementById(panelId)?.classList.add('hidden');
          t.querySelector('.accordion-chevron')?.classList.remove('rotate-180');
        });

        // Open this item if it wasn't open
        if (!isAlreadyOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          const panelId = trigger.getAttribute('aria-controls');
          if (panelId) document.getElementById(panelId)?.classList.remove('hidden');
          trigger.querySelector('.accordion-chevron')?.classList.add('rotate-180');
        }
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify accordion behavior**

Add temporarily to `src/pages/index.astro`:
```astro
---
import Accordion from '../components/ui/Accordion.astro';
const testItems = [
  { id: '1', title: 'Juurista', icon: '🏡', content: '<p>Syntynyt Hämeenkyröössä.</p>' },
  { id: '2', title: 'Oppimisesta', icon: '📚', content: '<p>Filosofian maisteri.</p>' },
  { id: '3', title: 'Kodista', icon: '🏠', content: '<p>Perheenisä.</p>' },
];
---
<div class="container-custom py-12">
  <Accordion items={testItems} sectionTitle="Elämäni eri osa-alueet" />
</div>
```

Open http://localhost:4321. Verify:
- Clicking item 1 opens it
- Clicking item 2 opens it AND closes item 1
- Clicking open item closes it

Remove the test code after verification.

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/Accordion.astro
git commit -m "feat: add accessible single-open Accordion component"
```

---

### Task 8: Remaining UI Components

**Files:**
- Create: `src/components/ui/BlogCard.astro`
- Create: `src/components/ui/AnnouncementBanner.astro`
- Create: `src/components/ui/VideoSection.astro`
- Create: `src/components/ui/CTASection.astro`
- Create: `src/components/ui/ContactForm.astro`

- [ ] **Step 1: Create BlogCard**

Figma reference: Blog cards on Etusivu (5884:58) — category badge, date, title, excerpt, "LUE LISÄÄ" link.

Create `src/components/ui/BlogCard.astro`:
```astro
---
interface Props {
  title: string;
  excerpt: string;
  date: Date;
  category: string;
  slug: string;
}

const { title, excerpt, date, category, slug } = Astro.props;

const formattedDate = date.toLocaleDateString('fi-FI', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});
---
<article class="bg-white border border-gray-200 rounded-lg overflow-hidden
                hover:shadow-md transition-shadow flex flex-col h-full">
  <div class="p-6 flex flex-col flex-1">
    <div class="flex items-center gap-3 mb-3 text-xs text-gray-500 flex-wrap">
      <span class="bg-green-brand/10 text-green-brand font-semibold px-2 py-1 rounded text-xs">
        {category}
      </span>
      <time datetime={date.toISOString()}>{formattedDate}</time>
    </div>
    <h3 class="text-base font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
    <p class="text-gray-600 text-sm leading-relaxed mb-5 flex-1">{excerpt}</p>
    <a
      href={`/blogi/${slug}`}
      class="inline-flex items-center text-green-brand font-bold text-sm
             hover:underline uppercase tracking-wide"
    >
      Lue lisää
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  </div>
</article>
```

- [ ] **Step 2: Create AnnouncementBanner**

Figma reference: Green banner below hero on Etusivu (5884:58). Text + "LUE LISÄÄ" link.

Create `src/components/ui/AnnouncementBanner.astro`:
```astro
---
interface Props {
  text: string;
  linkLabel?: string;
  linkHref?: string;
}
const { text, linkLabel = 'Lue lisää', linkHref } = Astro.props;
---
<div class="bg-green-banner text-cream py-3">
  <div class="container-custom flex items-center justify-between gap-4 flex-wrap">
    <p class="text-sm">{text}</p>
    {linkHref && (
      <a href={linkHref}
         class="text-xs font-bold uppercase tracking-widest whitespace-nowrap hover:underline flex-shrink-0">
        {linkLabel} →
      </a>
    )}
  </div>
</div>
```

- [ ] **Step 3: Create VideoSection**

Figma reference: Video (left) + intro text (right) on Etusivu (5884:58). Green play button when no video URL.

Create `src/components/ui/VideoSection.astro`:
```astro
---
interface Props {
  videoUrl?: string;
  bodyHtml: string;
}
const { videoUrl, bodyHtml } = Astro.props;
---
<section class="py-16 bg-gray-50">
  <div class="container-custom grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <!-- Video -->
    <div class="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg relative">
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title="Carl Willandt video"
          class="w-full h-full"
          allowfullscreen
          loading="lazy"
        />
      ) : (
        <div class="w-full h-full flex items-center justify-center bg-gray-300">
          <div class="w-20 h-20 bg-green-brand rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
    <!-- Text -->
    <div class="prose prose-lg max-w-none">
      <Fragment set:html={bodyHtml} />
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create CTASection**

Figma reference: "LÄHDE MUKAAN tukijoukkoihin!" on Etusivu (5884:58). Dark background, large title left, text + button right.

Create `src/components/ui/CTASection.astro`:
```astro
---
interface Props {
  title: string;
  bodyText?: string;
  ctaLabel: string;
  ctaHref: string;
}
const { title, bodyText, ctaLabel, ctaHref } = Astro.props;
---
<section class="bg-cta-dark py-16 md:py-24">
  <div class="container-custom grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-4xl md:text-5xl font-bold text-cream leading-tight uppercase">
        {title}
      </h2>
    </div>
    <div>
      {bodyText && (
        <p class="text-cream/75 text-lg leading-relaxed mb-8">{bodyText}</p>
      )}
      <a href={ctaHref} class="btn-outline">{ctaLabel}</a>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create ContactForm**

Used on Vapaaehtoiseksi and Ota yhteyttä. Netlify Forms integration via `data-netlify="true"`.

Create `src/components/ui/ContactForm.astro`:
```astro
---
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

interface Props {
  formName: string;
  fields: FormField[];
  submitLabel?: string;
}

const { formName, fields, submitLabel = 'Lähetä' } = Astro.props;

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-green-brand focus:border-transparent ' +
  'placeholder:text-gray-400';
---
<form
  name={formName}
  method="POST"
  data-netlify="true"
  netlify-honeypot="bot-field"
  class="space-y-5"
>
  <!-- Required hidden input for Netlify Forms -->
  <input type="hidden" name="form-name" value={formName} />
  <!-- Honeypot spam protection -->
  <p class="hidden" aria-hidden="true">
    <label>Jätä tyhjäksi: <input name="bot-field" /></label>
  </p>

  {fields.map(field => (
    <div>
      <label for={`${formName}-${field.name}`}
             class="block text-sm font-semibold text-gray-700 mb-1">
        {field.label}
        {field.required && <span class="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          id={`${formName}-${field.name}`}
          name={field.name}
          rows={5}
          required={field.required ?? false}
          placeholder={field.placeholder ?? ''}
          class={inputClass}
        />
      ) : (
        <input
          id={`${formName}-${field.name}`}
          type={field.type}
          name={field.name}
          required={field.required ?? false}
          placeholder={field.placeholder ?? ''}
          class={inputClass}
        />
      )}
    </div>
  ))}

  <button type="submit" class="btn-primary w-full sm:w-auto px-10">
    {submitLabel}
  </button>
</form>
```

- [ ] **Step 6: Commit**
```bash
git add src/components/ui/
git commit -m "feat: add BlogCard, AnnouncementBanner, VideoSection, CTASection, ContactForm components"
```

---

### Task 9: Content Collections and Site Settings

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/settings/site.json`
- Create: `src/content/blogi/ensimmainen-postaus.md`
- Create: `src/content/medialle/.gitkeep`

- [ ] **Step 1: Configure content collections**

Create `src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const blogiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const mediaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blogi: blogiCollection,
  medialle: mediaCollection,
};
```

- [ ] **Step 2: Create site settings JSON**

Create `src/content/settings/site.json`:
```json
{
  "heroText": "SIVISTYSTÄ, realismia ja rohkeutta",
  "heroBodyText": "Maailma muuttuu. Sitä muutetaan. Maailma kaipaa sivistystä turvallisuusrealismia juuri nyt enemmän kuin koskaan. Äänestä minua tokomään tätä sivistyneen, turvallisen ja vapaan Suomen puolesta kevään 2027 eduskuntavaaleissa.",
  "announcementBannerText": "",
  "announcementBannerLinkLabel": "Lue lisää",
  "announcementBannerLinkHref": "",
  "videoUrl": "",
  "videoBodyText": "<p>Täällä esittelyteksti videosta ja Carlin taustasta. Carl päivittää tämän CMS:n kautta.</p>",
  "socialX": "https://twitter.com/",
  "socialInstagram": "https://instagram.com/",
  "socialFacebook": "https://facebook.com/"
}
```

- [ ] **Step 3: Create sample blog post**

Create `src/content/blogi/ensimmainen-postaus.md`:
```md
---
title: Tervetuloa kampanjasivustolleni
date: 2026-05-04
category: Ajankohtaista
excerpt: Olen avannut kampanjasivustoni. Lue lisää siitä, mitä olen suunnitellut eduskuntavaaleissa 2027.
draft: false
---

Tervetuloa sivustolleni!

Olen Carl Willandt, Kokoomuksen eduskuntavaaliehdokas 2027. Tältä sivustolta löydät tietoa minusta, tavoitteistani ja kampanjastani.

Seuraa blogiani — kirjoitan täällä ajankohtaisista aiheista ja kampanjan kuulumisista.
```

- [ ] **Step 4: Create medialle placeholder**
```bash
touch src/content/medialle/.gitkeep
```

- [ ] **Step 5: Verify build passes**
```bash
npm run build
```
Expected: Build completes without TypeScript or schema errors. `dist/` folder created.

- [ ] **Step 6: Commit**
```bash
git add src/content/
git commit -m "feat: configure content collections and add sample blog post"
```

---

### Task 10: Etusivu (Home Page)

**Files:**
- Modify: `src/pages/index.astro`

Figma reference: node `5884:58`. Order: Hero → AnnouncementBanner (if text set) → VideoSection → 4 latest blog posts (2×2 grid) → CTASection → Footer.

- [ ] **Step 1: Build full home page**

Replace `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/ui/Hero.astro';
import AnnouncementBanner from '../components/ui/AnnouncementBanner.astro';
import VideoSection from '../components/ui/VideoSection.astro';
import BlogCard from '../components/ui/BlogCard.astro';
import CTASection from '../components/ui/CTASection.astro';
import { getCollection } from 'astro:content';
import siteSettings from '../content/settings/site.json';

const allPosts = await getCollection('blogi', ({ data }) => !data.draft);
const latestPosts = allPosts
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 4);
---
<BaseLayout title="Etusivu" description={siteSettings.heroBodyText}>
  <Hero
    title={siteSettings.heroText}
    imageSrc="/hero-carl.jpg"
    imageAlt="Carl Willandt"
    showKokoomusLogo={true}
    bodyText={siteSettings.heroBodyText}
    ctaLabel="Lue lisää"
    ctaHref="/carl"
  />

  {siteSettings.announcementBannerText && (
    <AnnouncementBanner
      text={siteSettings.announcementBannerText}
      linkLabel={siteSettings.announcementBannerLinkLabel}
      linkHref={siteSettings.announcementBannerLinkHref || undefined}
    />
  )}

  <VideoSection
    videoUrl={siteSettings.videoUrl || undefined}
    bodyHtml={siteSettings.videoBodyText}
  />

  <!-- Blog highlights -->
  {latestPosts.length > 0 && (
    <section class="py-16 bg-white">
      <div class="container-custom">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {latestPosts.map(post => (
            <BlogCard
              title={post.data.title}
              excerpt={post.data.excerpt}
              date={post.data.date}
              category={post.data.category}
              slug={post.slug}
            />
          ))}
        </div>
      </div>
    </section>
  )}

  <CTASection
    title="LÄHDE MUKAAN tukijoukkoihin!"
    bodyText="Voit osallistua kampanjaan monella tavalla — tule mukaan vapaaehtoiseksi, jaa viestiä tai tue kampanjaa."
    ctaLabel="Lähde mukaan"
    ctaHref="/vapaaehtoiseksi"
  />
</BaseLayout>
```

- [ ] **Step 2: Verify home page**

Open http://localhost:4321. Confirm:
- Hero with "SIVISTYSTÄ, realismia ja rohkeutta" title
- Video section with green play button (no URL set yet)
- Sample blog post card visible
- "LÄHDE MUKAAN" dark CTA section at bottom

- [ ] **Step 3: Run build**
```bash
npm run build && echo "BUILD OK"
```
Expected: `BUILD OK`

- [ ] **Step 4: Commit**
```bash
git add src/pages/index.astro
git commit -m "feat: build Etusivu (home page)"
```

---

### Task 11: Carl Page

**Files:**
- Create: `src/pages/carl.astro`

Figma reference: node `5927:4`. Hero → intro paragraph → accordion "Elämäni eri osa-alueet" with 6 sections.

- [ ] **Step 1: Create Carl page**

Create `src/pages/carl.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/ui/Hero.astro';
import Accordion from '../components/ui/Accordion.astro';
import type { AccordionItem } from '../components/ui/Accordion.astro';

const accordionItems: AccordionItem[] = [
  {
    id: 'juurista',
    title: 'Juurista',
    icon: '🏡',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
  {
    id: 'oppimisesta',
    title: 'Oppimisesta',
    icon: '📚',
    content: `<p>Koulupolkuni alkoi Kuokkolan kyläkoulussa, jota isäni ja vanhempani sisarukseinkin olivat käyneet.
      Ala-asteen jälkeen opintie jatkui Häkkarin ylästeen englanninkielisellä luokalla ja Lempäälän lukiossa,
      josta valmistuin ylioppilaaksi vuonna 2002.</p>
      <p>Vuonna 2005 aloitin opintoini Tampereen yliopistossa. Valmistuin vuonna 2013 filosofian maisteriksi.</p>`,
  },
  {
    id: 'kodista',
    title: 'Kodista',
    icon: '🏠',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
  {
    id: 'urheilusta',
    title: 'Urheilusta',
    icon: '⚽',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
  {
    id: 'metsastyksesta',
    title: 'Metsästyksestä',
    icon: '🌲',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
  {
    id: 'maanpuolustuksesta',
    title: 'Maanpuolustuksesta',
    icon: '🛡️',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
];
---
<BaseLayout
  title="Carl"
  description="Tutustu Carl Willandtiin — perheenisä, filosofian maisteri ja viestintäpäällikkö Hämeenkyröstä."
>
  <Hero
    title="CARL"
    imageSrc="/hero-carl.jpg"
    imageAlt="Carl Willandt"
  />

  <section class="py-12 bg-white">
    <div class="container-custom max-w-2xl">
      <p class="text-lg text-gray-700 leading-relaxed mb-10">
        Olen nelikymppinen perheenisä, filosofian maisteri ja viestintäpäällikkö Hämeenkyröstä,
        jonka arki on varsin tyypillistä ruuhkavuosielämää, jota ohjaavat työ, perhe, vastuu ja huoli
        tulevasta. Tällä sivulla pääset tutustumaan minuun tarkemmin.
      </p>

      <Accordion items={accordionItems} sectionTitle="Elämäni eri osa-alueet" />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify Carl page**

Open http://localhost:4321/carl. Confirm:
- Hero with "CARL" title
- Intro text visible
- Accordion with 6 items, only one opens at a time

- [ ] **Step 3: Commit**
```bash
git add src/pages/carl.astro
git commit -m "feat: build Carl page with bio and accordion"
```

---

### Task 12: Tavoitteeni Page

**Files:**
- Create: `src/pages/tavoitteeni.astro`

Figma reference: node `5941:13`. Hero → intro → accordion with political themes (icons visible in Figma).

- [ ] **Step 1: Create Tavoitteeni page**

Create `src/pages/tavoitteeni.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/ui/Hero.astro';
import Accordion from '../components/ui/Accordion.astro';
import type { AccordionItem } from '../components/ui/Accordion.astro';

const accordionItems: AccordionItem[] = [
  {
    id: 'sivistys',
    title: 'Sivistys on Suomen kivijalka',
    icon: '🎓',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
  {
    id: 'turvallisuus',
    title: 'Turvallisuus syntyy taloudesta ja puolustuskyvystä',
    icon: '🛡️',
    content: `<p>Turvallisuus on useista asioista, mutta ennen kaikkea se syntyy kestävästä taloudesta
      ja uskottavasta puolustuksesta. Reservin välipaloja ja metsästäjänä turvallisuus ei ole minulle
      ideologia, vaan velvollisuus.</p>
      <h4>Keinot</h4>
      <ul>
        <li>Velkaantuminen kuriin ja talous nousuun. Kokoomuksen johdolla kaikkien vastuullisten
        eduskuntapuolueiden kesken neuvoteltu velkajarru.</li>
        <li>Omavaraisuus ja huoltovarmuus kunniaan. Suomen tulee olla kiertotalouden ja uusiutuvan
        energian hyödyntämisen mallimaassa.</li>
        <li>Kansalaistaidot kuntoon. Suomen on puolustamisen arvoinen maa.</li>
      </ul>`,
  },
  {
    id: 'vapaus',
    title: 'Vapauta ei ole ilman vastuuta',
    icon: '⚖️',
    content: '<p>Sisältö päivitetään CMS:n kautta ennen julkaisua.</p>',
  },
];
---
<BaseLayout
  title="Tavoitteeni"
  description="Minulle kokoomuslaisuus tarkoittaa vastuullisuutta, sivistystä ja arvopohjaista realismia."
>
  <Hero
    title="TAVOITTEENI"
    imageSrc="/hero-carl.jpg"
    imageAlt="Carl Willandt"
  />

  <section class="py-12 bg-white">
    <div class="container-custom max-w-2xl">
      <p class="text-lg text-gray-700 leading-relaxed mb-10">
        Minulle kokoomuslaisuus tarkoittaa vastuullisuutta, sivistystä ja arvopohjaista realismia.
        Sivistys, turvallisuus ja vapaus ovat arvoja, joille pohjaan oman ajattelumaailmani ja
        yhteiskuntakäsitykseni, kuten myös politiikkani ja vaikuttajana. Tällä sivulla avaan hieman,
        mitä nämä arvot minulle konkreettisesti merkitsevät.
      </p>

      <Accordion items={accordionItems} />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Open http://localhost:4321/tavoitteeni — accordion with 3 political themes renders.

- [ ] **Step 3: Commit**
```bash
git add src/pages/tavoitteeni.astro
git commit -m "feat: build Tavoitteeni page with political themes accordion"
```

---

### Task 13: Blog Pages

**Files:**
- Create: `src/pages/blogi/index.astro`
- Create: `src/pages/blogi/[slug].astro`

Figma reference: node `5915:15` (article view). "← Takaisin blogiin" link, category badge, date, article content.

- [ ] **Step 1: Build blog listing page**

Create `src/pages/blogi/index.astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogCard from '../../components/ui/BlogCard.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('blogi', ({ data }) => !data.draft);
const posts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="Blogi / Ajankohtaista" description="Carlin kirjoituksia ja kannanottoja ajankohtaisiin aiheisiin.">
  <section class="bg-navy py-16">
    <div class="container-custom">
      <h1 class="text-6xl font-bold text-cream uppercase">BLOGI</h1>
      <p class="text-cream/60 mt-2 text-lg">Ajankohtaista</p>
    </div>
  </section>

  <section class="py-12 bg-white">
    <div class="container-custom">
      {posts.length === 0 ? (
        <p class="text-gray-500 text-center py-16 text-lg">
          Blogiin ei ole vielä julkaistu postauksia.
        </p>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogCard
              title={post.data.title}
              excerpt={post.data.excerpt}
              date={post.data.date}
              category={post.data.category}
              slug={post.slug}
            />
          ))}
        </div>
      )}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build blog article page**

Create `src/pages/blogi/[slug].astro`:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blogi');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

const formattedDate = post.data.date.toLocaleDateString('fi-FI', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});
---
<BaseLayout title={post.data.title} description={post.data.excerpt}>
  <!-- Article header -->
  <section class="bg-navy py-16">
    <div class="container-custom max-w-3xl">
      <a
        href="/blogi"
        class="inline-flex items-center gap-1 text-cream/50 hover:text-cream
               text-sm transition-colors mb-8"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Takaisin blogiin
      </a>
      <span class="inline-block bg-green-brand text-white text-xs font-bold
                   uppercase tracking-widest px-3 py-1 rounded mb-4">
        {post.data.category}
      </span>
      <h1 class="text-4xl md:text-5xl font-bold text-cream leading-tight mb-3">
        {post.data.title}
      </h1>
      <time class="text-cream/50 text-sm" datetime={post.data.date.toISOString()}>
        {formattedDate}
      </time>
    </div>
  </section>

  <!-- Article body -->
  <article class="py-12 bg-white">
    <div class="container-custom max-w-3xl prose prose-lg
                prose-headings:font-bold prose-a:text-green-brand
                prose-a:no-underline hover:prose-a:underline">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify both blog pages**

- http://localhost:4321/blogi — listing with sample post renders
- http://localhost:4321/blogi/ensimmainen-postaus — article with "← Takaisin blogiin" renders

- [ ] **Step 4: Commit**
```bash
git add src/pages/blogi/
git commit -m "feat: build blog listing and article pages"
```

---

### Task 14: Medialle, Vapaaehtoiseksi, Ota yhteyttä Pages

**Files:**
- Create: `src/pages/medialle.astro`
- Create: `src/pages/vapaaehtoiseksi.astro`
- Create: `src/pages/ota-yhteytta.astro`

- [ ] **Step 1: Build Medialle page**

Create `src/pages/medialle.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const pressReleases = await getCollection('medialle', ({ data }) => !data.draft);
const sorted = pressReleases.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout
  title="Medialle"
  description="Lehdistötiedotteet, kuvapankki ja toimittajien yhteystieto."
>
  <section class="bg-navy py-16">
    <div class="container-custom">
      <h1 class="text-6xl font-bold text-cream uppercase">MEDIALLE</h1>
    </div>
  </section>

  <section class="py-12 bg-white">
    <div class="container-custom max-w-3xl space-y-12">
      <!-- Press releases -->
      <div>
        <h2 class="text-2xl font-bold mb-6">Lehdistötiedotteet</h2>
        {sorted.length === 0 ? (
          <p class="text-gray-500">Tiedotteita ei vielä saatavilla — lisätään ennen sivuston julkaisua.</p>
        ) : (
          <ul class="space-y-4">
            {sorted.map(item => (
              <li class="border border-gray-200 rounded-lg p-5 hover:border-green-brand transition-colors">
                <p class="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                  {item.data.date.toLocaleDateString('fi-FI')}
                </p>
                <h3 class="font-bold text-gray-900">{item.data.title}</h3>
                <p class="text-gray-600 text-sm mt-1">{item.data.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <!-- Photo bank -->
      <div class="border-t pt-10">
        <h2 class="text-2xl font-bold mb-4">Kuvapankki</h2>
        <p class="text-gray-600">
          Ladattavat kuvat lisätään ennen sivuston julkaisua.
        </p>
      </div>

      <!-- Media contact -->
      <div class="border-t pt-10">
        <h2 class="text-2xl font-bold mb-4">Toimittajille</h2>
        <p class="text-gray-700">
          Mediayhteydenotot:{' '}
          <a href="mailto:carl@willandt.fi" class="text-green-brand hover:underline font-semibold">
            carl@willandt.fi
          </a>
        </p>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Build Vapaaehtoiseksi page**

Create `src/pages/vapaaehtoiseksi.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContactForm from '../components/ui/ContactForm.astro';

const fields = [
  {
    name: 'name',
    label: 'Nimi',
    type: 'text' as const,
    required: true,
    placeholder: 'Etunimi Sukunimi',
  },
  {
    name: 'email',
    label: 'Sähköposti',
    type: 'email' as const,
    required: true,
    placeholder: 'sinä@esimerkki.fi',
  },
  {
    name: 'phone',
    label: 'Puhelinnumero',
    type: 'tel' as const,
    required: false,
    placeholder: '+358 40 123 4567',
  },
  {
    name: 'message',
    label: 'Osaaminen ja kiinnostuksen kohteet',
    type: 'textarea' as const,
    required: false,
    placeholder: 'Kerro lyhyesti, miten haluaisit osallistua kampanjaan...',
  },
];
---
<BaseLayout
  title="Vapaaehtoiseksi"
  description="Liity Carlin tukijoukkoihin — tule mukaan vapaaehtoiseksi!"
>
  <section class="bg-navy py-16">
    <div class="container-custom">
      <h1 class="text-6xl font-bold text-cream uppercase">TUKIJOUKKOIHIN</h1>
      <p class="text-cream/60 mt-2 text-xl">Vapaaehtoiseksi</p>
    </div>
  </section>

  <section class="py-12 bg-white">
    <div class="container-custom max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <!-- Info text -->
        <div class="prose prose-lg">
          <h2>Miksi liittyä tukijoukkoihin?</h2>
          <p>
            Kampanjan menestys rakentuu ihmisten aktiivisuudesta. Voit osallistua monella tavalla:
            jakamalla viestiä somessa, osallistumalla vaalitilaisuuksiin tai auttamalla
            käytännön järjestelyissä.
          </p>
          <p>
            Täytä alla oleva lomake ja otamme sinuun yhteyttä sopivasta tavasta osallistua!
          </p>
        </div>

        <!-- Form -->
        <div>
          <ContactForm
            formName="vapaaehtoiseksi"
            fields={fields}
            submitLabel="Ilmoittaudu mukaan"
          />
        </div>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build Ota yhteyttä page**

Create `src/pages/ota-yhteytta.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContactForm from '../components/ui/ContactForm.astro';

const fields = [
  {
    name: 'name',
    label: 'Nimi',
    type: 'text' as const,
    required: true,
    placeholder: 'Etunimi Sukunimi',
  },
  {
    name: 'email',
    label: 'Sähköposti',
    type: 'email' as const,
    required: true,
    placeholder: 'sinä@esimerkki.fi',
  },
  {
    name: 'message',
    label: 'Viesti',
    type: 'textarea' as const,
    required: true,
    placeholder: 'Kirjoita viestisi tähän...',
  },
];
---
<BaseLayout title="Ota yhteyttä" description="Ota yhteyttä Carl Willandtiin.">
  <section class="bg-navy py-16">
    <div class="container-custom">
      <h1 class="text-6xl font-bold text-cream uppercase">OTA YHTEYTTÄ</h1>
    </div>
  </section>

  <section class="py-12 bg-white">
    <div class="container-custom max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <!-- Contact info -->
        <div>
          <h2 class="text-2xl font-bold mb-4">Yhteystiedot</h2>
          <p class="text-gray-700 mb-6">
            <a href="mailto:carl@willandt.fi"
               class="text-green-brand hover:underline font-semibold text-lg">
              carl@willandt.fi
            </a>
          </p>
          <div class="flex gap-4">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer"
               aria-label="X / Twitter" class="text-gray-400 hover:text-navy transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer"
               aria-label="Instagram" class="text-gray-400 hover:text-navy transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer"
               aria-label="Facebook" class="text-gray-400 hover:text-navy transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Form -->
        <div>
          <ContactForm
            formName="ota-yhteytta"
            fields={fields}
            submitLabel="Lähetä viesti"
          />
        </div>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Verify all three new pages**

- http://localhost:4321/medialle — press page with empty states
- http://localhost:4321/vapaaehtoiseksi — 2-column layout with form
- http://localhost:4321/ota-yhteytta — contact info + form

- [ ] **Step 5: Run full build**
```bash
npm run build && echo "ALL PAGES OK"
```
Expected: `ALL PAGES OK` — all 9 routes generated without errors.

- [ ] **Step 6: Commit**
```bash
git add src/pages/medialle.astro src/pages/vapaaehtoiseksi.astro src/pages/ota-yhteytta.astro
git commit -m "feat: build Medialle, Vapaaehtoiseksi, and Ota yhteyttä pages"
```

---

### Task 15: Decap CMS Setup

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`

- [ ] **Step 1: Create admin HTML**

Create `public/admin/index.html`:
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Carl Willandt — Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create CMS config**

Create `public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: GITHUB_USERNAME/Carl-Willandt
  branch: main

media_folder: public/uploads
public_folder: /uploads

collections:
  - name: blogi
    label: "Blogi"
    label_singular: "Blogipostaus"
    folder: src/content/blogi
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Otsikko", name: title, widget: string }
      - { label: "Päivämäärä", name: date, widget: datetime }
      - { label: "Kategoria", name: category, widget: string,
          hint: "Vapaa teksti, esim. 'Talous & kasvu', 'Turvallisuus', 'Koulutus'" }
      - { label: "Tiivistelmä", name: excerpt, widget: text,
          hint: "Lyhyt kuvaus, näkyy blogikorteissa ja hakukoneille" }
      - { label: "Luonnos (ei julkinen)", name: draft, widget: boolean, default: false }
      - { label: "Sisältö", name: body, widget: markdown }

  - name: medialle
    label: "Medialle"
    label_singular: "Lehdistötiedote"
    folder: src/content/medialle
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Otsikko", name: title, widget: string }
      - { label: "Päivämäärä", name: date, widget: datetime }
      - { label: "Tiivistelmä", name: excerpt, widget: text }
      - { label: "Luonnos", name: draft, widget: boolean, default: false }
      - { label: "Sisältö", name: body, widget: markdown }

  - name: asetukset
    label: "Sivuston asetukset"
    files:
      - label: "Etusivu"
        name: etusivu
        file: src/content/settings/site.json
        fields:
          - { label: "Hero-otsikko", name: heroText, widget: string }
          - { label: "Hero-leipäteksti", name: heroBodyText, widget: text }
          - { label: "Ilmoitusbannerin teksti (tyhjä = piilotettu)",
              name: announcementBannerText, widget: string, required: false }
          - { label: "Banneri: linkki-teksti", name: announcementBannerLinkLabel,
              widget: string, required: false }
          - { label: "Banneri: linkki-URL", name: announcementBannerLinkHref,
              widget: string, required: false }
          - { label: "Video-URL (YouTube embed, esim. https://www.youtube.com/embed/xyz)",
              name: videoUrl, widget: string, required: false }
          - { label: "Video-osion teksti (HTML)", name: videoBodyText,
              widget: markdown, required: false }
          - { label: "X / Twitter -profiili URL", name: socialX, widget: string }
          - { label: "Instagram-profiili URL", name: socialInstagram, widget: string }
          - { label: "Facebook-profiili URL", name: socialFacebook, widget: string }
```

- [ ] **Step 3: Replace GITHUB_USERNAME placeholder**

Open `public/admin/config.yml`, replace `GITHUB_USERNAME/Carl-Willandt` with the actual GitHub repository path (e.g., `samuliraappana/Carl-Willandt`).

- [ ] **Step 4: Commit**
```bash
git add public/admin/
git commit -m "feat: add Decap CMS admin UI and config"
```

---

### Task 16: Netlify Configuration and Deploy

**Files:**
- Create: `netlify.toml`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update astro.config.mjs with site URL**

Replace `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://willandt.fi',
  integrations: [tailwind(), mdx(), sitemap()],
});
```

- [ ] **Step 2: Create netlify.toml**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```

- [ ] **Step 3: Final build check**
```bash
npm run build && echo "BUILD READY FOR DEPLOY"
```
Expected: `BUILD READY FOR DEPLOY`

- [ ] **Step 4: Push to GitHub**
```bash
git add netlify.toml astro.config.mjs
git commit -m "feat: add Netlify configuration and set production site URL"
git push origin main
```

- [ ] **Step 5: Deploy on Netlify**

1. Go to https://app.netlify.com → "Add new site" → "Import an existing project" → GitHub
2. Select repository `Carl-Willandt`
3. Build settings are auto-detected from `netlify.toml`
4. Click **"Deploy site"**
5. Wait for deploy to complete (2-3 minutes)
6. Note the temporary Netlify URL (e.g., `amazing-widget-123.netlify.app`)

- [ ] **Step 6: Configure Netlify Identity for Decap CMS**

In Netlify dashboard for the site:
1. **Site configuration → Identity** → "Enable Identity"
2. **Identity → Registration** → set to "Invite only"
3. **Identity → Services → Git Gateway** → Enable Git Gateway
4. **Identity → Users** → "Invite users" → enter `carl@willandt.fi`

Carl will receive an email to set a password. He can then log in at `yoursite.netlify.app/admin`.

- [ ] **Step 7: Configure Netlify Forms notifications**

In Netlify dashboard:
1. **Forms** tab → verify `vapaaehtoiseksi` and `ota-yhteytta` forms appear after first deploy
2. Click on a form → **"Form notifications"** → "Add notification" → Email notification
3. Set recipient: `carl@willandt.fi`
4. Repeat for both forms

- [ ] **Step 8: Connect custom domain**

In Netlify dashboard:
1. **Domain management** → "Add custom domain" → enter `willandt.fi`
2. Follow DNS instructions: add CNAME record or Netlify nameservers at domain registrar
3. Enable HTTPS (automatic via Let's Encrypt — wait ~1 minute after DNS propagates)

- [ ] **Step 9: Smoke test production**

Open https://willandt.fi and verify:
- [ ] Home page loads with hero, blog card, CTA section
- [ ] Header navigation works (all 6 links + Tukijoukot button)
- [ ] Mobile hamburger menu toggles
- [ ] /carl — accordion opens/closes, only one at a time
- [ ] /tavoitteeni — accordion works
- [ ] /blogi — lists sample post
- [ ] /blogi/ensimmainen-postaus — article renders with back link
- [ ] /medialle — renders without errors
- [ ] /vapaaehtoiseksi — form submits (test with real data, check Netlify Forms dashboard)
- [ ] /ota-yhteytta — form submits (test, check Netlify Forms dashboard)
- [ ] Footer social links and email link work

---

### Task 17: Pre-Launch Polish

- [ ] **Step 1: Verify colors against Figma brand guidelines**

Open Figma node `5873:5` (Värit section). Compare rendered site colors against Figma.
Update `tailwind.config.mjs` color values as needed:
```js
colors: {
  navy: {
    DEFAULT: '#ACTUAL_HEX',  // from Figma dark background
    light: '#ACTUAL_HEX',    // from Figma slightly lighter navy
  },
  'green-brand': '#ACTUAL_HEX',  // from Figma CTA button green
  'green-banner': '#ACTUAL_HEX', // from Figma announcement banner
  cream: '#ACTUAL_HEX',          // from Figma text/logo color (F5F3F0 per SVG)
  'cta-dark': '#ACTUAL_HEX',     // from Figma "LÄHDE MUKAAN" section background
}
```
Commit if changed:
```bash
git add tailwind.config.mjs
git commit -m "fix: correct brand colors from Figma verification"
git push
```

- [ ] **Step 2: Verify and update typography**

In Figma node `5873:5` (Typografia section), identify the exact font names.
If different from DM Sans / Lora:
1. Update Google Fonts import URL in `src/styles/global.css`
2. Update `fontFamily` in `tailwind.config.mjs`
3. Commit and push

- [ ] **Step 3: Replace hero photo with Carl's professional photo**

When Carl's photo is available:
```bash
cp /path/to/carls-professional-photo.jpg public/hero-carl.jpg
git add public/hero-carl.jpg
git commit -m "content: replace placeholder with Carl's professional photo"
git push
```

- [ ] **Step 4: Update social media profile URLs**

Update in three files with Carl's actual profile URLs:
- `src/components/layout/Footer.astro` (3 social links)
- `src/pages/ota-yhteytta.astro` (3 social links)
- `src/content/settings/site.json` (`socialX`, `socialInstagram`, `socialFacebook`)

```bash
git add src/components/layout/Footer.astro src/pages/ota-yhteytta.astro src/content/settings/site.json
git commit -m "content: add Carl's social media profile URLs"
git push
```

- [ ] **Step 5: Fill accordion content via CMS**

Log in to `willandt.fi/admin` and fill in:
- Carl page: all 6 accordion sections (Juurista, Oppimisesta, Kodista, Urheilusta, Metsästyksestä, Maanpuolustuksesta)
- Tavoitteeni page: all 3 political themes (Sivistys, Turvallisuus, Vapaus)

Note: Accordion content is currently hardcoded in the page files. If Carl wants to edit this via CMS long-term, consider moving accordion items to the settings collection in a future iteration.

- [ ] **Step 6: Run Lighthouse audit**

```bash
npx lighthouse https://willandt.fi --output html --output-path lighthouse-report.html
open lighthouse-report.html
```

Target scores: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90, Best Practices ≥ 90.
Fix any critical issues before launch.

- [ ] **Step 7: Site is live — announce launch**

Confirm with stakeholders that:
- Domain resolves correctly
- Forms deliver email to `carl@willandt.fi`
- Carl can log in to `/admin` and create a blog post
- Mobile layout tested on real device
