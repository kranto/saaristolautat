import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = resolve(projectRoot, '../saaristodata/data.json');
const publicRoot = resolve(projectRoot, 'public');
const siteUrl = 'https://saaristolautat.fi';

const pages = {
  fi: {
    path: '/fi/lauttareitit/',
    file: 'fi/lauttareitit/index.html',
    locale: 'fi_FI',
    title: 'Saariston lauttareitit, laiturit ja alukset',
    description: 'Turun saariston, Ahvenanmaan ja lähialueiden lauttareitit, laiturit ja alukset tekstimuodossa.',
    intro: 'Tältä sivulta löydät Saaristolautat.fi-palvelun kartalla näkyvät reitit, laiturit ja alukset tekstimuodossa. Aikataulut ja yhteystiedot avautuvat interaktiiviselta kartalta.',
    openMap: 'Avaa lauttakartta',
    routes: 'Lauttareitit',
    landings: 'Laiturit',
    vessels: 'Alukset',
    noVessels: 'Alustietoa ei ole merkitty.',
    notice: 'Saaristolautat.fi on epävirallinen matkan suunnittelun apuväline. Tarkista reitit ja aikataulut aina liikennöitsijältä.',
    languages: 'Kielet',
    updated: 'Reittiluettelo on luotu palvelun nykyisestä reittidatasta.',
  },
  sv: {
    path: '/sv/farjerutter/',
    file: 'sv/farjerutter/index.html',
    locale: 'sv_SE',
    title: 'Skärgårdens färjerutter, bryggor och fartyg',
    description: 'Färjerutter, bryggor och fartyg i Åbolands skärgård, på Åland och i närliggande områden i textformat.',
    intro: 'Här finns rutter, bryggor och fartyg som visas på kartan i Saaristolautat.fi i textformat. Tidtabeller och kontaktuppgifter finns på den interaktiva kartan.',
    openMap: 'Öppna färjekartan',
    routes: 'Färjerutter',
    landings: 'Bryggor',
    vessels: 'Fartyg',
    noVessels: 'Ingen fartygsinformation har angetts.',
    notice: 'Saaristolautat.fi är ett inofficiellt hjälpmedel för reseplanering. Kontrollera alltid rutter och tidtabeller hos trafikoperatören.',
    languages: 'Språk',
    updated: 'Ruttförteckningen har skapats från tjänstens aktuella ruttdata.',
  },
  en: {
    path: '/en/ferry-routes/',
    file: 'en/ferry-routes/index.html',
    locale: 'en_GB',
    title: 'Archipelago ferry routes, landings and vessels',
    description: 'Ferry routes, landings and vessels in the Turku archipelago, Åland and nearby areas in an accessible text format.',
    intro: 'This page lists the routes, ferry landings and vessels shown on the Saaristolautat.fi map. Timetables and contact details are available on the interactive map.',
    openMap: 'Open the ferry map',
    routes: 'Ferry routes',
    landings: 'Landings',
    vessels: 'Vessels',
    noVessels: 'No vessel information is listed.',
    notice: 'Saaristolautat.fi is an unofficial trip-planning aid. Always confirm routes and timetables with the operator.',
    languages: 'Languages',
    updated: 'The route list is generated from the service’s current route data.',
  },
};

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const localized = (object, property, lang) =>
  object?.[`${property}_${lang}`] || object?.[property] || '';

function bilingualName(object) {
  if (!object) return '';
  const defaultName = object.name || '';
  const finnish = object.name_fi || (object.name_sv ? defaultName : '') || defaultName;
  const swedish = object.name_sv || (object.name_fi ? defaultName : '') || defaultName;
  return [...new Set([finnish, swedish].filter(Boolean))].join(' / ');
}

function bilingualPlace(pier) {
  const place = bilingualName(pier);
  const municipality = bilingualName(pier?.mun);
  return municipality && municipality !== place ? `${place} (${municipality})` : place;
}

function routeCards(routes, lang, text) {
  return Object.entries(routes).map(([id, route]) => {
    const name = localized(route, 'name', lang);
    const piers = (route.piers || []).map(bilingualPlace).filter(Boolean);
    const vessels = (route.vessels || []).map(vessel => localized(vessel, 'name', lang)).filter(Boolean);
    return `
      <article class="route" id="${escapeHtml(id)}">
        <h2>${escapeHtml(name)}</h2>
        <dl>
          <div><dt>${text.landings}</dt><dd>${escapeHtml(piers.join(' – '))}</dd></div>
          <div><dt>${text.vessels}</dt><dd>${escapeHtml(vessels.join(', ') || text.noVessels)}</dd></div>
        </dl>
        <a class="map-link" href="/#${encodeURIComponent(id)}">${text.openMap}: ${escapeHtml(name)}</a>
      </article>`;
  }).join('');
}

function languageLinks(currentLang) {
  const labels = { fi: 'Suomi', sv: 'Svenska', en: 'English' };
  return Object.entries(pages).map(([lang, page]) =>
    `<a href="${page.path}" hreflang="${lang}" lang="${lang}"${lang === currentLang ? ' aria-current="page"' : ''}>${labels[lang]}</a>`
  ).join('\n          ');
}

function structuredData(routes, lang, page) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title,
    numberOfItems: Object.keys(routes).length,
    inLanguage: lang,
    itemListElement: Object.entries(routes).map(([id, route], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: localized(route, 'name', lang),
      url: `${siteUrl}${page.path}#${encodeURIComponent(id)}`,
    })),
  }).replaceAll('<', '\\u003c');
}

function renderPage(routes, lang, page) {
  const canonical = `${siteUrl}${page.path}`;
  const cards = routeCards(routes, lang, page);
  const alternates = Object.entries(pages).map(([alternateLang, alternate]) =>
    `    <link rel="alternate" hreflang="${alternateLang}" href="${siteUrl}${alternate.path}" />`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)} | Saaristolautat.fi</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="${page.locale}" />
    <meta property="og:image" content="${siteUrl}/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/seo.css" />
    <script type="application/ld+json">${structuredData(routes, lang, page)}</script>
  </head>
  <body>
    <header>
      <a class="brand" href="/">Saaristolautat.fi</a>
      <nav aria-label="${page.languages}">
        ${languageLinks(lang)}
      </nav>
    </header>
    <main>
      <div class="intro">
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.intro)}</p>
        <p><a class="primary" href="/">${page.openMap}</a></p>
        <p class="notice">${escapeHtml(page.notice)}</p>
      </div>
      <section aria-labelledby="routes-heading">
        <h2 class="section-title" id="routes-heading">${page.routes}</h2>${cards}
      </section>
    </main>
    <footer>
      <p>${escapeHtml(page.updated)}</p>
      <p>Saaristolautat.fi © Kyösti Ranto 2018–2026</p>
    </footer>
  </body>
</html>
`;
}

const data = JSON.parse(await readFile(dataPath, 'utf8'));
for (const [lang, page] of Object.entries(pages)) {
  const outputPath = resolve(publicRoot, page.file);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderPage(data.routes, lang, page));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['/', ...Object.values(pages).map(page => page.path)].map(path => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
await writeFile(resolve(publicRoot, 'sitemap.xml'), sitemap);

console.log(`Generated ${Object.keys(pages).length} SEO pages and sitemap from ${dataPath}`);
