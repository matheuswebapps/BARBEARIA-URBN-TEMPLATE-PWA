const CACHE_NAME = 'urbn-template-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

let PWA = {
  name: null,
  appIconUrl: null,
  themeColor: '#2C1A1D',
  backgroundColor: '#FDFBF7',
  // optional supabase info (not strictly needed if appIconUrl is absolute)
  supabaseUrl: null,
  supabaseAnonKey: null,
  bucket: null
};

const buildManifest = (origin) => {
  const name = PWA.name || 'App';
  const iconSrc = `${origin}/pwa-icon.png?v=${Date.now()}`;

  return {
    name,
    short_name: name,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: PWA.backgroundColor || '#FDFBF7',
    theme_color: PWA.themeColor || '#2C1A1D',
    icons: [
      { src: iconSrc, sizes: '192x192', type: 'image/png' },
      { src: iconSrc, sizes: '512x512', type: 'image/png' }
    ]
  };
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PWA_CONFIG' || data.type === 'PWA_UPDATE') {
    if (data.supabase) {
      PWA.supabaseUrl = data.supabase.url || PWA.supabaseUrl;
      PWA.supabaseAnonKey = data.supabase.anonKey || PWA.supabaseAnonKey;
      PWA.bucket = data.supabase.bucket || PWA.bucket;
    }
    if (data.settings) {
      PWA.name = data.settings.name ?? PWA.name;
      PWA.appIconUrl = data.settings.appIconUrl ?? PWA.appIconUrl;
      PWA.themeColor = data.settings.themeColor ?? PWA.themeColor;
      PWA.backgroundColor = data.settings.backgroundColor ?? PWA.backgroundColor;
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Serve a dynamic manifest so future installs use the latest name/icon
  if (url.pathname === '/manifest.json') {
    event.respondWith((async () => {
      const manifest = buildManifest(url.origin);
      return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    })());
    return;
  }

  // Serve a same-origin icon that proxies the latest uploaded app icon
  if (url.pathname === '/pwa-icon.png') {
    event.respondWith((async () => {
      try {
        if (PWA.appIconUrl) {
          const res = await fetch(PWA.appIconUrl, { cache: 'no-store' });
          if (res.ok) {
            // Return as-is; browsers accept various PNG sizes
            return new Response(await res.blob(), {
              headers: {
                'Content-Type': res.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'no-store, max-age=0'
              }
            });
          }
        }
      } catch (e) { /* ignore */ }

      // fallback to bundled logo
      const cache = await caches.open(CACHE_NAME);
      const fallback = await cache.match('/logo.png');
      return fallback || fetch(event.request);
    })());
    return;
  }

  // Default: cache-first for static assets, network for others
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const res = await fetch(event.request);
      // cache only GET and same-origin basic responses
      if (event.request.method === 'GET' && url.origin === self.location.origin && res && res.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
