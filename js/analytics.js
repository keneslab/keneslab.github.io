// Google Analytics 4 Configuration
// Measurement ID는 Google Analytics 관리 > 데이터 스트림에서 확인 가능
// 형식: G-XXXXXXXXXX

// Google Analytics 초기화
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Google Analytics 4 설정
gtag('config', 'G-XD3X145PND');

// 페이지뷰 추적
function trackPageView(pagePath) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_path: pagePath
        });
    }
}

// 이벤트 추적
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
}

// Export functions
window.analytics = {
    trackPageView,
    trackEvent
};
