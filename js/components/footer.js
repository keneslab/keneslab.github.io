// Footer Web Component
class BlogFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const currentYear = new Date().getFullYear();

        this.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-bottom">
                        <p>&copy; ${currentYear} KenesLab. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .footer {
                background-color: var(--bg-primary);
                padding: 2rem 0;
            }

            .footer-container {
                max-width: var(--max-width);
                margin: 0 auto;
                padding: 0 1rem;
            }

            .footer-bottom {
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            @media (max-width: 640px) {
                .footer {
                    padding: 1.5rem 0;
                }
            }
        `;
        this.appendChild(style);
    }
}

customElements.define('blog-footer', BlogFooter);
