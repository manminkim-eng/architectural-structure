/* ═══════════════════════════════════════════════════════════
   MANMIN 설계하중 PWA — Service Worker
   KDS 41 12 00 : 2022  /  MANMIN Ver 5.0

   2026-08-31 — 캐시 버전 v5.0 → v5.0.1
   index.html 을 갱신했는데도(타이틀 심볼 삭제·헤더 고정 해제)
   캐시명이 그대로여서 activate 가 옛 캐시를 지우지 않았다.
   Cache-first 전략이라 기존 사용자에게는 구버전이 계속 제공된다.
   내용을 바꿀 때마다 이 버전을 함께 올릴 것.
   ═══════════════════════════════════════════════════════════ */

/* §17-1 (2026-09-02) — 도구 고유 접두어. 종전 `!== CACHE_NAME` 필터는 같은 origin 의 39종 캐시를 전부 지웠다 */
const PREFIX     = 'load-';
const CACHE_NAME = 'load-v5.0.2';
const ORPHAN     = ['manmin-load-v5.0', 'manmin-load-v5.0.1'];
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  /* v5.0 — 로컬 폴백 폰트. CDN 차단·오프라인 시 한글 깨짐 방지 */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@700;900&display=swap',
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
          .filter(name => name !== CACHE_NAME && (name.indexOf(PREFIX) === 0 || ORPHAN.indexOf(name) !== -1))
          .map(name => {
            console.log('[SW] 구버전 캐시 삭제:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: HTML 은 Network-first, 그 외는 Cache-first ── */
self.addEventListener('fetch', event => {
  // POST 요청 및 크롬 익스텐션은 캐시 제외
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  /* 2026-08-31 — HTML 문서는 Network-first 로 바꾼다.
     Cache-first 였을 때 index.html 을 갱신해도 캐시가 우선해
     구버전 화면이 계속 나왔다. 오프라인에서는 캐시로 폴백한다. */
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

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
