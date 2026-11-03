import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import messages from '../src/data/messages.js';

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
    openRoute: 'Avaa reitin tiedot',
    openOfficialTimetable: 'Avaa virallinen aikataulu',
    routes: 'Lauttareitit',
    routePage: 'lauttareitti',
    routeDetails: 'Reitin tiedot',
    serviceDetails: 'Liikennöinti',
    vesselDetails: 'Alusten tiedot',
    notes: 'Huomautukset',
    contactInfo: 'Yhteystiedot',
    specifier: 'Reitin tarkenne',
    backToRoutes: 'Kaikki lauttareitit',
    landings: 'Laiturit',
    areas: 'Kunnat ja alueet',
    vessels: 'Alukset',
    operators: 'Liikennöitsijät',
    officialTimetables: 'Viralliset aikataulut',
    bikes: 'Polkupyörät',
    cars: 'Autot',
    persons: 'Matkustajat',
    cafe: 'Kahvila',
    accessible: 'Esteetön',
    noVessels: 'Alustietoa ei ole merkitty.',
    notice: 'Saaristolautat.fi on epävirallinen matkan suunnittelun apuväline. Tarkista reitit ja aikataulut aina liikennöitsijältä.',
    languages: 'Kielet',
    updated: 'Reittitiedot on luotu palvelun nykyisestä reittidatasta.',
    detailIntro: (name, endpoints) => `${name} on saariston lauttareitti välillä ${endpoints}. Tältä sivulta löydät reitin laiturit, alueet, alukset sekä linkit kartalle ja virallisiin aikatauluihin.`,
    detailDescription: (name, endpoints) => `${name}: ${endpoints}. Katso laiturit, alukset ja linkit virallisiin aikatauluihin Saaristolautat.fi-palvelussa.`,
  },
  sv: {
    path: '/sv/farjerutter/',
    file: 'sv/farjerutter/index.html',
    locale: 'sv_SE',
    title: 'Skärgårdens färjerutter, bryggor och fartyg',
    description: 'Färjerutter, bryggor och fartyg i Åbolands skärgård, på Åland och i närliggande områden i textformat.',
    intro: 'Här finns rutter, bryggor och fartyg som visas på kartan i Saaristolautat.fi i textformat. Tidtabeller och kontaktuppgifter finns på den interaktiva kartan.',
    openMap: 'Öppna färjekartan',
    openRoute: 'Öppna ruttinformationen',
    openOfficialTimetable: 'Öppna den officiella tidtabellen',
    routes: 'Färjerutter',
    routePage: 'färjerutt',
    routeDetails: 'Ruttinformation',
    serviceDetails: 'Trafikering',
    vesselDetails: 'Fartygsinformation',
    notes: 'Anmärkningar',
    contactInfo: 'Kontaktuppgifter',
    specifier: 'Ruttspecifikation',
    backToRoutes: 'Alla färjerutter',
    landings: 'Bryggor',
    areas: 'Kommuner och områden',
    vessels: 'Fartyg',
    operators: 'Trafikoperatörer',
    officialTimetables: 'Officiella tidtabeller',
    bikes: 'Cyklar',
    cars: 'Bilar',
    persons: 'Passagerare',
    cafe: 'Café',
    accessible: 'Tillgänglig',
    noVessels: 'Ingen fartygsinformation har angetts.',
    notice: 'Saaristolautat.fi är ett inofficiellt hjälpmedel för reseplanering. Kontrollera alltid rutter och tidtabeller hos trafikoperatören.',
    languages: 'Språk',
    updated: 'Ruttinformationen har skapats från tjänstens aktuella ruttdata.',
    detailIntro: (name, endpoints) => `${name} är en färjerutt i skärgården mellan ${endpoints}. Här finns ruttens bryggor, områden, fartyg samt länkar till kartan och officiella tidtabeller.`,
    detailDescription: (name, endpoints) => `${name}: ${endpoints}. Se bryggor, fartyg och länkar till officiella tidtabeller på Saaristolautat.fi.`,
  },
  en: {
    path: '/en/ferry-routes/',
    file: 'en/ferry-routes/index.html',
    locale: 'en_GB',
    title: 'Archipelago ferry routes, landings and vessels',
    description: 'Ferry routes, landings and vessels in the Turku archipelago, Åland and nearby areas in an accessible text format.',
    intro: 'This page lists the routes, ferry landings and vessels shown on the Saaristolautat.fi map. Timetables and contact details are available on the interactive map.',
    openMap: 'Open the ferry map',
    openRoute: 'Open route details',
    openOfficialTimetable: 'Open the official timetable',
    routes: 'Ferry routes',
    routePage: 'ferry route',
    routeDetails: 'Route details',
    serviceDetails: 'Service information',
    vesselDetails: 'Vessel information',
    notes: 'Notes',
    contactInfo: 'Contact information',
    specifier: 'Route details',
    backToRoutes: 'All ferry routes',
    landings: 'Landings',
    areas: 'Municipalities and areas',
    vessels: 'Vessels',
    operators: 'Operators',
    officialTimetables: 'Official timetables',
    bikes: 'Bicycles',
    cars: 'Cars',
    persons: 'Passengers',
    cafe: 'Café',
    accessible: 'Accessible',
    noVessels: 'No vessel information is listed.',
    notice: 'Saaristolautat.fi is an unofficial trip-planning aid. Always confirm routes and timetables with the operator.',
    languages: 'Languages',
    updated: 'The route information is generated from the service’s current route data.',
    detailIntro: (name, endpoints) => `${name} is an archipelago ferry route between ${endpoints}. This page lists its landings, areas and vessels, with links to the map and official timetables.`,
    detailDescription: (name, endpoints) => `${name}: ${endpoints}. See the landings, vessels and links to official timetables on Saaristolautat.fi.`,
  },
};

