// Recent Posts Web Component
class RecentPosts extends HTMLElement {
    constructor() {
        super();
        this.posts = [];
        this.maxPosts = 5; // 최대 표시 게시물 수
    }

    async connectedCallback() {
        await this.loadPosts();
        this.render();
    }

    async loadPosts() {
        try {
            const response = await fetch('contents/posts-metadata.json');
            if (!response.ok) {
                throw new Error('Failed to load posts metadata');
            }
            const allPosts = await response.json();

            // 날짜 기준 역순 정렬 (최신순)
            allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 최대 5개까지만 선택
            this.posts = allPosts.slice(0, this.maxPosts).map(post => ({
                title: post.title,
                date: post.date,
                url: post.route ? `index.html#${post.route}` : '#',
                route: post.route
            }));
        } catch (error) {
            console.error('Error loading posts:', error);
            // 에러 발생 시 빈 배열 유지
            this.posts = [];
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    render() {
        const postsHTML = this.posts.map(post => {
            const dataRoute = post.route ? `data-route="${post.route}"` : '';
            return `
                <li class="recent-post-item">
                    <a href="${post.url}" ${dataRoute} class="recent-post-link">
                        <h4 class="recent-post-title">${post.title}</h4>
                        <span class="recent-post-date">${this.formatDate(post.date)}</span>
                    </a>
                </li>
            `;
        }).join('');

        this.innerHTML = `
            <div class="sidebar-section recent-posts">
                <h3>최근 게시물</h3>
                <ul class="recent-posts-list">
                    ${postsHTML}
                </ul>
                <div class="view-all-posts">
                    <a href="posts.html" class="view-all-link">전체 목록 보기 →</a>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .recent-posts-list {
                list-style: none;
            }

            .recent-post-item {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }

            .recent-post-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            .recent-post-link {
                display: block;
                transition: var(--transition);
            }

            .recent-post-link:hover {
                transform: translateX(4px);
            }

            .recent-post-link:hover .recent-post-title {
                color: var(--accent-color);
            }

            .recent-post-title {
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
                line-height: 1.4;
                transition: var(--transition);
            }

            .recent-post-date {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .view-all-posts {
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
                text-align: center;
            }

            .view-all-link {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--accent-color);
                font-weight: 600;
                font-size: 0.95rem;
                transition: var(--transition);
                text-decoration: none;
            }

            .view-all-link:hover {
                color: var(--accent-hover);
                transform: translateX(4px);
            }
        `;
        this.appendChild(style);
    }

    // Method to update posts dynamically
    updatePosts(newPosts) {
        this.posts = newPosts;
        this.render();
    }
}

customElements.define('recent-posts', RecentPosts);
