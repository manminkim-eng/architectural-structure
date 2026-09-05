# 🏗️ 건축물 설계하중 통합 산정 — MANMIN **Ver 5.0**

> **Developer MANMIN** | ㈜대성건축사사무소
> **KDS 41 12 00 : 2022** 기준 건축물 설계하중 통합 산정 PWA
> 고정·활·적설·풍·지진 5종 하중 + LRFD 하중조합 자동 산출

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-배포됨-blue)](https://manminkim-eng.github.io/architectural-structure)
[![PWA](https://img.shields.io/badge/PWA-지원-green)](https://web.dev/progressive-web-apps/)
[![KDS](https://img.shields.io/badge/기준-KDS_41_12_00_:_2022-navy)](https://www.kcsc.re.kr)

---

## 🆕 Ver 5.0 — MANMIN WAP 디자인 통일 적용 (2026-08-31)

MANMIN WAP 39종 디자인 통일 작업의 **비소방 계열 첫 적용본**이다.
마스터는 01 옥내소화전(`fire-hydrant-calc`) Ver 5.0이며, 이 도구가 그 패턴을 처음으로 복제했다.

> **계산 로직은 1바이트도 변경하지 않았다.** 하중 산정식·상수·검증식·법령 인용문 모두 Ver 1.0과 동일하다.
> 변경 범위는 `<style>` 블록 · 출력 래퍼 · 폰트 토큰 · 버전 문자열 넷뿐이다.
> 숫자 토큰 다중집합 대조로 검증했으며, 계산부(`<script type="text/babel">`)의 변경은
> 폰트 지정 5곳 · 버전 표기 3곳 · 출력 래퍼 신설분에 한정된다.

### 조정 내역

| # | 항목 | 기존 (Ver 1.0) | 변경 (Ver 5.0) |
|---|------|---------------|---------------|
| ① | **A4 여백** | `margin:15mm 12mm 20mm 15mm` | `margin:14mm 12mm 22mm 14mm` — 39종 공통 규격, 유효폭 **184 × 261mm** |
| ② | **하단 각인** | `@page{@bottom-left / @bottom-right{content:…}}` — **Chrome 미구현이라 인쇄물에 찍히지 않았다** | `#dev-stamp` · `#dev-stamp-print` 를 `position:fixed` 로 전환 → **매 페이지 출력** |
| ③ | **A4 폭 초과** | `794px` 고정폭 + 좌우여백 27mm = 필요폭 237mm > 용지 210mm | 인쇄 시 `.rpt-inner{width:auto}` 해제 → 유효폭 자동 정합 |
| ④ | **계산서 미리보기** | `ScaledPreview` — `offset ÷ scale` 보정 (모바일 우측 쏠림 소지) | 마스터 검증식 이식 — `getBoundingClientRect()` 실측 · `offset = max(0,(outerW−scaledW)/2)` · 높이 `scrollHeight×scale+40` |
| ⑤ | **모바일 JPG 저장** | 없음 | `🖼️ JPG 저장` 버튼 추가 — **MANMIN JPG 저장 v5.4** 원문 이식, 인쇄와 **동일 DOM** 캡처 |
| ⑥ | **출력 버튼** | 헤더 `🖨️ 인쇄` + FAB | `.mm-out` / `.mm-btn` 규격 v5.1 — 계산서 상단, 480px 이하 세로 전환 |
| ⑦ | **고정폭 폰트** | `Noto Sans Mono` (7곳) | `JetBrains Mono` + `Noto Sans KR` 폴백 (39종 공통 결정) — 잔존 **0건** |
| ⑧ | **오프라인 폰트** | Google Fonts CDN 의존 | `assets/fonts/` 로컬 woff2 동봉 + SW 선캐싱 → 차단망·오프라인 한글 유지 |
| ⑨ | **화면 계산서 여백** | 래퍼 없음 | `#report-zone{padding:14mm 12mm 22mm 14mm}` → **화면·인쇄 콘텐츠폭 동일 184mm** |
| ⑩ | **버전 체계** | Ver 1.0 / `manmin-load-v1.1` | **Ver 5.0 / `manmin-load-v5.0`** (전 39종 5.0에서 재출발) |

### MANMIN A4 규격 (전 39종 공통)

| 항목 | 값 |
|------|-----|
| 용지 | A4 portrait 210 × 297mm |
| 여백 | 상 14 · 우 12 · 하 22 · 좌 14mm |
| 유효 영역 | **184 × 261mm** |
| 하단 각인 | `MANMIN · Ver-5.0` · Orbitron 8pt · `#9CA3AF` · 우측 하단 |
| 쪽나눔 | `thead{display:table-header-group}` · `.ps`/`.print-section{break-inside:avoid}` |
| 분야 주도색 | 구조 `#6D28D9` *(이관 대기 — 의미색과 얽혀 있어 도구별 육안 확인 후 적용)* |

### JPG 저장 동작

```
설계하중_{공사명}_{YYYYMMDD}[_n].jpg
```

`.page-break` / `.pb` 를 경계로 페이지를 나눠 A4 비율 이미지를 장수만큼 저장한다.
인쇄 쪽나눔과 같은 경계를 쓰므로 **PDF와 JPG의 페이지 구성이 일치**한다.

구현에서 지킨 4가지 — 순서를 어기면 이미지가 깨진다.

1. **`rpt-inner` 의 transform 해제** — 모바일 축소배율이 이미지에 박히는 것을 막는다
2. **`document.fonts.ready` 대기** — 웹폰트 로딩 전 캡처하면 시스템 폰트로 굳는다
3. **`backgroundColor:'#FFFFFF'` 고정**
4. **`.no-print` · `#dev-stamp` 제외** — 버튼·각인이 이미지에 중복으로 찍히지 않게 한다

`html2canvas` 는 CDN 로드이나 Service Worker 의 Network-First 가 첫 온라인 실행 시 캐시하므로,
이후 오프라인·차단망에서도 저장이 동작한다.

### 근거 기준

| 구분 | 내용 |
|------|------|
| 하중 산정 | **KDS 41 12 00 : 2022** (건축물 설계하중) |
| 지진하중 | **KDS 41 17 00 : 2022** (건축물 내진설계기준) |
| 출처 | 국가건설기준센터 `kcsc.re.kr` — KDS·KCS는 LawMCP 범위 밖이므로 별도 확인 |
| 확인 상태 | **2026-08-31 기준 미확인** — 국가건설기준센터 접속 불가로 개정 여부 확인 보류 |

> ⚠️ 본 도구는 건축사 인허가·VE 단계의 적정성 검토용이며,
> 정식 구조계산서(건축구조기술사 날인)를 대체하지 않는다.

### 백업

| 파일 | 내용 |
|------|------|
| `index_백업_2026-08-31_원본.html` | v5.0 작업 직전 원본 (배포본과 바이트 일치 확인분) |
| `../../버전s-1.0/pwa_set/` | Ver 1.0 폴더 전체 **무변경 보존** |

---

## 📁 파일 구성

```
📦 architectural-structure-v5.0/
├── 📄 index.html          # 메인 앱 (React 기반, 모든 기능 포함)
├── 📄 manifest.json       # PWA 매니페스트 (설치 정보)
├── 📄 sw.js               # Service Worker (오프라인 캐시, CACHE v5.0)
├── 📄 .nojekyll           # GitHub Pages Jekyll 비활성화
├── 📁 assets/fonts/       # 로컬 폴백 폰트 (v5.0 신규)
│   ├── manmin-fonts.css
│   └── NotoSansKR-var.woff2
├── 📁 icons/              # 앱 아이콘 (72~512px)
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png  ← maskable
│   ├── icon-384.png
│   └── icon-512.png  ← maskable
└── 📄 README.md
```

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 저장소 생성 및 업로드
```bash
git init
git add .
git commit -m "feat: MANMIN 설계하중 PWA 초기 배포"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2단계 — GitHub Pages 활성화
1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `/ (root)`
4. **Save** 클릭
5. 약 1~2분 후 `https://YOUR_USERNAME.github.io/YOUR_REPO` 에서 접근 가능

### 3단계 — PWA 설치 확인
- **Chrome/Edge (PC)**: 주소창 우측 설치 아이콘(🖥️) 클릭
- **Android Chrome**: 하단 배너 "설치하기" 버튼 탭
- **iPhone Safari**: 공유(⬆️) → 홈 화면에 추가

---

## ⚙️ 주요 기능

| 기능 | 설명 |
|------|------|
| 🧱 고정하중 (D) | 재료별 단위중량 DB, 층별 자동 합산 |
| 👥 활하중 (L) | 용도별 최소 바닥활하중 (KDS 표 적용) |
| ❄️ 적설하중 (S) | 지역별 기본 지상적설하중, 경사 보정 |
| 💨 풍하중 (W) | 풍속 구역·노출 범주·형상계수 반영 |
| 🌍 지진하중 (E) | 지역계수·지반분류·구조시스템(R값) |
| ⚖️ LRFD 하중조합 | 8가지 조합 자동 산출, 지배 하중 강조 |
| 📄 A4 계산서 | 인쇄/PDF 저장 (구조계산서 형식) |
| 📲 PWA 설치 | 오프라인 사용, 홈 화면 바로가기 |
| ❓ 도움말 모달 | 이용 방법 + 관련 자료 + 설치 안내 |

---

## 📋 적용 기준

- **KDS 41 12 00 : 2022** — 건축물 설계하중 (2022. 10. 11 개정)
- **KDS 41 17 00** — 건축물 내진설계기준
- **KDS 41 19 00** — 건축물 기초구조 설계기준

> ⚠️ **주의**: 본 프로그램의 계산 결과는 참고용이며, 최종 설계값은 반드시 구조기술사의 검토·확인이 필요합니다.

---

## 🛠️ 기술 스택

- **React 18** (UMD CDN, 별도 빌드 불필요)
- **Service Worker** — Cache-first 전략, 오프라인 지원
- **Web App Manifest** — PWA 설치, 홈 화면 아이콘
- **CSS3** — 반응형 (데스크탑·태블릿·모바일)
- **Noto Sans KR + Orbitron** — Google Fonts

---

## 👤 개발

**STRUCTURE KIM MANMIN**  
구조 설계 계산 자동화 도구 시리즈

---

## v5.0.10 (2026-09-05) — 우하단 모달 2종 규격 통일 (MIN 지시)
| 항목 | 가이드 모달 (.mo-*) 기존 | 헬프 모달 (.help-mo-*) 기존 | 통일 (소방 마스터 fml 규격) |
|---|---|---|---|
| 위치 | 화면 중앙 | 우측 하단 정렬 | **화면 중앙** (≤640px 바텀시트) |
| 폭 | max-width 640 | max-width 480 | **840px** (641~1024px: 88vw) |
| 높이 | calc(100vh-40px) / 모바일 -24px | calc(100vh-90px) | **calc(100vh-32px)** (태블릿 88vh · 모바일 92vh) |
| 헤더 여백 | 15px 18px 0 | 15px 18px 0 | **18px 22px 0** (모바일 14/16) |
| 닫기 버튼 | 30px | 30px | **34px** |
| 탭 | 11.5px / 8px 13px · gold | 11.5px / 8px 13px · #fbbf24 | **12px / 9px 18px · var(--gold)** |
| 본문 여백 | 15px 18px | 16px 18px | **20px 22px 28px** (모바일 16/16/36) |
| 배경·그림자 | .60 blur6 / 24px72px | .55 blur5 / 24px72px | **.62 blur5 / 30px 80px** |
| 구현 | — | — | 문서 끝 `<style id="mm-v5-modal-unify">` 덧씌움 (HTML·JSX 무접촉) · sw `load-v5.0.10` |
