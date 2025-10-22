// Contact Section Web Component
class ContactSection extends HTMLElement {
    constructor() {
        super();
        this.title = this.getAttribute('title') || '문의하기';
        this.description = this.getAttribute('description') || '프로젝트 문의나 협업 제안을 환영합니다.';
        this.linkUrl = this.getAttribute('link-url') || '/contact.html';
        this.buttonText = this.getAttribute('button-text') || '문의하기';
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="sidebar-section contact">
                <h3>${this.title}</h3>
                <p>${this.description}</p>
                <a href="${this.linkUrl}" class="btn-primary">${this.buttonText}</a>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .contact p {
                margin-bottom: 1rem;
                line-height: 1.6;
            }

            .btn-primary {
                display: inline-block;
                background: var(--accent-color);
                color: var(--bg-primary);
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                transition: var(--transition);
            }

            .btn-primary:hover {
                background: var(--accent-hover);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
        `;
        this.appendChild(style);
    }

    // Allow dynamic updates
    static get observedAttributes() {
        return ['title', 'description', 'link-url', 'button-text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch(name) {
                case 'title':
                    this.title = newValue;
                    break;
                case 'description':
                    this.description = newValue;
                    break;
                case 'link-url':
                    this.linkUrl = newValue;
                    break;
                case 'button-text':
                    this.buttonText = newValue;
                    break;
            }
            this.render();
        }
    }
}

customElements.define('contact-section', ContactSection);
