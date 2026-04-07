/* ═══════════════════════════════════════════════════════════
   MANMIN 설계하중 PWA — Service Worker
   KDS 41 12 00 : 2022  /  MANMIN Ver 1.0
   ═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'manmin-load-v1.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&family=Noto+Sans+Mono:wght@400;600;700&family=Orbitron:wght@700;900&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

/* ── Install: 정적 자산 캐시 ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 캐시 설치 중...');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'cors' })))
        .catch(err => {
          console.warn('[SW] 일부 자산 캐시 실패 (무시):', err);
        });
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: 구버전 캐시 정리 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] 구버전 캐시 삭제:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache-first, Network fallback ── */
self.addEventListener('fetch', event => {
  // POST 요청 및 크롬 익스텐션은 캐시 제외
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        // 동적 캐시 저장
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // 오프라인 폴백 — index.html 반환
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

/* ── 백그라운드 동기화 (미래 확장용) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-calc-data') {
    console.log('[SW] 백그라운드 동기화 실행');
  }
});
