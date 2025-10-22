// Content Loader with Routing
class ContentRouter {
    constructor() {
        this.mainContent = document.getElementById('mainContent');
        this.routes = {};
        // Routes that should load as full pages instead of SPA
        this.fullPageRoutes = [];
        this.defaultRoute = 'shakeflat';
        this.metadataLoaded = false;
        this.postsMetadata = []; // Store full post metadata for SEO
    }

    async loadRoutesFromMetadata() {
        try {
            const response = await fetch('contents/posts-metadata.json');
            if (response.ok) {
                const posts = await response.json();
                // Store full metadata for SEO
                this.postsMetadata = posts;
                // Build routes from metadata
                posts.forEach(post => {
                    this.routes[post.route] = `contents/${post.filename}`;
                });
                this.metadataLoaded = true;
                console.log('Routes loaded from metadata:', this.routes);
            } else {
                console.error('Failed to load posts metadata');
            }
        } catch (error) {
            console.error('Error loading posts metadata:', error);
        }
    }

    async init() {
        // Load routes from metadata first
        await this.loadRoutesFromMetadata();

        // Load content based on URL
        await this.loadContentFromURL();

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.loadContentFromURL();
        });

        // Handle link clicks for SPA navigation
        this.setupLinkHandlers();
    }

    getRouteFromURL() {
        const path = window.location.pathname;
        const hash = window.location.hash;

        // Try to get route from pathname (e.g., /shakeflat)
        const pathRoute = path.split('/').filter(p => p).pop();

        // Try to get route from hash (e.g., #/shakeflat)
        const hashRoute = hash.replace('#/', '').replace('#', '');

        return pathRoute || hashRoute || this.defaultRoute;
    }

    async loadContentFromURL() {
        if (!this.mainContent) return;

        const route = this.getRouteFromURL();
        const contentPath = this.routes[route] || this.routes[this.defaultRoute];

        await this.loadContent(contentPath, route);
    }

    async loadContent(contentPath, routeName) {
        try {
            const response = await fetch(contentPath);
            if (response.ok) {
                const content = await response.text();

                // Check if the loaded content is a full HTML page
                if (content.includes('<!DOCTYPE html>')) {
                    // Extract only the main content from the full page
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    const mainContent = doc.querySelector('article.main-content');

                    if (mainContent) {
                        this.mainContent.innerHTML = mainContent.innerHTML;

                        // Load inline styles from the page's <head>
                        const inlineStyles = doc.querySelectorAll('head style');
                        inlineStyles.forEach(style => {
                            // Check if this style is not already in the document
                            const styleId = 'dynamic-style-' + routeName;
                            let existingStyle = document.getElementById(styleId);

                            if (existingStyle) {
                                existingStyle.textContent = style.textContent;
                            } else {
                                const newStyle = document.createElement('style');
                                newStyle.id = styleId;
                                newStyle.textContent = style.textContent;
                                document.head.appendChild(newStyle);
                            }
                        });

                        // Re-execute scripts from the loaded content
                        // First, load external scripts
                        const externalScripts = doc.querySelectorAll('script[src]');
                        const scriptPromises = [];

                        externalScripts.forEach(script => {
                            const src = script.getAttribute('src');
                            // Skip if script is already loaded
                            if (!document.querySelector(`script[src="${src}"]`)) {
                                const promise = new Promise((resolve, reject) => {
                                    const newScript = document.createElement('script');
                                    newScript.src = src;
                                    newScript.onload = resolve;
                                    newScript.onerror = reject;
                                    document.body.appendChild(newScript);
                                });
                                scriptPromises.push(promise);
                            }
                        });

                        // After external scripts load, execute inline scripts
                        Promise.all(scriptPromises).then(() => {
                            const inlineScripts = doc.querySelectorAll('script:not([src])');
                            inlineScripts.forEach(script => {
                                if (script.textContent.trim()) {
                                    try {
                                        // Use Function constructor instead of eval for better scoping
                                        const scriptFunc = new Function(script.textContent);
                                        scriptFunc();
                                    } catch (e) {
                                        console.error('Error executing inline script:', e);
                                    }
                                }
                            });
                        }).catch(error => {
                            console.error('Error loading external scripts:', error);
                        });
                    } else {
                        this.mainContent.innerHTML = content;
                    }
                } else {
                    // If it's just a content snippet, use it directly
                    this.mainContent.innerHTML = content;
                }

                // Update page title if needed
                document.title = `KenesLab Blog - ${routeName}`;

                // Update SEO meta tags
                this.updateSEO(routeName);
            } else {
                this.mainContent.innerHTML = '<p>콘텐츠를 불러올 수 없습니다.</p>';
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.mainContent.innerHTML = '<p>콘텐츠 로드 중 오류가 발생했습니다.</p>';
        }
    }

    // SEO 메타 태그 업데이트
    updateSEO(routeName) {
        // SEO Manager가 로드되었는지 확인
        if (typeof window.seoManager === 'undefined') {
            console.warn('SEO Manager not loaded');
            return;
        }

        // 해당 포스트의 메타데이터 찾기
        const postMeta = this.postsMetadata.find(post => post.route === routeName);

        if (postMeta) {
            // 포스트별 SEO 업데이트
            window.seoManager.updateFromPostMetadata(postMeta, routeName);
        } else if (routeName === this.defaultRoute || !routeName) {
            // 홈페이지 SEO 업데이트
            window.seoManager.updateForHomePage();
        } else {
            // 기타 페이지
            window.seoManager.updateForPage({
                title: routeName,
                url: window.location.href
            });
        }
    }

    setupLinkHandlers() {
        // Add click handlers for internal navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigateTo(route);
            }
        });
    }

    navigateTo(route) {
        // Check if this route should load as a full page
        if (this.fullPageRoutes.includes(route)) {
            // Redirect to the actual HTML file
            window.location.href = this.routes[route];
            return;
        }

        // Update URL without page reload
        const newURL = `${window.location.origin}/${route}`;
        window.history.pushState({ route }, '', newURL);

        // Load the new content
        const contentPath = this.routes[route] || this.routes[this.defaultRoute];
        this.loadContent(contentPath, route);
    }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const router = new ContentRouter();
    router.init();
});
