// Google Tag Manager Analytics Helper
// GTM을 통해 이벤트를 추적하기 위한 헬퍼 함수들

// dataLayer 초기화
window.dataLayer = window.dataLayer || [];

// 페이지뷰 추적
function trackPageView(pagePath) {
    window.dataLayer.push({
        'event': 'page_view',
        'page_path': pagePath
    });
}

// 이벤트 추적
function trackEvent(eventName, eventParams = {}) {
    window.dataLayer.push({
        'event': eventName,
        ...eventParams
    });
}

// Export functions
window.analytics = {
    trackPageView,
    trackEvent
};

// Track initial page view on load
document.addEventListener('DOMContentLoaded', function() {
    trackPageView(window.location.pathname);
});
