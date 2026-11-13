#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';

const defaults = {
  baseUrl: 'http://127.0.0.1:5173/',
  chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  outputDir: 'screenshots',
  port: '9223',
  wait: '8000',
  zooms: '11,13,15',
};

function parseArguments(values) {
  const result = { ...defaults };
  for (let index = 0; index < values.length; index += 2) {
    const option = values[index];
    const value = values[index + 1];
    if (!option?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near ${option || '<end>'}`);
    }
    const key = option.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    result[key] = value;
  }
  return result;
}

function wait(milliseconds) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
}

async function waitForPage(port, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = targets.find(target => target.type === 'page');
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await wait(100);
  }
  throw new Error('Chrome debugging endpoint did not become ready');
}

function connect(page) {
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve: finish, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else finish(message.result);
  });
  return {
    ready: new Promise((finish, reject) => {
      socket.addEventListener('open', finish, { once: true });
      socket.addEventListener('error', reject, { once: true });
    }),
    command(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((finish, reject) => pending.set(id, { resolve: finish, reject }));
    },
    close() {
      socket.close();
    },
  };
}

const options = parseArguments(process.argv.slice(2));
if (!options.name || !options.center) {
  throw new Error('Usage: capture-map-screenshots.mjs --name NAME --center LNG,LAT [--zooms 11,13,15]');
}
const center = options.center.split(',').map(Number);
const zooms = options.zooms.split(',').map(Number);
if (center.length !== 2 || !center.every(Number.isFinite) || !zooms.every(Number.isFinite)) {
  throw new Error('Center and zooms must contain finite numbers');
}

const outputDirectory = resolve(options.outputDir);
const profileDirectory = await mkdtemp(`${tmpdir()}/saaristolautat-map-capture-`);
await mkdir(outputDirectory, { recursive: true });
const chrome = spawn(options.chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--window-size=1280,720',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${options.port}`,
  '--remote-allow-origins=*',
  `--user-data-dir=${profileDirectory}`,
  'about:blank',
], { stdio: 'ignore' });

try {
  const page = await waitForPage(options.port);
  const client = connect(page);
  await client.ready;
  try {
    for (const zoom of zooms) {
      const url = new URL(options.baseUrl);
      url.searchParams.set('landcover', 'kmtk');
      url.searchParams.set('screenshotCenter', center.join(','));
      url.searchParams.set('screenshotZoom', String(zoom));
      url.hash = 'screenshot';
      await client.command('Page.navigate', { url: url.href });
      await wait(Number(options.wait));
      const screenshot = await client.command('Page.captureScreenshot', {
        format: 'jpeg', quality: 92, fromSurface: true,
      });
      const filename = `${options.name}-kmtk-z${zoom}.jpg`;
      const output = resolve(outputDirectory, basename(filename));
      await writeFile(output, Buffer.from(screenshot.data, 'base64'));
      console.log(output);
    }
  } finally {
    client.close();
  }
} finally {
  chrome.kill('SIGTERM');
  await new Promise(finish => chrome.once('exit', finish));
  await rm(profileDirectory, { recursive: true, force: true });
}
