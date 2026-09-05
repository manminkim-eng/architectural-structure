/* ═══════════════════════════════════════════════════════════
   S11b 회차 2026-09-05 — 아이콘 파일명 45 규격(icon-NxN)으로 변경 · manifest 갱신 유도 · 캐시명 v5.0.9
   S11 회차 2026-09-05 — 앱 아이콘 45 내진성능과 동일화 · 캐시명 v5.0.8
   S9 회차 2026-09-05 — R28 JPG v5.5 소제목 동반 이관 동반 캐시명 v5.0.7
   S4 회차 2026-09-04 — R1b #mm-print-stamp 인쇄 비표시 동반 캐시명 v5.0.6
   S3-0 회차 2026-09-04 — R27 html2canvas 클론 정화 동반 캐시명 v5.0.5
   S2 회차 2026-09-04 — index 소급(R1·R21·R26 등) 동반 캐시명 v5.0.4
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.0.3 (S10)
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
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE_NAME = 'load-v5.0.10';
const ORPHAN     = ['manmin-load-v5.0', 'manmin-load-v5.0.1'];
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
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
      return Promise.allSettled(STATIC_ASSETS.map((u) => cache.add(mmReq(u)).catch((e) => console.warn('[SW] precache skip:', u, e))))
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
          .filter(name => name !== CACHE_NAME && (mmOwn(name) || ORPHAN.indexOf(name) !== -1))
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
      }).catch(() => mmMatch('./index.html'))
    );
    return;
  }

  event.respondWith(
    mmMatch(event.request).then(cached => {
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
          return mmMatch('./index.html');
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
