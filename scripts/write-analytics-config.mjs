import { readFile, writeFile } from 'node:fs/promises';

const outputPath = new URL('../build/js/goatcounter-pageview.js', import.meta.url);
const scriptUrl = process.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';
const websiteId = process.env.VITE_UMAMI_WEBSITE_ID || '6d0b3cd2-13e7-4bb4-9bb0-99b9e57ad936';

const source = await readFile(outputPath, 'utf8');
const configured = source
  .replace("'__UMAMI_SCRIPT_URL__'", JSON.stringify(scriptUrl))
  .replace("'__UMAMI_WEBSITE_ID__'", JSON.stringify(websiteId));

if (configured === source || configured.includes('__UMAMI_')) {
  throw new Error('Umami placeholders were not replaced in the page-view script');
}

await writeFile(outputPath, configured);
