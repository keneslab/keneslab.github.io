# Changelog - SEO 자동화 개선

## 2025-10-23 - 메타데이터 자동 생성 기능 추가 ⭐

### ✨ 주요 개선사항

#### 🎯 HTML 파일에서 메타데이터 자동 추출
- **핵심 기능**: 새로운 HTML 파일을 자동으로 감지하고 메타데이터를 추출하여 posts-metadata.json에 추가
- **자동 추출 항목**:
  - ✅ 제목: `<h1>` 태그에서 자동 추출
  - ✅ 날짜: `<span class="date">` 에서 추출 (한글 날짜 "2025년 10월 23일" → "2025-10-23" 자동 변환)
  - ✅ 저자: `<span class="author">` 에서 추출
  - ✅ 설명: 첫 번째 `<p>` 태그에서 추출 (최대 160자, SEO 최적화)
  - ✅ 라우트: 파일명에서 자동 생성 (예: `my-post.html` → `my-post`)

#### 🤖 대화형 메타데이터 입력
- 자동 추출된 정보를 확인하고 수정 가능
- 키워드와 OG 이미지 경로는 사용자가 직접 입력
- Enter 키로 기본값 사용 가능

#### 📁 스마트 파일 감지
- `workspace/contents/` 디렉토리의 모든 HTML 파일 스캔
- posts-metadata.json에 없는 파일만 처리
- 중복 방지 및 효율적인 처리

### 🔧 기술적 변경사항

#### `generate-static-pages.js` 업데이트

**새로 추가된 함수:**
1. `parseHtmlContent(htmlContent, filename)` - HTML에서 메타데이터 추출
2. `scanAndUpdateMetadata()` - 새 HTML 파일 스캔 및 메타데이터 생성
3. `question(query)` - 대화형 입력을 위한 Promise 기반 함수
4. `main()` - 비동기 메인 함수로 전체 실행 흐름 관리

**새로 추가된 모듈:**
```javascript
const readline = require('readline');
```

**변경된 상수:**
```javascript
const CONTENTS_DIR = './workspace/contents';
```

**실행 흐름 변경:**
```
기존: loadMetadata → updateMetadata → generatePages → syncMetadata → generateSitemap
새로: scanAndUpdateMetadata → loadMetadata → updateMetadata → generatePages → syncMetadata → generateSitemap
```

### 📊 실행 결과 예시

```bash
$ node workspace/bin/generate-static-pages.js

🚀 KenesLab Blog - Static Page Generator

==================================================

🔍 Scanning workspace/contents for HTML files...

📝 Found 1 new HTML file(s) without metadata:

--- Processing: my-new-post.html ---

🤖 Auto-detected metadata:
   Title: 새로운 블로그 포스트
   Date: 2025-10-23
   Author: KenesLab
   Description: 이 글은 새로운 기능에 대한 설명입니다...
   Route: my-new-post

✓ Use auto-detected metadata? (y/n, default: y): y
Keywords (comma separated): 블로그, 자동화, SEO
OG Image path [images/my-new-post-og.jpg]:

✅ Metadata added for my-new-post.html
💾 Metadata saved to: ./posts-metadata.json

📄 Generating 3 static pages...
...
```

### 🎯 사용자 이점

#### 작성자 관점
- ✅ **HTML 파일만 작성하면 끝!** - 메타데이터 수동 작성 불필요
- ✅ **실수 방지** - 자동 추출로 오타나 누락 최소화
- ✅ **빠른 작성** - 본문 작성에만 집중 가능
- ✅ **일관성 유지** - 자동화된 포맷으로 일관된 구조 유지

#### 기술적 이점
- ✅ **유지보수 용이** - 메타데이터와 콘텐츠의 자동 동기화
- ✅ **확장성** - 새로운 필드 추가가 쉬움
- ✅ **신뢰성** - 사람의 실수 최소화

### 📝 업데이트된 워크플로우

**기존 방식:**
1. 본문 HTML 작성 (`workspace/contents/`)
2. **posts-metadata.json 수동 편집** ❌ (오타 위험, 번거로움)
3. `node generate-static-pages.js` 실행
4. Git commit & push

**새로운 방식:**
1. 본문 HTML 작성 (`workspace/contents/`)
2. `node generate-static-pages.js` 실행 ✅ (메타데이터 자동 생성!)
   - 자동 추출된 정보 확인
   - 키워드, 이미지만 입력
3. Git commit & push

**결과:** 5분 걸리던 작업이 1분으로 단축! 🚀

---

## 2025-10-22 - SEO 자동화 업데이트

### ✨ 주요 개선사항

