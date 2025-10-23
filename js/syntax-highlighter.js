/**
 * Syntax Highlighter using Highlight.js
 *
 * Highlight.js를 사용하여 코드 블록에 syntax highlighting 적용
 * - 자동 언어 감지
 * - 200개 이상의 언어 지원
 * - One Dark 테마 적용 (Atom 에디터 스타일)
 */

// Highlight.js CDN 로드 함수
function loadHighlightJS() {
    // 이미 로드되었는지 확인
    if (window.hljs) {
        console.log('✓ Highlight.js already loaded');
        initHighlighting();
        return;
    }

    console.log('📦 Loading Highlight.js from CDN...');

    // CSS 로드 (One Dark 테마)
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
    document.head.appendChild(cssLink);

    // JavaScript 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = () => {
        console.log('✓ Highlight.js loaded successfully');
        initHighlighting();
    };
    script.onerror = () => {
        console.error('✗ Failed to load Highlight.js');
    };
    document.head.appendChild(script);
}

// Highlight.js 초기화 및 적용
function initHighlighting() {
    if (!window.hljs) {
        console.error('✗ Highlight.js not available');
        return;
    }

    // 모든 <pre><code> 블록에 적용
    const codeBlocks = document.querySelectorAll('pre code');
    console.log(`🎨 Found ${codeBlocks.length} code blocks to highlight`);

    codeBlocks.forEach((block, index) => {
        try {
            // 이미 하이라이팅되었는지 확인
            if (block.classList.contains('hljs')) {
                console.log(`  Block ${index + 1}: Already highlighted, skipping`);
                return;
            }

            // Highlight.js 적용
            hljs.highlightElement(block);
            console.log(`  Block ${index + 1}: ✓ Highlighted`);
        } catch (error) {
            console.error(`  Block ${index + 1}: ✗ Error -`, error);
        }
    });

    console.log('✅ All code blocks processed');
}

// DOM 로드 시 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHighlightJS);
} else {
    loadHighlightJS();
}