const languageLabels = { fi: 'Suomi', sv: 'Svenska', en: 'English' };

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const readJson = async path => JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));

function deepGet(object, path) {
  return path.reduce((value, part) => value?.[part], object);
}

function translateMessage(args, lang) {
  if (args === '' || args === null || args === undefined) return '';
  const parts = Array.isArray(args) ? args : [args];
  let message = deepGet(messages[lang], String(parts[0]).split('.'));
  if (typeof message !== 'string') return '';
  for (let index = 0; index < 5; index += 1) {
    message = message.replace(`{${index}}`, index < parts.length - 1 ? parts[index + 1] : '');
  }
  return message.trim();
}

const localized = (object, property, lang) => object?.[`${property}_L`]
  ? translateMessage(object[`${property}_L`], lang)
  : object?.[`${property}_${lang}`] || object?.[property] || '';
const compactSlashes = value => String(value || '').replace(/\s*\/\s*/g, '/');
const typographicRouteDash = value => String(value || '').replace(/\s+-\s+/g, ' – ');

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

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createRouteEntries(routes) {
  const entries = Object.entries(routes).map(([id, route]) => ({ id, route, paths: {} }));

  for (const [lang, page] of Object.entries(pages)) {
    const baseSlugs = entries.map(({ id, route }) => slugify(localized(route, 'name', lang)) || slugify(id));
    const counts = new Map();
    baseSlugs.forEach(slug => counts.set(slug, (counts.get(slug) || 0) + 1));
    const used = new Set();

    entries.forEach((entry, index) => {
      const base = baseSlugs[index];
      const piers = entry.route.piers || [];
      const endpointSlug = slugify([
        bilingualName(piers[0], lang),
        bilingualName(piers.at(-1), lang),
      ].filter(Boolean).join('-'));
      let slug = counts.get(base) > 1 && endpointSlug ? `${base}-${endpointSlug}` : base;
      if (used.has(slug)) slug = `${slug}-${slugify(entry.id)}`;
      used.add(slug);
      entry.paths[lang] = `${page.path}${slug}/`;
    });
  }

  return entries;
}

