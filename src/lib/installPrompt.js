let installPrompt = null;
let installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const listeners = new Set();

function notify() {
  listeners.forEach(listener => listener());
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  notify();
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installed = true;
  notify();
});

export function getInstallState() {
  return { installPrompt, installed };
}

export function subscribeToInstallState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function showInstallPrompt() {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  notify();
  await prompt.prompt();
}
