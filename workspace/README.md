# Workspace - 글 작성 작업 공간

이 디렉토리는 블로그 글 작성을 위한 작업 공간입니다.

## 📁 디렉토리 구조

```
workspace/
├── bin/
│   └── generate-static-pages.js  # 정적 페이지 생성 스크립트
├── contents/
│   ├── shakeflat.html            # 포스트 본문
│   └── web-components.html       # 포스트 본문
└── README.md                      # 이 파일

루트/
└── posts-metadata.json            # 포스트 메타데이터 (Git 업로드됨)
```

## ✍️ 새 글 작성 방법

### 방법 1: 자동 메타데이터 생성 (권장) ⭐

#### 1. 포스트 본문만 작성

`workspace/contents/` 디렉토리에 새로운 HTML 파일을 생성합니다.

**예시: `my-new-post.html`**

```html
<h1>제목</h1>
<div class="post-meta">
    <span class="date">2025년 10월 23일</span>
    <span class="author">KenesLab</span>
</div>
<div class="post-content">
    <p>본문 내용...</p>

    <h2>부제목</h2>
    <p>더 많은 내용...</p>
</div>
```

**주의사항:**
- `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` 태그는 **작성하지 않습니다**
- 본문 영역만 작성합니다 (메타 태그는 자동 생성됨)

#### 2. 스크립트 실행

```bash
node workspace/bin/generate-static-pages.js
```

스크립트가 자동으로:
1. 📄 새 HTML 파일을 감지
2. 🤖 HTML에서 메타데이터를 자동 추출
   - **제목**: `<h1>` 태그에서 추출
   - **날짜**: `<span class="date">` 에서 추출 (한글 날짜 자동 변환)
   - **저자**: `<span class="author">` 에서 추출
   - **설명**: 첫 번째 `<p>` 태그에서 추출 (최대 160자)
   - **라우트**: 파일명에서 자동 생성
3. ✅ 자동 추출된 정보를 확인하고 수정 가능
4. ⌨️ 키워드와 OG 이미지 경로 입력 요청
5. 💾 `posts-metadata.json`에 자동 저장
6. 📄 정적 HTML 페이지 생성
7. 🗺️ sitemap.xml 자동 업데이트

**실행 예시:**
```
🔍 Scanning workspace/contents for HTML files...

📝 Found 1 new HTML file(s) without metadata:

--- Processing: my-new-post.html ---

🤖 Auto-detected metadata:
   Title: 새 글 제목
   Date: 2025-10-23
   Author: KenesLab
   Description: 이 글에 대한 설명...
   Route: my-new-post

✓ Use auto-detected metadata? (y/n, default: y): y
Keywords (comma separated): 키워드1, 키워드2, 키워드3
OG Image path [images/my-new-post-og.jpg]:

✅ Metadata added for my-new-post.html
💾 Metadata saved to: ./posts-metadata.json
```

---

### 방법 2: 수동 메타데이터 작성

---

### 방법 2: 수동 메타데이터 작성

이전 방식대로 수동으로 메타데이터를 작성할 수도 있습니다.

#### 1. 본문 작성
위의 방법 1과 동일하게 `workspace/contents/`에 HTML 파일 작성

#### 2. 메타데이터 수동 추가

루트 디렉토리의 `posts-metadata.json` 파일에 새 포스트 정보를 추가합니다.

```json
{
    "title": "새 글 제목",
    "date": "2025-10-23",
    "dateModified": "2025-10-23",
    "filename": "my-new-post.html",
    "route": "my-new-post",
    "description": "이 글에 대한 설명 (SEO용, 160자 이내 권장)",
    "keywords": "키워드1, 키워드2, 키워드3",
    "author": "KenesLab",
    "image": "images/my-new-post-og.jpg"
}
```

**필드 설명:**
- `title`: 글 제목
- `date`: 최초 작성일 (YYYY-MM-DD)
- `dateModified`: 최종 수정일 (YYYY-MM-DD)
- `filename`: 본문 파일명 (contents/ 내)
- `route`: URL 경로 (예: `/my-new-post.html`)
- `description`: SEO 설명문 (160자 이내)
- `keywords`: SEO 키워드 (쉼표로 구분)
- `author`: 저자명
- `image`: OG 이미지 경로

#### 3. 정적 페이지 생성

루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
node workspace/bin/generate-static-pages.js
```

---

### 🎯 어떤 방법을 선택해야 할까요?

| 방법 | 장점 | 단점 | 추천 대상 |
|------|------|------|-----------|
| **방법 1: 자동** | ✅ 빠르고 편리<br>✅ 실수 방지<br>✅ HTML 구조만 신경쓰면 됨 | ⚠️ 대화형 입력 필요 | 대부분의 경우 |
| **방법 2: 수동** | ✅ 세밀한 제어<br>✅ JSON 직접 편집 | ⚠️ 오타 가능성<br>⚠️ 번거로움 | 특수한 경우 |

💡 **권장**: 방법 1을 사용하되, 자동 추출된 정보를 확인하고 필요시 수정하세요!

---

## 🔧 주요 기능

### 자동 메타데이터 추출

스크립트가 HTML 파일에서 자동으로 추출:
- 제목 (H1 태그)
- 날짜 (한글 날짜 자동 변환)
- 저자 (post-meta 내)
- 설명 (첫 번째 p 태그)

### 에셋 버전 관리 (Cache Busting)

블로그는 CSS/JS 파일의 자동 버전 관리를 지원합니다. 이를 통해 브라우저 캐시 문제를 해결할 수 있습니다.

#### 버전 업데이트 방법

CSS나 JS 파일을 수정한 후, 다음 명령을 실행:

```bash
# 모든 에셋 버전 업데이트 (권장)
node workspace/bin/update-asset-versions.js --increment-all

