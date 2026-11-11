// Service worker: guarda os arquivos do app para funcionar offline.
// Ao mudar qualquer arquivo do app, aumente o número da VERSAO (v1 -> v2)
// para o celular baixar a versão nova.
const VERSAO = "ambition-v1";
const ARQUIVOS = ["./", "index.html", "style.css", "app.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

// Primeiro tenta o que está guardado; se não tiver, busca na internet
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((guardado) => guardado || fetch(e.request)));
});