const routeFeatureOrder = ['interval', 'duration', 'order', 'booking', 'cost', 'seasonal', 'limit', 'seealso'];

function vesselInfo(vessel, lang) {
  const capacity = vessel.capacity || {};
  const features = vessel.features || {};
  return {
    name: localized(vessel, 'name', lang),
    capacity: {
      bikes: capacity.bikes,
      cars: capacity.cars,
      persons: capacity.persons,
    },
    cafe: Boolean(features.cafe),
    accessible: Boolean(features.access),
  };
}

function contactItems(contact, lang) {
  if (!contact) return [];
  const phones = [contact.phones || []].flat().map(phone => {
    const number = typeof phone === 'object' ? phone.tel : phone;
    if (!number) return null;
    const specifier = typeof phone === 'object' ? localized(phone, 'name', lang) : '';
    return {
      href: `tel:${String(number).replace(/\(.*\)/g, '').replace(/[ -]/g, '')}`,
      text: String(number).replace(/\(.*\)/g, '').replace(/-/g, ' '),
      specifier,
    };
  }).filter(Boolean);
  const email = contact.email
    ? [{ href: `mailto:${contact.email}`, text: contact.email, specifier: '' }]
    : [];
  const websites = [contact.www || []].flat().map(website => {
    const href = typeof website === 'object' ? localized(website, 'uri', lang) : website;
    if (typeof href !== 'string') return null;
    return {
      href,
      text: href.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      specifier: typeof website === 'object' ? localized(website, 'name', lang) : '',
    };
  }).filter(Boolean);
  const facebook = contact.fb
    ? [{
        href: typeof contact.fb === 'object' ? contact.fb.uri : contact.fb,
        text: typeof contact.fb === 'object' ? contact.fb.name || 'Facebook' : 'Facebook',
        specifier: '',
      }]
    : [];
  return [...phones, ...email, ...websites, ...facebook];
}

function contactGroups(route, lang) {
  const vessels = (route.vessels || []).map(vessel => ({
    name: localized(vessel, 'name', lang),
    items: contactItems(vessel.contact, lang),
  }));
  const operators = (route.operator || []).map(operator => ({
    name: localized(operator, 'name', lang),
    items: contactItems(operator.contact, lang),
  }));
  return [...vessels, ...operators].filter(group => group.items.length);
}

function operatorInfo(operator, lang) {
  const websites = [operator.contact?.www || []].flat();
  const homepage = websites.map(website =>
    typeof website === 'object' ? localized(website, 'uri', lang) : website
  ).find(uri => typeof uri === 'string');
  return {
    name: localized(operator, 'name', lang),
    homepage: homepage || '',
  };
}

function routeInfo(entry, lang, routeMetadata) {
  const { id, route } = entry;
  const piers = (route.piers || []).map(pier => bilingualName(pier, lang)).filter(Boolean);
  const primaryPiers = (route.piers || []).map(pier => localized(pier, 'name', lang)).filter(Boolean);
  const areas = [...new Set((route.piers || []).map(pier => bilingualName(pier.mun, lang)).filter(Boolean))];
  const vesselDetails = (route.vessels || []).map(vessel => vesselInfo(vessel, lang));
  const vessels = vesselDetails.map(vessel => vessel.name).filter(Boolean);
  const operators = (route.operator || []).map(operator => operatorInfo(operator, lang)).filter(operator => operator.name);
  const timetableLinks = (route.timetables || []).map(timetable => ({
    url: localized(timetable, 'link', lang),
    name: localized(timetable, 'name', lang) || localized(timetable, 'specifier', lang),
  })).filter(timetable => timetable.url);
  return {
    id,
    name: routeTitle(route, lang, routeMetadata.get(id)),
    primaryName: typographicRouteDash(compactSlashes(localized(route, 'name', lang))),
    path: entry.paths[lang],
    specifier: localized(route, 'specifier', lang),
    piers,
    areas,
    vessels,
    vesselDetails,
    operators,
    timetableLinks,
    serviceDetails: routeFeatureOrder.map(type => localized(route.features, type, lang)).filter(Boolean),
    notes: (route.notes || []).map(note => localized(note, 'content', lang)).filter(Boolean),
    contacts: contactGroups(route, lang),
    endpoints: [piers[0], piers.at(-1)].filter(Boolean).join(' – '),
    primaryEndpoints: [primaryPiers[0], primaryPiers.at(-1)].filter(Boolean).join(' – '),
  };
}

