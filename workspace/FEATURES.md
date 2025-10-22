# KenesLab Blog - 자동화 기능 가이드

## 🎯 개요

KenesLab 블로그는 **완전 자동화된 정적 사이트 생성 시스템**을 갖추고 있습니다.
HTML 파일만 작성하면 메타데이터 생성, SEO 최적화, sitemap 관리까지 모두 자동으로 처리됩니다.

---

## ✨ 핵심 기능

### 1. 메타데이터 자동 생성 ⭐ NEW!

#### 작동 방식
1. `workspace/contents/`에 HTML 파일 작성
2. 스크립트 실행 시 자동으로 파일 감지
3. HTML 파싱하여 메타데이터 자동 추출
4. 사용자 확인 및 추가 정보 입력
5. `posts-metadata.json`에 자동 저장

#### 자동 추출 항목
- **제목**: `<h1>` 태그
- **날짜**: `<span class="date">` (한글 날짜 자동 변환)
- **저자**: `<span class="author">`
- **설명**: 첫 번째 `<p>` 태그 (최대 160자)
- **라우트**: 파일명 기반

#### 수동 입력 항목
- **키워드**: SEO용 키워드 (쉼표로 구분)
- **이미지**: OG 이미지 경로 (기본값 제공)

---

### 2. sitemap.xml 자동 관리

#### 기능
- ✅ 모든 페이지 자동 포함 (정적 페이지 + 블로그 포스트)
- ✅ lastmod 자동 업데이트 (dateModified 기반)
- ✅ 페이지별 우선순위 자동 설정
- ✅ 검색엔진 최적화된 구조

#### 우선순위 설정
```
Homepage:        1.0 (주간 업데이트)
Posts Page:      0.9 (주간 업데이트)
About:           0.7 (월간 업데이트)
Contact:         0.6 (월간 업데이트)
Blog Posts:      0.8 (월간 업데이트)
```

---

### 3. SEO 메타태그 자동 생성

각 페이지마다 자동으로 생성되는 태그:

#### 기본 SEO 태그
```html
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta name="author" content="...">
<link rel="canonical" href="...">
```

#### Open Graph (소셜 미디어)
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="article">
<meta property="og:url" content="...">
<meta property="og:image" content="...">
```

#### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

#### 구조화된 데이터 (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "...",
  "dateModified": "...",
  "author": {...},
  "publisher": {...}
}
```

---

### 4. 메타데이터 동기화

#### workspace ↔ root 자동 동기화
- 두 위치의 `posts-metadata.json` 자동 동기화
- 최신 버전을 자동으로 감지하여 동기화
- 한쪽만 존재할 경우 자동 복사

#### dateModified 자동 업데이트
- 스크립트 실행 시 현재 날짜로 자동 업데이트
- sitemap.xml의 lastmod에 반영

---

## 🚀 사용 방법

### 기본 워크플로우

```bash
# 1. 본문 작성
# workspace/contents/my-post.html 파일 생성

# 2. 스크립트 실행 (모든 것이 자동화됨!)
node workspace/bin/generate-static-pages.js

# 출력 예시:
# 🔍 Scanning workspace/contents for HTML files...
# 📝 Found 1 new HTML file(s) without metadata:
#
# --- Processing: my-post.html ---
# 🤖 Auto-detected metadata:
#    Title: 내 새로운 포스트
#    Date: 2025-10-23
#    Author: KenesLab
#    Description: 포스트 설명...
#
# ✓ Use auto-detected metadata? (y/n, default: y): y
# Keywords (comma separated): 키워드1, 키워드2
# OG Image path [images/my-post-og.jpg]:
#
# ✅ Metadata added for my-post.html
# 💾 Metadata saved to: ./posts-metadata.json
#
# 📄 Generating 3 static pages...
# ✅ All static pages generated successfully!
#
# 📍 Generating sitemap.xml...
# ✓ sitemap.xml generated successfully!

# 3. Git 커밋
git add *.html posts-metadata.json sitemap.xml
git commit -m "Add new post: My Post"
git push
```

### HTML 작성 템플릿

```html
<h1>제목을 여기에 작성</h1>
<div class="post-meta">
    <span class="date">2025년 10월 23일</span>
    <span class="author">KenesLab</span>
</div>
<div class="post-content">
    <p>첫 번째 단락이 자동으로 description이 됩니다. 160자 이내로 작성하는 것이 좋습니다.</p>

    <h2>부제목</h2>
    <p>본문 내용...</p>

    <ul>
        <li>목록 항목</li>
    </ul>
</div>
```

