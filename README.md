# 🏗️ 건축물 설계하중 통합 산정 — MANMIN Ver 1.0

> **KDS 41 12 00 : 2022** 기준 건축물 설계하중 통합 산정 PWA  
> 고정·활·적설·풍·지진 5종 하중 + LRFD 하중조합 자동 산출

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-배포됨-blue)](https://your-username.github.io/your-repo)
[![PWA](https://img.shields.io/badge/PWA-지원-green)](https://web.dev/progressive-web-apps/)
[![KDS](https://img.shields.io/badge/기준-KDS_41_12_00_:_2022-navy)](https://www.kcsc.re.kr)

---

## 📁 파일 구성

```
📦 pwa_set/
├── 📄 index.html          # 메인 앱 (React 기반, 모든 기능 포함)
├── 📄 manifest.json       # PWA 매니페스트 (설치 정보)
├── 📄 sw.js               # Service Worker (오프라인 캐시)
├── 📄 .nojekyll           # GitHub Pages Jekyll 비활성화
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