function alternateLinks(entry) {
  return Object.entries(pages).map(([lang, page]) => {
    const path = entry ? entry.paths[lang] : page.path;
    return `    <link rel="alternate" hreflang="${lang}" href="${siteUrl}${path}" />`;
  }).join('\n');
}

function languageLinks(currentLang, entry) {
  return Object.entries(pages).map(([lang, page]) => {
    const path = entry ? entry.paths[lang] : page.path;
    return `<a href="${path}" hreflang="${lang}" lang="${lang}"${lang === currentLang ? ' aria-current="page"' : ''}>${languageLabels[lang]}</a>`;
  }).join('\n          ');
}

function routeCards(entries, lang, text, routeMetadata) {
  return entries.map(entry => {
    const info = routeInfo(entry, lang, routeMetadata);
    return `
      <article class="route" id="${escapeHtml(info.id)}">
        <h2><a class="route-title" href="${info.path}">${escapeHtml(info.name)}</a></h2>
        <dl>
          <div><dt>${text.landings}</dt><dd>${escapeHtml(info.piers.join(' – '))}</dd></div>
          <div><dt>${text.areas}</dt><dd>${escapeHtml(info.areas.join(', '))}</dd></div>
          <div><dt>${text.vessels}</dt><dd>${escapeHtml(info.vessels.join(', ') || text.noVessels)}</dd></div>
        </dl>
        <div class="route-actions">
          <a href="${info.path}">${text.openRoute}</a>
          <a class="map-link" href="/#${encodeURIComponent(info.id)}">${text.openMap}: ${escapeHtml(info.name)}</a>
        </div>
      </article>`;
  }).join('');
}

function indexStructuredData(entries, lang, page, routeMetadata) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title,
    numberOfItems: entries.length,
    inLanguage: lang,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: routeTitle(entry.route, lang, routeMetadata.get(entry.id)),
      url: `${siteUrl}${entry.paths[lang]}`,
    })),
  }).replaceAll('<', '\\u003c');
}

