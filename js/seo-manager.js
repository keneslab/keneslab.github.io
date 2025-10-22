// SEO Manager - Dynamic Meta Tags and Structured Data
class SEOManager {
    constructor() {
        this.defaultMeta = {
            title: 'KenesLab Blog',
            description: '케네스랩의 기술 블로그. 웹 개발, 프레임워크, 프로그래밍에 대한 인사이트를 공유합니다.',
            keywords: '케네스랩, 웹개발, 프로그래밍, 기술블로그, shakeFlat',
            author: 'KenesLab',
            image: 'images/og-default.jpg',
            url: window.location.origin,
            type: 'website',
            siteName: 'KenesLab Blog',
            twitterCard: 'summary_large_image',
            twitterSite: '@keneslab'
        };
    }

    // 메타 태그 업데이트
    updateMetaTags(metadata) {
        const meta = { ...this.defaultMeta, ...metadata };

        // Title 업데이트
        document.title = meta.title;

        // 기본 메타 태그
        this.updateOrCreateMeta('name', 'description', meta.description);
        this.updateOrCreateMeta('name', 'keywords', meta.keywords);
        this.updateOrCreateMeta('name', 'author', meta.author);

        // Open Graph 메타 태그
        this.updateOrCreateMeta('property', 'og:title', meta.title);
        this.updateOrCreateMeta('property', 'og:description', meta.description);
        this.updateOrCreateMeta('property', 'og:type', meta.type);
        this.updateOrCreateMeta('property', 'og:url', meta.url);
        this.updateOrCreateMeta('property', 'og:image', this.getAbsoluteUrl(meta.image));
        this.updateOrCreateMeta('property', 'og:site_name', meta.siteName);
        this.updateOrCreateMeta('property', 'og:locale', 'ko_KR');

        // Twitter Card 메타 태그
        this.updateOrCreateMeta('name', 'twitter:card', meta.twitterCard);
        this.updateOrCreateMeta('name', 'twitter:title', meta.title);
        this.updateOrCreateMeta('name', 'twitter:description', meta.description);
        this.updateOrCreateMeta('name', 'twitter:image', this.getAbsoluteUrl(meta.image));
        if (meta.twitterSite) {
            this.updateOrCreateMeta('name', 'twitter:site', meta.twitterSite);
        }

        // Canonical URL
        this.updateOrCreateLink('canonical', meta.url);
    }

    // 구조화된 데이터 (JSON-LD) 업데이트
    updateStructuredData(data) {
        const structuredDataId = 'structured-data';
        let script = document.getElementById(structuredDataId);

        if (!script) {
            script = document.createElement('script');
            script.id = structuredDataId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(data, null, 2);
    }

    // 블로그 포스트용 구조화된 데이터 생성
    createBlogPostStructuredData(postMeta) {
        return {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": postMeta.title,
            "description": postMeta.description || this.defaultMeta.description,
            "image": this.getAbsoluteUrl(postMeta.image || this.defaultMeta.image),
            "datePublished": postMeta.datePublished,
            "dateModified": postMeta.dateModified || postMeta.datePublished,
            "author": {
                "@type": "Organization",
                "name": postMeta.author || this.defaultMeta.author,
                "url": window.location.origin
            },
            "publisher": {
                "@type": "Organization",
                "name": this.defaultMeta.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.getAbsoluteUrl("images/logo.png")
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": postMeta.url
            }
        };
    }

    // 웹사이트용 구조화된 데이터 생성
    createWebsiteStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.defaultMeta.siteName,
            "url": window.location.origin,
            "description": this.defaultMeta.description,
            "publisher": {
                "@type": "Organization",
                "name": this.defaultMeta.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.getAbsoluteUrl("images/logo.png")
                }
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${window.location.origin}/posts?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };
    }

    // 메타 태그 생성 또는 업데이트 헬퍼
    updateOrCreateMeta(attrName, attrValue, content) {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attrName, attrValue);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    }

    // Link 태그 생성 또는 업데이트 헬퍼
    updateOrCreateLink(rel, href) {
        let element = document.querySelector(`link[rel="${rel}"]`);

        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }

        element.setAttribute('href', href);
    }

    // 상대 URL을 절대 URL로 변환
    getAbsoluteUrl(url) {
        if (!url) return window.location.origin + '/images/og-default.jpg';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return window.location.origin + '/' + url.replace(/^\//, '');
    }

    // 포스트 메타데이터로부터 SEO 정보 추출 및 업데이트
    updateFromPostMetadata(postMetadata, route) {
        const currentUrl = `${window.location.origin}/${route}`;

        const seoMeta = {
            title: `${postMetadata.title} - KenesLab Blog`,
            description: postMetadata.description || this.defaultMeta.description,
            keywords: postMetadata.keywords || this.defaultMeta.keywords,
            author: postMetadata.author || this.defaultMeta.author,
            image: postMetadata.image || this.defaultMeta.image,
            url: currentUrl,
            type: 'article'
        };

        // 메타 태그 업데이트
        this.updateMetaTags(seoMeta);

        // 구조화된 데이터 업데이트
        const structuredData = this.createBlogPostStructuredData({
            title: postMetadata.title,
            description: postMetadata.description,
            image: postMetadata.image,
            datePublished: postMetadata.date,
            dateModified: postMetadata.dateModified,
            author: postMetadata.author,
            url: currentUrl
        });

        this.updateStructuredData(structuredData);
    }

    // 홈페이지용 SEO 업데이트
    updateForHomePage() {
        this.updateMetaTags(this.defaultMeta);
        this.updateStructuredData(this.createWebsiteStructuredData());
    }

    // 특정 페이지용 SEO 업데이트
    updateForPage(pageData) {
        const meta = {
            title: pageData.title ? `${pageData.title} - KenesLab Blog` : this.defaultMeta.title,
            description: pageData.description || this.defaultMeta.description,
            keywords: pageData.keywords || this.defaultMeta.keywords,
            url: pageData.url || window.location.href,
            type: 'website'
        };

        this.updateMetaTags(meta);
        this.updateStructuredData(this.createWebsiteStructuredData());
    }
}

// 전역 SEO 매니저 인스턴스 생성
window.seoManager = new SEOManager();