**주의사항:**
- `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` 태그 불필요
- 위 구조만 지키면 자동으로 처리됨

---

## 📊 자동화 효과

### Before (수동 작업)
```
1. HTML 작성 (10분)
2. posts-metadata.json 수동 편집 (5분)
   - 오타 위험 ❌
   - 형식 오류 가능 ❌
3. sitemap.xml 수동 편집 (3분)
   - 누락 가능 ❌
4. 스크립트 실행 (1분)
5. 검증 및 수정 (3분)

총 소요시간: ~22분
```

### After (자동화)
```
1. HTML 작성 (10분)
2. 스크립트 실행 (1분)
   - 메타데이터 자동 생성 ✅
   - sitemap 자동 업데이트 ✅
   - SEO 태그 자동 생성 ✅
3. 키워드/이미지 입력 (1분)

총 소요시간: ~12분 (45% 단축!)
```

### 품질 향상
- ✅ **오타 제거**: 자동 추출로 오타 없음
- ✅ **누락 방지**: 모든 필수 필드 자동 체크
- ✅ **일관성**: 동일한 구조 유지
- ✅ **SEO 최적화**: 모든 SEO 태그 완벽 생성

---

## 🔧 고급 기능

### 메타데이터 수동 편집

자동 추출이 마음에 들지 않을 경우:

```bash
# 스크립트 실행 시
✓ Use auto-detected metadata? (y/n, default: y): n

# 그러면 각 항목을 직접 입력 가능
Title [...]: 원하는 제목
Date (YYYY-MM-DD) [...]: 2025-10-23
Author [...]: 저자명
Description [...]: 설명
Route [...]: custom-route
```

### 배치 처리

여러 파일을 한 번에 처리:

```bash
# workspace/contents/에 여러 HTML 파일 생성
# post1.html, post2.html, post3.html

# 스크립트 실행
node workspace/bin/generate-static-pages.js

# 각 파일마다 순차적으로 메타데이터 입력 요청
```

---

## 💡 팁 & 모범 사례

### 1. 설명(Description) 작성
- 첫 번째 단락은 자동으로 description이 됨
- **160자 이내**로 작성하는 것이 SEO에 좋음
- 핵심 키워드를 포함하세요

### 2. 키워드 선택
- 5-10개의 관련 키워드 선택
- 쉼표로 구분
- 예: `웹개발, JavaScript, React, 프론트엔드, SEO`

### 3. OG 이미지
- 권장 크기: **1200x630px**
- 파일 위치: `images/` 디렉토리
- 파일명 규칙: `{route}-og.jpg` 또는 `-og.png`

### 4. 날짜 형식
- HTML에서는 한글 형식 사용 가능: `2025년 10월 23일`
- 자동으로 `2025-10-23` 형식으로 변환됨

### 5. 라우트(Route)
- 파일명에서 자동 생성됨
- URL에 직접 사용되므로 의미 있는 파일명 사용
- 영문, 숫자, 하이픈만 사용 권장

---

## 🐛 문제 해결

### Q: 메타데이터가 자동 추출되지 않아요
**A**: HTML 구조를 확인하세요:
- `<h1>` 태그가 있나요?
- `<div class="post-meta">` 안에 date, author span이 있나요?
- `<div class="post-content">` 안에 `<p>` 태그가 있나요?

### Q: 한글 날짜가 제대로 변환되지 않아요
**A**: 형식을 확인하세요:
- 올바른 형식: `2025년 10월 23일` 또는 `2025년 1월 5일`
- 공백과 "년", "월", "일" 문자를 정확히 사용하세요

### Q: sitemap에 새 페이지가 안 보여요
**A**:
- `posts-metadata.json`에 항목이 있는지 확인
- 스크립트를 다시 실행
- sitemap.xml 파일 확인

### Q: 이미 있는 메타데이터를 수정하고 싶어요
**A**: 두 가지 방법:
1. `posts-metadata.json` 파일을 직접 편집
2. 파일을 삭제하고 스크립트 재실행 (자동 재생성)

---

## 📚 관련 문서

- [README.md](README.md) - 전체 사용 가이드
- [CHANGELOG.md](CHANGELOG.md) - 변경 이력
- [generate-static-pages.js](bin/generate-static-pages.js) - 스크립트 소스

---

**마지막 업데이트**: 2025-10-23
**버전**: 2.0.0
**작성자**: KenesLab