# 특정 파일만 업데이트
node workspace/bin/update-asset-versions.js --increment css/style.css

# 메이저 버전 증가
node workspace/bin/update-asset-versions.js --increment-all --major
```

이 명령은:
- `workspace/bin/asset-versions.json`의 버전을 업데이트
- 모든 HTML 파일의 CSS/JS 링크를 자동으로 업데이트
- 예: `css/style.css` → `css/style.css?v=1.0.1`

**자세한 내용은 `workspace/bin/README.md`를 참조하세요.**

### 정적 페이지 생성

### 3. 정적 페이지 생성

루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
node workspace/bin/generate-static-pages.js
```

이 명령은:
1. `posts-metadata.json`을 읽어서 모든 포스트 정보를 가져옵니다
2. `dateModified`를 현재 날짜로 자동 업데이트합니다
3. 각 포스트의 본문 HTML을 읽습니다
4. SEO 메타 태그가 포함된 완전한 HTML 페이지를 생성합니다
5. 루트 디렉토리에 `{route}.html` 파일로 저장합니다
6. `sitemap.xml`을 자동으로 생성/업데이트합니다
7. 루트의 `posts-metadata.json`도 함께 동기화합니다

**생성 결과:**
- `c:\dev\blog\my-new-post.html` (루트에 생성)
- `c:\dev\blog\sitemap.xml` (자동 업데이트)
- `c:\dev\blog\posts-metadata.json` (자동 동기화)

### 4. Sitemap 업데이트 (자동)

✨ **sitemap.xml은 자동으로 생성/업데이트됩니다!** 수동으로 편집할 필요가 없습니다.

스크립트 실행 시 자동으로:
- 모든 정적 페이지 (홈, 포스트 목록, 회사 소개, 문의하기)
- 모든 블로그 포스트
- 각 페이지의 lastmod (최종 수정일)
- 적절한 priority와 changefreq

가 sitemap.xml에 반영됩니다.

### 5. 메인 페이지에 링크 추가 (선택사항)

`index.html`의 최신 글 목록에 새 포스트를 추가할 수 있습니다.

## 🎯 자동화된 기능

### SEO 최적화
스크립트가 자동으로 생성하는 SEO 요소:
- ✅ Meta description, keywords, author
- ✅ Open Graph 태그 (소셜 미디어 공유)
- ✅ Twitter Card 태그
- ✅ Canonical URL
- ✅ JSON-LD 구조화된 데이터 (Schema.org)
- ✅ Google Tag Manager 통합

### Sitemap 자동 생성
- ✅ 모든 정적 페이지 포함 (홈, 포스트 목록, 회사 소개, 문의하기)
- ✅ 모든 블로그 포스트 포함
- ✅ lastmod 자동 업데이트 (`dateModified` 기반)
- ✅ 적절한 priority 설정 (홈: 1.0, 포스트: 0.8 등)
- ✅ changefreq 자동 설정

### Metadata 자동 관리
- ✅ **새 HTML 파일 자동 감지** ⭐
- ✅ **HTML에서 메타데이터 자동 추출** ⭐
  - 제목 (H1 태그)
  - 날짜 (한글 날짜 자동 변환)
  - 저자
  - 설명 (첫 번째 단락)
  - 라우트 (파일명 기반)
- ✅ `dateModified` 자동 업데이트
- ✅ workspace와 root 간 자동 동기화
- ✅ JSON 포맷 자동 정리

## 🔧 주의사항

1. **workspace/ 디렉토리는 Git에 올라가지 않습니다** (`.gitignore`에 포함)
2. **posts-metadata.json은 루트에 있으며 Git에 올라갑니다** (컴포넌트들이 참조함)
3. **본문만 작성**하고, 메타 태그 등은 스크립트가 자동 생성합니다
4. **route 값**은 고유해야 하며, URL에 사용됩니다
5. **OG 이미지**는 1200x630px 권장 크기입니다

## 📝 수정하기

기존 글을 수정하려면:

1. `workspace/contents/{filename}.html` 파일 수정
2. `posts-metadata.json`의 `dateModified` 업데이트
3. `node workspace/bin/generate-static-pages.js` 재실행

## 🚀 배포

생성된 정적 HTML 파일들과 posts-metadata.json을 Git에 커밋하고 푸시하면 됩니다.

```bash
git add *.html posts-metadata.json sitemap.xml
git commit -m "Add new post: My New Post"
git push
```