function detailStructuredData(info, lang, page, description) {
  const canonical = `${siteUrl}${info.path}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: `${info.primaryName} – ${page.routePage}`,
        description,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', name: 'Saaristolautat.fi', url: `${siteUrl}/` },
        mainEntity: {
          '@type': 'ItemList',
          name: page.landings,
          numberOfItems: info.piers.length,
          itemListElement: info.piers.map((pier, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: pier,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: page.routes, item: `${siteUrl}${page.path}` },
          { '@type': 'ListItem', position: 2, name: info.primaryName, item: canonical },
        ],
      },
    ],
  }).replaceAll('<', '\\u003c');
}

function documentHead({ page, title, description, canonical, alternates, structuredData }) {
  return `  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | Saaristolautat.fi</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
${alternates}
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:locale" content="${page.locale}" />
    <meta property="og:image" content="${siteUrl}/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/seo.css" />
    <script type="application/ld+json">${structuredData}</script>
  </head>`;
}

function renderIndexPage(entries, lang, page, routeMetadata) {
  const canonical = `${siteUrl}${page.path}`;
  const head = documentHead({
    page,
    title: page.title,
    description: page.description,
    canonical,
    alternates: `${alternateLinks()}\n    <link rel="alternate" hreflang="x-default" href="${siteUrl}/" />`,
    structuredData: indexStructuredData(entries, lang, page, routeMetadata),
  });

  return `<!DOCTYPE html>
<html lang="${lang}">
${head}
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
        <h2 class="section-title" id="routes-heading">${page.routes}</h2>${routeCards(entries, lang, page, routeMetadata)}
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

function detailRows(info, text) {
  const timetableLinks = info.timetableLinks.map((timetable, index) =>
    `<a href="${escapeHtml(timetable.url)}">${text.openOfficialTimetable}${info.timetableLinks.length > 1 ? `: ${escapeHtml(timetable.name || String(index + 1))}` : ''}</a>`
  ).join('<br />');
  return [
    info.specifier ? [text.specifier, escapeHtml(info.specifier)] : null,
    [text.landings, escapeHtml(info.piers.join(' – '))],
    [text.areas, escapeHtml(info.areas.join(', '))],
    [text.vessels, escapeHtml(info.vessels.join(', ') || text.noVessels)],
    info.operators.length ? [text.operators, info.operators.map(operator =>
      operator.homepage
        ? `<a href="${escapeHtml(operator.homepage)}">${escapeHtml(operator.name)}</a>`
        : escapeHtml(operator.name)
    ).join(', ')] : null,
    timetableLinks ? [text.officialTimetables, timetableLinks] : null,
  ].filter(Boolean).map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('\n          ');
}

function renderServiceDetails(info, text) {
  if (!info.serviceDetails.length) return '';
  return `
      <section class="info-section">
        <h2>${text.serviceDetails}</h2>
        <ul class="feature-list">
          ${info.serviceDetails.map(feature => `<li>${feature}</li>`).join('\n          ')}
        </ul>
      </section>`;
}

function capacityItem(label, value) {
  if (!value) return null;
  if (value === true) return label;
  const renderedValue = String(value).trim();
  return renderedValue ? `${label}: ${escapeHtml(renderedValue)}` : label;
}

function renderVesselDetails(info, text) {
  if (!info.vesselDetails.length) return '';
  const vessels = info.vesselDetails.map(vessel => {
    const features = [
      capacityItem(text.bikes, vessel.capacity.bikes),
      capacityItem(text.cars, vessel.capacity.cars),
      capacityItem(text.persons, vessel.capacity.persons),
      vessel.cafe ? text.cafe : null,
      vessel.accessible ? text.accessible : null,
    ].filter(Boolean);
    return `
          <article class="vessel-detail">
            <h3>${escapeHtml(vessel.name)}</h3>
            ${features.length ? `<ul>${features.map(feature => `<li>${feature}</li>`).join('')}</ul>` : ''}
          </article>`;
  }).join('');
  return `
      <section class="info-section">
        <h2>${text.vesselDetails}</h2>
        <div class="detail-grid">${vessels}
        </div>
      </section>`;
}

function renderNotes(info, text) {
  if (!info.notes.length) return '';
  return `
      <section class="info-section">
        <h2>${text.notes}</h2>
        <div class="notes">${info.notes.map(note => `<div class="note">${note}</div>`).join('')}</div>
      </section>`;
}

function renderContacts(info, text) {
  if (!info.contacts.length) return '';
  const groups = info.contacts.map(group => `
          <article class="contact-detail">
            <h3>${escapeHtml(group.name)}</h3>
            <ul>${group.items.map(item => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.text)}</a>${item.specifier ? ` – ${escapeHtml(item.specifier)}` : ''}</li>`).join('')}</ul>
          </article>`).join('');
  return `
      <section class="info-section">
        <h2>${text.contactInfo}</h2>
        <div class="detail-grid">${groups}
        </div>
      </section>`;
}

function renderDetailPage(entry, lang, page, routeMetadata) {
  const info = routeInfo(entry, lang, routeMetadata);
  const title = `${info.primaryName} – ${page.routePage}`;
  const description = page.detailDescription(info.name, info.endpoints);
  const canonical = `${siteUrl}${info.path}`;
  const head = documentHead({
    page,
    title,
    description,
    canonical,
    alternates: alternateLinks(entry),
    structuredData: detailStructuredData(info, lang, page, description),
  });

  return `<!DOCTYPE html>
<html lang="${lang}">
${head}
  <body>
    <header>
      <a class="brand" href="/">Saaristolautat.fi</a>
      <nav aria-label="${page.languages}">
        ${languageLinks(lang, entry)}
      </nav>
    </header>
    <main>
      <nav class="breadcrumb" aria-label="${page.routes}">
        <a href="${page.path}">← ${page.backToRoutes}</a>
      </nav>
      <div class="intro route-intro">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(page.detailIntro(info.primaryName, info.primaryEndpoints))}</p>
        <p><a class="primary" href="/#${encodeURIComponent(info.id)}">${page.openMap}: ${escapeHtml(info.primaryName)}</a></p>
        <p class="notice">${escapeHtml(page.notice)}</p>
      </div>
      <article class="route route-detail">
        <h2>${page.routeDetails}</h2>
        <dl>
          ${detailRows(info, page)}
        </dl>
      </article>${renderServiceDetails(info, page)}${renderVesselDetails(info, page)}${renderNotes(info, page)}${renderContacts(info, page)}
    </main>
    <footer>
      <p>${escapeHtml(page.updated)}</p>
      <p>Saaristolautat.fi © Kyösti Ranto 2018–2026</p>
    </footer>
  </body>
