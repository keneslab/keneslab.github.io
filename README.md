# 블로그 (KenesLab Blog)

KenesLab의 기술 블로그 레포지토리입니다. 정적 HTML 페이지와 SEO 최적화 콘텐츠를 자동으로 생성하는 워크플로우를 제공합니다.

## 개요

이 레포지토리는 블로그 운영을 위한 완전한 솔루션을 제공합니다:

- **정적 HTML 페이지 자동 생성**: 본문만 작성하면 SEO 최적화된 완전한 HTML 페이지가 자동 생성
- **메타데이터 자동 추출**: HTML 파일에서 제목, 날짜, 저자, 설명을 자동으로 추출
- **SEO 자동화**: Open Graph, Twitter Card, JSON-LD 등 모든 SEO 요소 자동 생성
- **Sitemap 자동 관리**: 포스트 추가/수정 시 sitemap.xml 자동 업데이트
- **캐시 버스팅**: CSS/JS 파일의 자동 버전 관리로 브라우저 캐시 문제 해결

## 프로젝트 구조

```
blog/
├── index.html              # 메인 페이지
├── posts.html              # 포스트 목록 페이지
├── about.html              # 회사 소개 페이지
├── contact.html            # 문의하기 페이지
├── sitemap.xml             # 자동 생성된 사이트맵
├── robots.txt              # 검색 엔진 크롤러 설정
├── posts-metadata.json     # 포스트 메타데이터 (자동 관리)
│
├── css/                    # 스타일시트
│   └── style.css
│
├── js/                     # JavaScript 파일
│   ├── analytics.js        # Google Analytics
│   ├── theme.js            # 테마 관리
│   └── components/         # Web Components
│       ├── header.js
│       ├── footer.js
│       ├── posts-list.js
│       ├── recent-posts.js
│       ├── contact-section.js
│       └── company-info.js
│
├── images/                 # 이미지 파일
│
└── workspace/              # 작업 공간 (Git에 포함되지 않음)
    ├── bin/                # 자동화 스크립트
    │   ├── generate-static-pages.js   # 정적 페이지 생성
    │   ├── update-asset-versions.js   # 에셋 버전 관리
    │   └── asset-versions.json        # 버전 정보
    │
    └── contents/           # 포스트 본문 (HTML)
        ├── shakeflat.html
        └── web-components.html
```

## 빠른 시작

### 1. 새 포스트 작성

`workspace/contents/` 디렉토리에 HTML 본문 파일을 작성합니다:

```html
<!-- workspace/contents/my-new-post.html -->
<h1>새로운 포스트 제목</h1>
<div class="post-meta">
    <span class="date">2025년 10월 23일</span>
    <span class="author">KenesLab</span>
</div>
<div class="post-content">
    <p>포스트 내용...</p>
</div>
```

### 2. 정적 페이지 자동 생성

```powershell
node workspace/bin/generate-static-pages.js
```

스크립트가 자동으로 수행하는 작업:
1. 새로운 HTML 파일 감지
2. HTML에서 메타데이터 추출 (제목, 날짜, 저자, 설명)
3. 추가 정보 입력 요청 (키워드, OG 이미지)
4. `posts-metadata.json`에 저장
5. 완전한 정적 HTML 페이지 생성 (SEO 메타 태그 포함)
6. `sitemap.xml` 자동 업데이트

### 3. 배포

```powershell
git add *.html posts-metadata.json sitemap.xml
git commit -m "Add new post: 포스트 제목"
git push
```

## 주요 자동화 기능

### 정적 페이지 생성

**스크립트**: `workspace/bin/generate-static-pages.js`

**자동 생성 요소**:
- ✅ HTML5 문서 구조 (DOCTYPE, html, head, body)
- ✅ SEO 메타 태그 (description, keywords, author)
- ✅ Open Graph 태그 (소셜 미디어 공유)
- ✅ Twitter Card 태그
- ✅ Canonical URL
- ✅ JSON-LD 구조화된 데이터 (Schema.org BlogPosting)
- ✅ Google Tag Manager 통합
- ✅ 공통 헤더/푸터 컴포넌트

**특징**:
- 본문만 작성하면 완전한 페이지가 자동 생성
- workspace와 root 디렉토리 간 자동 동기화
- `dateModified` 자동 업데이트

### Sitemap 자동 관리

**생성 내용**:
- 모든 정적 페이지 (홈, 포스트 목록, 회사 소개, 문의하기)
- 모든 블로그 포스트
- 최종 수정일 (`lastmod`) 자동 설정
- 적절한 우선순위 (`priority`) 및 변경 빈도 (`changefreq`)

**XML Sitemap 표준 준수**:
```xml
<url>
  <loc>https://www.keneslab.com/my-post.html</loc>
  <lastmod>2025-10-23</lastmod>
  <priority>0.8</priority>
  <changefreq>monthly</changefreq>
</url>
```

### 메타데이터 자동 추출

HTML 파일에서 다음 정보를 자동으로 추출:
- **제목**: `<h1>` 태그
- **날짜**: `<span class="date">` (한글 날짜 자동 변환)
- **저자**: `<span class="author">`
- **설명**: 첫 번째 `<p>` 태그 (최대 160자)
- **라우트**: 파일명 기반 자동 생성

### 캐시 버스팅 (Cache Busting)

**스크립트**: `workspace/bin/update-asset-versions.js`

CSS/JS 파일 수정 시 버전 자동 관리:

```powershell
# 모든 에셋 버전 업데이트
node workspace/bin/update-asset-versions.js --increment-all

# 특정 파일만 업데이트
node workspace/bin/update-asset-versions.js --increment css/style.css

# 메이저 버전 증가
node workspace/bin/update-asset-versions.js --increment-all --major
```

**결과**:
```html
<!-- 버전이 자동으로 추가됨 -->
<link rel="stylesheet" href="css/style.css?v=1.0.1">
<script src="js/theme.js?v=1.0.2"></script>
```

## SEO 최적화

### 메타 태그

각 페이지에 자동으로 추가되는 SEO 요소:

```html
<!-- 기본 메타 태그 -->
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta name="author" content="KenesLab">

<!-- Open Graph (Facebook, LinkedIn 등) -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">

<!-- Canonical URL -->
<link rel="canonical" href="...">
```

### JSON-LD 구조화된 데이터

Google 검색 결과 최적화를 위한 Schema.org 데이터:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "...",
  "dateModified": "...",
  "author": { "@type": "Person", "name": "KenesLab" },
  "description": "..."
}
```

## 자세한 가이드

상세한 작성 가이드 및 워크플로우는 `workspace/README.md`를 참조하세요:

- 새 글 작성 방법 (자동/수동)
- 스크립트 사용법
- 수정하기
- 자동화 기능 상세 설명

## 기술 스택

- **순수 HTML/CSS/JavaScript**: 프레임워크 없음
- **Web Components**: 재사용 가능한 컴포넌트
- **Node.js**: 자동화 스크립트
- **Google Tag Manager**: 분석 및 추적
- **Schema.org**: 구조화된 데이터

## 문의

- **이메일**: birdryoo@gmail.com

---

**© 2025 KenesLab. All rights reserved.**