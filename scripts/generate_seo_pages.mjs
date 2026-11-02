import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = resolve(projectRoot, '../saaristodata/data.json');
const mapDataPath = resolve(projectRoot, '../saaristodata/saaristo.json');
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
    areas: 'Kunnat ja alueet',
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
    areas: 'Kommuner och områden',
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
    areas: 'Municipalities and areas',
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

const readJson = async path => JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));

const localized = (object, property, lang) =>
  object?.[`${property}_${lang}`] || object?.[property] || '';

const compactSlashes = value => String(value || '').replace(/\s*\/\s*/g, '/');

function orderedDomesticNames(finnish, swedish, defaultName, lang) {
  const names = lang === 'fi'
    ? [finnish, swedish]
    : lang === 'sv'
      ? [swedish, finnish]
      : [defaultName, finnish, swedish];
  return [...new Set(names.filter(Boolean))];
}

function bilingualName(object, lang) {
  if (!object) return '';
  const defaultName = object.name || '';
  const finnish = object.name_fi || (object.name_sv ? defaultName : '') || defaultName;
  const swedish = object.name_sv || (object.name_fi ? defaultName : '') || defaultName;
  return orderedDomesticNames(finnish, swedish, defaultName, lang).join('/');
}

function bilingualPlace(pier, lang) {
  return bilingualName(pier, lang);
}

const roadFerrySubtypes = new Set(['conn2', 'conn2m', 'cableferry']);

function routeTitle(route, lang, routeMetadata) {
  const localizedTitle = compactSlashes(localized(route, 'name', lang));
  if (!roadFerrySubtypes.has(routeMetadata?.ssubtype)) return localizedTitle;

  const finnishParts = (route.name_fi || route.name || '').split(/\s+-\s+/);
  const swedishParts = (route.name_sv || route.name || '').split(/\s+-\s+/);
  const defaultParts = (route.name || '').split(/\s+-\s+/);
  if (finnishParts.length !== 2 || swedishParts.length !== 2 || defaultParts.length !== 2) return localizedTitle;

  return finnishParts.map((part, index) =>
    orderedDomesticNames(part, swedishParts[index], defaultParts[index], lang).join('/')
  ).join(' – ');
}

function routeCards(routes, lang, text, routeMetadata) {
  return Object.entries(routes).map(([id, route]) => {
    const name = routeTitle(route, lang, routeMetadata.get(id));
    const piers = (route.piers || []).map(pier => bilingualPlace(pier, lang)).filter(Boolean);
    const areas = [...new Set((route.piers || []).map(pier => bilingualName(pier.mun, lang)).filter(Boolean))];
    const vessels = (route.vessels || []).map(vessel => localized(vessel, 'name', lang)).filter(Boolean);
    return `
      <article class="route" id="${escapeHtml(id)}">
        <h2>${escapeHtml(name)}</h2>
        <dl>
          <div><dt>${text.landings}</dt><dd>${escapeHtml(piers.join(' – '))}</dd></div>
          <div><dt>${text.areas}</dt><dd>${escapeHtml(areas.join(', '))}</dd></div>
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

function structuredData(routes, lang, page, routeMetadata) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title,
    numberOfItems: Object.keys(routes).length,
    inLanguage: lang,
    itemListElement: Object.entries(routes).map(([id, route], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: routeTitle(route, lang, routeMetadata.get(id)),
      url: `${siteUrl}${page.path}#${encodeURIComponent(id)}`,
    })),
  }).replaceAll('<', '\\u003c');
}

function renderPage(routes, lang, page, routeMetadata) {
  const canonical = `${siteUrl}${page.path}`;
  const cards = routeCards(routes, lang, page, routeMetadata);
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
    <script type="application/ld+json">${structuredData(routes, lang, page, routeMetadata)}</script>
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

const data = await readJson(dataPath);
const mapData = await readJson(mapDataPath);
const obsoleteRouteIds = new Set();
const routeMetadata = new Map();
(function collectObsoleteRoutes(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(collectObsoleteRoutes);
    return;
  }
  if (node.properties?.stype === 'connection_obsolete' && node.properties.ref) {
    obsoleteRouteIds.add(node.properties.ref);
  }
  if (node.properties?.stype?.startsWith('connection') && node.properties.ref) {
    routeMetadata.set(node.properties.ref, node.properties);
  }
  if (Array.isArray(node.features)) node.features.forEach(collectObsoleteRoutes);
})(mapData);

const routes = Object.fromEntries(
  Object.entries(data.routes).filter(([id, route]) => !route.obsolete && !obsoleteRouteIds.has(id))
);
for (const [lang, page] of Object.entries(pages)) {
  const outputPath = resolve(publicRoot, page.file);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderPage(routes, lang, page, routeMetadata));
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

console.log(`Generated ${Object.keys(pages).length} SEO pages with ${Object.keys(routes).length} current routes from ${dataPath}`);