</html>
`;
}

function sitemapUrl(path, variants = []) {
  const alternates = variants.map(({ lang, path: alternatePath }) =>
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl}${alternatePath}" />`
  ).join('\n');
  return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>${alternates ? `\n${alternates}` : ''}
  </url>`;
}

const data = await readJson(dataPath);
const mapData = await readJson(mapDataPath);
const obsoleteRouteIds = new Set();
const routeMetadata = new Map();
(function collectRouteMetadata(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(collectRouteMetadata);
    return;
  }
  if (node.properties?.stype === 'connection_obsolete' && node.properties.ref) {
    obsoleteRouteIds.add(node.properties.ref);
  }
  if (node.properties?.stype?.startsWith('connection') && node.properties.ref) {
    routeMetadata.set(node.properties.ref, node.properties);
  }
  if (Array.isArray(node.features)) node.features.forEach(collectRouteMetadata);
})(mapData);

const routes = Object.fromEntries(
  Object.entries(data.routes).filter(([id, route]) => !route.obsolete && !obsoleteRouteIds.has(id))
);
const entries = createRouteEntries(routes);

for (const [lang, page] of Object.entries(pages)) {
  const indexOutputPath = resolve(publicRoot, page.file);
  const indexDirectory = dirname(indexOutputPath);
  await mkdir(indexDirectory, { recursive: true });
  for (const item of await readdir(indexDirectory, { withFileTypes: true })) {
    if (item.isDirectory()) await rm(resolve(indexDirectory, item.name), { recursive: true, force: true });
  }
  await writeFile(indexOutputPath, renderIndexPage(entries, lang, page, routeMetadata));

  for (const entry of entries) {
    const routeOutputPath = resolve(publicRoot, entry.paths[lang].slice(1), 'index.html');
    await mkdir(dirname(routeOutputPath), { recursive: true });
    await writeFile(routeOutputPath, renderDetailPage(entry, lang, page, routeMetadata));
  }
}

const indexVariants = Object.entries(pages).map(([lang, page]) => ({ lang, path: page.path }));
const sitemapUrls = [sitemapUrl('/')];
for (const [lang, page] of Object.entries(pages)) {
  sitemapUrls.push(sitemapUrl(page.path, indexVariants));
  for (const entry of entries) {
    const variants = Object.keys(pages).map(alternateLang => ({
      lang: alternateLang,
      path: entry.paths[alternateLang],
    }));
    sitemapUrls.push(sitemapUrl(entry.paths[lang], variants));
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>
`;
await writeFile(resolve(publicRoot, 'sitemap.xml'), sitemap);

console.log(`Generated ${Object.keys(pages).length} route indexes and ${entries.length * Object.keys(pages).length} route pages from ${dataPath}`);
