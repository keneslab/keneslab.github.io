// Posts List with Pagination Web Component
class PostsList extends HTMLElement {
    constructor() {
        super();
        this.posts = [];
        this.currentPage = 1;
        this.postsPerPage = 10; // 페이지당 게시물 수
        this.totalPages = 1;
    }

    async connectedCallback() {
        await this.loadPosts();
        this.render();
        this.attachEventListeners();
    }

    async loadPosts() {
        try {
            const response = await fetch('posts-metadata.json');
            if (!response.ok) {
                throw new Error('Failed to load posts metadata');
            }
            const allPosts = await response.json();

            // 날짜 기준 역순 정렬 (최신순)
            this.posts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);

            // URL에서 페이지 번호 가져오기
            const urlParams = new URLSearchParams(window.location.search);
            const page = parseInt(urlParams.get('page')) || 1;
            this.currentPage = Math.max(1, Math.min(page, this.totalPages));
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    getCurrentPagePosts() {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        return this.posts.slice(startIndex, endIndex);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    render() {
        const currentPosts = this.getCurrentPagePosts();

        const postsHTML = currentPosts.map(post => {
            const url = post.route ? `/${post.route}.html` : '#';
            return `
                <div class="post-item">
                    <h3 class="post-title">
                        <a href="${url}">${post.title}</a>
                    </h3>
                    <div class="post-meta">
                        <span class="post-date">${this.formatDate(post.date)}</span>
                    </div>
                </div>
            `;
        }).join('');

        const paginationHTML = this.renderPagination();

        this.innerHTML = `
            <div class="posts-list-container">
                <div class="posts-count">
                    전체 <strong>${this.posts.length}</strong>개의 게시물
                </div>
                <div class="posts-grid">
                    ${postsHTML || '<p class="no-posts">게시물이 없습니다.</p>'}
                </div>
                ${paginationHTML}
            </div>
        `;

        this.addStyles();
    }

    renderPagination() {
        if (this.totalPages <= 1) {
            return '';
        }

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        // 끝 페이지가 총 페이지보다 작을 때 시작 페이지 조정
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let pagesHTML = '';

        // 이전 버튼
        if (this.currentPage > 1) {
            pagesHTML += `<button class="page-btn" data-page="${this.currentPage - 1}">이전</button>`;
        }

        // 첫 페이지
        if (startPage > 1) {
            pagesHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHTML += `<span class="page-ellipsis">...</span>`;
            }
        }

        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            pagesHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }

        // 마지막 페이지
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pagesHTML += `<span class="page-ellipsis">...</span>`;
            }
            pagesHTML += `<button class="page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
        }

        // 다음 버튼
        if (this.currentPage < this.totalPages) {
            pagesHTML += `<button class="page-btn" data-page="${this.currentPage + 1}">다음</button>`;
        }

        return `
            <div class="pagination">
                ${pagesHTML}
            </div>
        `;
    }

    attachEventListeners() {
        const pageButtons = this.querySelectorAll('.page-btn');
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.goToPage(page);
                }
            });
        });
    }

    goToPage(page) {
        this.currentPage = page;

        // URL 업데이트
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);

        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 다시 렌더링
        this.render();
        this.attachEventListeners();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .posts-list-container {
                width: 100%;
            }

            .posts-count {
                font-size: 0.95rem;
                color: var(--text-secondary);
                margin-bottom: 1.5rem;
            }

            .posts-count strong {
                color: var(--accent-color);
                font-weight: 700;
            }

            .posts-grid {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                margin-bottom: 3rem;
            }

            .post-item {
                padding: 1.5rem 1.5rem 1rem 1.5rem;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                transition: var(--transition);
            }

            .post-item:hover {
                border-color: var(--accent-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .post-title {
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
                line-height: 1.4;
            }

            .post-title a {
                color: var(--text-primary);
                text-decoration: none;
                transition: var(--transition);
            }

            .post-title a:hover {
                color: var(--accent-color);
            }

            .post-meta {
                display: flex;
                align-items: center;
                gap: 1rem;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .post-date {
                display: flex;
                align-items: center;
            }

            .no-posts {
                text-align: center;
                padding: 3rem;
                color: var(--text-secondary);
                font-size: 1.1rem;
            }

            /* Pagination Styles */
            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.5rem;
                margin-top: 3rem;
                flex-wrap: wrap;
            }

            .page-btn {
                min-width: 40px;
                height: 40px;
                padding: 0.5rem 1rem;
                border: 1px solid var(--border-color);
                background: var(--card-bg);
                color: var(--text-primary);
                border-radius: 6px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 0.95rem;
                font-weight: 500;
            }

            .page-btn:hover:not(.active) {
                border-color: var(--accent-color);
                color: var(--accent-color);
                transform: translateY(-2px);
            }

            .page-btn.active {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
                font-weight: 700;
            }

            .page-ellipsis {
                padding: 0 0.5rem;
                color: var(--text-secondary);
            }

            .page-title {
                font-size: 2rem;
                margin-bottom: 2rem;
                color: var(--text-primary);
                border-bottom: 3px solid var(--accent-color);
                padding-bottom: 1rem;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .post-item {
                    padding: 1rem;
                }

                .post-title {
                    font-size: 1.1rem;
                }

                .page-btn {
                    min-width: 36px;
                    height: 36px;
                    padding: 0.4rem 0.8rem;
                    font-size: 0.9rem;
                }

                .pagination {
                    gap: 0.3rem;
                }
            }
        `;
        this.appendChild(style);
    }
}

customElements.define('posts-list', PostsList);
