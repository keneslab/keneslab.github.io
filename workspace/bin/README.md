# Blog Build Scripts

블로그 사이트 빌드 및 관리를 위한 스크립트 모음입니다.

## 📁 파일 구조

```
workspace/bin/
├── asset-versions.json          # CSS/JS 파일 버전 정보
├── generate-static-pages.js     # 정적 HTML 페이지 생성 스크립트
├── update-asset-versions.js     # 에셋 버전 관리 스크립트
└── README.md                    # 이 파일
```

## 🚀 에셋 버전 관리 시스템 (Cache Busting)

CSS와 JS 파일의 브라우저 캐시 문제를 해결하기 위한 자동 버전 관리 시스템입니다.

### 작동 방식

1. **asset-versions.json**: 각 CSS/JS 파일의 버전 번호를 저장
2. **update-asset-versions.js**: 버전 번호를 자동으로 업데이트하고 HTML 파일의 링크를 수정
3. **generate-static-pages.js**: 생성되는 article HTML에 자동으로 버전이 적용된 링크 삽입

### 사용 방법

#### 1. 모든 에셋 버전 업데이트 (권장)

CSS나 JS 파일을 수정한 후, 모든 에셋의 버전을 한 번에 업데이트:

```bash
node workspace/bin/update-asset-versions.js --increment-all
```

이 명령은:
- 모든 에셋의 패치 버전을 증가시킵니다 (1.0.0 → 1.0.1)
- HTML 파일들의 링크를 자동으로 업데이트합니다

#### 2. 특정 파일만 버전 업데이트

특정 파일만 수정한 경우:

```bash
# CSS 파일만 업데이트
node workspace/bin/update-asset-versions.js --increment css/style.css

# 특정 JS 파일만 업데이트
node workspace/bin/update-asset-versions.js --increment js/theme.js
```

#### 3. 버전 타입 지정

메이저/마이너/패치 버전을 선택적으로 증가:

```bash
# 메이저 버전 증가 (1.0.0 → 2.0.0)
node workspace/bin/update-asset-versions.js --increment-all --major

# 마이너 버전 증가 (1.0.0 → 1.1.0)
node workspace/bin/update-asset-versions.js --increment-all --minor

# 패치 버전 증가 (기본값, 1.0.0 → 1.0.1)
node workspace/bin/update-asset-versions.js --increment-all --patch
```

#### 4. 파일 해시 사용 (선택사항)

시맨틱 버전 대신 파일 내용의 해시값을 사용:

```bash
node workspace/bin/update-asset-versions.js --hash
```

이 방법은 파일 내용이 변경될 때마다 다른 해시를 생성합니다.

### 버전 업데이트 후 결과

명령 실행 후, 다음 파일들이 자동으로 업데이트됩니다:

**고정 HTML 파일:**
- `index.html`
- `about.html`
- `contact.html`
- `posts.html`

**예시:**
```html
<!-- 업데이트 전 -->
<link rel="stylesheet" href="css/style.css">
<script src="js/theme.js"></script>

<!-- 업데이트 후 -->
<link rel="stylesheet" href="css/style.css?v=1.0.1">
<script src="js/theme.js?v=1.0.1"></script>
```

## 📄 정적 페이지 생성

블로그 article 페이지를 생성하는 스크립트입니다.

### 사용 방법

```bash
node workspace/bin/generate-static-pages.js
```

이 스크립트는:
1. `workspace/contents/` 디렉토리의 HTML 파일들을 스캔
2. 메타데이터 수집 (제목, 날짜, 설명 등)
3. 버전이 적용된 CSS/JS 링크로 정적 HTML 페이지 생성
4. `sitemap.xml` 자동 업데이트

**생성된 article 페이지는 자동으로 최신 에셋 버전을 사용합니다.**

## 🔄 권장 워크플로우

### CSS/JS 파일 수정 시

1. CSS 또는 JS 파일 수정
2. 버전 업데이트 실행:
   ```bash
   node workspace/bin/update-asset-versions.js --increment-all
   ```
3. article 재생성 (필요한 경우):
   ```bash
   node workspace/bin/generate-static-pages.js
   ```
4. Git에 커밋:
   ```bash
   git add .
   git commit -m "Update assets and increment versions"
   ```

### 새 블로그 글 작성 시

1. `workspace/contents/`에 HTML 파일 작성
2. 정적 페이지 생성:
   ```bash
   node workspace/bin/generate-static-pages.js
   ```
3. Git에 커밋

## 🎯 주요 기능

### 자동 캐시 무효화
- 브라우저가 항상 최신 CSS/JS 파일을 로드하도록 보장
- 사용자가 강제 새로고침(Ctrl+F5)을 하지 않아도 업데이트 적용

### 버전 통합 관리
- 모든 에셋 버전을 한 곳(`asset-versions.json`)에서 관리
- HTML 파일 전체에 일관된 버전 적용

### 자동화
- HTML 파일의 링크를 수동으로 수정할 필요 없음
- 에러 가능성 감소

## 📋 asset-versions.json 구조

```json
{
    "css/style.css": "1.0.1",
    "js/analytics.js": "1.0.1",
    "js/theme.js": "1.0.1",
    "js/components/header.js": "1.0.1",
    "js/components/footer.js": "1.0.1",
    "js/components/company-info.js": "1.0.1",
    "js/components/contact-section.js": "1.0.1",
    "js/components/recent-posts.js": "1.0.1",
    "js/components/posts-list.js": "1.0.1"
}
```

## 🔍 도움말

각 스크립트의 자세한 옵션 확인:

```bash
node workspace/bin/update-asset-versions.js --help
```

## ⚠️ 주의사항

1. **asset-versions.json 파일 유지**: 이 파일을 삭제하지 마세요. Git에 커밋해야 합니다.
2. **일관성 유지**: 에셋 수정 후 반드시 버전 업데이트를 실행하세요.
3. **Git 커밋**: 버전 업데이트 후 변경된 파일들을 모두 커밋하세요.

## 💡 팁

- **대규모 변경**: 여러 파일을 수정한 경우 `--increment-all` 사용
- **작은 수정**: 한두 개 파일만 수정한 경우 `--increment <file>` 사용
- **버전 의미**:
  - Major (--major): API 변경, 대규모 리팩토링
  - Minor (--minor): 새 기능 추가
  - Patch (기본값): 버그 수정, 작은 개선