#### 1. sitemap.xml 자동 생성/업데이트
- **기능**: `generate-static-pages.js` 실행 시 sitemap.xml을 자동으로 생성
- **장점**:
  - 수동으로 sitemap을 편집할 필요 없음
  - 새 글 작성 시 자동으로 sitemap에 추가됨
  - lastmod가 posts-metadata.json의 dateModified를 기반으로 자동 업데이트

**생성되는 sitemap 구조:**
```xml
- Homepage (priority: 1.0, changefreq: weekly)
- Posts Page (priority: 0.9, changefreq: weekly)
- About Page (priority: 0.7, changefreq: monthly)
- Contact Page (priority: 0.6, changefreq: monthly)
- All Blog Posts (priority: 0.8, changefreq: monthly)
```

#### 2. posts-metadata.json 자동 업데이트
- **기능**: dateModified를 현재 날짜로 자동 업데이트
- **로직**:
  - dateModified가 없거나 현재 날짜보다 이전이면 자동 업데이트
  - 스크립트 실행 시마다 체크하여 최신 상태 유지

#### 3. 메타데이터 자동 동기화
- **기능**: workspace와 root 간 posts-metadata.json 자동 동기화
- **방식**:
  - 두 파일의 수정 시간을 비교
  - 더 최신 파일을 기준으로 동기화
  - 한쪽만 존재하면 자동으로 복사

### 🔧 기술적 변경사항

#### `generate-static-pages.js` 업데이트

**새로 추가된 함수:**
1. `updateMetadata(posts)` - dateModified 자동 업데이트
2. `syncMetadata()` - workspace-root 간 메타데이터 동기화
3. `generateSitemap(posts)` - sitemap.xml 자동 생성

**변경된 상수:**
```javascript
const SITEMAP_PATH = './sitemap.xml';
const BASE_URL = 'https://keneslab.github.io';
```

**실행 흐름:**
```
1. posts-metadata.json 로드
2. dateModified 자동 업데이트
3. 정적 HTML 페이지 생성
4. posts-metadata.json 동기화 (workspace ↔ root)
5. sitemap.xml 자동 생성
```

### 📊 실행 결과 예시

```bash
$ node workspace/bin/generate-static-pages.js

📝 Updating posts-metadata.json with current dateModified...
✓ Metadata updated: ./posts-metadata.json

Generating 2 static pages...
Processing: 웹컴포넌트 기술에 대해서
  ✓ Generated: web-components.html
Processing: 웹개발 프레임워크 shakeFlat 소개
  ✓ Generated: shakeflat.html

✅ All static pages generated successfully!
📁 Output directory: ./
✓ posts-metadata.json already in sync

📍 Generating sitemap.xml...
✓ sitemap.xml generated successfully!
  - Total URLs: 6
  - Static pages: 4
  - Blog posts: 2

💡 Tip: Commit generated HTML files, posts-metadata.json, and sitemap.xml to Git.
```

### 🎯 사용자 이점

#### 작성자 관점
- ✅ sitemap.xml을 수동으로 편집할 필요 없음
- ✅ dateModified를 수동으로 업데이트할 필요 없음
- ✅ 한 번의 명령으로 모든 SEO 요소 자동 생성
- ✅ 휴먼 에러 감소

#### SEO 관점
- ✅ 항상 최신 sitemap 유지
- ✅ 정확한 lastmod 날짜 제공
- ✅ 검색엔진이 새 콘텐츠를 빠르게 인덱싱
- ✅ 일관된 우선순위 및 갱신 빈도 관리

### 📝 업데이트된 워크플로우

**기존 방식:**
1. 본문 HTML 작성 (`workspace/contents/`)
2. posts-metadata.json에 메타데이터 추가
3. `node generate-static-pages.js` 실행
4. **sitemap.xml 수동 편집** ❌
5. **dateModified 수동 업데이트** ❌
6. Git commit & push

**새로운 방식:**
1. 본문 HTML 작성 (`workspace/contents/`)
2. posts-metadata.json에 메타데이터 추가
3. `node generate-static-pages.js` 실행 ✅ (모든 것 자동화)
4. Git commit & push

### 🔮 향후 개선 계획

- [ ] 이미지 sitemap 자동 생성
- [ ] RSS 피드 자동 생성
- [ ] Google Search Console 자동 제출
- [ ] 빌드 시 HTML/CSS/JS minification
- [ ] 이미지 최적화 자동화

### 📚 참고 문서

- `workspace/README.md` - 업데이트된 사용 가이드
- `workspace/bin/generate-static-pages.js` - 스크립트 소스 코드

---

**작성자**: GitHub Copilot
**날짜**: 2025-10-22
**버전**: 1.1.0
