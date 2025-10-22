// Header Web Component
class BlogHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.innerHTML = `
            <header class="header">
                <nav class="nav-container">
                    <div class="logo">
                        <a href="/">
                            <span class="logo-icon"><img src="/images/keneslab.png" alt="KenesLab Logo"></span>
                            <span class="logo-text">KenesLab</span>
                        </a>
                    </div>

                    <button class="mobile-menu-toggle" aria-label="메뉴 열기">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <ul class="nav-menu">
                        <li><a href="/" class="nav-link">홈</a></li>
                        <li><a href="/posts.html" class="nav-link">글목록</a></li>
                        <li><a href="/about.html" class="nav-link">회사 소개</a></li>
                        <li><a href="/contact.html" class="nav-link">문의하기</a></li>
                    </ul>
                </nav>
            </header>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .header {
                background-color: var(--bg-secondary);
                box-shadow: var(--shadow);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                border-bottom: 1px solid var(--border-color);
            }

            .nav-container {
                max-width: var(--max-width);
                margin: 0 auto;
                padding: 0 1rem;
                height: var(--header-height);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo a {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-primary);
            }

            .logo-icon {
                font-size: 2rem;
            }

            .logo-icon img {
                height: 32px;
                width: 32px;
            }

            .logo-text {
                background: #fff;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .nav-menu {
                display: flex;
                list-style: none;
                align-items: center;
                gap: 2rem;
            }

            .nav-link {
                color: var(--text-primary);
                font-weight: 500;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                transition: var(--transition);
            }

            .nav-link:hover {
                background-color: var(--bg-tertiary);
                color: var(--accent-color);
            }

            .mobile-menu-toggle {
                display: none;
                flex-direction: column;
                gap: 4px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
            }

            .mobile-menu-toggle span {
                display: block;
                width: 25px;
                height: 3px;
                background-color: var(--text-primary);
                transition: var(--transition);
                border-radius: 2px;
            }

            .mobile-menu-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(7px, 7px);
            }

            .mobile-menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }

            .mobile-menu-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -7px);
            }

            @media (max-width: 768px) {
                .mobile-menu-toggle {
                    display: flex;
                }

                .nav-menu {
                    position: absolute;
                    top: var(--header-height);
                    left: 0;
                    right: 0;
                    flex-direction: column;
                    background-color: var(--bg-secondary);
                    padding: 1rem;
                    gap: 0;
                    box-shadow: var(--shadow);
                    display: none;
                }

                .nav-menu.active {
                    display: flex;
                }

                .nav-menu li {
                    width: 100%;
                }

                .nav-link {
                    display: block;
                    width: 100%;
                    padding: 1rem;
                }
            }
        `;
        this.appendChild(style);
    }

    attachEventListeners() {
        const mobileToggle = this.querySelector('.mobile-menu-toggle');
        const navMenu = this.querySelector('.nav-menu');

        mobileToggle?.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu?.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = this.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });
    }
}

customElements.define('blog-header', BlogHeader);
